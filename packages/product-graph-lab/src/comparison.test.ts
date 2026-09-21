import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { buildPrototypeComparisonReport } from "./comparison.ts";

describe("Product Graph prototype comparison", () => {
  it("proves semantic, round-trip, ordering, and query parity", () => {
    expect(buildPrototypeComparisonReport().parity).toEqual({
      semanticRevisionEqual: true,
      roundTripEqual: true,
      insertionOrderStable: true,
      queryResultsEqual: true,
    });
  });

  it("covers every canonical selection criterion while deferring selection", () => {
    const report = buildPrototypeComparisonReport();
    expect(report.selection).toBe("DEFERRED_TO_IN-P02-S01-T02");
    expect(Object.keys(report.criteria).sort()).toEqual(
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

  it("produces deterministic representative and scaled measurements", () => {
    const first = buildPrototypeComparisonReport();
    const second = buildPrototypeComparisonReport();

    expect(first.measurements).toEqual(second.measurements);
    expect(first.fixtures.scaled).toEqual({ nodes: 128, edges: 256 });
    expect(first.measurements.representative.normalizedRelationalRows).toBe(9);
    expect(first.measurements.scaled.normalizedRelationalRows).toBe(385);
    expect(first.measurements.scaled.structuredDocumentBytes).toBeGreaterThan(0);
    expect(first.measurements.scaled.normalizedRelationalBytes).toBeGreaterThan(0);
  });

  it("keeps committed comparison evidence synchronized with executable evidence", () => {
    const committed = JSON.parse(
      readFileSync(
        "docs/evidence/P02_S01_T01_PRODUCT_GRAPH_PROTOTYPE_COMPARISON_2026-09-21.json",
        "utf8",
      ),
    ) as unknown;

    expect(committed).toEqual(buildPrototypeComparisonReport());
  });
});
