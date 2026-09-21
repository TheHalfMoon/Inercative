import {
  canonicalGraphState,
  canonicalizeJson,
  semanticGraphRevision,
  type JsonValue,
  type ProductGraphEdge,
  type ProductGraphNode,
  type ProductGraphSlice,
  type ProductGraphState,
} from "./structured.ts";

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
    throw new TypeError("Relational Product Graph attributes must encode a JSON object.");
  }
  return canonicalizeJson(parsed) as Readonly<Record<string, JsonValue>>;
}

function rowToNode(row: GraphNodeRow): ProductGraphNode {
  return {
    id: row.nodeId,
    kind: row.kind,
    attributes: parseAttributes(row.attributesJson),
  };
}

function rowToEdge(row: GraphEdgeRow): ProductGraphEdge {
  return {
    id: row.edgeId,
    kind: row.kind,
    from: row.fromNodeId,
    to: row.toNodeId,
    attributes: parseAttributes(row.attributesJson),
  };
}

function snapshotFromGraph(state: ProductGraphState): NormalizedRelationalSnapshot {
  const graph = canonicalGraphState(state);
  const revision = semanticGraphRevision(graph);
  return {
    representation: "normalized-relational-v1",
    revisionRow: { graphId: graph.graphId, schemaVersion: 1, revision },
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
}

function validatedSnapshotGraph(snapshot: NormalizedRelationalSnapshot): ProductGraphState {
  const { revisionRow } = snapshot;
  if (
    snapshot.representation !== "normalized-relational-v1" ||
    revisionRow.schemaVersion !== 1 ||
    revisionRow.graphId.trim().length === 0 ||
    revisionRow.revision.trim().length === 0
  ) {
    throw new TypeError("Invalid relational Product Graph revision row.");
  }

  for (const row of [...snapshot.nodeRows, ...snapshot.edgeRows]) {
    if (row.graphId !== revisionRow.graphId || row.revision !== revisionRow.revision) {
      throw new TypeError("Relational Product Graph row identity does not match its revision.");
    }
  }

  const graph = canonicalGraphState({
    schemaVersion: 1,
    graphId: revisionRow.graphId,
    nodes: snapshot.nodeRows.map(rowToNode),
    edges: snapshot.edgeRows.map(rowToEdge),
  });

  if (semanticGraphRevision(graph) !== revisionRow.revision) {
    throw new TypeError("Relational Product Graph revision does not match its rows.");
  }
  return graph;
}

class RelationalQuerySession {
  readonly #graph: ProductGraphState;
  readonly #nodes = new Map<string, ProductGraphNode>();
  readonly #outgoing = new Map<string, readonly ProductGraphEdge[]>();

  constructor(graph: ProductGraphState) {
    this.#graph = canonicalGraphState(graph);
    for (const node of this.#graph.nodes) this.#nodes.set(node.id, node);
    for (const node of this.#graph.nodes) {
      this.#outgoing.set(
        node.id,
        this.#graph.edges.filter((edge) => edge.from === node.id),
      );
    }
  }

  getNode(nodeId: string): ProductGraphNode | null {
    return this.#nodes.get(nodeId) ?? null;
  }

  outgoingEdges(nodeId: string): readonly ProductGraphEdge[] {
    return this.#outgoing.get(nodeId) ?? [];
  }

  sliceFrom(nodeId: string): ProductGraphSlice {
    const root = this.getNode(nodeId);
    if (root === null) return { graphId: this.#graph.graphId, nodeIds: [], edgeIds: [] };

    const edges = this.outgoingEdges(nodeId);
    return {
      graphId: this.#graph.graphId,
      nodeIds: [...new Set([root.id, ...edges.map((edge) => edge.to)])].sort(compareText),
      edgeIds: edges.map((edge) => edge.id).sort(compareText),
    };
  }
}

export const normalizedRelationalPrototype = {
  persist(state: ProductGraphState): NormalizedRelationalSnapshot {
    return snapshotFromGraph(state);
  },

  restore(snapshot: NormalizedRelationalSnapshot): ProductGraphState {
    return validatedSnapshotGraph(snapshot);
  },

  serialize(snapshot: NormalizedRelationalSnapshot): string {
    return JSON.stringify(snapshotFromGraph(validatedSnapshotGraph(snapshot)));
  },

  open(snapshot: NormalizedRelationalSnapshot): RelationalQuerySession {
    return new RelationalQuerySession(validatedSnapshotGraph(snapshot));
  },
};
