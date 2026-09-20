import { createHash } from "node:crypto";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export interface PrototypeNode {
  readonly id: string;
  readonly kind: string;
  readonly attributes: Readonly<Record<string, JsonValue>>;
}

export interface PrototypeEdge {
  readonly id: string;
  readonly kind: string;
  readonly from: string;
  readonly to: string;
  readonly attributes: Readonly<Record<string, JsonValue>>;
}

export interface PrototypeGraphState {
  readonly schemaVersion: 1;
  readonly graphId: string;
  readonly nodes: readonly PrototypeNode[];
  readonly edges: readonly PrototypeEdge[];
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function canonicalizeJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalizeJson(item));
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

function canonicalAttributes(
  attributes: Readonly<Record<string, JsonValue>>,
): Readonly<Record<string, JsonValue>> {
  return canonicalizeJson(attributes) as Readonly<Record<string, JsonValue>>;
}

export function canonicalGraphState(state: PrototypeGraphState): PrototypeGraphState {
  if (state.schemaVersion !== 1) {
    throw new TypeError("Prototype graph schemaVersion must equal 1.");
  }
  if (state.graphId.trim().length === 0) {
    throw new TypeError("Prototype graph graphId must be non-empty.");
  }

  const nodes = state.nodes
    .map((node) => ({
      ...node,
      attributes: canonicalAttributes(node.attributes),
    }))
    .sort((left, right) => compareText(left.id, right.id));

  const edges = state.edges
    .map((edge) => ({
      ...edge,
      attributes: canonicalAttributes(edge.attributes),
    }))
    .sort((left, right) => compareText(left.id, right.id));

  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (node.id.trim().length === 0 || node.kind.trim().length === 0) {
      throw new TypeError("Prototype nodes require non-empty id and kind.");
    }
    if (nodeIds.has(node.id)) {
      throw new TypeError(`Duplicate prototype node id: ${node.id}`);
    }
    nodeIds.add(node.id);
  }

  const edgeIds = new Set<string>();
  for (const edge of edges) {
    if (edge.id.trim().length === 0 || edge.kind.trim().length === 0) {
      throw new TypeError("Prototype edges require non-empty id and kind.");
    }
    if (edgeIds.has(edge.id)) {
      throw new TypeError(`Duplicate prototype edge id: ${edge.id}`);
    }
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      throw new TypeError(`Prototype edge ${edge.id} references a missing endpoint.`);
    }
    edgeIds.add(edge.id);
  }

  return {
    schemaVersion: 1,
    graphId: state.graphId,
    nodes,
    edges,
  };
}

export function canonicalGraphJson(state: PrototypeGraphState): string {
  return JSON.stringify(canonicalGraphState(state));
}

export function semanticGraphRevision(state: PrototypeGraphState): string {
  return `sha256:${createHash("sha256").update(canonicalGraphJson(state)).digest("hex")}`;
}

export function semanticGraphEqual(
  left: PrototypeGraphState,
  right: PrototypeGraphState,
): boolean {
  return canonicalGraphJson(left) === canonicalGraphJson(right);
}

export function reversedInsertionOrder(state: PrototypeGraphState): PrototypeGraphState {
  return {
    ...state,
    nodes: [...state.nodes].reverse(),
    edges: [...state.edges].reverse(),
  };
}

export function makeSyntheticGraph(nodeCount: number, edgeCount: number): PrototypeGraphState {
  if (!Number.isInteger(nodeCount) || nodeCount < 2) {
    throw new TypeError("nodeCount must be an integer >= 2.");
  }
  if (!Number.isInteger(edgeCount) || edgeCount < 1) {
    throw new TypeError("edgeCount must be an integer >= 1.");
  }

  const kinds = ["entity", "page", "role", "requirement"] as const;
  const nodes = Array.from({ length: nodeCount }, (_, index): PrototypeNode => ({
    id: `node:${index.toString().padStart(4, "0")}`,
    kind: kinds[index % kinds.length] ?? "entity",
    attributes: {
      active: index % 2 === 0,
      index,
      label: `Synthetic node ${index.toString()}`,
    },
  }));

  const edges = Array.from({ length: edgeCount }, (_, index): PrototypeEdge => {
    const fromIndex = index % nodeCount;
    const toIndex = (index * 7 + 3) % nodeCount;
    return {
      id: `edge:${index.toString().padStart(5, "0")}`,
      kind: index % 2 === 0 ? "references" : "depends-on",
      from: nodes[fromIndex]?.id ?? "",
      to: nodes[toIndex]?.id ?? "",
      attributes: {
        ordinal: index,
      },
    };
  });

  return canonicalGraphState({
    schemaVersion: 1,
    graphId: `synthetic:${nodeCount.toString()}:${edgeCount.toString()}`,
    nodes,
    edges,
  });
}
