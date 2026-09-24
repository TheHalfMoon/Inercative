import { describe, expect, it } from "vitest";

import {
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

  it("replaces same-kind attributes and rejects kind changes", () => {
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

  it("fails closed for base, confidence, provenance, and operation errors", () => {
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
      compileChangeIntent(base, intent(base, [{ kind: "no-op" }, { kind: "no-op" }])),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_MULTIPLE_OPERATIONS" }));
    expect(() =>
      compileChangeIntent(
        base,
        intent(base, [
          {
            kind: "upsert-node",
            node: { id: "page:one", kind: "page", attributes: { name: "One" } },
          },
          {
            kind: "upsert-node",
            node: { id: "page:one", kind: "page", attributes: { name: "Two" } },
          },
        ]),
      ),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_DUPLICATE_TARGET" }));
    expect(() =>
      compileChangeIntent(base, intent(base, [{ kind: "unsupported" } as never])),
    ).toThrowError(expect.objectContaining({ code: "CHANGE_INTENT_INVALID_OPERATION" }));
  });

  it("fails closed with deterministic domain issues for an invalid candidate", () => {
    const base = baseGraph();
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
