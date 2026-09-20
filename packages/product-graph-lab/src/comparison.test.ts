import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { buildPrototypeComparisonReport } from "./comparison.ts";
import { structuredDocumentAdapter } from "./document-prototype.ts";
import { representativeGraphFixture } from "./fixtures.ts";
import { canonicalGraphJson, reversedInsertionOrder, semanticGraphEqual } from "./model.ts";
import { normalizedRelationalAdapter } from "./relational-prototype.ts";

describe("Product Graph persistence prototypes", () => {
  it("round-trips the representative graph through both alternatives", () => {
    const documentSnapshot = structuredDocumentAdapter.persist(representativeGraphFixture);
    const relationalSnapshot = normalizedRelationalAdapter.persist(representativeGraphFixture);

    expect(
      semanticGraphEqual(
        structuredDocumentAdapter.restore(documentSnapshot),
        representativeGraphFixture,
      ),
    ).toBe(true);
    expect(
      semanticGraphEqual(
        normalizedRelationalAdapter.restore(relationalSnapshot),
        representativeGraphFixture,
      ),
    ).toBe(true);
  });

  it("binds both alternatives to the same semantic revision", () => {
    const documentSnapshot = structuredDocumentAdapter.persist(representativeGraphFixture);
    const relationalSnapshot = normalizedRelationalAdapter.persist(representativeGraphFixture);

    expect(documentSnapshot.revision).toBe(relationalSnapshot.revisionRow.revision);
  });

  it("keeps structured-document serialization stable under insertion-order permutations", () => {
    const first = structuredDocumentAdapter.persist(representativeGraphFixture);
    const second = structuredDocumentAdapter.persist(
      reversedInsertionOrder(representativeGraphFixture),
    );

    expect(structuredDocumentAdapter.serialize(first)).toBe(
      structuredDocumentAdapter.serialize(second),
    );
  });

  it("returns equivalent deterministic node, edge, and slice queries", () => {
    const documentSession = structuredDocumentAdapter.open(
      structuredDocumentAdapter.persist(representativeGraphFixture),
    );
    const relationalSession = normalizedRelationalAdapter.open(
      normalizedRelationalAdapter.persist(representativeGraphFixture),
    );

    for (const nodeId of ["page:orders", "entity:order", "role:operator", "missing"]) {
      expect(documentSession.getNode(nodeId)).toEqual(relationalSession.getNode(nodeId));
      expect(documentSession.outgoingEdges(nodeId)).toEqual(
        relationalSession.outgoingEdges(nodeId),
      );
      expect(documentSession.sliceFrom(nodeId)).toEqual(relationalSession.sliceFrom(nodeId));
    }
  });

  it("preserves explicit relational node, edge, and revision identity", () => {
    const snapshot = normalizedRelationalAdapter.persist(representativeGraphFixture);

    expect(snapshot.revisionRow.graphId).toBe(representativeGraphFixture.graphId);
    expect(snapshot.nodeRows).toHaveLength(representativeGraphFixture.nodes.length);
    expect(snapshot.edgeRows).toHaveLength(representativeGraphFixture.edges.length);
    expect(snapshot.nodeRows.every((row) => row.revision === snapshot.revisionRow.revision)).toBe(
      true,
    );
    expect(snapshot.edgeRows.every((row) => row.revision === snapshot.revisionRow.revision)).toBe(
      true,
    );
  });

  it("records every canonical selection criterion without making the T02 decision", () => {
    const report = buildPrototypeComparisonReport();

    expect(report.selection).toBe("DEFERRED_TO_IN-P02-S01-T02");
    expect(report.parity).toEqual({
      semanticRevisionEqual: true,
      roundTripEqual: true,
      insertionOrderStable: true,
      queryResultsEqual: true,
    });
    expect(Object.keys(report.canonicalCriteria).sort()).toEqual(
      [
        "deterministicDiff",
        "humanInspectability",
        "mergeability",
        "migrationVersioning",
        "performance",
        "sliceQueryErgonomics",
        "testability",
      ].sort(),
    );
    expect(report.unresolvedTradeoffs.length).toBeGreaterThan(0);
  });

  it("measures deterministic representative and synthetic storage surfaces", () => {
    const first = buildPrototypeComparisonReport();
    const second = buildPrototypeComparisonReport();

    expect(first.measured).toEqual(second.measured);
    expect(first.measured.synthetic.nodeCount).toBe(1000);
    expect(first.measured.synthetic.edgeCount).toBe(2000);
    expect(first.measured.synthetic.normalizedRelationalRows).toBe(3001);
    expect(first.measured.synthetic.structuredDocumentBytes).toBeGreaterThan(0);
    expect(first.measured.synthetic.normalizedRelationalBytes).toBeGreaterThan(0);
  });

  it("keeps the committed comparison report synchronized with executable evidence", () => {
    const committed = JSON.parse(
      readFileSync(
        "docs/evidence/P02_S01_T01_PRODUCT_GRAPH_PROTOTYPE_COMPARISON_2026-09-20.json",
        "utf8",
      ),
    ) as unknown;

    expect(committed).toEqual(buildPrototypeComparisonReport());
  });

  it("keeps canonical graph JSON stable", () => {
    expect(canonicalGraphJson(representativeGraphFixture)).toBe(
      canonicalGraphJson(reversedInsertionOrder(representativeGraphFixture)),
    );
  });
});
