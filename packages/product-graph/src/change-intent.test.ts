import { describe, expect, it } from "vitest";

import {
  CHANGE_INTENT_MAX_OPERATIONS,
  compileChangeIntent,
  createProductGraphRevision,
  type ChangeIntentOperationV1,
  type ChangeIntentV1,
  type ProductGraphRevisionDocumentV1,
} from "./index.ts";

function baseGraph(): ProductGraphRevisionDocumentV1 {
  return createProductGraphRevision({
    schemaVersion: 1,
    graphId: "graph:change-intent",
    nodes: [{ id: "entity:account", kind: "entity", attributes: { name: "Account" } }],
    edges: [],
  });
}

function relationGraph(withEdge = false): ProductGraphRevisionDocumentV1 {
  return createProductGraphRevision({
    schemaVersion: 1,
    graphId: "graph:relations",
    nodes: [
      { id: "entity:account", kind: "entity", attributes: { name: "Account" } },
      { id: "entity:profile", kind: "entity", attributes: { name: "Profile" } },
      { id: "page:overview", kind: "page", attributes: { name: "Overview" } },
    ],
    edges: withEdge
      ? [
          {
            id: "edge:overview-account",
            kind: "displays",
            from: "page:overview",
            to: "entity:account",
            attributes: {},
          },
        ]
      : [],
  });
}

function intent(
  base: ProductGraphRevisionDocumentV1,
  operations: readonly ChangeIntentOperationV1[],
  overrides: Record<string, unknown> = {},
): ChangeIntentV1 {
  return {
    schemaVersion: 1,
    intentId: "intent:account-name",
    baseRevision: base.revision,
    provenance: { source: "user", reference: "user:message:1" },
    confidence: 0.9,
    operations,
    ...overrides,
  };
}

describe("compileChangeIntent", () => {
  it("compiles a no-op to a deterministic proposal without changing the base", () => {
    const base = baseGraph();
    const before = structuredClone(base);
    const request = intent(base, [{ kind: "no-op" }]);

    const first = compileChangeIntent(base, request);
    const second = compileChangeIntent(base, request);

    expect(first).toEqual(second);
    expect(first.baseRevision).toBe(base.revision);
    expect(first.candidateRevision).toEqual(base);
    expect(first.operation).toEqual({ kind: "no-op" });
    expect(first.operations).toEqual([{ kind: "no-op" }]);
    expect(first.issues).toEqual([]);
    expect(base).toEqual(before);
  });

  it("adds a valid node and returns a separately identified candidate revision", () => {
    const base = baseGraph();
    const proposal = compileChangeIntent(
      base,
      intent(base, [
        {
          kind: "upsert-node",
          node: { id: "page:overview", kind: "page", attributes: { name: "Overview" } },
        },
      ]),
    );

    expect(proposal.candidateRevision.graph.nodes).toHaveLength(2);
    expect(proposal.candidateRevision.revision).not.toBe(base.revision);
    expect(proposal.issues).toEqual([]);
    expect(proposal.proposalId).toMatch(/^proposal-[0-9a-f]{64}$/);
  });

  it("replaces same-kind node attributes and rejects node kind changes", () => {
    const base = baseGraph();
    const replacement = compileChangeIntent(
      base,
      intent(base, [
        {
          kind: "upsert-node",
          node: {
            id: "entity:account",
            kind: "entity",
            attributes: { name: "Customer account", description: "Renamed" },
          },
        },
      ]),
    );
    expect(replacement.candidateRevision.graph.nodes[0]?.attributes).toEqual({
      name: "Customer account",
      description: "Renamed",
    });

    expect(() =>
      compileChangeIntent(
        base,
        intent(base, [
          {
            kind: "upsert-node",
            node: { id: "entity:account", kind: "page", attributes: { name: "Overview" } },
          },
        ]),
      ),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_NODE_KIND_CHANGE" }));
  });

  it("adds and attribute-updates a valid edge without changing its stable identity", () => {
    const base = relationGraph();
    const added = compileChangeIntent(
      base,
      intent(base, [
        {
          kind: "upsert-edge",
          edge: {
            id: "edge:overview-account",
            kind: "displays",
            from: "page:overview",
            to: "entity:account",
            attributes: {},
          },
        },
      ]),
    );
    expect(added.candidateRevision.graph.edges).toEqual([
      {
        id: "edge:overview-account",
        kind: "displays",
        from: "page:overview",
        to: "entity:account",
        attributes: {},
      },
    ]);

    const updated = compileChangeIntent(
      added.candidateRevision,
      intent(
        added.candidateRevision,
        [
          {
            kind: "upsert-edge",
            edge: {
              id: "edge:overview-account",
              kind: "displays",
              from: "page:overview",
              to: "entity:account",
              attributes: { source: "user" },
            },
          },
        ],
        { intentId: "intent:edge-attributes" },
      ),
    );
    expect(updated.candidateRevision.graph.edges[0]?.attributes).toEqual({ source: "user" });
  });

  it("rejects edge kind and endpoint changes under an existing edge id", () => {
    const base = relationGraph(true);
    expect(() =>
      compileChangeIntent(
        base,
        intent(base, [
          {
            kind: "upsert-edge",
            edge: {
              id: "edge:overview-account",
              kind: "triggers",
              from: "page:overview",
              to: "entity:account",
              attributes: {},
            },
          },
        ]),
      ),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_EDGE_KIND_CHANGE" }));

    expect(() =>
      compileChangeIntent(
        base,
        intent(base, [
          {
            kind: "upsert-edge",
            edge: {
              id: "edge:overview-account",
              kind: "displays",
              from: "page:overview",
              to: "entity:profile",
              attributes: {},
            },
          },
        ]),
      ),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_EDGE_ENDPOINT_CHANGE" }));
  });

  it("applies remove-edge then remove-node in declared order and preserves inputs", () => {
    const base = relationGraph(true);
    const before = structuredClone(base);
    const request = intent(base, [
      { kind: "remove-edge", edgeId: "edge:overview-account" },
      { kind: "remove-node", nodeId: "page:overview" },
    ]);
    const requestBefore = structuredClone(request);

    const first = compileChangeIntent(base, request);
    const second = compileChangeIntent(base, request);

    expect(first).toEqual(second);
    expect(first.operation).toEqual({ kind: "remove-edge", edgeId: "edge:overview-account" });
    expect(first.operations).toEqual(request.operations);
    expect(first.candidateRevision.graph.edges).toEqual([]);
    expect(first.candidateRevision.graph.nodes.map((node) => node.id)).toEqual([
      "entity:account",
      "entity:profile",
    ]);
    expect(base).toEqual(before);
    expect(request).toEqual(requestBefore);
  });

  it("rejects invalid removal ordering, unknown targets, and duplicate targets", () => {
    const base = relationGraph(true);
    expect(() =>
      compileChangeIntent(
        base,
        intent(base, [
          { kind: "remove-node", nodeId: "page:overview" },
          { kind: "remove-edge", edgeId: "edge:overview-account" },
        ]),
      ),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_NODE_HAS_INCIDENT_EDGES" }));

    expect(() =>
      compileChangeIntent(base, intent(base, [{ kind: "remove-edge", edgeId: "edge:missing" }])),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_TARGET_NOT_FOUND" }));

    expect(() =>
      compileChangeIntent(
        base,
        intent(base, [
          { kind: "remove-edge", edgeId: "edge:overview-account" },
          { kind: "remove-edge", edgeId: "edge:overview-account" },
        ]),
      ),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_DUPLICATE_TARGET" }));
  });

  it("supports an ordered add-node then add-edge proposal", () => {
    const base = baseGraph();
    const proposal = compileChangeIntent(
      base,
      intent(base, [
        {
          kind: "upsert-node",
          node: { id: "page:overview", kind: "page", attributes: { name: "Overview" } },
        },
        {
          kind: "upsert-edge",
          edge: {
            id: "edge:overview-account",
            kind: "displays",
            from: "page:overview",
            to: "entity:account",
            attributes: {},
          },
        },
      ]),
    );

    expect(proposal.operations).toHaveLength(2);
    expect(proposal.candidateRevision.graph.nodes).toHaveLength(2);
    expect(proposal.candidateRevision.graph.edges).toHaveLength(1);
    expect(proposal.issues).toEqual([]);
  });

  it("fails closed for base, confidence, provenance, no-op conflicts, and operation limits", () => {
    const base = baseGraph();
    const request = intent(base, [{ kind: "no-op" }]);

    expect(() =>
      compileChangeIntent(base, { ...request, baseRevision: "sha256:wrong" }),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_BASE_MISMATCH" }));
    expect(() => compileChangeIntent(base, { ...request, confidence: 1.1 })).toThrowError(
      expect.objectContaining({ code: "CHANGE_INTENT_INVALID_CONFIDENCE" }),
    );
    expect(() =>
      compileChangeIntent(base, { ...request, provenance: { source: "unknown", reference: "x" } }),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_INVALID_PROVENANCE" }));
    expect(() =>
      compileChangeIntent(
        base,
        intent(base, [
          { kind: "no-op" },
          {
            kind: "upsert-node",
            node: { id: "page:one", kind: "page", attributes: { name: "One" } },
          },
        ]),
      ),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_OPERATION_CONFLICT" }));
    expect(() =>
      compileChangeIntent(
        base,
        intent(
          base,
          Array.from({ length: CHANGE_INTENT_MAX_OPERATIONS + 1 }, () => ({ kind: "no-op" as const })),
        ),
      ),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_TOO_MANY_OPERATIONS" }));
    expect(() =>
      compileChangeIntent(base, intent(base, [{ kind: "unsupported" } as never])),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_INVALID_OPERATION" }));
  });

  it("fails closed with deterministic domain issues for an invalid node or edge candidate", () => {
    const base = relationGraph();
    expect(() =>
      compileChangeIntent(
        base,
        intent(base, [
          {
            kind: "upsert-node",
            node: { id: "entity:invalid", kind: "entity", attributes: { name: 7 } },
          },
        ]),
      ),
    ).toThrowError(
      expect.objectContaining({
        code: "CHANGE_INTENT_DOMAIN_INVALID",
        issues: [
          expect.objectContaining({ code: "DOMAIN_INVALID_FIELD_TYPE", target: "entity:invalid" }),
        ],
      }),
    );

    expect(() =>
      compileChangeIntent(
        base,
        intent(base, [
          {
            kind: "upsert-edge",
            edge: {
              id: "edge:invalid",
              kind: "starts",
              from: "page:overview",
              to: "entity:account",
              attributes: {},
            },
          },
        ]),
      ),
    ).toThrowError(
      expect.objectContaining({
        code: "CHANGE_INTENT_DOMAIN_INVALID",
        issues: [expect.objectContaining({ code: "DOMAIN_INVALID_EDGE_ENDPOINT" })],
      }),
    );
  });

  it("is independent of base node insertion and JSON key order", () => {
    const first = createProductGraphRevision({
      schemaVersion: 1,
      graphId: "graph:order",
      nodes: [
        { id: "entity:a", kind: "entity", attributes: { name: "A" } },
        { id: "page:b", kind: "page", attributes: { name: "B" } },
      ],
      edges: [],
    });
    const second = createProductGraphRevision({
      schemaVersion: 1,
      graphId: "graph:order",
      nodes: [
        { id: "page:b", kind: "page", attributes: { name: "B" } },
        { id: "entity:a", kind: "entity", attributes: { name: "A" } },
      ],
      edges: [],
    });
    const request = intent(first, [{ kind: "no-op" }]);

    expect(compileChangeIntent(first, request)).toEqual(compileChangeIntent(second, request));
  });
});
