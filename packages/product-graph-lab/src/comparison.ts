import { Buffer } from "node:buffer";

import { normalizedRelationalPrototype } from "./relational.ts";
import {
  canonicalGraphJson,
  reversedInsertionOrder,
  structuredDocumentPrototype,
  type ProductGraphState,
} from "./structured.ts";

export interface PrototypeComparisonReport {
  readonly schemaVersion: 1;
  readonly task: "IN-P02-S01-T01";
  readonly selection: "DEFERRED_TO_IN-P02-S01-T02";
  readonly fixtures: {
    readonly representative: { readonly nodes: 4; readonly edges: 4 };
    readonly scaled: { readonly nodes: 128; readonly edges: 256 };
  };
  readonly parity: {
    readonly semanticRevisionEqual: boolean;
    readonly roundTripEqual: boolean;
    readonly insertionOrderStable: boolean;
    readonly queryResultsEqual: boolean;
  };
  readonly measurements: {
    readonly representative: SurfaceMeasurement;
    readonly scaled: SurfaceMeasurement;
  };
  readonly criteria: Readonly<Record<CanonicalCriterion, RepresentationNotes>>;
  readonly unresolvedTradeoffs: readonly string[];
}

interface SurfaceMeasurement {
  readonly structuredDocumentBytes: number;
  readonly normalizedRelationalBytes: number;
  readonly normalizedRelationalRows: number;
}

interface RepresentationNotes {
  readonly structuredDocument: string;
  readonly normalizedRelational: string;
}

type CanonicalCriterion =
  | "deterministicDiff"
  | "mergeability"
  | "migrationVersioning"
  | "sliceQueryErgonomics"
  | "testability"
  | "humanInspectability"
  | "performance";

export const representativeGraphFixture: ProductGraphState = {
  schemaVersion: 1,
  graphId: "fixture:operations-console",
  nodes: [
    { id: "action:refund", kind: "action", attributes: { label: "Refund" } },
    { id: "entity:order", kind: "entity", attributes: { label: "Order" } },
    { id: "page:orders", kind: "page", attributes: { label: "Orders" } },
    { id: "role:operator", kind: "role", attributes: { label: "Operator" } },
  ],
  edges: [
    { id: "edge:page-order", kind: "displays", from: "page:orders", to: "entity:order", attributes: {} },
    { id: "edge:page-refund", kind: "offers", from: "page:orders", to: "action:refund", attributes: {} },
    { id: "edge:role-page", kind: "uses", from: "role:operator", to: "page:orders", attributes: {} },
    { id: "edge:role-refund", kind: "permits", from: "role:operator", to: "action:refund", attributes: {} },
  ],
};

function scaledGraphFixture(): ProductGraphState {
  const nodes = Array.from({ length: 128 }, (_, index) => ({
    id: `node:${index.toString().padStart(3, "0")}`,
    kind: index % 2 === 0 ? "entity" : "feature",
    attributes: { index, label: `Node ${index}` },
  }));
  const edges = Array.from({ length: 256 }, (_, index) => ({
    id: `edge:${index.toString().padStart(3, "0")}`,
    kind: "relates",
    from: nodes[index % nodes.length]!.id,
    to: nodes[(index * 7 + 1) % nodes.length]!.id,
    attributes: { index },
  }));
  return { schemaVersion: 1, graphId: "fixture:scaled-128-256", nodes, edges };
}

function byteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

function graphEqual(left: ProductGraphState, right: ProductGraphState): boolean {
  return canonicalGraphJson(left) === canonicalGraphJson(right);
}

function surface(state: ProductGraphState): SurfaceMeasurement {
  const structured = structuredDocumentPrototype.persist(state);
  const relational = normalizedRelationalPrototype.persist(state);
  return {
    structuredDocumentBytes: byteLength(structuredDocumentPrototype.serialize(structured)),
    normalizedRelationalBytes: byteLength(normalizedRelationalPrototype.serialize(relational)),
    normalizedRelationalRows: 1 + relational.nodeRows.length + relational.edgeRows.length,
  };
}

function parityFor(state: ProductGraphState, queryNode: string): PrototypeComparisonReport["parity"] {
  const structured = structuredDocumentPrototype.persist(state);
  const relational = normalizedRelationalPrototype.persist(state);
  const structuredSession = structuredDocumentPrototype.open(structured);
  const relationalSession = normalizedRelationalPrototype.open(relational);
  const reversed = reversedInsertionOrder(state);

  return {
    semanticRevisionEqual: structured.revision === relational.revisionRow.revision,
    roundTripEqual:
      graphEqual(state, structuredDocumentPrototype.restore(structured)) &&
      graphEqual(state, normalizedRelationalPrototype.restore(relational)),
    insertionOrderStable:
      structuredDocumentPrototype.serialize(structured) ===
        structuredDocumentPrototype.serialize(structuredDocumentPrototype.persist(reversed)) &&
      normalizedRelationalPrototype.serialize(relational) ===
        normalizedRelationalPrototype.serialize(normalizedRelationalPrototype.persist(reversed)),
    queryResultsEqual:
      JSON.stringify(structuredSession.getNode(queryNode)) ===
        JSON.stringify(relationalSession.getNode(queryNode)) &&
      JSON.stringify(structuredSession.outgoingEdges(queryNode)) ===
        JSON.stringify(relationalSession.outgoingEdges(queryNode)) &&
      JSON.stringify(structuredSession.sliceFrom(queryNode)) ===
        JSON.stringify(relationalSession.sliceFrom(queryNode)),
  };
}

function combineParity(
  left: PrototypeComparisonReport["parity"],
  right: PrototypeComparisonReport["parity"],
): PrototypeComparisonReport["parity"] {
  return {
    semanticRevisionEqual: left.semanticRevisionEqual && right.semanticRevisionEqual,
    roundTripEqual: left.roundTripEqual && right.roundTripEqual,
    insertionOrderStable: left.insertionOrderStable && right.insertionOrderStable,
    queryResultsEqual: left.queryResultsEqual && right.queryResultsEqual,
  };
}

export function buildPrototypeComparisonReport(): PrototypeComparisonReport {
  const scaled = scaledGraphFixture();
  return {
    schemaVersion: 1,
    task: "IN-P02-S01-T01",
    selection: "DEFERRED_TO_IN-P02-S01-T02",
    fixtures: { representative: { nodes: 4, edges: 4 }, scaled: { nodes: 128, edges: 256 } },
    parity: combineParity(
      parityFor(representativeGraphFixture, "page:orders"),
      parityFor(scaled, "node:000"),
    ),
    measurements: { representative: surface(representativeGraphFixture), scaled: surface(scaled) },
    criteria: {
      deterministicDiff: {
        structuredDocument: "Canonical sorting yields stable documents; array edits can widen textual diff context.",
        normalizedRelational: "Stable row identities yield deterministic serialization and narrower logical change units.",
      },
      mergeability: {
        structuredDocument: "One inspectable artifact is simple, while concurrent edits can overlap within shared arrays.",
        normalizedRelational: "Independent node and edge rows provide narrower logical merge units with more storage structure.",
      },
      migrationVersioning: {
        structuredDocument: "Whole-document schema transforms are direct but operate on complete revisions.",
        normalizedRelational: "Explicit revision/node/edge rows support granular migrations with a larger schema surface.",
      },
      sliceQueryErgonomics: {
        structuredDocument: "Deterministic in-memory indexes serve slices after complete-document hydration.",
        normalizedRelational: "Row identity maps naturally to indexed partial-read designs; database behavior is not measured here.",
      },
      testability: {
        structuredDocument: "Canonical fixtures and round-trip assertions are compact.",
        normalizedRelational: "Row-level constraints are explicit and independently falsifiable.",
      },
      humanInspectability: {
        structuredDocument: "The semantic whole is directly readable as one canonical snapshot.",
        normalizedRelational: "Rows are explicit, but reconstructing the semantic whole requires projection.",
      },
      performance: {
        structuredDocument: "Deterministic serialized size is measured; production hydration/query latency is not.",
        normalizedRelational: "Deterministic bytes and row counts are measured; production indexed-query latency is not.",
      },
    },
    unresolvedTradeoffs: [
      "Production database latency and indexing behavior at realistic project sizes.",
      "Observed concurrent-edit conflict rates versus whole-revision inspectability.",
      "Migration cadence once P02-S02 domain and governance semantics expand.",
    ],
  };
}

export function buildPrototypeComparisonReportJson(): string {
  return `${JSON.stringify(buildPrototypeComparisonReport(), null, 2)}\n`;
}
