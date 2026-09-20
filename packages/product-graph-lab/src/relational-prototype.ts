import type {
  PrototypeGraphSlice,
  PrototypePersistenceAdapter,
  PrototypeQuerySession,
} from "./adapter.ts";
import {
  canonicalGraphState,
  canonicalizeJson,
  semanticGraphRevision,
  type JsonValue,
  type PrototypeEdge,
  type PrototypeNode,
} from "./model.ts";

export interface GraphRevisionRow {
  readonly graphId: string;
  readonly schemaVersion: 1;
  readonly revision: string;
}

export interface GraphNodeRow {
  readonly graphId: string;
  readonly revision: string;
  readonly nodeId: string;
  readonly kind: string;
  readonly attributesJson: string;
}

export interface GraphEdgeRow {
  readonly graphId: string;
  readonly revision: string;
  readonly edgeId: string;
  readonly kind: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly attributesJson: string;
}

export interface NormalizedRelationalSnapshot {
  readonly representation: "normalized-relational-v1";
  readonly revisionRow: GraphRevisionRow;
  readonly nodeRows: readonly GraphNodeRow[];
  readonly edgeRows: readonly GraphEdgeRow[];
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function parseAttributes(value: string): Readonly<Record<string, JsonValue>> {
  const parsed = JSON.parse(value) as JsonValue;
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new TypeError("Relational prototype attributesJson must encode a JSON object.");
  }
  return canonicalizeJson(parsed) as Readonly<Record<string, JsonValue>>;
}

function rowToNode(row: GraphNodeRow): PrototypeNode {
  return {
    id: row.nodeId,
    kind: row.kind,
    attributes: parseAttributes(row.attributesJson),
  };
}

function rowToEdge(row: GraphEdgeRow): PrototypeEdge {
  return {
    id: row.edgeId,
    kind: row.kind,
    from: row.fromNodeId,
    to: row.toNodeId,
    attributes: parseAttributes(row.attributesJson),
  };
}

class NormalizedRelationalSession implements PrototypeQuerySession {
  readonly #graphId: string;
  readonly #nodeById = new Map<string, GraphNodeRow>();
  readonly #outgoingByNode = new Map<string, readonly GraphEdgeRow[]>();

  constructor(snapshot: NormalizedRelationalSnapshot) {
    this.#graphId = snapshot.revisionRow.graphId;
    for (const row of snapshot.nodeRows) {
      this.#nodeById.set(row.nodeId, row);
    }

    const mutableOutgoing = new Map<string, GraphEdgeRow[]>();
    for (const row of snapshot.edgeRows) {
      const outgoing = mutableOutgoing.get(row.fromNodeId) ?? [];
      outgoing.push(row);
      mutableOutgoing.set(row.fromNodeId, outgoing);
    }
    for (const [nodeId, rows] of mutableOutgoing) {
      this.#outgoingByNode.set(
        nodeId,
        [...rows].sort((left, right) => compareText(left.edgeId, right.edgeId)),
      );
    }
  }

  getNode(nodeId: string): PrototypeNode | null {
    const row = this.#nodeById.get(nodeId);
    return row === undefined ? null : rowToNode(row);
  }

  outgoingEdges(nodeId: string): readonly PrototypeEdge[] {
    return (this.#outgoingByNode.get(nodeId) ?? []).map((row) => rowToEdge(row));
  }

  sliceFrom(nodeId: string): PrototypeGraphSlice {
    const root = this.getNode(nodeId);
    if (root === null) {
      return { graphId: this.#graphId, nodeIds: [], edgeIds: [] };
    }

    const edges = this.outgoingEdges(nodeId);
    const nodeIds = new Set<string>([root.id]);
    for (const edge of edges) {
      nodeIds.add(edge.to);
    }

    return {
      graphId: this.#graphId,
      nodeIds: [...nodeIds].sort(compareText),
      edgeIds: edges.map((edge) => edge.id).sort(compareText),
    };
  }
}

export const normalizedRelationalAdapter: PrototypePersistenceAdapter<NormalizedRelationalSnapshot> =
  {
    id: "normalized-relational",

    persist(state) {
      const graph = canonicalGraphState(state);
      const revision = semanticGraphRevision(graph);

      return {
        representation: "normalized-relational-v1",
        revisionRow: {
          graphId: graph.graphId,
          schemaVersion: 1,
          revision,
        },
        nodeRows: graph.nodes.map((node) => ({
          graphId: graph.graphId,
          revision,
          nodeId: node.id,
          kind: node.kind,
          attributesJson: JSON.stringify(node.attributes),
        })),
        edgeRows: graph.edges.map((edge) => ({
          graphId: graph.graphId,
          revision,
          edgeId: edge.id,
          kind: edge.kind,
          fromNodeId: edge.from,
          toNodeId: edge.to,
          attributesJson: JSON.stringify(edge.attributes),
        })),
      };
    },

    restore(persisted) {
      return canonicalGraphState({
        schemaVersion: persisted.revisionRow.schemaVersion,
        graphId: persisted.revisionRow.graphId,
        nodes: persisted.nodeRows.map((row) => rowToNode(row)),
        edges: persisted.edgeRows.map((row) => rowToEdge(row)),
      });
    },

    serialize(persisted) {
      return JSON.stringify({
        representation: persisted.representation,
        revisionRow: persisted.revisionRow,
        nodeRows: [...persisted.nodeRows].sort((left, right) =>
          compareText(left.nodeId, right.nodeId),
        ),
        edgeRows: [...persisted.edgeRows].sort((left, right) =>
          compareText(left.edgeId, right.edgeId),
        ),
      });
    },

    open(persisted) {
      return new NormalizedRelationalSession(persisted);
    },
  };
