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
  readonly schemaVersion: typeof ASSUMPTION_LEDGER_SCHEMA_VERSION;
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
  readonly schemaVersion: typeof ASSUMPTION_LEDGER_SCHEMA_VERSION;
  readonly manifestId: AssumptionInvalidationManifestId;
  readonly assumptionId: AssumptionId;
  readonly eventId: AssumptionLedgerEventId;
  readonly dependentWorkRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly effect: typeof ASSUMPTION_LEDGER_EFFECT;
}

export interface AssumptionLedgerStateV1 {
  readonly schemaVersion: typeof ASSUMPTION_LEDGER_SCHEMA_VERSION;
  readonly stateId: AssumptionLedgerStateId;
  readonly origin: AssumptionRecordV1;
  readonly status: AssumptionLedgerStatus;
  readonly currentStatement: string;
  readonly currentSource: string;
  readonly events: readonly AssumptionLedgerEventV1[];
  readonly invalidationManifests: readonly AssumptionInvalidationManifestV1[];
}

export class AssumptionLedgerError extends Error {
  readonly code: AssumptionLedgerErrorCode;

  constructor(code: AssumptionLedgerErrorCode, message: string) {
    super(message);
    this.name = "AssumptionLedgerError";
    this.code = code;
  }
}

function fail(code: AssumptionLedgerErrorCode, message: string): never {
  throw new AssumptionLedgerError(code, message);
}

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", `${label} must be an object.`);
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", `${label} must be a plain object.`);
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
    .sort(compareText);
  if (unknown.length > 0) {
    fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", `${label} has unknown keys: ${unknown.join(", ")}.`);
  }
}

function boundedText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", `${label} must be non-empty text.`);
  }
  if (value.length > maxLength) {
    return fail(
      "ASSUMPTION_LEDGER_INVALID_SCHEMA",
      `${label} exceeds ${maxLength.toString()} chars.`,
    );
  }
  return value;
}

function assumptionId(value: unknown): AssumptionId {
  if (typeof value !== "string" || !/^assumption-[0-9a-f]{64}$/.test(value)) {
    return fail(
      "ASSUMPTION_LEDGER_INVALID_SCHEMA",
      "Assumption ID must be an assumption- prefixed SHA-256 identity.",
    );
  }
  return value as AssumptionId;
}

function action(value: unknown): AssumptionLedgerAction {
  if (
    typeof value !== "string" ||
    !ASSUMPTION_LEDGER_ACTIONS.includes(value as AssumptionLedgerAction)
  ) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", "Assumption ledger action is not supported.");
  }
  return value as AssumptionLedgerAction;
}

function references(value: unknown, label: string): readonly string[] {
  if (!Array.isArray(value) || value.length > ASSUMPTION_LEDGER_MAX_REFERENCE_COUNT) {
    return fail(
      "ASSUMPTION_LEDGER_INVALID_REFERENCE_SET",
      `${label} exceeds the bounded reference count.`,
    );
  }
  const normalized = value.map((item) => {
    if (
      typeof item !== "string" ||
      item.trim().length === 0 ||
      item.length > ASSUMPTION_LEDGER_MAX_REFERENCE_LENGTH
    ) {
      return fail(
        "ASSUMPTION_LEDGER_INVALID_REFERENCE_SET",
        `${label} entries must be bounded non-empty strings.`,
      );
    }
    return item;
  });
  return Object.freeze([...new Set(normalized)].sort(compareText));
}

function affectedNodeIds(value: unknown): readonly string[] {
  if (!Array.isArray(value) || value.length > QUESTION_GATE_MAX_AFFECTED_NODE_IDS) {
    return fail("ASSUMPTION_LEDGER_INVALID_ORIGIN", "Invalid origin affected-node count.");
  }
  const ids = value.map((item) => {
    if (
      typeof item !== "string" ||
      item.trim().length === 0 ||
      item.length > QUESTION_GATE_MAX_NODE_ID_LENGTH
    ) {
      return fail(
        "ASSUMPTION_LEDGER_INVALID_ORIGIN",
        "Origin affected-node IDs must be bounded non-empty strings.",
      );
    }
    return item;
  });
  return Object.freeze([...new Set(ids)].sort(compareText));
}

function finiteConfidence(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    return fail("ASSUMPTION_LEDGER_INVALID_ORIGIN", "Origin confidence must be between 0 and 1.");
  }
  return value;
}

function enumValue<T extends string>(
  value: unknown,
  values: readonly T[],
  label: string,
): T {
  if (typeof value !== "string" || !values.includes(value as T)) {
    return fail("ASSUMPTION_LEDGER_INVALID_ORIGIN", `${label} is not supported.`);
  }
  return value as T;
}

function canonicalOrigin(value: unknown): AssumptionRecordV1 {
  const candidate = record(value, "Assumption origin");
  exactKeys(
    candidate,
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
      "Assumption origin must be a schemaVersion 1 inferred AssumptionRecordV1.",
    );
  }

  const normalized = Object.freeze({
    schemaVersion: QUESTION_GATE_SCHEMA_VERSION,
    assumptionId: assumptionId(candidate.assumptionId),
    statement: boundedText(candidate.statement, "Assumption origin statement", QUESTION_GATE_MAX_TEXT_LENGTH),
    source: boundedText(candidate.source, "Assumption origin source", QUESTION_GATE_MAX_TEXT_LENGTH),
    reason: enumValue(
      candidate.reason,
      QUESTION_GATE_REASON_CODES,
      "Assumption origin reason",
    ) as QuestionGateReasonCode,
    confidence: finiteConfidence(candidate.confidence),
    impact: enumValue(candidate.impact, QUESTION_GATE_IMPACTS, "Assumption origin impact") as QuestionGateImpact,
    reversibility: enumValue(
      candidate.reversibility,
      QUESTION_GATE_REVERSIBILITIES,
      "Assumption origin reversibility",
    ) as QuestionGateReversibility,
    affectedNodeIds: affectedNodeIds(candidate.affectedNodeIds),
    status: "inferred" as const,
  });

  if (
    normalized.reason !== "REVERSIBLE_OR_LOW_IMPACT_DEFAULT" &&
    normalized.reason !== "HIGH_CONFIDENCE_DEFAULT"
  ) {
    return fail(
      "ASSUMPTION_LEDGER_INVALID_ORIGIN",
      "Assumption origin reason cannot produce an inferred assumption.",
    );
  }

  const expectedId = `assumption-${hash({
    schemaVersion: normalized.schemaVersion,
    statement: normalized.statement,
    source: normalized.source,
    reason: normalized.reason,
    confidence: normalized.confidence,
    impact: normalized.impact,
    reversibility: normalized.reversibility,
    affectedNodeIds: normalized.affectedNodeIds,
    status: normalized.status,
  })}` as AssumptionId;
  if (normalized.assumptionId !== expectedId) {
    return fail(
      "ASSUMPTION_LEDGER_STALE_ASSUMPTION_ID",
      "Assumption origin identity does not match its canonical content.",
    );
  }

  return normalized;
}

function replacement(value: unknown): AssumptionReplacementV1 {
  const candidate = record(value, "Assumption replacement");
  exactKeys(candidate, ["statement", "source"], "Assumption replacement");
  return Object.freeze({
    statement: boundedText(
      candidate.statement,
      "Assumption replacement statement",
      QUESTION_GATE_MAX_TEXT_LENGTH,
    ),
    source: boundedText(
      candidate.source,
      "Assumption replacement source",
      QUESTION_GATE_MAX_TEXT_LENGTH,
    ),
  });
}

export function validateAssumptionLedgerEventInput(
  value: unknown,
): AssumptionLedgerEventInputV1 {
  const candidate = record(value, "Assumption ledger event input");
  exactKeys(
    candidate,
    [
      "schemaVersion",
      "assumptionId",
      "action",
      "source",
      "replacement",
      "dependentWorkRefs",
      "evidenceRefs",
    ],
    "Assumption ledger event input",
  );
  if (candidate.schemaVersion !== ASSUMPTION_LEDGER_SCHEMA_VERSION) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", "Assumption ledger schemaVersion must be 1.");
  }

  const normalizedAction = action(candidate.action);
  const normalizedReplacement =
    candidate.replacement === null ? null : replacement(candidate.replacement);
  const dependentWorkRefs = references(candidate.dependentWorkRefs, "Dependent-work references");
  const evidenceRefs = references(candidate.evidenceRefs, "Evidence references");

  if (normalizedAction === "confirm") {
    if (
      normalizedReplacement !== null ||
      dependentWorkRefs.length !== 0 ||
      evidenceRefs.length !== 0
    ) {
      return fail(
        "ASSUMPTION_LEDGER_ACTION_FIELD_MISMATCH",
        "Confirm forbids replacement and invalidation references.",
      );
    }
  } else if (normalizedReplacement === null) {
    return fail(
      "ASSUMPTION_LEDGER_ACTION_FIELD_MISMATCH",
      `${normalizedAction} requires replacement data.`,
    );
  }

  return Object.freeze({
    schemaVersion: ASSUMPTION_LEDGER_SCHEMA_VERSION,
    assumptionId: assumptionId(candidate.assumptionId),
    action: normalizedAction,
    source: boundedText(candidate.source, "Assumption ledger event source", QUESTION_GATE_MAX_TEXT_LENGTH),
    replacement: normalizedReplacement,
    dependentWorkRefs,
    evidenceRefs,
  });
}

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function allowedTransition(status: AssumptionLedgerStatus, nextAction: AssumptionLedgerAction): boolean {
  if (status === "superseded") return false;
  if (nextAction === "confirm") return status === "inferred";
  if (nextAction === "correct") return status !== "superseded";
  return status !== "superseded";
}

function nextStatus(actionValue: AssumptionLedgerAction): AssumptionLedgerStatus {
  if (actionValue === "confirm") return "confirmed";
  if (actionValue === "correct") return "corrected";
  return "superseded";
}

function eventIdentity(
  event: AssumptionLedgerEventInputV1,
  sequence: number,
  previousEventId: AssumptionLedgerEventId | null,
): AssumptionLedgerEventId {
  return `assumption-event-${hash({ sequence, previousEventId, ...event })}`;
}

function manifestFor(event: AssumptionLedgerEventV1): AssumptionInvalidationManifestV1 {
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
    manifestId: `assumption-invalidation-${hash(body)}` as AssumptionInvalidationManifestId,
  });
}

export function replayAssumptionLedger(
  originValue: unknown,
  eventValues: readonly unknown[],
): AssumptionLedgerStateV1 {
  const origin = canonicalOrigin(originValue);
  if (!Array.isArray(eventValues)) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", "Assumption ledger events must be an array.");
  }

  let status: AssumptionLedgerStatus = "inferred";
  let currentStatement = origin.statement;
  let currentSource = origin.source;
  let previousEventId: AssumptionLedgerEventId | null = null;
  const events: AssumptionLedgerEventV1[] = [];
  const invalidationManifests: AssumptionInvalidationManifestV1[] = [];

  for (const [offset, rawEvent] of eventValues.entries()) {
    const input = validateAssumptionLedgerEventInput(rawEvent);
    if (input.assumptionId !== origin.assumptionId) {
      return fail(
        "ASSUMPTION_LEDGER_STALE_ASSUMPTION_ID",
        "Assumption ledger event does not target the immutable origin assumption.",
      );
    }
    if (!allowedTransition(status, input.action)) {
      return fail(
        "ASSUMPTION_LEDGER_INVALID_TRANSITION",
        `Cannot ${input.action} an assumption in ${status} state.`,
      );
    }

    const sequence = offset + 1;
    const event = Object.freeze({
      ...input,
      eventId: eventIdentity(input, sequence, previousEventId),
      sequence,
    });
    events.push(event);
    previousEventId = event.eventId;
    status = nextStatus(event.action);

    if (event.replacement !== null) {
      currentStatement = event.replacement.statement;
      currentSource = event.replacement.source;
    }
    if (event.action === "correct" || event.action === "supersede") {
      invalidationManifests.push(manifestFor(event));
    }
  }

  const frozenEvents = Object.freeze([...events]);
  const frozenManifests = Object.freeze([...invalidationManifests]);
  const semanticState = {
    schemaVersion: ASSUMPTION_LEDGER_SCHEMA_VERSION,
    origin,
    status,
    currentStatement,
    currentSource,
    events: frozenEvents,
    invalidationManifests: frozenManifests,
  } as const;

  return Object.freeze({
    ...semanticState,
    stateId: `assumption-ledger-${hash(semanticState)}` as AssumptionLedgerStateId,
  });
}
