import { createHash } from "node:crypto";

export type JsonValue =
  string | number | boolean | null | readonly JsonValue[] | { readonly [key: string]: JsonValue };

export interface ProductGraphNode {
  readonly id: string;
  readonly kind: string;
  readonly attributes: Readonly<Record<string, JsonValue>>;
}

export interface ProductGraphEdge {
  readonly id: string;
  readonly kind: string;
  readonly from: string;
  readonly to: string;
  readonly attributes: Readonly<Record<string, JsonValue>>;
}

export interface ProductGraphState {
  readonly schemaVersion: 1;
  readonly graphId: string;
  readonly nodes: readonly ProductGraphNode[];
  readonly edges: readonly ProductGraphEdge[];
}

export interface ProductGraphSlice {
  readonly graphId: string;
  readonly nodeIds: readonly string[];
  readonly edgeIds: readonly string[];
}

export interface StructuredDocumentSnapshot {
  readonly representation: "structured-document-v1";
  readonly revision: string;
  readonly graph: ProductGraphState;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function canonicalizeJson(value: JsonValue): JsonValue {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new TypeError("Canonical JSON numbers must be finite.");
  }
  if (Array.isArray(value)) {
    return (value as readonly JsonValue[]).map((item) => canonicalizeJson(item));
  }
  if (value !== null && typeof value === "object") {
    const record = value as Readonly<Record<string, JsonValue>>;
    return Object.fromEntries(
      Object.keys(record)
        .sort(compareText)
        .map((key) => {
          const item = record[key];
          if (item === undefined) {
            throw new TypeError(`Canonical JSON key ${key} resolved to undefined.`);
          }
          return [key, canonicalizeJson(item)];
        }),
    );
  }
  return value;
}

export function canonicalGraphState(state: ProductGraphState): ProductGraphState {
  if (state.schemaVersion !== 1 || state.graphId.trim().length === 0) {
    throw new TypeError("Product Graph requires schemaVersion 1 and a non-empty graphId.");
  }

  const nodes = state.nodes
    .map((node) => ({
      ...node,
      attributes: canonicalizeJson(node.attributes) as Readonly<Record<string, JsonValue>>,
    }))
    .sort((left, right) => compareText(left.id, right.id));
  const nodeIds = new Set<string>();

  for (const node of nodes) {
    if (node.id.trim().length === 0 || node.kind.trim().length === 0 || nodeIds.has(node.id)) {
      throw new TypeError(`Invalid or duplicate Product Graph node: ${node.id}`);
    }
    nodeIds.add(node.id);
  }

  const edgeIds = new Set<string>();
  const edges = state.edges
    .map((edge) => ({
      ...edge,
      attributes: canonicalizeJson(edge.attributes) as Readonly<Record<string, JsonValue>>,
    }))
    .sort((left, right) => compareText(left.id, right.id));

  for (const edge of edges) {
    if (
      edge.id.trim().length === 0 ||
      edge.kind.trim().length === 0 ||
      edgeIds.has(edge.id) ||
      !nodeIds.has(edge.from) ||
      !nodeIds.has(edge.to)
    ) {
      throw new TypeError(`Invalid Product Graph edge: ${edge.id}`);
    }
    edgeIds.add(edge.id);
  }

  return { schemaVersion: 1, graphId: state.graphId, nodes, edges };
}

export function canonicalGraphJson(state: ProductGraphState): string {
  return JSON.stringify(canonicalGraphState(state));
}

export function semanticGraphRevision(state: ProductGraphState): string {
  return `sha256:${createHash("sha256").update(canonicalGraphJson(state)).digest("hex")}`;
}

export function reversedInsertionOrder(state: ProductGraphState): ProductGraphState {
  return { ...state, nodes: [...state.nodes].reverse(), edges: [...state.edges].reverse() };
}

class StructuredQuerySession {
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
      edgeIds: edges.map((edge) => edge.id),
    };
  }
}

export const structuredDocumentPrototype = {
  persist(state: ProductGraphState): StructuredDocumentSnapshot {
    const graph = canonicalGraphState(state);
    return {
      representation: "structured-document-v1",
      revision: semanticGraphRevision(graph),
      graph,
    };
  },

  restore(snapshot: StructuredDocumentSnapshot): ProductGraphState {
    return canonicalGraphState(snapshot.graph);
  },

  serialize(snapshot: StructuredDocumentSnapshot): string {
    return JSON.stringify({
      representation: snapshot.representation,
      revision: snapshot.revision,
      graph: canonicalGraphState(snapshot.graph),
    });
  },

  open(snapshot: StructuredDocumentSnapshot): StructuredQuerySession {
    return new StructuredQuerySession(snapshot.graph);
  },
};
