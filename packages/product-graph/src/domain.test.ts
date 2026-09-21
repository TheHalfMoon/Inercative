import { describe, expect, it } from "vitest";

import {
  DOMAIN_FIELD_TYPES,
  DOMAIN_NODE_KINDS,
  DOMAIN_NODE_KIND_SPECS,
  DomainValidationError,
  collectProductGraphDomainIssues,
  createProductGraphRevision,
  parseProductGraphRevision,
  semanticProductGraphRevision,
  serializeProductGraphRevision,
  validateProductGraphDomain,
  validateProductGraphState,
  type DomainFieldType,
  type DomainNodeKind,
  type JsonObject,
  type JsonValue,
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
