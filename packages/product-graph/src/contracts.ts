import { createHash } from "node:crypto";

export const PRODUCT_GRAPH_SCHEMA_VERSION = 1 as const;
export const PRODUCT_GRAPH_REPRESENTATION = "structured-document-v1" as const;
export const PRODUCT_GRAPH_MAX_JSON_DEPTH = 64 as const;

export type JsonScalar = string | number | boolean | null;

export interface JsonObject {
  readonly [key: string]: JsonValue;
}

export type JsonValue = JsonScalar | readonly JsonValue[] | JsonObject;
export type ProductGraphRevision = `sha256:${string}`;

export interface ProductGraphNodeV1 {
  readonly id: string;
  readonly kind: string;
  readonly attributes: JsonObject;
}

export interface ProductGraphEdgeV1 {
  readonly id: string;
  readonly kind: string;
  readonly from: string;
  readonly to: string;
  readonly attributes: JsonObject;
}

export interface ProductGraphStateV1 {
  readonly schemaVersion: 1;
  readonly graphId: string;
  readonly nodes: readonly ProductGraphNodeV1[];
  readonly edges: readonly ProductGraphEdgeV1[];
}

export interface ProductGraphRevisionDocumentV1 {
  readonly representation: typeof PRODUCT_GRAPH_REPRESENTATION;
  readonly revision: ProductGraphRevision;
  readonly graph: ProductGraphStateV1;
}

export interface ProductGraphSliceV1 {
  readonly graphId: string;
  readonly nodeIds: readonly string[];
  readonly edgeIds: readonly string[];
}

export interface ProductGraphQueryV1 {
  getNode(nodeId: string): ProductGraphNodeV1 | null;
  outgoingEdges(nodeId: string): readonly ProductGraphEdgeV1[];
  sliceFrom(nodeId: string): ProductGraphSliceV1;
}

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function assertExactKeys(
  record: Record<string, unknown>,
  allowedKeys: readonly string[],
  label: string,
): void {
  const unknownKeys = Object.keys(record)
    .filter((key) => !allowedKeys.includes(key))
    .sort(compareText);
  if (unknownKeys.length > 0) {
    throw new TypeError(`${label} has unknown keys: ${unknownKeys.join(", ")}`);
  }
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    throw new TypeError(`${label} must be an object.`);
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${label} must be a plain object.`);
  }
  return value as Record<string, unknown>;
}

function nonBlankString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value;
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function canonicalJson(value: unknown, label = "JSON value"): JsonValue {
  return canonicalJsonValue(value, label, 0, new Set<object>());
}

function canonicalJsonValue(
  value: unknown,
  label: string,
  depth: number,
  ancestors: Set<object>,
): JsonValue {
  if (depth > PRODUCT_GRAPH_MAX_JSON_DEPTH) {
    throw new TypeError(
      `${label} exceeds the maximum canonical JSON depth of ${PRODUCT_GRAPH_MAX_JSON_DEPTH.toString()}.`,
    );
  }
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`${label} numbers must be finite.`);
    return value;
  }
  if (isUnknownArray(value)) {
    if (ancestors.has(value)) throw new TypeError(`${label} must not contain a cycle.`);
    ancestors.add(value);
    const canonical = Object.freeze(
      value.map((item, index) =>
        canonicalJsonValue(item, `${label}[${index.toString()}]`, depth + 1, ancestors),
      ),
    );
    ancestors.delete(value);
    return canonical;
  }
  const record = asRecord(value, label);
  if (ancestors.has(record)) throw new TypeError(`${label} must not contain a cycle.`);
  ancestors.add(record);
  const canonical = Object.freeze(
    Object.fromEntries(
      Object.keys(record)
        .sort(compareText)
        .map((key) => [
          key,
          canonicalJsonValue(record[key], `${label}.${key}`, depth + 1, ancestors),
        ]),
    ),
  );
  ancestors.delete(record);
  return canonical;
}

function attributes(value: unknown, label: string): JsonObject {
  const canonical = canonicalJson(value, label);
  if (canonical === null || isUnknownArray(canonical) || typeof canonical !== "object") {
    throw new TypeError(`${label} must be a JSON object.`);
  }
  return canonical;
}

function node(value: unknown): ProductGraphNodeV1 {
  const record = asRecord(value, "Product Graph node");
  assertExactKeys(record, ["id", "kind", "attributes"], "Product Graph node");
  return Object.freeze({
    id: nonBlankString(record.id, "Product Graph node id"),
    kind: nonBlankString(record.kind, "Product Graph node kind"),
    attributes: attributes(record.attributes, "Product Graph node attributes"),
  });
}

function edge(value: unknown): ProductGraphEdgeV1 {
  const record = asRecord(value, "Product Graph edge");
  assertExactKeys(record, ["id", "kind", "from", "to", "attributes"], "Product Graph edge");
  return Object.freeze({
    id: nonBlankString(record.id, "Product Graph edge id"),
    kind: nonBlankString(record.kind, "Product Graph edge kind"),
    from: nonBlankString(record.from, "Product Graph edge from"),
    to: nonBlankString(record.to, "Product Graph edge to"),
    attributes: attributes(record.attributes, "Product Graph edge attributes"),
  });
}

export function validateProductGraphState(value: unknown): ProductGraphStateV1 {
  const record = asRecord(value, "Product Graph state");
  assertExactKeys(record, ["schemaVersion", "graphId", "nodes", "edges"], "Product Graph state");
  if (record.schemaVersion !== PRODUCT_GRAPH_SCHEMA_VERSION) {
    throw new TypeError("Product Graph schemaVersion must be 1.");
  }
  const graphId = nonBlankString(record.graphId, "Product Graph graphId");
  if (!Array.isArray(record.nodes) || !Array.isArray(record.edges)) {
    throw new TypeError("Product Graph nodes and edges must be arrays.");
  }

  const nodes = Object.freeze(record.nodes.map(node).sort((a, b) => compareText(a.id, b.id)));
  const nodeIds = new Set<string>();
  for (const item of nodes) {
    if (nodeIds.has(item.id)) throw new TypeError(`Duplicate Product Graph node id: ${item.id}`);
    nodeIds.add(item.id);
  }

  const edges = Object.freeze(record.edges.map(edge).sort((a, b) => compareText(a.id, b.id)));
  const edgeIds = new Set<string>();
  for (const item of edges) {
    if (edgeIds.has(item.id)) throw new TypeError(`Duplicate Product Graph edge id: ${item.id}`);
    if (!nodeIds.has(item.from) || !nodeIds.has(item.to)) {
      throw new TypeError(`Product Graph edge ${item.id} references a missing node.`);
    }
    edgeIds.add(item.id);
  }

  return Object.freeze({ schemaVersion: 1, graphId, nodes, edges });
}

export function canonicalProductGraphJson(value: unknown): string {
  return JSON.stringify(validateProductGraphState(value));
}

export function semanticProductGraphRevision(value: unknown): ProductGraphRevision {
  return `sha256:${createHash("sha256").update(canonicalProductGraphJson(value)).digest("hex")}`;
}

export function createProductGraphRevision(
  graph: ProductGraphStateV1,
): ProductGraphRevisionDocumentV1 {
  const canonical = validateProductGraphState(graph);
  return Object.freeze({
    representation: PRODUCT_GRAPH_REPRESENTATION,
    revision: semanticProductGraphRevision(canonical),
    graph: canonical,
  });
}

export function validateProductGraphRevision(value: unknown): ProductGraphRevisionDocumentV1 {
  const record = asRecord(value, "Product Graph revision document");
  assertExactKeys(
    record,
    ["representation", "revision", "graph"],
    "Product Graph revision document",
  );
  if (record.representation !== PRODUCT_GRAPH_REPRESENTATION) {
    throw new TypeError("Product Graph representation must be structured-document-v1.");
  }
  if (typeof record.revision !== "string" || !/^sha256:[0-9a-f]{64}$/.test(record.revision)) {
    throw new TypeError("Product Graph revision must be a lowercase sha256 digest.");
  }
  const graph = validateProductGraphState(record.graph);
  const revision = semanticProductGraphRevision(graph);
  if (record.revision !== revision) {
    throw new TypeError("Product Graph revision digest does not match canonical graph state.");
  }
  return Object.freeze({ representation: PRODUCT_GRAPH_REPRESENTATION, revision, graph });
}

export function serializeProductGraphRevision(value: unknown): string {
  return JSON.stringify(validateProductGraphRevision(value));
}

export function parseProductGraphRevision(serialized: string): ProductGraphRevisionDocumentV1 {
  return validateProductGraphRevision(JSON.parse(serialized) as unknown);
}

class ProductGraphQuerySession implements ProductGraphQueryV1 {
  readonly #graph: ProductGraphStateV1;
  readonly #nodes = new Map<string, ProductGraphNodeV1>();
  readonly #outgoing = new Map<string, readonly ProductGraphEdgeV1[]>();

  constructor(document: ProductGraphRevisionDocumentV1) {
    this.#graph = document.graph;
    for (const item of this.#graph.nodes) this.#nodes.set(item.id, item);
    for (const item of this.#graph.nodes) {
      this.#outgoing.set(
        item.id,
        Object.freeze(this.#graph.edges.filter((candidate) => candidate.from === item.id)),
      );
    }
  }

  getNode(nodeId: string): ProductGraphNodeV1 | null {
    return this.#nodes.get(nodeId) ?? null;
  }

  outgoingEdges(nodeId: string): readonly ProductGraphEdgeV1[] {
    return this.#outgoing.get(nodeId) ?? [];
  }

  sliceFrom(nodeId: string): ProductGraphSliceV1 {
    const root = this.getNode(nodeId);
    if (root === null) {
      return Object.freeze({ graphId: this.#graph.graphId, nodeIds: [], edgeIds: [] });
    }
    const edges = this.outgoingEdges(nodeId);
    return Object.freeze({
      graphId: this.#graph.graphId,
      nodeIds: Object.freeze(
        [...new Set([root.id, ...edges.map((item) => item.to)])].sort(compareText),
      ),
      edgeIds: Object.freeze(edges.map((item) => item.id)),
    });
  }
}

export function openProductGraphRevision(value: unknown): ProductGraphQueryV1 {
  return new ProductGraphQuerySession(validateProductGraphRevision(value));
}
