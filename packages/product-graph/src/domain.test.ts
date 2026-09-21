import { describe, expect, it } from "vitest";

import {
  DOMAIN_AUDIT_VALUES,
  DOMAIN_ANY_NODE_KIND,
  DOMAIN_CONTINUOUS_EXPORT_BLOCKED_LEVELS,
  DOMAIN_DATA_CLASS_LEVELS,
  DOMAIN_DELETION_VALUES,
  DOMAIN_EDGE_KINDS,
  DOMAIN_EDGE_KIND_SPECS,
  DOMAIN_ENUM_FIELDS,
  DOMAIN_EXPORT_VALUES,
  DOMAIN_FIELD_TYPES,
  DOMAIN_NODE_KINDS,
  DOMAIN_NODE_KIND_SPECS,
  DOMAIN_POLICY_REQUIRED_CLASS_LEVELS,
  DOMAIN_RESIDENCY_VALUES,
  DOMAIN_RETENTION_VALUES,
  DomainValidationError,
  collectProductGraphDomainIssues,
  createProductGraphRevision,
  openProductGraphRevision,
  parseProductGraphRevision,
  semanticProductGraphRevision,
  serializeProductGraphRevision,
  validateProductGraphDomain,
  validateProductGraphState,
  type DomainEndpointKind,
  type DomainEnumFieldSpec,
  type DomainFieldType,
  type DomainNodeKind,
  type JsonObject,
  type JsonValue,
  type ProductGraphEdgeV1,
  type ProductGraphNodeV1,
  type ProductGraphStateV1,
} from "./index.ts";

const minimalAttributes: Record<DomainNodeKind, JsonObject> = {
  persona: { goals: ["buy quickly"], name: "Buyer" },
  role: { name: "Operator" },
  entity: { name: "Order", tenantOwned: true },
  page: { name: "Orders", route: "/orders" },
  action: { name: "Refund", consequence: "financial" },
  workflow: { name: "Refund flow", steps: ["open", "confirm"] },
  permission: { effect: "allow", name: "Refund permission" },
  assumption: { confidence: 0.62, statement: "One tenant per workspace" },
  requirement: { statement: "Refunds are audited" },
  dataclass: { level: "personal", name: "Customer personal data" },
  datapolicy: {
    audit: "required",
    deletion: "scheduled",
    export: "on-request",
    name: "Customer data policy",
    residency: "single-region",
    retention: "bounded",
  },
};

const probeNodes: readonly ProductGraphNodeV1[] = DOMAIN_NODE_KINDS.map((kind) => ({
  id: `probe:${kind}`,
  kind,
  attributes: minimalAttributes[kind],
}));

const nodeGraph: ProductGraphStateV1 = {
  schemaVersion: 1,
  graphId: "graph:domain-nodes",
  nodes: probeNodes,
  edges: [],
};

function graphWith(nodes: readonly ProductGraphNodeV1[]): ProductGraphStateV1 {
  return { schemaVersion: 1, graphId: "graph:probe", nodes, edges: [] };
}

function singleNode(kind: string, attributes: JsonObject): ProductGraphStateV1 {
  return graphWith([{ id: "probe:node", kind, attributes }]);
}

function wrongTypeFor(type: DomainFieldType): JsonValue {
  if (type === "string") return 5;
  if (type === "string-list") return ["valid", " "];
  if (type === "number") return "0.62";
  return "true";
}

describe("Product Graph domain node semantics", () => {
  it("accepts the well-formed node fixture with no issues", () => {
    expect(collectProductGraphDomainIssues(nodeGraph)).toEqual([]);
    const validated = validateProductGraphDomain(nodeGraph);
    expect(validated).toEqual(validateProductGraphState(nodeGraph));
    expect(Object.isFrozen(validated)).toBe(true);
    expect(Object.isFrozen(validated.nodes)).toBe(true);
  });

  it("declares a spec for every node kind and exercises every kind in the fixture", () => {
    expect(DOMAIN_NODE_KIND_SPECS.map((spec) => spec.kind)).toEqual([...DOMAIN_NODE_KINDS]);
    expect(nodeGraph.nodes.map((node) => node.kind)).toEqual([...DOMAIN_NODE_KINDS]);
  });

  const requiredCases = DOMAIN_NODE_KIND_SPECS.flatMap((spec) =>
    Object.entries(spec.required).map(([field]) => [spec.kind, field] as [DomainNodeKind, string]),
  );

  it.each(requiredCases)("rejects a missing required field %s.%s", (kind, field) => {
    const attributes: Record<string, JsonValue> = { ...minimalAttributes[kind] };
    delete attributes[field];

    const issues = collectProductGraphDomainIssues(singleNode(kind, attributes));

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: "DOMAIN_MISSING_REQUIRED_FIELD",
      phase: "node",
      target: "probe:node",
      field,
    });
  });

  const fieldCases = DOMAIN_NODE_KIND_SPECS.flatMap((spec) =>
    Object.entries({ ...spec.required, ...spec.optional }).map(
      ([field, type]) => [spec.kind, field, type] as [DomainNodeKind, string, DomainFieldType],
    ),
  );

  it.each(fieldCases)("rejects a wrong value type for %s.%s", (kind, field, type) => {
    const attributes: Record<string, JsonValue> = {
      ...minimalAttributes[kind],
      [field]: wrongTypeFor(type),
    };

    const issues = collectProductGraphDomainIssues(singleNode(kind, attributes));

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: "DOMAIN_INVALID_FIELD_TYPE",
      phase: "node",
      target: "probe:node",
      field,
    });
    expect(DOMAIN_FIELD_TYPES).toContain(type);
  });

  it("rejects unknown node kinds and unknown attribute fields", () => {
    const unknownKind = collectProductGraphDomainIssues(singleNode("feature", {}));
    expect(unknownKind).toHaveLength(1);
    expect(unknownKind[0]).toMatchObject({
      code: "DOMAIN_UNKNOWN_NODE_KIND",
      target: "probe:node",
      field: "kind",
    });

    const unknownField = collectProductGraphDomainIssues(
      singleNode("role", { name: "Operator", scope: "global" }),
    );
    expect(unknownField).toHaveLength(1);
    expect(unknownField[0]).toMatchObject({
      code: "DOMAIN_UNKNOWN_FIELD",
      target: "probe:node",
      field: "scope",
    });
  });

  it("reports the same ordered issues across insertion order, key order, and repeated runs", () => {
    const broken = graphWith([
      { id: "probe:zeta", kind: "role", attributes: { name: "Z", scope: "x" } },
      { id: "probe:alpha", kind: "role", attributes: { description: 7, name: "A" } },
      { id: "probe:mid", kind: "page", attributes: { name: " " } },
    ]);
    const reordered = graphWith([
      { id: "probe:mid", kind: "page", attributes: { name: " " } },
      { id: "probe:alpha", kind: "role", attributes: { name: "A", description: 7 } },
      { id: "probe:zeta", kind: "role", attributes: { scope: "x", name: "Z" } },
    ]);

    const baseline = collectProductGraphDomainIssues(broken);
    expect(baseline.map((issue) => [issue.target, issue.code, issue.field])).toEqual([
      ["probe:alpha", "DOMAIN_INVALID_FIELD_TYPE", "description"],
      ["probe:mid", "DOMAIN_INVALID_FIELD_TYPE", "name"],
      ["probe:zeta", "DOMAIN_UNKNOWN_FIELD", "scope"],
    ]);
    expect(collectProductGraphDomainIssues(broken)).toEqual(baseline);
    expect(collectProductGraphDomainIssues(reordered)).toEqual(baseline);
    expect(collectProductGraphDomainIssues(nodeGraph)).toEqual([]);
  });

  it("surfaces a core contract violation as exactly one deterministic prerequisite issue", () => {
    const dangling = graphWith([...probeNodes, probeNodes[0]!]);
    const issues = collectProductGraphDomainIssues(dangling);

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: "DOMAIN_CORE_CONTRACT_INVALID",
      phase: "core",
      target: "",
      field: null,
    });
    expect(issues[0]?.message).toContain("Duplicate Product Graph node id");

    let thrown: unknown;
    try {
      validateProductGraphDomain(dangling);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(DomainValidationError);
    expect((thrown as DomainValidationError).issues).toEqual(issues);
  });

  it.each([
    ["persona", { goals: ["g"], name: " " }],
    ["workflow", { name: "Flow", steps: [] }],
    ["assumption", { confidence: "high", statement: "s" }],
    ["entity", { name: "Order", tenantOwned: "yes" }],
  ] as [DomainNodeKind, JsonObject][])(
    "rejects malformed nested values for %s",
    (kind, attributes) => {
      const issues = collectProductGraphDomainIssues(singleNode(kind, attributes));
      expect(issues).toHaveLength(1);
      expect(issues[0]?.code).toBe("DOMAIN_INVALID_FIELD_TYPE");
    },
  );

  it("does not mutate or normalize the validated input", () => {
    const candidate: ProductGraphStateV1 = structuredClone(nodeGraph);
    const before = JSON.stringify(candidate);

    expect(collectProductGraphDomainIssues(candidate)).toEqual([]);
    const validated = validateProductGraphDomain(candidate);

    expect(JSON.stringify(candidate)).toBe(before);
    expect(candidate.edges).toEqual([]);
    expect(validated).toEqual(validateProductGraphState(candidate));
  });

  it("preserves canonical revision identity and never collapses distinguished documents", () => {
    const revision = createProductGraphRevision(nodeGraph);
    validateProductGraphDomain(nodeGraph);

    expect(semanticProductGraphRevision(nodeGraph)).toBe(revision.revision);
    expect(parseProductGraphRevision(serializeProductGraphRevision(revision)).revision).toBe(
      revision.revision,
    );

    const reordered: ProductGraphStateV1 = { ...nodeGraph, nodes: [...nodeGraph.nodes].reverse() };
    expect(semanticProductGraphRevision(reordered)).toBe(revision.revision);

    const renamed: ProductGraphStateV1 = {
      ...nodeGraph,
      nodes: nodeGraph.nodes.map((node) =>
        node.id === "probe:page" ? { ...node, attributes: { name: "Orders v2" } } : node,
      ),
    };
    expect(collectProductGraphDomainIssues(renamed)).toEqual([]);
    expect(semanticProductGraphRevision(renamed)).not.toBe(revision.revision);

    expect(() =>
      validateProductGraphState({
        ...singleNode("role", { name: "Operator" }),
        nodes: [{ id: "probe:node", kind: "role", attributes: { name: "Operator" }, extra: 1 }],
      }),
    ).toThrow(/unknown keys/);
  });

  it("rejects cyclic and over-deep canonical JSON deterministically", () => {
    const cyclic: Record<string, unknown> = { name: "loop" };
    cyclic.self = cyclic;

    expect(() => validateProductGraphState(singleNode("role", cyclic as JsonObject))).toThrow(
      /must not contain a cycle/,
    );

    let deep: JsonValue = "leaf";
    for (let index = 0; index < 80; index += 1) deep = [deep];
    const deepGraph = singleNode("role", { name: "deep", nested: deep });

    let first: unknown;
    let second: unknown;
    try {
      validateProductGraphState(deepGraph);
    } catch (error) {
      first = error;
    }
    try {
      validateProductGraphState(deepGraph);
    } catch (error) {
      second = error;
    }

    expect(first).toBeInstanceOf(TypeError);
    expect(first).not.toBeInstanceOf(RangeError);
    expect((first as Error).message).toMatch(/maximum canonical JSON depth/);
    expect((second as Error).message).toBe((first as Error).message);
  });
});

const edgeGraph: ProductGraphStateV1 = {
  schemaVersion: 1,
  graphId: "graph:domain-edges",
  nodes: [
    ...probeNodes,
    { id: "probe:role-auditor", kind: "role", attributes: { name: "Auditor" } },
  ],
  edges: [
    {
      id: "edge:may",
      kind: "may",
      from: "probe:role",
      to: "probe:action",
      attributes: {},
    },
    {
      id: "edge:cannot",
      kind: "cannot",
      from: "probe:role-auditor",
      to: "probe:action",
      attributes: {},
    },
    {
      id: "edge:displays",
      kind: "displays",
      from: "probe:page",
      to: "probe:entity",
      attributes: {},
    },
    {
      id: "edge:triggers",
      kind: "triggers",
      from: "probe:page",
      to: "probe:action",
      attributes: {},
    },
    {
      id: "edge:starts",
      kind: "starts",
      from: "probe:action",
      to: "probe:workflow",
      attributes: {},
    },
    {
      id: "edge:reads",
      kind: "reads",
      from: "probe:workflow",
      to: "probe:entity",
      attributes: {},
    },
    {
      id: "edge:writes",
      kind: "writes",
      from: "probe:workflow",
      to: "probe:entity",
      attributes: {},
    },
    {
      id: "edge:requires",
      kind: "requires",
      from: "probe:requirement",
      to: "probe:page",
      attributes: {},
    },
    {
      id: "edge:governs",
      kind: "governs",
      from: "probe:permission",
      to: "probe:action",
      attributes: {},
    },
    {
      id: "edge:affects",
      kind: "affects",
      from: "probe:assumption",
      to: "probe:requirement",
      attributes: {},
    },
    {
      id: "edge:classified-as",
      kind: "classified_as",
      from: "probe:entity",
      to: "probe:dataclass",
      attributes: {},
    },
    {
      id: "edge:governs-policy",
      kind: "governs",
      from: "probe:datapolicy",
      to: "probe:entity",
      attributes: {},
    },
  ],
};

function edge(kind: string, from: string, to: string, id = "probe:edge"): ProductGraphEdgeV1 {
  return { id, kind, from, to, attributes: {} };
}

function graphWithEdges(
  nodes: readonly ProductGraphNodeV1[],
  edges: readonly ProductGraphEdgeV1[],
): ProductGraphStateV1 {
  return { schemaVersion: 1, graphId: "graph:probe", nodes, edges };
}

function edgeCodes(value: unknown): readonly string[] {
  return collectProductGraphDomainIssues(value).map((issue) => issue.code);
}

function endpointAccepts(allowed: readonly DomainEndpointKind[], kind: DomainNodeKind): boolean {
  return allowed.some((entry) => entry === kind || entry === DOMAIN_ANY_NODE_KIND);
}

describe("Product Graph domain edge and relation semantics", () => {
  it("accepts the well-formed edge fixture with no issues", () => {
    expect(collectProductGraphDomainIssues(edgeGraph)).toEqual([]);
    expect(validateProductGraphDomain(edgeGraph)).toEqual(validateProductGraphState(edgeGraph));
  });

  it("declares a spec for every edge kind in declared order and exercises every kind", () => {
    expect(DOMAIN_EDGE_KIND_SPECS.map((spec) => spec.kind)).toEqual([...DOMAIN_EDGE_KINDS]);
    expect([...new Set(edgeGraph.edges.map((item) => item.kind))].sort()).toEqual(
      [...DOMAIN_EDGE_KINDS].sort(),
    );
  });

  it("declares only known node kinds and at least one endpoint for every edge kind spec", () => {
    for (const spec of DOMAIN_EDGE_KIND_SPECS) {
      for (const allowed of [spec.from, spec.to]) {
        expect(allowed.length).toBeGreaterThan(0);
        for (const entry of allowed) {
          expect(entry === DOMAIN_ANY_NODE_KIND || DOMAIN_NODE_KINDS.includes(entry)).toBe(true);
        }
      }
      // The declared from/to sets are derived projections of the endpoint authority, so a pair can
      // never disagree with what the spec advertises.
      expect(spec.pairs.length).toBeGreaterThan(0);
      expect(spec.from).toEqual([...new Set(spec.pairs.map(([from]) => from))]);
      expect(spec.to).toEqual([...new Set(spec.pairs.map(([, to]) => to))]);
      // The wildcard is a target-only construct: endpoint matching looks the source up by concrete
      // node kind, so a pair declaring it as a source would be unreachable.
      for (const [from] of spec.pairs) {
        expect(from).not.toBe(DOMAIN_ANY_NODE_KIND);
      }
    }
  });

  it("rejects an incompatible source endpoint for every edge kind", () => {
    for (const spec of DOMAIN_EDGE_KIND_SPECS) {
      const badFrom = DOMAIN_NODE_KINDS.find((kind) => !endpointAccepts(spec.from, kind));
      expect(badFrom).toBeDefined();
      const goodTo = DOMAIN_NODE_KINDS.find((kind) => endpointAccepts(spec.to, kind));
      expect(goodTo).toBeDefined();
      // Keep the endpoints distinct so the only reported issue is the source-kind mismatch.
      const candidate = edge(
        spec.kind,
        `probe:${badFrom ?? "role"}`,
        badFrom === goodTo ? "probe:entity" : `probe:${goodTo ?? "action"}`,
      );
      const issues = collectProductGraphDomainIssues(graphWithEdges(probeNodes, [candidate]));
      expect(issues.map((issue) => [issue.code, issue.field])).toEqual([
        ["DOMAIN_ENDPOINT_KIND_MISMATCH", "from"],
      ]);
    }
  });

  it("rejects an incompatible target endpoint for every edge kind that constrains it", () => {
    for (const spec of DOMAIN_EDGE_KIND_SPECS) {
      const badTo = DOMAIN_NODE_KINDS.find((kind) => !endpointAccepts(spec.to, kind));
      if (badTo === undefined) continue;
      const goodFrom = DOMAIN_NODE_KINDS.find((kind) => endpointAccepts(spec.from, kind));
      expect(goodFrom).toBeDefined();
      const candidate = edge(spec.kind, `probe:${goodFrom ?? "role"}`, `probe:${badTo}`);
      const issues = collectProductGraphDomainIssues(graphWithEdges(probeNodes, [candidate]));
      expect(issues.map((issue) => [issue.code, issue.field])).toEqual([
        ["DOMAIN_ENDPOINT_KIND_MISMATCH", "to"],
      ]);
    }
  });

  it("rejects unknown edge kinds without inventing endpoint rules", () => {
    const candidate = edge("depends_on", "probe:role", "probe:action");
    const issues = collectProductGraphDomainIssues(graphWithEdges(probeNodes, [candidate]));
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: "DOMAIN_UNKNOWN_EDGE_KIND",
      phase: "edge",
      target: "probe:edge",
      field: "kind",
    });
  });

  it("rejects self-referencing edges for every edge kind", () => {
    for (const kind of DOMAIN_EDGE_KINDS) {
      const candidate = edge(kind, "probe:entity", "probe:entity");
      const issues = collectProductGraphDomainIssues(graphWithEdges(probeNodes, [candidate]));
      const selfReference = issues.filter((issue) => issue.code === "DOMAIN_SELF_REFERENCE");
      expect(selfReference).toHaveLength(1);
      expect(selfReference[0]).toMatchObject({ phase: "edge", target: "probe:edge", field: null });
    }
  });

  it("rejects duplicate relations and conflicting role authorization", () => {
    const duplicates = collectProductGraphDomainIssues(
      graphWithEdges(probeNodes, [
        edge("may", "probe:role", "probe:action", "edge:first"),
        edge("may", "probe:role", "probe:action", "edge:second"),
      ]),
    );
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]).toMatchObject({
      code: "DOMAIN_DUPLICATE_RELATION",
      phase: "relation",
      target: "edge:second",
      field: null,
    });
    expect(duplicates[0]?.message).toContain("edge:first");

    const conflicts = collectProductGraphDomainIssues(
      graphWithEdges(probeNodes, [
        edge("may", "probe:role", "probe:action", "edge:grant"),
        edge("cannot", "probe:role", "probe:action", "edge:deny"),
      ]),
    );
    expect(conflicts.map((issue) => [issue.code, issue.target, issue.phase])).toEqual([
      ["DOMAIN_CONFLICTING_AUTHORIZATION", "edge:deny", "relation"],
      ["DOMAIN_CONFLICTING_AUTHORIZATION", "edge:grant", "relation"],
    ]);
  });

  it("does not report an authorization conflict when the roles differ", () => {
    const secondRole: ProductGraphNodeV1 = {
      id: "probe:role-2",
      kind: "role",
      attributes: { name: "Auditor" },
    };
    const issues = collectProductGraphDomainIssues(
      graphWithEdges(
        [...probeNodes, secondRole],
        [
          edge("may", "probe:role", "probe:action", "edge:grant"),
          edge("cannot", "probe:role-2", "probe:action", "edge:deny"),
        ],
      ),
    );
    expect(issues).toEqual([]);
  });

  it("orders issues by documented phase, then target, field, and code", () => {
    const broken = graphWithEdges(
      [
        { id: "probe:zeta", kind: "role", attributes: { name: "Z", scope: "x" } },
        { id: "probe:alpha", kind: "role", attributes: { name: "A" } },
        { id: "probe:beta", kind: "entity", attributes: { name: "B" } },
      ],
      [
        edge("may", "probe:alpha", "probe:beta", "edge:z"),
        edge("may", "probe:alpha", "probe:beta", "edge:a"),
        edge("depends_on", "probe:alpha", "probe:beta", "edge:m"),
      ],
    );
    const reordered = graphWithEdges(
      [
        { id: "probe:beta", kind: "entity", attributes: { name: "B" } },
        { id: "probe:alpha", kind: "role", attributes: { name: "A" } },
        { id: "probe:zeta", kind: "role", attributes: { scope: "x", name: "Z" } },
      ],
      [
        edge("depends_on", "probe:alpha", "probe:beta", "edge:m"),
        edge("may", "probe:alpha", "probe:beta", "edge:a"),
        edge("may", "probe:alpha", "probe:beta", "edge:z"),
      ],
    );

    const baseline = collectProductGraphDomainIssues(broken);
    expect(baseline.map((issue) => [issue.phase, issue.target, issue.code])).toEqual([
      ["node", "probe:zeta", "DOMAIN_UNKNOWN_FIELD"],
      ["edge", "edge:a", "DOMAIN_ENDPOINT_KIND_MISMATCH"],
      ["edge", "edge:m", "DOMAIN_UNKNOWN_EDGE_KIND"],
      ["edge", "edge:z", "DOMAIN_ENDPOINT_KIND_MISMATCH"],
      ["relation", "edge:z", "DOMAIN_DUPLICATE_RELATION"],
    ]);
    expect(collectProductGraphDomainIssues(broken)).toEqual(baseline);
    expect(collectProductGraphDomainIssues(reordered)).toEqual(baseline);
  });

  it("keeps one deterministic core issue ahead of every domain phase", () => {
    const dangling = graphWithEdges(probeNodes, [
      edge("may", "probe:role", "probe:missing"),
      edge("depends_on", "probe:role", "probe:action"),
    ]);
    const issues = collectProductGraphDomainIssues(dangling);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: "DOMAIN_CORE_CONTRACT_INVALID",
      phase: "core",
      target: "",
      field: null,
    });
    expect(issues[0]?.message).toContain("references a missing node");
  });

  it("does not mutate the validated input and preserves canonical revision identity", () => {
    const candidate: ProductGraphStateV1 = structuredClone(edgeGraph);
    const before = JSON.stringify(candidate);
    const revision = createProductGraphRevision(edgeGraph);

    expect(edgeCodes(candidate)).toEqual([]);
    const validated = validateProductGraphDomain(candidate);

    expect(JSON.stringify(candidate)).toBe(before);
    expect(validated).toEqual(validateProductGraphState(candidate));
    expect(semanticProductGraphRevision(candidate)).toBe(revision.revision);
    expect(parseProductGraphRevision(serializeProductGraphRevision(revision)).revision).toBe(
      revision.revision,
    );

    const reordered: ProductGraphStateV1 = {
      ...edgeGraph,
      nodes: [...edgeGraph.nodes].reverse(),
      edges: [...edgeGraph.edges].reverse(),
    };
    expect(edgeCodes(reordered)).toEqual([]);
    expect(semanticProductGraphRevision(reordered)).toBe(revision.revision);

    const retargeted: ProductGraphStateV1 = {
      ...edgeGraph,
      edges: edgeGraph.edges.map((item) =>
        item.id === "edge:displays" ? { ...item, to: "probe:workflow" } : item,
      ),
    };
    expect(edgeCodes(retargeted)).toEqual(["DOMAIN_ENDPOINT_KIND_MISMATCH"]);
    expect(semanticProductGraphRevision(retargeted)).not.toBe(revision.revision);
  });

  it("preserves ordered single-pass outgoing-edge query results after the OCR-003 repair", () => {
    const query = openProductGraphRevision(createProductGraphRevision(edgeGraph));

    for (const node of edgeGraph.nodes) {
      expect(query.outgoingEdges(node.id).map((item) => item.id)).toEqual(
        edgeGraph.edges
          .filter((item) => item.from === node.id)
          .map((item) => item.id)
          .sort(),
      );
    }
    expect(query.outgoingEdges("probe:role").map((item) => item.id)).toEqual(["edge:may"]);
    expect(query.outgoingEdges("probe:role-auditor").map((item) => item.id)).toEqual([
      "edge:cannot",
    ]);
    expect(query.outgoingEdges("probe:persona")).toEqual([]);
    expect(query.outgoingEdges("probe:missing")).toEqual([]);
    expect(query.sliceFrom("probe:role").edgeIds).toEqual(["edge:may"]);
  });

  it("covers every declared edge kind in the edge fixture", () => {
    for (const kind of DOMAIN_EDGE_KINDS) {
      expect(edgeGraph.edges.some((item) => item.kind === kind)).toBe(true);
    }
  });
});

const policyEnumFields: readonly DomainEnumFieldSpec[] = DOMAIN_ENUM_FIELDS.filter(
  (spec) => spec.kind === "datapolicy",
);

describe("Product Graph data classification and lifecycle semantics", () => {
  it("declares a closed, unique, non-empty vocabulary for every enum-constrained attribute", () => {
    expect(DOMAIN_ENUM_FIELDS.length).toBeGreaterThan(0);
    expect(policyEnumFields.map((spec) => spec.field)).toEqual([
      "audit",
      "deletion",
      "export",
      "residency",
      "retention",
    ]);
    expect(DOMAIN_ENUM_FIELDS.find((spec) => spec.kind === "dataclass")?.values).toEqual([
      ...DOMAIN_DATA_CLASS_LEVELS,
    ]);
    expect(DOMAIN_ENUM_FIELDS.find((spec) => spec.field === "retention")?.values).toEqual([
      ...DOMAIN_RETENTION_VALUES,
    ]);
    expect(DOMAIN_ENUM_FIELDS.find((spec) => spec.field === "deletion")?.values).toEqual([
      ...DOMAIN_DELETION_VALUES,
    ]);
    expect(DOMAIN_ENUM_FIELDS.find((spec) => spec.field === "export")?.values).toEqual([
      ...DOMAIN_EXPORT_VALUES,
    ]);
    expect(DOMAIN_ENUM_FIELDS.find((spec) => spec.field === "audit")?.values).toEqual([
      ...DOMAIN_AUDIT_VALUES,
    ]);
    expect(DOMAIN_ENUM_FIELDS.find((spec) => spec.field === "residency")?.values).toEqual([
      ...DOMAIN_RESIDENCY_VALUES,
    ]);

    for (const enumSpec of DOMAIN_ENUM_FIELDS) {
      const kindSpec = DOMAIN_NODE_KIND_SPECS.find((item) => item.kind === enumSpec.kind);
      const declared: Record<string, DomainFieldType> = {
        ...kindSpec?.required,
        ...kindSpec?.optional,
      };
      expect(kindSpec).toBeDefined();
      expect(declared[enumSpec.field]).toBe("string");
      expect(enumSpec.values.length).toBeGreaterThan(0);
      expect(new Set(enumSpec.values).size).toBe(enumSpec.values.length);
    }

    // One declared vocabulary per attribute: a duplicated entry would report the same violation
    // twice for one value, so the invariant is pinned rather than assumed.
    expect(new Set(DOMAIN_ENUM_FIELDS.map((spec) => `${spec.kind}.${spec.field}`)).size).toBe(
      DOMAIN_ENUM_FIELDS.length,
    );
  });

  it.each([...DOMAIN_DATA_CLASS_LEVELS])(
    "accepts the declared data-classification level %s",
    (level) => {
      const issues = collectProductGraphDomainIssues(
        singleNode("dataclass", { level, name: "Customer data" }),
      );
      expect(issues).toEqual([]);
    },
  );

  it.each(["PUBLIC", "public ", "confidential", "restricted", "private"])(
    "rejects the out-of-vocabulary classification level %j",
    (level) => {
      const issues = collectProductGraphDomainIssues(
        singleNode("dataclass", { level, name: "Customer data" }),
      );
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({
        code: "DOMAIN_INVALID_ENUM_VALUE",
        phase: "node",
        target: "probe:node",
        field: "level",
      });
      expect(issues[0]?.message).toContain(
        "public, internal, personal, sensitive, secret, regulated",
      );
    },
  );

  it.each(["", " "])("rejects the blank classification level %j as a type violation", (level) => {
    const issues = collectProductGraphDomainIssues(
      singleNode("dataclass", { level, name: "Customer data" }),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: "DOMAIN_INVALID_FIELD_TYPE",
      target: "probe:node",
      field: "level",
    });
  });

  const lifecycleValueCases = policyEnumFields.flatMap((spec) =>
    spec.values.map((value) => [spec.field, value] as [string, string]),
  );

  it.each(lifecycleValueCases)("accepts the declared lifecycle value %s=%s", (field, value) => {
    const attributes: Record<string, JsonValue> = { deletion: "scheduled", name: "Policy" };
    attributes[field] = value;
    expect(collectProductGraphDomainIssues(singleNode("datapolicy", attributes))).toEqual([]);
  });

  it.each([
    ["retention", "forever"],
    ["deletion", "purge"],
    ["export", "always"],
    ["audit", "optional"],
    ["residency", "eu-only"],
  ])("rejects the out-of-vocabulary lifecycle value %s=%s", (field, value) => {
    const issues = collectProductGraphDomainIssues(
      singleNode("datapolicy", { [field]: value, name: "Policy" }),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: "DOMAIN_INVALID_ENUM_VALUE",
      phase: "node",
      target: "probe:node",
      field,
    });
  });

  it.each([
    [{ name: "Policy", retention: "bounded" }, ["DOMAIN_LIFECYCLE_CONTRADICTION"]],
    [
      { deletion: "none", name: "Policy", retention: "bounded" },
      ["DOMAIN_LIFECYCLE_CONTRADICTION"],
    ],
    [{ deletion: "soft", name: "Policy", retention: "bounded" }, []],
    [{ deletion: "hard", name: "Policy", retention: "bounded" }, []],
    [{ deletion: "scheduled", name: "Policy", retention: "bounded" }, []],
    [{ name: "Policy", retention: "indefinite" }, []],
    [{ deletion: "none", name: "Policy", retention: "indefinite" }, []],
    [{ deletion: 7, name: "Policy", retention: "bounded" }, ["DOMAIN_INVALID_FIELD_TYPE"]],
  ] as [JsonObject, readonly string[]][])(
    "reports the bounded-retention lifecycle rule for %j",
    (attributes, expectedCodes) => {
      const issues = collectProductGraphDomainIssues(singleNode("datapolicy", attributes));
      expect(issues.map((issue) => issue.code)).toEqual([...expectedCodes]);
      for (const issue of issues) {
        expect(issue.phase).toBe("node");
      }
      if (expectedCodes.includes("DOMAIN_LIFECYCLE_CONTRADICTION")) {
        expect(issues[0]).toMatchObject({ target: "probe:node", field: "deletion" });
        expect(issues[0]?.message).toContain("soft");
      }
    },
  );

  it("fails closed for classification and lifecycle attributes that are not declared yet", () => {
    const issues = collectProductGraphDomainIssues(
      graphWith([
        {
          id: "probe:class",
          kind: "dataclass",
          attributes: { level: "internal", name: "C", purpose: "analytics" },
        },
        { id: "probe:policy", kind: "datapolicy", attributes: { consent: "required", name: "P" } },
      ]),
    );
    expect(issues.map((issue) => [issue.target, issue.field, issue.code])).toEqual([
      ["probe:class", "purpose", "DOMAIN_UNKNOWN_FIELD"],
      ["probe:policy", "consent", "DOMAIN_UNKNOWN_FIELD"],
    ]);
  });

  it("keeps classification and lifecycle reporting deterministic across node order", () => {
    const nodes: readonly ProductGraphNodeV1[] = [
      { id: "probe:beta", kind: "dataclass", attributes: { level: "restricted", name: "B" } },
      { id: "probe:alpha", kind: "datapolicy", attributes: { name: "A", retention: "bounded" } },
      { id: "probe:gamma", kind: "datapolicy", attributes: { export: "always", name: "C" } },
    ];
    const baseline = collectProductGraphDomainIssues(graphWith(nodes));

    expect(baseline.map((issue) => [issue.target, issue.field, issue.code])).toEqual([
      ["probe:alpha", "deletion", "DOMAIN_LIFECYCLE_CONTRADICTION"],
      ["probe:beta", "level", "DOMAIN_INVALID_ENUM_VALUE"],
      ["probe:gamma", "export", "DOMAIN_INVALID_ENUM_VALUE"],
    ]);
    expect(collectProductGraphDomainIssues(graphWith([...nodes].reverse()))).toEqual(baseline);
    expect(collectProductGraphDomainIssues(graphWith(nodes))).toEqual(baseline);
  });

  it("does not mutate classification and lifecycle input and preserves revision identity", () => {
    const graph: ProductGraphStateV1 = graphWith([
      {
        id: "probe:class",
        kind: "dataclass",
        attributes: { level: "regulated", name: "Regulated data" },
      },
      {
        id: "probe:policy",
        kind: "datapolicy",
        attributes: { deletion: "hard", name: "Regulated policy", retention: "bounded" },
      },
    ]);
    const before = JSON.stringify(graph);
    const revision = createProductGraphRevision(graph);

    expect(collectProductGraphDomainIssues(graph)).toEqual([]);
    const validated = validateProductGraphDomain(graph);

    expect(JSON.stringify(graph)).toBe(before);
    expect(validated).toEqual(validateProductGraphState(graph));
    expect(semanticProductGraphRevision(graph)).toBe(revision.revision);
    expect(parseProductGraphRevision(serializeProductGraphRevision(revision)).revision).toBe(
      revision.revision,
    );
  });
});

const governanceNodes: readonly ProductGraphNodeV1[] = [
  { id: "gov:entity", kind: "entity", attributes: { name: "Customer" } },
  { id: "gov:class-internal", kind: "dataclass", attributes: { level: "internal", name: "Ops" } },
  { id: "gov:class-public", kind: "dataclass", attributes: { level: "public", name: "Marketing" } },
  { id: "gov:class-personal", kind: "dataclass", attributes: { level: "personal", name: "PII" } },
  {
    id: "gov:class-personal-copy",
    kind: "dataclass",
    attributes: { level: "personal", name: "PII copy" },
  },
  { id: "gov:class-secret", kind: "dataclass", attributes: { level: "secret", name: "Secrets" } },
  {
    id: "gov:policy",
    kind: "datapolicy",
    attributes: { deletion: "hard", name: "Customer policy", retention: "bounded" },
  },
  {
    id: "gov:policy-open",
    kind: "datapolicy",
    attributes: { audit: "required", export: "on-request", name: "Open policy" },
  },
  { id: "gov:permission", kind: "permission", attributes: { effect: "allow", name: "Read" } },
];

function governanceGraph(edges: readonly ProductGraphEdgeV1[]): ProductGraphStateV1 {
  return graphWithEdges(governanceNodes, edges);
}

function withExportedPolicy(policyExport: string): readonly ProductGraphNodeV1[] {
  return governanceNodes.map((node) =>
    node.id === "gov:policy-open"
      ? { ...node, attributes: { ...node.attributes, export: policyExport } }
      : node,
  );
}

function governanceCodes(value: unknown): readonly string[] {
  return collectProductGraphDomainIssues(value).map((issue) => issue.code);
}

describe("Product Graph data-governance relation and cross-node semantics", () => {
  it("accepts every declared endpoint pair of every relation kind", () => {
    const cases = DOMAIN_EDGE_KIND_SPECS.flatMap((spec) =>
      spec.pairs.map(
        ([from, to]) =>
          [
            spec.kind,
            `probe:${from}`,
            to === DOMAIN_ANY_NODE_KIND ? "probe:requirement" : `probe:${to}`,
          ] as [string, string, string],
      ),
    );

    expect(cases.length).toBeGreaterThan(DOMAIN_EDGE_KINDS.length);
    for (const [kind, from, to] of cases) {
      const issues = collectProductGraphDomainIssues(
        graphWithEdges(probeNodes, [edge(kind, from, to)]),
      );
      expect(issues.filter((issue) => issue.code === "DOMAIN_ENDPOINT_KIND_MISMATCH")).toEqual([]);
    }
  });

  it.each([
    ["governs", "permission", "entity"],
    ["governs", "datapolicy", "action"],
    ["requires", "permission", "datapolicy"],
    ["classified_as", "datapolicy", "dataclass"],
    ["classified_as", "entity", "entity"],
    ["displays", "page", "page"],
  ] as [string, string, string][])(
    "keeps rejecting the endpoint combination %s %s -> %s",
    (kind, from, to) => {
      const issues = collectProductGraphDomainIssues(
        graphWithEdges(probeNodes, [edge(kind, `probe:${from}`, `probe:${to}`)]),
      );
      expect(issues.map((issue) => issue.code)).toContain("DOMAIN_ENDPOINT_KIND_MISMATCH");
    },
  );

  it("accepts the source-specific governance relations", () => {
    expect(
      collectProductGraphDomainIssues(
        graphWithEdges(probeNodes, [
          edge("classified_as", "probe:entity", "probe:dataclass", "edge:classified"),
          edge("governs", "probe:datapolicy", "probe:entity", "edge:policy-governs"),
          edge("requires", "probe:requirement", "probe:datapolicy", "edge:requirement"),
        ]),
      ),
    ).toEqual([]);
  });

  it("declares the classification levels that require a handling policy", () => {
    expect([...DOMAIN_POLICY_REQUIRED_CLASS_LEVELS]).toEqual([
      "personal",
      "sensitive",
      "secret",
      "regulated",
    ]);
    expect([...DOMAIN_CONTINUOUS_EXPORT_BLOCKED_LEVELS]).toEqual(["secret", "regulated"]);
    for (const level of DOMAIN_POLICY_REQUIRED_CLASS_LEVELS) {
      expect(DOMAIN_DATA_CLASS_LEVELS).toContain(level);
    }
    for (const level of DOMAIN_CONTINUOUS_EXPORT_BLOCKED_LEVELS) {
      expect(DOMAIN_POLICY_REQUIRED_CLASS_LEVELS).toContain(level);
    }
  });

  it("reports an entity that is classified into more than one level", () => {
    const issues = collectProductGraphDomainIssues(
      governanceGraph([
        edge("classified_as", "gov:entity", "gov:class-internal", "edge:class-a"),
        edge("classified_as", "gov:entity", "gov:class-personal", "edge:class-b"),
        edge("governs", "gov:policy", "gov:entity", "edge:governs"),
      ]),
    );

    expect(issues.map((issue) => [issue.code, issue.phase, issue.target])).toEqual([
      ["DOMAIN_CONFLICTING_CLASSIFICATION", "governance", "gov:entity"],
    ]);
    expect(issues[0]?.message).toContain("internal, personal");
  });

  it("does not report a conflict when every classification declares the same level", () => {
    const codes = governanceCodes(
      governanceGraph([
        edge("classified_as", "gov:entity", "gov:class-personal", "edge:class-a"),
        edge("classified_as", "gov:entity", "gov:class-personal-copy", "edge:class-b"),
        edge("governs", "gov:policy", "gov:entity", "edge:governs"),
      ]),
    );

    expect(codes).toEqual([]);
  });

  it("reports classified data that requires a handling policy but has none", () => {
    const ungoverned = collectProductGraphDomainIssues(
      governanceGraph([edge("classified_as", "gov:entity", "gov:class-personal")]),
    );
    expect(ungoverned.map((issue) => [issue.code, issue.target, issue.field])).toEqual([
      ["DOMAIN_SENSITIVE_DATA_WITHOUT_POLICY", "gov:entity", null],
    ]);
    expect(ungoverned[0]?.message).toContain("personal");

    const governed = collectProductGraphDomainIssues(
      governanceGraph([
        edge("classified_as", "gov:entity", "gov:class-personal", "edge:class"),
        edge("governs", "gov:policy", "gov:entity", "edge:governs"),
      ]),
    );
    expect(governed).toEqual([]);
  });

  it("does not require a handling policy for internal or public data", () => {
    expect(
      governanceCodes(governanceGraph([edge("classified_as", "gov:entity", "gov:class-internal")])),
    ).toEqual([]);
    expect(
      governanceCodes(governanceGraph([edge("classified_as", "gov:entity", "gov:class-public")])),
    ).toEqual([]);
  });

  it("does not treat a rejected governs edge as a governing policy", () => {
    const codes = governanceCodes(
      governanceGraph([
        edge("classified_as", "gov:entity", "gov:class-personal", "edge:class"),
        edge("governs", "gov:permission", "gov:entity", "edge:governs"),
      ]),
    );
    expect(codes).toEqual([
      "DOMAIN_ENDPOINT_KIND_MISMATCH",
      "DOMAIN_SENSITIVE_DATA_WITHOUT_POLICY",
    ]);
  });

  it("reports a policy that allows continuous export of secret data", () => {
    const issues = collectProductGraphDomainIssues(
      graphWithEdges(withExportedPolicy("continuous"), [
        edge("classified_as", "gov:entity", "gov:class-secret", "edge:class"),
        edge("governs", "gov:policy-open", "gov:entity", "edge:governs"),
      ]),
    );

    expect(issues.map((issue) => [issue.code, issue.phase, issue.target, issue.field])).toEqual([
      ["DOMAIN_CLASS_POLICY_CONFLICT", "governance", "gov:policy-open", "export"],
    ]);
    expect(issues[0]?.message).toContain("secret");
  });

  it.each([
    ["on-request", "gov:class-secret"],
    ["none", "gov:class-secret"],
    ["continuous", "gov:class-personal"],
    ["continuous", "gov:class-internal"],
  ] as [string, string][])(
    "does not report a class/policy conflict for export %s with %s data",
    (policyExport, classId) => {
      const codes = governanceCodes(
        graphWithEdges(withExportedPolicy(policyExport), [
          edge("classified_as", "gov:entity", classId, "edge:class"),
          edge("governs", "gov:policy-open", "gov:entity", "edge:governs"),
        ]),
      );

      expect(codes).toEqual([]);
    },
  );

  it("keeps governance reporting deterministic across node and edge order", () => {
    const nodes = withExportedPolicy("continuous");
    const edges: readonly ProductGraphEdgeV1[] = [
      edge("classified_as", "gov:entity", "gov:class-secret", "edge:class-a"),
      edge("classified_as", "gov:entity", "gov:class-personal", "edge:class-b"),
      edge("governs", "gov:policy-open", "gov:entity", "edge:governs"),
    ];
    const baseline = collectProductGraphDomainIssues(graphWithEdges(nodes, edges));

    expect(baseline.map((issue) => [issue.target, issue.code])).toEqual([
      ["gov:entity", "DOMAIN_CONFLICTING_CLASSIFICATION"],
      ["gov:policy-open", "DOMAIN_CLASS_POLICY_CONFLICT"],
    ]);
    expect(
      collectProductGraphDomainIssues(graphWithEdges([...nodes].reverse(), [...edges].reverse())),
    ).toEqual(baseline);
    expect(collectProductGraphDomainIssues(graphWithEdges(nodes, edges))).toEqual(baseline);
  });

  it("orders governance issues after every earlier phase", () => {
    const issues = collectProductGraphDomainIssues(
      graphWithEdges(
        [
          ...governanceNodes,
          { id: "gov:role", kind: "role", attributes: { name: "Operator", scope: "global" } },
        ],
        [
          edge("may", "gov:role", "gov:entity", "edge:may-target"),
          edge("classified_as", "gov:entity", "gov:class-personal", "edge:class"),
        ],
      ),
    );

    expect(issues.map((issue) => issue.phase)).toEqual(["node", "edge", "governance"]);
    expect(issues.map((issue) => issue.code)).toEqual([
      "DOMAIN_UNKNOWN_FIELD",
      "DOMAIN_ENDPOINT_KIND_MISMATCH",
      "DOMAIN_SENSITIVE_DATA_WITHOUT_POLICY",
    ]);
  });

  it("does not mutate governance input and preserves revision identity", () => {
    const graph = governanceGraph([
      edge("classified_as", "gov:entity", "gov:class-personal", "edge:class"),
      edge("governs", "gov:policy", "gov:entity", "edge:governs"),
    ]);
    const before = JSON.stringify(graph);
    const revision = createProductGraphRevision(graph);

    expect(collectProductGraphDomainIssues(graph)).toEqual([]);
    const validated = validateProductGraphDomain(graph);

    expect(JSON.stringify(graph)).toBe(before);
    expect(validated).toEqual(validateProductGraphState(graph));
    expect(semanticProductGraphRevision(graph)).toBe(revision.revision);
  });
});
