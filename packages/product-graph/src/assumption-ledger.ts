import { createHash } from "node:crypto";

import {
  QUESTION_GATE_IMPACTS,
  QUESTION_GATE_MAX_AFFECTED_NODE_IDS,
  QUESTION_GATE_MAX_NODE_ID_LENGTH,
  QUESTION_GATE_MAX_TEXT_LENGTH,
  QUESTION_GATE_REASON_CODES,
  QUESTION_GATE_REVERSIBILITIES,
  QUESTION_GATE_SCHEMA_VERSION,
  type AssumptionId,
  type AssumptionRecordV1,
  type QuestionGateImpact,
  type QuestionGateReasonCode,
  type QuestionGateReversibility,
} from "./question-gate.ts";

export const ASSUMPTION_LEDGER_SCHEMA_VERSION = 1 as const;
export const ASSUMPTION_LEDGER_ACTIONS = ["confirm", "correct", "supersede"] as const;
export const ASSUMPTION_LEDGER_STATUSES = [
  "inferred",
  "confirmed",
  "corrected",
  "superseded",
] as const;
export const ASSUMPTION_LEDGER_MAX_REFERENCE_COUNT = 128 as const;
export const ASSUMPTION_LEDGER_MAX_REFERENCE_LENGTH = 256 as const;
export const ASSUMPTION_LEDGER_EFFECT = "reference-only" as const;
export const ASSUMPTION_LEDGER_ERROR_CODES = [
  "ASSUMPTION_LEDGER_INVALID_SCHEMA",
  "ASSUMPTION_LEDGER_INVALID_ORIGIN",
  "ASSUMPTION_LEDGER_STALE_ASSUMPTION_ID",
  "ASSUMPTION_LEDGER_ACTION_FIELD_MISMATCH",
  "ASSUMPTION_LEDGER_INVALID_REFERENCE_SET",
  "ASSUMPTION_LEDGER_INVALID_TRANSITION",
] as const;

export type AssumptionLedgerAction = (typeof ASSUMPTION_LEDGER_ACTIONS)[number];
export type AssumptionLedgerStatus = (typeof ASSUMPTION_LEDGER_STATUSES)[number];
export type AssumptionLedgerErrorCode = (typeof ASSUMPTION_LEDGER_ERROR_CODES)[number];
export type AssumptionLedgerEventId = `assumption-event-${string}`;
export type AssumptionInvalidationManifestId = `assumption-invalidation-${string}`;
export type AssumptionLedgerStateId = `assumption-ledger-${string}`;

export interface AssumptionReplacementV1 {
  readonly statement: string;
  readonly source: string;
}

export interface AssumptionLedgerEventInputV1 {
  readonly schemaVersion: 1;
  readonly assumptionId: AssumptionId;
  readonly action: AssumptionLedgerAction;
  readonly source: string;
  readonly replacement: AssumptionReplacementV1 | null;
  readonly dependentWorkRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface AssumptionLedgerEventV1 extends AssumptionLedgerEventInputV1 {
  readonly eventId: AssumptionLedgerEventId;
  readonly sequence: number;
}

export interface AssumptionInvalidationManifestV1 {
  readonly schemaVersion: 1;
  readonly manifestId: AssumptionInvalidationManifestId;
  readonly assumptionId: AssumptionId;
  readonly eventId: AssumptionLedgerEventId;
  readonly dependentWorkRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly effect: typeof ASSUMPTION_LEDGER_EFFECT;
}

export interface AssumptionLedgerStateV1 {
  readonly schemaVersion: 1;
  readonly stateId: AssumptionLedgerStateId;
  readonly origin: AssumptionRecordV1;
  readonly status: AssumptionLedgerStatus;
  readonly currentStatement: string;
  readonly currentSource: string;
  readonly events: readonly AssumptionLedgerEventV1[];
  readonly invalidationManifests: readonly AssumptionInvalidationManifestV1[];
}

export class AssumptionLedgerError extends Error {
  constructor(
    readonly code: AssumptionLedgerErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AssumptionLedgerError";
  }
}

function fail(code: AssumptionLedgerErrorCode, message: string): never {
  throw new AssumptionLedgerError(code, message);
}

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function closed(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
  if (
    value === null ||
    Array.isArray(value) ||
    typeof value !== "object" ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value) as object | null)
  ) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", `${label} must be a plain object.`);
  }
  const candidate = value as Record<string, unknown>;
  const unknown = Object.keys(candidate)
    .filter((key) => !keys.includes(key))
    .sort(compareText);
  if (unknown.length > 0) {
    fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", `${label} has unknown keys: ${unknown.join(", ")}.`);
  }
  return candidate;
}

function text(value: unknown, label: string): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.length > QUESTION_GATE_MAX_TEXT_LENGTH
  ) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", `${label} must be bounded non-empty text.`);
  }
  return value;
}

function enumValue<T extends string>(
  value: unknown,
  values: readonly T[],
  code: AssumptionLedgerErrorCode,
  label: string,
): T {
  if (typeof value !== "string" || !values.includes(value as T)) {
    return fail(code, `${label} is not supported.`);
  }
  return value as T;
}

function list(
  value: unknown,
  maxCount: number,
  maxLength: number,
  code: AssumptionLedgerErrorCode,
  label: string,
): readonly string[] {
  if (!Array.isArray(value) || value.length > maxCount) fail(code, `${label} is not bounded.`);
  const normalized = value.map((item) => {
    if (typeof item !== "string" || item.trim().length === 0 || item.length > maxLength) {
      return fail(code, `${label} entries must be bounded non-empty strings.`);
    }
    return item;
  });
  return Object.freeze([...new Set(normalized)].sort(compareText));
}

function assumptionId(value: unknown): AssumptionId {
  if (typeof value !== "string" || !/^assumption-[0-9a-f]{64}$/.test(value)) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", "Invalid assumption identity.");
  }
  return value as AssumptionId;
}

function normalizeOrigin(value: unknown): AssumptionRecordV1 {
  const candidate = closed(
    value,
    [
      "schemaVersion",
      "assumptionId",
      "statement",
      "source",
      "reason",
      "confidence",
      "impact",
      "reversibility",
      "affectedNodeIds",
      "status",
    ],
    "Assumption origin",
  );
  if (candidate.schemaVersion !== QUESTION_GATE_SCHEMA_VERSION || candidate.status !== "inferred") {
    return fail(
      "ASSUMPTION_LEDGER_INVALID_ORIGIN",
      "Origin must be an inferred AssumptionRecordV1.",
    );
  }
  if (
    typeof candidate.confidence !== "number" ||
    !Number.isFinite(candidate.confidence) ||
    candidate.confidence < 0 ||
    candidate.confidence > 1
  ) {
    return fail("ASSUMPTION_LEDGER_INVALID_ORIGIN", "Origin confidence must be between 0 and 1.");
  }

  const normalized = Object.freeze({
    schemaVersion: QUESTION_GATE_SCHEMA_VERSION,
    assumptionId: assumptionId(candidate.assumptionId),
    statement: text(candidate.statement, "Origin statement"),
    source: text(candidate.source, "Origin source"),
    reason: enumValue(
      candidate.reason,
      QUESTION_GATE_REASON_CODES,
      "ASSUMPTION_LEDGER_INVALID_ORIGIN",
      "Origin reason",
    ),
    confidence: candidate.confidence,
    impact: enumValue(
      candidate.impact,
      QUESTION_GATE_IMPACTS,
      "ASSUMPTION_LEDGER_INVALID_ORIGIN",
      "Origin impact",
    ),
    reversibility: enumValue(
      candidate.reversibility,
      QUESTION_GATE_REVERSIBILITIES,
      "ASSUMPTION_LEDGER_INVALID_ORIGIN",
      "Origin reversibility",
    ),
    affectedNodeIds: list(
      candidate.affectedNodeIds,
      QUESTION_GATE_MAX_AFFECTED_NODE_IDS,
      QUESTION_GATE_MAX_NODE_ID_LENGTH,
      "ASSUMPTION_LEDGER_INVALID_ORIGIN",
      "Origin affected-node IDs",
    ),
    status: "inferred" as const,
  });
  if (
    !["REVERSIBLE_OR_LOW_IMPACT_DEFAULT", "HIGH_CONFIDENCE_DEFAULT"].includes(normalized.reason)
  ) {
    return fail("ASSUMPTION_LEDGER_INVALID_ORIGIN", "Origin reason cannot produce an assumption.");
  }
  const expected = `assumption-${hash({
    schemaVersion: normalized.schemaVersion,
    statement: normalized.statement,
    source: normalized.source,
    reason: normalized.reason,
    confidence: normalized.confidence,
    impact: normalized.impact,
    reversibility: normalized.reversibility,
    affectedNodeIds: normalized.affectedNodeIds,
    status: normalized.status,
  })}`;
  if (normalized.assumptionId !== expected) {
    return fail("ASSUMPTION_LEDGER_STALE_ASSUMPTION_ID", "Origin identity is stale.");
  }
  return normalized;
}

function normalizeReplacement(value: unknown): AssumptionReplacementV1 {
  const candidate = closed(value, ["statement", "source"], "Assumption replacement");
  return Object.freeze({
    statement: text(candidate.statement, "Replacement statement"),
    source: text(candidate.source, "Replacement source"),
  });
}

export function validateAssumptionLedgerEventInput(value: unknown): AssumptionLedgerEventInputV1 {
  const candidate = closed(
    value,
    [
      "schemaVersion",
      "assumptionId",
      "action",
      "source",
      "replacement",
      "dependentWorkRefs",
      "evidenceRefs",
    ],
    "Assumption ledger event",
  );
  if (candidate.schemaVersion !== ASSUMPTION_LEDGER_SCHEMA_VERSION) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", "Assumption ledger schemaVersion must be 1.");
  }
  const nextAction = enumValue(
    candidate.action,
    ASSUMPTION_LEDGER_ACTIONS,
    "ASSUMPTION_LEDGER_INVALID_SCHEMA",
    "Assumption ledger action",
  );
  const replacement =
    candidate.replacement === null ? null : normalizeReplacement(candidate.replacement);
  const dependentWorkRefs = list(
    candidate.dependentWorkRefs,
    ASSUMPTION_LEDGER_MAX_REFERENCE_COUNT,
    ASSUMPTION_LEDGER_MAX_REFERENCE_LENGTH,
    "ASSUMPTION_LEDGER_INVALID_REFERENCE_SET",
    "Dependent-work references",
  );
  const evidenceRefs = list(
    candidate.evidenceRefs,
    ASSUMPTION_LEDGER_MAX_REFERENCE_COUNT,
    ASSUMPTION_LEDGER_MAX_REFERENCE_LENGTH,
    "ASSUMPTION_LEDGER_INVALID_REFERENCE_SET",
    "Evidence references",
  );
  if (
    (nextAction === "confirm" &&
      (replacement !== null || dependentWorkRefs.length > 0 || evidenceRefs.length > 0)) ||
    (nextAction !== "confirm" && replacement === null)
  ) {
    return fail(
      "ASSUMPTION_LEDGER_ACTION_FIELD_MISMATCH",
      "Action-specific replacement/invalidation fields do not match.",
    );
  }
  return Object.freeze({
    schemaVersion: ASSUMPTION_LEDGER_SCHEMA_VERSION,
    assumptionId: assumptionId(candidate.assumptionId),
    action: nextAction,
    source: text(candidate.source, "Assumption ledger event source"),
    replacement,
    dependentWorkRefs,
    evidenceRefs,
  });
}

function manifest(event: AssumptionLedgerEventV1): AssumptionInvalidationManifestV1 {
  const body = {
    schemaVersion: ASSUMPTION_LEDGER_SCHEMA_VERSION,
    assumptionId: event.assumptionId,
    eventId: event.eventId,
    dependentWorkRefs: event.dependentWorkRefs,
    evidenceRefs: event.evidenceRefs,
    effect: ASSUMPTION_LEDGER_EFFECT,
  } as const;
  return Object.freeze({
    ...body,
    manifestId: `assumption-invalidation-${hash(body)}`,
  });
}

export function replayAssumptionLedger(
  originValue: unknown,
  eventValues: readonly unknown[],
): AssumptionLedgerStateV1 {
  const origin = normalizeOrigin(originValue);
  if (!Array.isArray(eventValues)) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", "Assumption ledger events must be an array.");
  }

  let status: AssumptionLedgerStatus = "inferred";
  let currentStatement = origin.statement;
  let currentSource = origin.source;
  let previousEventId: AssumptionLedgerEventId | null = null;
  const events: AssumptionLedgerEventV1[] = [];
  const invalidationManifests: AssumptionInvalidationManifestV1[] = [];

  for (const [offset, raw] of eventValues.entries()) {
    const input = validateAssumptionLedgerEventInput(raw);
    if (input.assumptionId !== origin.assumptionId) {
      return fail("ASSUMPTION_LEDGER_STALE_ASSUMPTION_ID", "Event targets another assumption.");
    }
    if (status === "superseded" || (input.action === "confirm" && status !== "inferred")) {
      return fail("ASSUMPTION_LEDGER_INVALID_TRANSITION", `Cannot ${input.action} from ${status}.`);
    }

    const sequence = offset + 1;
    const event = Object.freeze({
      ...input,
      eventId: `assumption-event-${hash({
        sequence,
        previousEventId,
        ...input,
      })}`,
      sequence,
    });
    events.push(event);
    previousEventId = event.eventId;
    status =
      event.action === "confirm"
        ? "confirmed"
        : event.action === "correct"
          ? "corrected"
          : "superseded";
    if (event.replacement !== null) {
      currentStatement = event.replacement.statement;
      currentSource = event.replacement.source;
    }
    if (event.action !== "confirm") invalidationManifests.push(manifest(event));
  }

  const semantic = {
    schemaVersion: ASSUMPTION_LEDGER_SCHEMA_VERSION,
    origin,
    status,
    currentStatement,
    currentSource,
    events: Object.freeze([...events]),
    invalidationManifests: Object.freeze([...invalidationManifests]),
  } as const;
  return Object.freeze({
    ...semantic,
    stateId: `assumption-ledger-${hash(semantic)}`,
  });
}
