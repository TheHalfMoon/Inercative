import { describe, expect, it } from "vitest";

import { normalizedRelationalPrototype } from "./relational.ts";
import {
  canonicalGraphJson,
  reversedInsertionOrder,
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
      attributes: { label: "Orders", meta: { z: 2, a: 1 } },
    },
    { id: "action:refund", kind: "action", attributes: { label: "Refund" } },
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
      id: "edge:operator-refund",
      kind: "permits",
      from: "role:operator",
      to: "action:refund",
      attributes: {},
    },
  ],
};

describe("normalized relational Product Graph prototype", () => {
  it("round-trips the canonical semantic graph", () => {
    const snapshot = normalizedRelationalPrototype.persist(fixture);
    expect(canonicalGraphJson(normalizedRelationalPrototype.restore(snapshot))).toBe(
      canonicalGraphJson(fixture),
    );
  });

  it("canonicalizes graph and row insertion order", () => {
    const first = normalizedRelationalPrototype.persist(fixture);
    const second = normalizedRelationalPrototype.persist(reversedInsertionOrder(fixture));
    const reordered = {
      ...first,
      nodeRows: [...first.nodeRows].reverse(),
      edgeRows: [...first.edgeRows].reverse(),
    };

    expect(first.revisionRow.revision).toBe(second.revisionRow.revision);
    expect(normalizedRelationalPrototype.serialize(first)).toBe(
      normalizedRelationalPrototype.serialize(second),
    );
    expect(normalizedRelationalPrototype.serialize(reordered)).toBe(
      normalizedRelationalPrototype.serialize(first),
    );
  });

  it("returns deterministic bounded queries", () => {
    const session = normalizedRelationalPrototype.open(
      normalizedRelationalPrototype.persist(fixture),
    );

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

  it("rejects row graph and revision mismatches", () => {
    const snapshot = normalizedRelationalPrototype.persist(fixture);
    const wrongGraph = {
      ...snapshot,
      nodeRows: [
        { ...snapshot.nodeRows[0]!, graphId: "fixture:other" },
        ...snapshot.nodeRows.slice(1),
      ],
    };
    const wrongRevision = {
      ...snapshot,
      edgeRows: [
        { ...snapshot.edgeRows[0]!, revision: "sha256:stale" },
        ...snapshot.edgeRows.slice(1),
      ],
    };

    expect(() => normalizedRelationalPrototype.restore(wrongGraph)).toThrow(/identity/);
    expect(() => normalizedRelationalPrototype.open(wrongRevision)).toThrow(/identity/);
  });

  it("rejects malformed attributes and stale semantic revisions", () => {
    const snapshot = normalizedRelationalPrototype.persist(fixture);
    const malformed = {
      ...snapshot,
      nodeRows: [{ ...snapshot.nodeRows[0]!, attributesJson: "[]" }, ...snapshot.nodeRows.slice(1)],
    };
    const stale = {
      ...snapshot,
      nodeRows: [
        { ...snapshot.nodeRows[0]!, attributesJson: '{"label":"Changed"}' },
        ...snapshot.nodeRows.slice(1),
      ],
    };

    expect(() => normalizedRelationalPrototype.restore(malformed)).toThrow(/JSON object/);
    expect(() => normalizedRelationalPrototype.serialize(stale)).toThrow(/revision/);
  });
});
