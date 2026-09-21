import { describe, expect, it } from "vitest";

import {
  canonicalGraphJson,
  canonicalizeJson,
  reversedInsertionOrder,
  semanticGraphRevision,
  structuredDocumentPrototype,
  type ProductGraphState,
} from "./structured.ts";

const fixture: ProductGraphState = {
  schemaVersion: 1,
  graphId: "fixture:operations-console",
  nodes: [
    { id: "role:operator", kind: "role", attributes: { label: "Operator" } },
    {
      id: "page:orders",
      kind: "page",
      attributes: { route: "/orders", meta: { z: 2, a: 1 }, label: "Orders" },
    },
    { id: "action:refund", kind: "action", attributes: { label: "Refund" } },
    {
      id: "integration:payments",
      kind: "integration",
      attributes: { secretRequired: true, label: "Payments" },
    },
  ],
  edges: [
    {
      id: "edge:page-refund",
      kind: "offers",
      from: "page:orders",
      to: "action:refund",
      attributes: {},
    },
    {
      id: "edge:refund-payments",
      kind: "uses",
      from: "action:refund",
      to: "integration:payments",
      attributes: {},
    },
    {
      id: "edge:operator-refund",
      kind: "permits",
      from: "role:operator",
      to: "action:refund",
      attributes: {},
    },
  ],
};

describe("structured Product Graph prototype", () => {
  it("round-trips the canonical semantic graph", () => {
    const snapshot = structuredDocumentPrototype.persist(fixture);
    expect(canonicalGraphJson(structuredDocumentPrototype.restore(snapshot))).toBe(
      canonicalGraphJson(fixture),
    );
  });

  it("keeps serialization and revision stable across insertion order", () => {
    const first = structuredDocumentPrototype.persist(fixture);
    const second = structuredDocumentPrototype.persist(reversedInsertionOrder(fixture));

    expect(structuredDocumentPrototype.serialize(first)).toBe(
      structuredDocumentPrototype.serialize(second),
    );
    expect(first.revision).toBe(second.revision);
    expect(first.revision).toBe(semanticGraphRevision(fixture));
    expect(canonicalizeJson({ z: 1, a: { z: 2, a: 3 } })).toEqual({
      a: { a: 3, z: 2 },
      z: 1,
    });
  });

  it("returns deterministic node, outgoing-edge, and one-hop slice queries", () => {
    const session = structuredDocumentPrototype.open(structuredDocumentPrototype.persist(fixture));

    expect(session.getNode("page:orders")?.kind).toBe("page");
    expect(session.outgoingEdges("page:orders").map((edge) => edge.id)).toEqual([
      "edge:page-refund",
    ]);
    expect(session.sliceFrom("page:orders")).toEqual({
      graphId: fixture.graphId,
      nodeIds: ["action:refund", "page:orders"],
      edgeIds: ["edge:page-refund"],
    });
    expect(session.sliceFrom("missing")).toEqual({
      graphId: fixture.graphId,
      nodeIds: [],
      edgeIds: [],
    });
  });

  it("fails closed on duplicate identity and missing edge endpoints", () => {
    expect(() =>
      structuredDocumentPrototype.persist({
        ...fixture,
        nodes: [...fixture.nodes, fixture.nodes[0]!],
      }),
    ).toThrow(/node/);
    expect(() =>
      structuredDocumentPrototype.persist({
        ...fixture,
        edges: [
          ...fixture.edges,
          { id: "edge:bad", kind: "uses", from: "missing", to: "page:orders", attributes: {} },
        ],
      }),
    ).toThrow(/edge/);
  });
});
