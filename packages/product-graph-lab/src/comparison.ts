import { Buffer } from "node:buffer";

import { structuredDocumentAdapter } from "./document-prototype.ts";
import { representativeGraphFixture } from "./fixtures.ts";
import {
  canonicalGraphJson,
  makeSyntheticGraph,
  reversedInsertionOrder,
  semanticGraphEqual,
} from "./model.ts";
import { normalizedRelationalAdapter } from "./relational-prototype.ts";

export interface PrototypeComparisonReport {
  readonly schemaVersion: 1;
  readonly task: "IN-P02-S01-T01";
  readonly selection: "DEFERRED_TO_IN-P02-S01-T02";
  readonly fixture: {
    readonly graphId: string;
    readonly nodeCount: number;
    readonly edgeCount: number;
  };
  readonly parity: {
    readonly semanticRevisionEqual: boolean;
    readonly roundTripEqual: boolean;
    readonly insertionOrderStable: boolean;
    readonly queryResultsEqual: boolean;
  };
  readonly measured: {
    readonly representative: {
      readonly structuredDocumentBytes: number;
      readonly normalizedRelationalBytes: number;
      readonly normalizedRelationalRows: number;
    };
    readonly synthetic: {
      readonly nodeCount: 1000;
      readonly edgeCount: 2000;
      readonly structuredDocumentBytes: number;
      readonly normalizedRelationalBytes: number;
      readonly normalizedRelationalRows: number;
    };
  };
  readonly canonicalCriteria: {
    readonly deterministicDiff: {
      readonly structuredDocument: string;
      readonly normalizedRelational: string;
    };
    readonly mergeability: {
      readonly structuredDocument: string;
      readonly normalizedRelational: string;
    };
    readonly migrationVersioning: {
      readonly structuredDocument: string;
      readonly normalizedRelational: string;
    };
    readonly sliceQueryErgonomics: {
      readonly structuredDocument: string;
      readonly normalizedRelational: string;
    };
    readonly testability: {
      readonly structuredDocument: string;
      readonly normalizedRelational: string;
    };
    readonly humanInspectability: {
      readonly structuredDocument: string;
      readonly normalizedRelational: string;
    };
    readonly performance: {
      readonly structuredDocument: string;
      readonly normalizedRelational: string;
    };
  };
  readonly unresolvedTradeoffs: readonly string[];
}

function byteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

function queryParity(): boolean {
  const documentSnapshot = structuredDocumentAdapter.persist(representativeGraphFixture);
  const relationalSnapshot = normalizedRelationalAdapter.persist(representativeGraphFixture);
  const documentSession = structuredDocumentAdapter.open(documentSnapshot);
  const relationalSession = normalizedRelationalAdapter.open(relationalSnapshot);

  const nodeIds = ["page:orders", "entity:order", "role:operator", "missing"];
  for (const nodeId of nodeIds) {
    if (
      JSON.stringify(documentSession.getNode(nodeId)) !==
      JSON.stringify(relationalSession.getNode(nodeId))
    ) {
      return false;
    }
    if (
      JSON.stringify(documentSession.outgoingEdges(nodeId)) !==
      JSON.stringify(relationalSession.outgoingEdges(nodeId))
    ) {
      return false;
    }
    if (
      JSON.stringify(documentSession.sliceFrom(nodeId)) !==
      JSON.stringify(relationalSession.sliceFrom(nodeId))
    ) {
      return false;
    }
  }
  return true;
}

export function buildPrototypeComparisonReport(): PrototypeComparisonReport {
  const documentSnapshot = structuredDocumentAdapter.persist(representativeGraphFixture);
  const relationalSnapshot = normalizedRelationalAdapter.persist(representativeGraphFixture);
  const reversedDocument = structuredDocumentAdapter.persist(
    reversedInsertionOrder(representativeGraphFixture),
  );

  const documentRoundTrip = structuredDocumentAdapter.restore(documentSnapshot);
  const relationalRoundTrip = normalizedRelationalAdapter.restore(relationalSnapshot);

  const syntheticGraph = makeSyntheticGraph(1000, 2000);
  const syntheticDocument = structuredDocumentAdapter.persist(syntheticGraph);
  const syntheticRelational = normalizedRelationalAdapter.persist(syntheticGraph);

  return {
    schemaVersion: 1,
    task: "IN-P02-S01-T01",
    selection: "DEFERRED_TO_IN-P02-S01-T02",
    fixture: {
      graphId: representativeGraphFixture.graphId,
      nodeCount: representativeGraphFixture.nodes.length,
      edgeCount: representativeGraphFixture.edges.length,
    },
    parity: {
      semanticRevisionEqual: documentSnapshot.revision === relationalSnapshot.revisionRow.revision,
      roundTripEqual:
        semanticGraphEqual(representativeGraphFixture, documentRoundTrip) &&
        semanticGraphEqual(representativeGraphFixture, relationalRoundTrip),
      insertionOrderStable:
        structuredDocumentAdapter.serialize(documentSnapshot) ===
        structuredDocumentAdapter.serialize(reversedDocument),
      queryResultsEqual: queryParity(),
    },
    measured: {
      representative: {
        structuredDocumentBytes: byteLength(structuredDocumentAdapter.serialize(documentSnapshot)),
        normalizedRelationalBytes: byteLength(
          normalizedRelationalAdapter.serialize(relationalSnapshot),
        ),
        normalizedRelationalRows:
          1 + relationalSnapshot.nodeRows.length + relationalSnapshot.edgeRows.length,
      },
      synthetic: {
        nodeCount: 1000,
        edgeCount: 2000,
        structuredDocumentBytes: byteLength(structuredDocumentAdapter.serialize(syntheticDocument)),
        normalizedRelationalBytes: byteLength(
          normalizedRelationalAdapter.serialize(syntheticRelational),
        ),
        normalizedRelationalRows:
          1 + syntheticRelational.nodeRows.length + syntheticRelational.edgeRows.length,
      },
    },
    canonicalCriteria: {
      deterministicDiff: {
        structuredDocument:
          "Canonical sorting and attribute-key normalization produce a stable document diff; array edits can still widen textual diff context.",
        normalizedRelational:
          "Stable explicit node/edge row identities localize semantic changes; row serialization remains deterministic.",
      },
      mergeability: {
        structuredDocument:
          "One human-readable artifact is simple to inspect but concurrent edits near the same arrays can conflict.",
        normalizedRelational:
          "Independent node/edge rows offer narrower logical merge units but require a storage migration layer.",
      },
      migrationVersioning: {
        structuredDocument:
          "Schema-versioned whole-document transforms are straightforward for early prototypes but can become expensive for large revisions.",
        normalizedRelational:
          "Explicit revision/node/edge row schemas support incremental migrations but increase migration surface and coordination.",
      },
      sliceQueryErgonomics: {
        structuredDocument:
          "Derived in-memory indexes give direct node/outgoing lookups after loading one canonical document.",
        normalizedRelational:
          "Normalized rows map naturally to indexed relational queries and partial loading without whole-document hydration.",
      },
      testability: {
        structuredDocument:
          "Single canonical fixture, deterministic serialization, and round-trip assertions are compact.",
        normalizedRelational:
          "Row-level fixtures make constraints and query plans explicit but require more fixture material.",
      },
      humanInspectability: {
        structuredDocument:
          "Highest direct inspectability: semantic state is readable as one canonical JSON-shaped artifact.",
        normalizedRelational:
          "Rows are explicit but reconstructing the semantic whole requires joins or a projection.",
      },
      performance: {
        structuredDocument:
          "Measured serialized size is compact and indexed in-memory query work is constant after whole-document hydration.",
        normalizedRelational:
          "Measured row/storage overhead is higher in the prototype, but indexed partial reads avoid mandatory whole-document hydration.",
      },
    },
    unresolvedTradeoffs: [
      "Expected real project-size distribution and largest supported graph revision.",
      "Concurrent edit/merge pressure versus whole-revision inspectability.",
      "Whether partial server-side graph slices dominate whole-revision reads in later harness phases.",
      "Migration cadence once domain/data-governance semantics expand in P02-S02.",
    ],
  };
}

export function buildPrototypeComparisonReportJson(): string {
  return `${JSON.stringify(buildPrototypeComparisonReport(), null, 2)}\n`;
}

export function representativeCanonicalGraphJson(): string {
  return canonicalGraphJson(representativeGraphFixture);
}
