import type {
  PrototypeGraphSlice,
  PrototypePersistenceAdapter,
  PrototypeQuerySession,
} from "./adapter.ts";
import {
  canonicalGraphState,
  semanticGraphRevision,
  type PrototypeEdge,
  type PrototypeGraphState,
  type PrototypeNode,
} from "./model.ts";

export interface StructuredDocumentSnapshot {
  readonly representation: "structured-document-v1";
  readonly revision: string;
  readonly graph: PrototypeGraphState;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

class StructuredDocumentSession implements PrototypeQuerySession {
  readonly #graph: PrototypeGraphState;
  readonly #nodeById = new Map<string, PrototypeNode>();
  readonly #outgoingByNode = new Map<string, readonly PrototypeEdge[]>();

  constructor(graph: PrototypeGraphState) {
    this.#graph = canonicalGraphState(graph);
    for (const node of this.#graph.nodes) {
      this.#nodeById.set(node.id, node);
    }

    const mutableOutgoing = new Map<string, PrototypeEdge[]>();
    for (const edge of this.#graph.edges) {
      const outgoing = mutableOutgoing.get(edge.from) ?? [];
      outgoing.push(edge);
      mutableOutgoing.set(edge.from, outgoing);
    }
    for (const [nodeId, edges] of mutableOutgoing) {
      this.#outgoingByNode.set(
        nodeId,
        [...edges].sort((left, right) => compareText(left.id, right.id)),
      );
    }
  }

  getNode(nodeId: string): PrototypeNode | null {
    return this.#nodeById.get(nodeId) ?? null;
  }

  outgoingEdges(nodeId: string): readonly PrototypeEdge[] {
    return this.#outgoingByNode.get(nodeId) ?? [];
  }

  sliceFrom(nodeId: string): PrototypeGraphSlice {
    const root = this.getNode(nodeId);
    if (root === null) {
      return { graphId: this.#graph.graphId, nodeIds: [], edgeIds: [] };
    }

    const edges = this.outgoingEdges(nodeId);
    const nodeIds = new Set<string>([root.id]);
    for (const edge of edges) {
      nodeIds.add(edge.to);
    }

    return {
      graphId: this.#graph.graphId,
      nodeIds: [...nodeIds].sort(compareText),
      edgeIds: edges.map((edge) => edge.id).sort(compareText),
    };
  }
}

export const structuredDocumentAdapter: PrototypePersistenceAdapter<StructuredDocumentSnapshot> = {
  id: "structured-document",

  persist(state) {
    const graph = canonicalGraphState(state);
    return {
      representation: "structured-document-v1",
      revision: semanticGraphRevision(graph),
      graph,
    };
  },

  restore(persisted) {
    return canonicalGraphState(persisted.graph);
  },

  serialize(persisted) {
    return JSON.stringify({
      representation: persisted.representation,
      revision: persisted.revision,
      graph: canonicalGraphState(persisted.graph),
    });
  },

  open(persisted) {
    return new StructuredDocumentSession(persisted.graph);
  },
};
