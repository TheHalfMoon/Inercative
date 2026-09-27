import { createHash } from "node:crypto";

import {
  ASSUMPTION_STATUSES,
  QUESTION_GATE_IMPACTS,
  QUESTION_GATE_MAX_AFFECTED_NODE_IDS,
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
const MAX_TEXT_LENGTH = 1_024;
const MAX_REFERENCES = 128;
const MAX_EVENTS = 64;
const MAX_REFERENCE_LENGTH = 256;

export type AssumptionLedgerAction = (typeof ASSUMPTION_LEDGER_ACTIONS)[number];
export type AssumptionLedgerStatus = "inferred" | "confirmed" | "corrected" | "superseded";
export type AssumptionLedgerErrorCode =
  | "ASSUMPTION_LEDGER_INVALID_SCHEMA"
  | "ASSUMPTION_LEDGER_INVALID_ASSUMPTION"
  | "ASSUMPTION_LEDGER_STALE_ASSUMPTION"
  | "ASSUMPTION_LEDGER_INVALID_ACTION_FIELDS"
  | "ASSUMPTION_LEDGER_INVALID_REFERENCES"
  | "ASSUMPTION_LEDGER_INVALID_TRANSITION";

export interface AssumptionLedgerEventInputV1 {
  readonly schemaVersion: typeof ASSUMPTION_LEDGER_SCHEMA_VERSION;
  readonly assumptionId: AssumptionId;
  readonly action: AssumptionLedgerAction;
  readonly source: string;
  readonly correctedStatement: string | null;
  readonly replacementAssumptionId: AssumptionId | null;
  readonly dependentWorkRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface AssumptionLedgerEventV1 extends AssumptionLedgerEventInputV1 {
  readonly eventId: `assumption-event-${string}`;
}

export interface AssumptionInvalidationManifestV1 {
  readonly schemaVersion: typeof ASSUMPTION_LEDGER_SCHEMA_VERSION;
  readonly manifestId: `assumption-invalidation-${string}`;
  readonly assumptionId: AssumptionId;
  readonly eventId: AssumptionLedgerEventV1["eventId"];
  readonly dependentWorkRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface AssumptionLedgerStateV1 {
  readonly schemaVersion: typeof ASSUMPTION_LEDGER_SCHEMA_VERSION;
  readonly ledgerRevisionId: `assumption-ledger-${string}`;
  readonly originAssumption: AssumptionRecordV1;
  readonly status: AssumptionLedgerStatus;
  readonly effectiveStatement: string;
  readonly replacementAssumptionId: AssumptionId | null;
  readonly events: readonly AssumptionLedgerEventV1[];
  readonly invalidations: readonly AssumptionInvalidationManifestV1[];
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

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function boundedText(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > MAX_TEXT_LENGTH) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", `${label} must be bounded non-empty text.`);
  }
  return value;
}

function assumptionId(value: unknown, label: string): AssumptionId {
  if (typeof value !== "string" || !/^assumption-[0-9a-f]{64}$/.test(value)) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", `${label} must be a canonical assumption ID.`);
  }
  return value as AssumptionId;
}

function canonicalReferences(value: unknown, label: string): readonly string[] {
  if (!Array.isArray(value) || value.length > MAX_REFERENCES) {
    return fail("ASSUMPTION_LEDGER_INVALID_REFERENCES", `${label} has an invalid reference count.`);
  }
  const refs = value.map((item) => {
    if (
      typeof item !== "string" ||
      item.trim().length === 0 ||
      item.length > MAX_REFERENCE_LENGTH
    ) {
      return fail(
        "ASSUMPTION_LEDGER_INVALID_REFERENCES",
        `${label} must contain bounded non-empty strings.`,
      );
    }
    return item;
  });
  return Object.freeze([...new Set(refs)].sort(compareText));
}

function hash(
  prefix: "assumption-event" | "assumption-invalidation" | "assumption-ledger",
  value: unknown,
): string {
  return `${prefix}-${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

function validateOriginAssumption(value: unknown): AssumptionRecordV1 {
  const candidate = record(value, "Origin assumption");
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
    "Origin assumption",
  );
  if (
    candidate.schemaVersion !== QUESTION_GATE_SCHEMA_VERSION ||
    candidate.status !== ASSUMPTION_STATUSES[0] ||
    typeof candidate.reason !== "string" ||
    !QUESTION_GATE_REASON_CODES.includes(candidate.reason as QuestionGateReasonCode) ||
    typeof candidate.confidence !== "number" ||
    !Number.isFinite(candidate.confidence) ||
    candidate.confidence < 0 ||
    candidate.confidence > 1 ||
    typeof candidate.impact !== "string" ||
    !QUESTION_GATE_IMPACTS.includes(candidate.impact as QuestionGateImpact) ||
    typeof candidate.reversibility !== "string" ||
    !QUESTION_GATE_REVERSIBILITIES.includes(candidate.reversibility as QuestionGateReversibility)
  ) {
    return fail("ASSUMPTION_LEDGER_INVALID_ASSUMPTION", "Origin assumption is invalid.");
  }
  if (
    !Array.isArray(candidate.affectedNodeIds) ||
    candidate.affectedNodeIds.length > QUESTION_GATE_MAX_AFFECTED_NODE_IDS
  ) {
    return fail("ASSUMPTION_LEDGER_INVALID_ASSUMPTION", "Origin affected node count is invalid.");
  }

  const id = assumptionId(candidate.assumptionId, "Origin assumptionId");
  const statement = boundedText(candidate.statement, "Origin statement");
  const source = boundedText(candidate.source, "Origin source");
  const affectedNodeIds = canonicalReferences(candidate.affectedNodeIds, "Origin affectedNodeIds");
  const canonical = {
    schemaVersion: QUESTION_GATE_SCHEMA_VERSION,
    statement,
    source,
    reason: candidate.reason as QuestionGateReasonCode,
    confidence: candidate.confidence,
    impact: candidate.impact as QuestionGateImpact,
    reversibility: candidate.reversibility as QuestionGateReversibility,
    affectedNodeIds,
    status: "inferred" as const,
  };
  const expected = `assumption-${createHash("sha256").update(JSON.stringify(canonical)).digest("hex")}`;
  if (id !== expected) {
    return fail("ASSUMPTION_LEDGER_INVALID_ASSUMPTION", "Origin assumption identity is invalid.");
  }

  return Object.freeze({ ...canonical, assumptionId: id });
}

export function validateAssumptionLedgerEventInput(value: unknown): AssumptionLedgerEventInputV1 {
  const candidate = record(value, "Assumption ledger event");
  exactKeys(
    candidate,
    [
      "schemaVersion",
      "assumptionId",
      "action",
      "source",
      "correctedStatement",
      "replacementAssumptionId",
      "dependentWorkRefs",
      "evidenceRefs",
    ],
    "Assumption ledger event",
  );
  if (candidate.schemaVersion !== ASSUMPTION_LEDGER_SCHEMA_VERSION) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", "Assumption ledger schemaVersion must be 1.");
  }
  if (
    typeof candidate.action !== "string" ||
    !ASSUMPTION_LEDGER_ACTIONS.includes(candidate.action as AssumptionLedgerAction)
  ) {
    return fail("ASSUMPTION_LEDGER_INVALID_SCHEMA", "Assumption ledger action is not supported.");
  }

  const id = assumptionId(candidate.assumptionId, "Assumption event assumptionId");
  const action = candidate.action as AssumptionLedgerAction;
  const source = boundedText(candidate.source, "Assumption event source");
  const correctedStatement =
    candidate.correctedStatement === null
      ? null
      : boundedText(candidate.correctedStatement, "Corrected statement");
  const replacementAssumptionId =
    candidate.replacementAssumptionId === null
      ? null
      : assumptionId(candidate.replacementAssumptionId, "Replacement assumptionId");
  const dependentWorkRefs = canonicalReferences(candidate.dependentWorkRefs, "Dependent work refs");
  const evidenceRefs = canonicalReferences(candidate.evidenceRefs, "Evidence refs");

  if (
    (action === "confirm" &&
      (correctedStatement !== null ||
        replacementAssumptionId !== null ||
        dependentWorkRefs.length > 0 ||
        evidenceRefs.length > 0)) ||
    (action === "correct" && (correctedStatement === null || replacementAssumptionId !== null)) ||
    (action === "supersede" &&
      (correctedStatement !== null ||
        replacementAssumptionId === null ||
        replacementAssumptionId === id))
  ) {
    return fail(
      "ASSUMPTION_LEDGER_INVALID_ACTION_FIELDS",
      "Assumption ledger fields do not match the requested action.",
    );
  }

  return Object.freeze({
    schemaVersion: ASSUMPTION_LEDGER_SCHEMA_VERSION,
    assumptionId: id,
    action,
    source,
    correctedStatement,
    replacementAssumptionId,
    dependentWorkRefs,
    evidenceRefs,
  });
}

function event(input: AssumptionLedgerEventInputV1): AssumptionLedgerEventV1 {
  const eventId = hash("assumption-event", input) as AssumptionLedgerEventV1["eventId"];
  return Object.freeze({ ...input, eventId });
}

function invalidation(eventRecord: AssumptionLedgerEventV1): AssumptionInvalidationManifestV1 {
  const content = {
    schemaVersion: ASSUMPTION_LEDGER_SCHEMA_VERSION,
    assumptionId: eventRecord.assumptionId,
    eventId: eventRecord.eventId,
    dependentWorkRefs: eventRecord.dependentWorkRefs,
    evidenceRefs: eventRecord.evidenceRefs,
  };
  return Object.freeze({
    ...content,
    manifestId: hash(
      "assumption-invalidation",
      content,
    ) as AssumptionInvalidationManifestV1["manifestId"],
  });
}

// Replay emits evidence only; callers own every downstream invalidation side effect.
export function replayAssumptionLedger(
  originValue: unknown,
  eventValues: readonly unknown[],
): AssumptionLedgerStateV1 {
  const origin = validateOriginAssumption(originValue);
  if (!Array.isArray(eventValues) || eventValues.length > MAX_EVENTS) {
    return fail(
      "ASSUMPTION_LEDGER_INVALID_SCHEMA",
      "Assumption ledger events must be a bounded array.",
    );
  }

  let status: AssumptionLedgerStatus = "inferred";
  let effectiveStatement = origin.statement;
  let replacementAssumptionId: AssumptionId | null = null;
  const events: AssumptionLedgerEventV1[] = [];
  const invalidations: AssumptionInvalidationManifestV1[] = [];

  for (const value of eventValues) {
    const input = validateAssumptionLedgerEventInput(value);
    if (input.assumptionId !== origin.assumptionId) {
      return fail("ASSUMPTION_LEDGER_STALE_ASSUMPTION", "Event targets a different assumption.");
    }
    if (
      status === "corrected" ||
      status === "superseded" ||
      (status === "confirmed" && input.action === "confirm")
    ) {
      return fail(
        "ASSUMPTION_LEDGER_INVALID_TRANSITION",
        "Assumption lifecycle transition is invalid.",
      );
    }

    const eventRecord = event(input);
    events.push(eventRecord);

    if (input.action === "confirm") {
      status = "confirmed";
    } else if (input.action === "correct") {
      if (input.correctedStatement === null) {
        return fail("ASSUMPTION_LEDGER_INVALID_ACTION_FIELDS", "Correction statement is required.");
      }
      status = "corrected";
      effectiveStatement = input.correctedStatement;
      invalidations.push(invalidation(eventRecord));
    } else {
      if (input.replacementAssumptionId === null) {
        return fail(
          "ASSUMPTION_LEDGER_INVALID_ACTION_FIELDS",
          "Replacement assumption is required.",
        );
      }
      status = "superseded";
      replacementAssumptionId = input.replacementAssumptionId;
      invalidations.push(invalidation(eventRecord));
    }
  }

  const frozenEvents = Object.freeze(events);
  const frozenInvalidations = Object.freeze(invalidations);
  const revisionContent = {
    schemaVersion: ASSUMPTION_LEDGER_SCHEMA_VERSION,
    assumptionId: origin.assumptionId,
    status,
    effectiveStatement,
    replacementAssumptionId,
    eventIds: frozenEvents.map((item) => item.eventId),
    invalidationIds: frozenInvalidations.map((item) => item.manifestId),
  };

  return Object.freeze({
    schemaVersion: ASSUMPTION_LEDGER_SCHEMA_VERSION,
    ledgerRevisionId: hash(
      "assumption-ledger",
      revisionContent,
    ) as AssumptionLedgerStateV1["ledgerRevisionId"],
    originAssumption: origin,
    status,
    effectiveStatement,
    replacementAssumptionId,
    events: frozenEvents,
    invalidations: frozenInvalidations,
  });
}
