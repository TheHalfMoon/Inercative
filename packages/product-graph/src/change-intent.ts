import { createHash } from "node:crypto";

import {
  createProductGraphRevision,
  validateProductGraphRevision,
  validateProductGraphState,
  type JsonObject,
  type JsonValue,
  type ProductGraphEdgeV1,
  type ProductGraphNodeV1,
  type ProductGraphRevision,
  type ProductGraphRevisionDocumentV1,
} from "./contracts.ts";
import { collectProductGraphDomainIssues, type DomainIssue } from "./domain.ts";

export const CHANGE_INTENT_SCHEMA_VERSION = 1 as const;
export const CHANGE_INTENT_MAX_OPERATIONS = 32 as const;
export const CHANGE_INTENT_OPERATION_KINDS = [
  "no-op",
  "upsert-node",
  "upsert-edge",
  "remove-node",
  "remove-edge",
] as const;
export type ChangeIntentOperationKind = (typeof CHANGE_INTENT_OPERATION_KINDS)[number];
export const CHANGE_INTENT_PROVENANCE_SOURCES = ["user", "import", "system"] as const;
export type ChangeIntentProvenanceSource = (typeof CHANGE_INTENT_PROVENANCE_SOURCES)[number];

export const CHANGE_INTENT_ERROR_CODES = [
  "CHANGE_INTENT_INVALID_SCHEMA",
  "CHANGE_INTENT_BASE_MISMATCH",
  "CHANGE_INTENT_INVALID_CONFIDENCE",
  "CHANGE_INTENT_INVALID_PROVENANCE",
  "CHANGE_INTENT_INVALID_OPERATION",
  "CHANGE_INTENT_MULTIPLE_OPERATIONS",
  "CHANGE_INTENT_TOO_MANY_OPERATIONS",
  "CHANGE_INTENT_OPERATION_CONFLICT",
  "CHANGE_INTENT_DUPLICATE_TARGET",
  "CHANGE_INTENT_TARGET_NOT_FOUND",
  "CHANGE_INTENT_NODE_KIND_CHANGE",
  "CHANGE_INTENT_EDGE_KIND_CHANGE",
  "CHANGE_INTENT_EDGE_ENDPOINT_CHANGE",
  "CHANGE_INTENT_NODE_HAS_INCIDENT_EDGES",
  "CHANGE_INTENT_DOMAIN_INVALID",
] as const;
export type ChangeIntentErrorCode = (typeof CHANGE_INTENT_ERROR_CODES)[number];

export interface ChangeIntentProvenanceV1 {
  readonly source: ChangeIntentProvenanceSource;
  readonly reference: string;
}

export type ChangeIntentOperationV1 =
  | { readonly kind: "no-op" }
  | { readonly kind: "upsert-node"; readonly node: ProductGraphNodeV1 }
  | { readonly kind: "upsert-edge"; readonly edge: ProductGraphEdgeV1 }
  | { readonly kind: "remove-node"; readonly nodeId: string }
  | { readonly kind: "remove-edge"; readonly edgeId: string };

export interface ChangeIntentV1 {
  readonly schemaVersion: typeof CHANGE_INTENT_SCHEMA_VERSION;
  readonly intentId: string;
  readonly baseRevision: ProductGraphRevision;
  readonly provenance: ChangeIntentProvenanceV1;
  readonly confidence: number;
  readonly operations: readonly ChangeIntentOperationV1[];
}

export interface ProposedGraphDeltaV1 {
  readonly schemaVersion: typeof CHANGE_INTENT_SCHEMA_VERSION;
  readonly proposalId: `proposal-${string}`;
  readonly intentId: string;
  readonly baseRevision: ProductGraphRevision;
  readonly intentDigest: ProductGraphRevision;
  readonly deltaDigest: ProductGraphRevision;
  /** Backward-compatible alias for the first operation. Use `operations` for the full ordered delta. */
  readonly operation: ChangeIntentOperationV1;
  readonly operations: readonly ChangeIntentOperationV1[];
  readonly candidateRevision: ProductGraphRevisionDocumentV1;
  readonly issues: readonly DomainIssue[];
}

export class ChangeIntentError extends Error {
  readonly code: ChangeIntentErrorCode;
  readonly issues: readonly DomainIssue[];

  constructor(code: ChangeIntentErrorCode, message: string, issues: readonly DomainIssue[] = []) {
    super(message);
    this.name = "ChangeIntentError";
    this.code = code;
    this.issues = Object.freeze([...issues]);
  }
}

function fail(code: ChangeIntentErrorCode, message: string): never {
  throw new ChangeIntentError(code, message);
}

function failDomain(issues: readonly DomainIssue[]): never {
  throw new ChangeIntentError(
    "CHANGE_INTENT_DOMAIN_INVALID",
    "ChangeIntent candidate does not satisfy Product Graph domain validation.",
    issues,
  );
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function isJsonArray(value: JsonValue): value is readonly JsonValue[] {
  return Array.isArray(value);
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (value === null || isUnknownArray(value) || typeof value !== "object") {
    fail("CHANGE_INTENT_INVALID_SCHEMA", `${label} must be an object.`);
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    fail("CHANGE_INTENT_INVALID_SCHEMA", `${label} must be a plain object.`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string,
): void {
  const unknown = Object.keys(value)
    .filter((key) => !allowed.includes(key))
    .sort();
  if (unknown.length > 0) {
    fail("CHANGE_INTENT_INVALID_SCHEMA", `${label} has unknown keys: ${unknown.join(", ")}.`);
  }
}

function text(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail("CHANGE_INTENT_INVALID_SCHEMA", `${label} must be a non-empty string.`);
  }
  return value;
}

function canonicalValue(value: JsonValue): JsonValue {
  if (isJsonArray(value)) return value.map((item) => canonicalValue(item));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, item]) => [key, canonicalValue(item)]),
    );
  }
  return value;
}

function digest(value: JsonValue): ProductGraphRevision {
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(canonicalValue(value)))
    .digest("hex")}`;
}

function jsonValue(value: unknown): JsonValue {
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

function provenance(value: unknown): ChangeIntentProvenanceV1 {
  const candidate = record(value, "ChangeIntent provenance");
  exactKeys(candidate, ["source", "reference"], "ChangeIntent provenance");
  const source = candidate.source;
  if (
    typeof source !== "string" ||
    !CHANGE_INTENT_PROVENANCE_SOURCES.includes(source as ChangeIntentProvenanceSource)
  ) {
    fail("CHANGE_INTENT_INVALID_PROVENANCE", "ChangeIntent provenance source is not supported.");
  }
  return Object.freeze({
    source: source as ChangeIntentProvenanceSource,
    reference: text(candidate.reference, "ChangeIntent provenance reference"),
  });
}

function parsedNode(value: unknown): ProductGraphNodeV1 {
  const node = record(value, "ChangeIntent upsert-node node");
  if (
    typeof node.id !== "string" ||
    node.id.trim().length === 0 ||
    typeof node.kind !== "string" ||
    node.kind.trim().length === 0 ||
    node.attributes === null ||
    typeof node.attributes !== "object" ||
    isUnknownArray(node.attributes)
  ) {
    fail("CHANGE_INTENT_INVALID_OPERATION", "ChangeIntent upsert-node requires a valid node.");
  }
  try {
    const checked = validateProductGraphState({
      schemaVersion: 1,
      graphId: "change-intent:node-validation",
      nodes: [
        {
          id: node.id,
          kind: node.kind,
          attributes: node.attributes as JsonObject,
        },
      ],
      edges: [],
    });
    const validated = checked.nodes[0];
    if (validated === undefined) {
      return fail(
        "CHANGE_INTENT_INVALID_OPERATION",
        "ChangeIntent upsert-node requires a valid node.",
      );
    }
    return validated;
  } catch (error) {
    return fail(
      "CHANGE_INTENT_INVALID_OPERATION",
      error instanceof Error ? error.message : "ChangeIntent upsert-node requires a valid node.",
    );
  }
}

function parsedEdge(value: unknown): ProductGraphEdgeV1 {
  const edge = record(value, "ChangeIntent upsert-edge edge");
  exactKeys(
    edge,
    ["id", "kind", "from", "to", "attributes"],
    "ChangeIntent upsert-edge edge",
  );
  const id = text(edge.id, "ChangeIntent edge id");
  const kind = text(edge.kind, "ChangeIntent edge kind");
  const from = text(edge.from, "ChangeIntent edge from");
  const to = text(edge.to, "ChangeIntent edge to");
  if (
    edge.attributes === null ||
    typeof edge.attributes !== "object" ||
    isUnknownArray(edge.attributes)
  ) {
    return fail(
      "CHANGE_INTENT_INVALID_OPERATION",
      "ChangeIntent upsert-edge requires JSON-object attributes.",
    );
  }
  try {
    const endpointIds = [...new Set([from, to])];
    const checked = validateProductGraphState({
      schemaVersion: 1,
      graphId: "change-intent:edge-validation",
      nodes: endpointIds.map((nodeId) => ({ id: nodeId, kind: "validation", attributes: {} })),
      edges: [{ id, kind, from, to, attributes: edge.attributes as JsonObject }],
    });
    const validated = checked.edges[0];
    if (validated === undefined) {
      return fail(
        "CHANGE_INTENT_INVALID_OPERATION",
        "ChangeIntent upsert-edge requires a valid edge.",
      );
    }
    return validated;
  } catch (error) {
    return fail(
      "CHANGE_INTENT_INVALID_OPERATION",
      error instanceof Error ? error.message : "ChangeIntent upsert-edge requires a valid edge.",
    );
  }
}

function operation(value: unknown): ChangeIntentOperationV1 {
  const candidate = record(value, "ChangeIntent operation");
  if (candidate.kind === "no-op") {
    exactKeys(candidate, ["kind"], "ChangeIntent no-op operation");
    return Object.freeze({ kind: "no-op" });
  }
  if (candidate.kind === "upsert-node") {
    exactKeys(candidate, ["kind", "node"], "ChangeIntent upsert-node operation");
    return Object.freeze({ kind: "upsert-node", node: parsedNode(candidate.node) });
  }
  if (candidate.kind === "upsert-edge") {
    exactKeys(candidate, ["kind", "edge"], "ChangeIntent upsert-edge operation");
    return Object.freeze({ kind: "upsert-edge", edge: parsedEdge(candidate.edge) });
  }
  if (candidate.kind === "remove-node") {
    exactKeys(candidate, ["kind", "nodeId"], "ChangeIntent remove-node operation");
    return Object.freeze({
      kind: "remove-node",
      nodeId: text(candidate.nodeId, "ChangeIntent nodeId"),
    });
  }
  if (candidate.kind === "remove-edge") {
    exactKeys(candidate, ["kind", "edgeId"], "ChangeIntent remove-edge operation");
    return Object.freeze({
      kind: "remove-edge",
      edgeId: text(candidate.edgeId, "ChangeIntent edgeId"),
    });
  }
  return fail("CHANGE_INTENT_INVALID_OPERATION", "ChangeIntent operation kind is not supported.");
}

function operationTarget(item: ChangeIntentOperationV1): string {
  if (item.kind === "no-op") return "no-op";
  if (item.kind === "upsert-node") return `node:${item.node.id}`;
  if (item.kind === "remove-node") return `node:${item.nodeId}`;
  if (item.kind === "upsert-edge") return `edge:${item.edge.id}`;
  return `edge:${item.edgeId}`;
}

function intentEnvelope(value: unknown, base: ProductGraphRevisionDocumentV1): ChangeIntentV1 {
  const candidate = record(value, "ChangeIntent");
  exactKeys(
    candidate,
    ["schemaVersion", "intentId", "baseRevision", "provenance", "confidence", "operations"],
    "ChangeIntent",
  );
  if (candidate.schemaVersion !== CHANGE_INTENT_SCHEMA_VERSION) {
    fail("CHANGE_INTENT_INVALID_SCHEMA", "ChangeIntent schemaVersion must be 1.");
  }
  const intentId = text(candidate.intentId, "ChangeIntent intentId");
  if (candidate.baseRevision !== base.revision) {
    fail(
      "CHANGE_INTENT_BASE_MISMATCH",
      "ChangeIntent baseRevision does not match the supplied base.",
    );
  }
  if (
    typeof candidate.confidence !== "number" ||
    !Number.isFinite(candidate.confidence) ||
    candidate.confidence < 0 ||
    candidate.confidence > 1
  ) {
    fail("CHANGE_INTENT_INVALID_CONFIDENCE", "ChangeIntent confidence must be between 0 and 1.");
  }
  if (!isUnknownArray(candidate.operations) || candidate.operations.length === 0) {
    return fail(
      "CHANGE_INTENT_INVALID_OPERATION",
      "ChangeIntent requires at least one operation.",
    );
  }
  if (candidate.operations.length > CHANGE_INTENT_MAX_OPERATIONS) {
    return fail(
      "CHANGE_INTENT_TOO_MANY_OPERATIONS",
      `ChangeIntent accepts at most ${CHANGE_INTENT_MAX_OPERATIONS.toString()} operations.`,
    );
  }
  const operations = Object.freeze(candidate.operations.map(operation));
  if (operations.length > 1 && operations.some((item) => item.kind === "no-op")) {
    return fail(
      "CHANGE_INTENT_OPERATION_CONFLICT",
      "ChangeIntent no-op cannot be combined with graph mutations.",
    );
  }
  const targets = operations.map(operationTarget);
  if (new Set(targets).size !== targets.length) {
    return fail(
      "CHANGE_INTENT_DUPLICATE_TARGET",
      "ChangeIntent contains duplicate or conflicting operation targets.",
    );
  }
  return Object.freeze({
    schemaVersion: CHANGE_INTENT_SCHEMA_VERSION,
    intentId,
    baseRevision: base.revision,
    provenance: provenance(candidate.provenance),
    confidence: candidate.confidence,
    operations,
  });
}

function validatedCandidate(
  base: ProductGraphRevisionDocumentV1,
  nodes: readonly ProductGraphNodeV1[],
  edges: readonly ProductGraphEdgeV1[],
): ProductGraphRevisionDocumentV1 {
  let candidate: ProductGraphRevisionDocumentV1;
  try {
    candidate = createProductGraphRevision({
      schemaVersion: 1,
      graphId: base.graph.graphId,
      nodes,
      edges,
    });
  } catch (error) {
    return fail(
      "CHANGE_INTENT_INVALID_OPERATION",
      error instanceof Error ? error.message : "ChangeIntent produced an invalid candidate graph.",
    );
  }
  const issues = collectProductGraphDomainIssues(candidate.graph);
  if (issues.length > 0) return failDomain(issues);
  return candidate;
}

function candidateFor(
  base: ProductGraphRevisionDocumentV1,
  op: ChangeIntentOperationV1,
): ProductGraphRevisionDocumentV1 {
  if (op.kind === "no-op") return base;

  if (op.kind === "upsert-node") {
    const current = base.graph.nodes.find((node) => node.id === op.node.id);
    if (current !== undefined && current.kind !== op.node.kind) {
      return fail(
        "CHANGE_INTENT_NODE_KIND_CHANGE",
        "ChangeIntent cannot change an existing node kind.",
      );
    }
    const nodes =
      current === undefined
        ? [...base.graph.nodes, op.node]
        : base.graph.nodes.map((node) => (node.id === op.node.id ? op.node : node));
    return validatedCandidate(base, nodes, base.graph.edges);
  }

  if (op.kind === "upsert-edge") {
    const current = base.graph.edges.find((edge) => edge.id === op.edge.id);
    if (current !== undefined && current.kind !== op.edge.kind) {
      return fail(
        "CHANGE_INTENT_EDGE_KIND_CHANGE",
        "ChangeIntent cannot change an existing edge kind.",
      );
    }
    if (current !== undefined && (current.from !== op.edge.from || current.to !== op.edge.to)) {
      return fail(
        "CHANGE_INTENT_EDGE_ENDPOINT_CHANGE",
        "ChangeIntent cannot change existing edge endpoints under the same edge id.",
      );
    }
    const edges =
      current === undefined
        ? [...base.graph.edges, op.edge]
        : base.graph.edges.map((edge) => (edge.id === op.edge.id ? op.edge : edge));
    return validatedCandidate(base, base.graph.nodes, edges);
  }

  if (op.kind === "remove-edge") {
    const current = base.graph.edges.find((edge) => edge.id === op.edgeId);
    if (current === undefined) {
      return fail(
        "CHANGE_INTENT_TARGET_NOT_FOUND",
        `ChangeIntent edge target not found: ${op.edgeId}.`,
      );
    }
    return validatedCandidate(
      base,
      base.graph.nodes,
      base.graph.edges.filter((edge) => edge.id !== op.edgeId),
    );
  }

  const current = base.graph.nodes.find((node) => node.id === op.nodeId);
  if (current === undefined) {
    return fail(
      "CHANGE_INTENT_TARGET_NOT_FOUND",
      `ChangeIntent node target not found: ${op.nodeId}.`,
    );
  }
  if (base.graph.edges.some((edge) => edge.from === op.nodeId || edge.to === op.nodeId)) {
    return fail(
      "CHANGE_INTENT_NODE_HAS_INCIDENT_EDGES",
      `ChangeIntent cannot remove node ${op.nodeId} while incident edges remain.`,
    );
  }
  return validatedCandidate(
    base,
    base.graph.nodes.filter((node) => node.id !== op.nodeId),
    base.graph.edges,
  );
}

export function compileChangeIntent(
  baseValue: unknown,
  intentValue: unknown,
): ProposedGraphDeltaV1 {
  let base: ProductGraphRevisionDocumentV1;
  try {
    base = validateProductGraphRevision(baseValue);
  } catch (error) {
    return fail(
      "CHANGE_INTENT_BASE_MISMATCH",
      error instanceof Error ? error.message : "Supplied Product Graph base is invalid.",
    );
  }
  const intent = intentEnvelope(intentValue, base);
  const firstOperation = intent.operations[0];
  if (firstOperation === undefined) {
    return fail(
      "CHANGE_INTENT_INVALID_OPERATION",
      "ChangeIntent requires at least one operation.",
    );
  }
  const intentDigest = digest(
    jsonValue({
      intentId: intent.intentId,
      baseRevision: intent.baseRevision,
      provenance: intent.provenance,
      confidence: intent.confidence,
      operations: intent.operations,
    }),
  );
  let candidateRevision = base;
  for (const item of intent.operations) candidateRevision = candidateFor(candidateRevision, item);
  const issues = collectProductGraphDomainIssues(candidateRevision.graph);
  if (issues.length > 0) return failDomain(issues);
  const deltaDigest = digest(
    jsonValue({
      baseRevision: base.revision,
      intentId: intent.intentId,
      intentDigest,
      operations: intent.operations,
      candidateRevision: candidateRevision.revision,
    }),
  );
  return Object.freeze({
    schemaVersion: CHANGE_INTENT_SCHEMA_VERSION,
    proposalId: `proposal-${deltaDigest.slice("sha256:".length)}`,
    intentId: intent.intentId,
    baseRevision: base.revision,
    intentDigest,
    deltaDigest,
    operation: firstOperation,
    operations: Object.freeze([...intent.operations]),
    candidateRevision,
    issues: Object.freeze([...issues]),
  });
}
