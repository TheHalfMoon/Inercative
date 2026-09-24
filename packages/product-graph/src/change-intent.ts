import { createHash } from "node:crypto";

import {
  createProductGraphRevision,
  validateProductGraphRevision,
  validateProductGraphState,
  type JsonObject,
  type JsonValue,
  type ProductGraphNodeV1,
  type ProductGraphRevision,
  type ProductGraphRevisionDocumentV1,
} from "./contracts.ts";
import { collectProductGraphDomainIssues, type DomainIssue } from "./domain.ts";

export const CHANGE_INTENT_SCHEMA_VERSION = 1 as const;
export const CHANGE_INTENT_OPERATION_KINDS = ["no-op", "upsert-node"] as const;
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
  "CHANGE_INTENT_DUPLICATE_TARGET",
  "CHANGE_INTENT_NODE_KIND_CHANGE",
  "CHANGE_INTENT_DOMAIN_INVALID",
] as const;
export type ChangeIntentErrorCode = (typeof CHANGE_INTENT_ERROR_CODES)[number];

export interface ChangeIntentProvenanceV1 {
  readonly source: ChangeIntentProvenanceSource;
  readonly reference: string;
}

export type ChangeIntentOperationV1 =
  { readonly kind: "no-op" } | { readonly kind: "upsert-node"; readonly node: ProductGraphNodeV1 };

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
  readonly operation: ChangeIntentOperationV1;
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
        .sort(([left], [right]) => left.localeCompare(right))
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

function operation(value: unknown): ChangeIntentOperationV1 {
  const candidate = record(value, "ChangeIntent operation");
  if (candidate.kind === "no-op") {
    exactKeys(candidate, ["kind"], "ChangeIntent no-op operation");
    return Object.freeze({ kind: "no-op" });
  }
  if (candidate.kind === "upsert-node") {
    exactKeys(candidate, ["kind", "node"], "ChangeIntent upsert-node operation");
    const node = record(candidate.node, "ChangeIntent upsert-node node");
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
        graphId: "change-intent:validation",
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
      return Object.freeze({ kind: "upsert-node", node: validated });
    } catch (error) {
      return fail(
        "CHANGE_INTENT_INVALID_OPERATION",
        error instanceof Error ? error.message : "ChangeIntent upsert-node requires a valid node.",
      );
    }
  }
  return fail("CHANGE_INTENT_INVALID_OPERATION", "ChangeIntent operation kind is not supported.");
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
      "This Grain accepts exactly one ChangeIntent operation.",
    );
  }
  if (candidate.operations.length > 1) {
    const parsed = candidate.operations.map(operation);
    const targets = parsed.map((item) => (item.kind === "upsert-node" ? item.node.id : null));
    if (targets.every((target) => target !== null) && new Set(targets).size !== targets.length) {
      return fail(
        "CHANGE_INTENT_DUPLICATE_TARGET",
        "ChangeIntent contains duplicate operation targets.",
      );
    }
    return fail(
      "CHANGE_INTENT_MULTIPLE_OPERATIONS",
      "This Grain accepts exactly one ChangeIntent operation.",
    );
  }
  const rawOperation = candidate.operations[0];
  if (rawOperation === undefined) {
    return fail(
      "CHANGE_INTENT_INVALID_OPERATION",
      "This Grain accepts exactly one ChangeIntent operation.",
    );
  }
  return Object.freeze({
    schemaVersion: CHANGE_INTENT_SCHEMA_VERSION,
    intentId,
    baseRevision: base.revision,
    provenance: provenance(candidate.provenance),
    confidence: candidate.confidence,
    operations: Object.freeze([operation(rawOperation)]),
  });
}

function candidateFor(base: ProductGraphRevisionDocumentV1, op: ChangeIntentOperationV1) {
  if (op.kind === "no-op") return base;
  const current = base.graph.nodes.find((node) => node.id === op.node.id);
  if (current !== undefined && current.kind !== op.node.kind) {
    fail("CHANGE_INTENT_NODE_KIND_CHANGE", "ChangeIntent cannot change an existing node kind.");
  }
  const nodes =
    current === undefined
      ? [...base.graph.nodes, op.node]
      : base.graph.nodes.map((node) => (node.id === op.node.id ? op.node : node));
  try {
    return createProductGraphRevision({
      schemaVersion: 1,
      graphId: base.graph.graphId,
      nodes,
      edges: base.graph.edges,
    });
  } catch (error) {
    return fail(
      "CHANGE_INTENT_INVALID_OPERATION",
      error instanceof Error ? error.message : "ChangeIntent produced an invalid candidate graph.",
    );
  }
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
  const op = intent.operations[0];
  if (op === undefined) {
    return fail(
      "CHANGE_INTENT_INVALID_OPERATION",
      "This Grain accepts exactly one ChangeIntent operation.",
    );
  }
  const intentDigest = digest(
    jsonValue({
      intentId: intent.intentId,
      baseRevision: intent.baseRevision,
      provenance: intent.provenance,
      confidence: intent.confidence,
      operations: [op],
    }),
  );
  const candidateRevision = candidateFor(base, op);
  const issues = collectProductGraphDomainIssues(candidateRevision.graph);
  if (issues.length > 0) return failDomain(issues);
  const deltaDigest = digest(
    jsonValue({
      baseRevision: base.revision,
      intentId: intent.intentId,
      intentDigest,
      operation: op,
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
    operation: op,
    candidateRevision,
    issues: Object.freeze([...issues]),
  });
}
