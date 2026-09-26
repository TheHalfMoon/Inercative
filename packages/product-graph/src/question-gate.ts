import { createHash } from "node:crypto";

export const QUESTION_GATE_SCHEMA_VERSION = 1 as const;
export const QUESTION_GATE_HIGH_CONFIDENCE_THRESHOLD = 0.85 as const;
export const QUESTION_GATE_MAX_QUESTIONS_BEFORE_PREVIEW = 3 as const;
export const QUESTION_GATE_MAX_TEXT_LENGTH = 1_024 as const;
export const QUESTION_GATE_MAX_AFFECTED_NODE_IDS = 64 as const;
export const QUESTION_GATE_MAX_NODE_ID_LENGTH = 256 as const;

export const QUESTION_GATE_IMPACTS = ["low", "medium", "high"] as const;
export const QUESTION_GATE_REVERSIBILITIES = ["easy", "moderate", "hard"] as const;
export const QUESTION_GATE_OUTCOMES = ["derive", "assume", "ask", "defer"] as const;
export const QUESTION_GATE_REASON_CODES = [
  "DERIVABLE_FROM_CONTEXT",
  "REVERSIBLE_OR_LOW_IMPACT_DEFAULT",
  "HIGH_CONFIDENCE_DEFAULT",
  "MATERIAL_BLOCKER_NEEDS_USER",
  "QUESTION_BUDGET_EXHAUSTED",
  "REVERSIBLE_PROTOTYPE",
] as const;
export const ASSUMPTION_STATUSES = ["inferred"] as const;

export const QUESTION_GATE_ERROR_CODES = [
  "QUESTION_GATE_INVALID_SCHEMA",
  "QUESTION_GATE_INVALID_CONFIDENCE",
  "QUESTION_GATE_INVALID_BUDGET",
  "QUESTION_GATE_INVALID_AFFECTED_NODE_IDS",
] as const;

export type QuestionGateImpact = (typeof QUESTION_GATE_IMPACTS)[number];
export type QuestionGateReversibility = (typeof QUESTION_GATE_REVERSIBILITIES)[number];
export type QuestionGateOutcome = (typeof QUESTION_GATE_OUTCOMES)[number];
export type QuestionGateReasonCode = (typeof QUESTION_GATE_REASON_CODES)[number];
export type AssumptionStatus = (typeof ASSUMPTION_STATUSES)[number];
export type QuestionGateErrorCode = (typeof QUESTION_GATE_ERROR_CODES)[number];
export type AssumptionId = `assumption-${string}`;

export interface QuestionBudgetV1 {
  readonly used: number;
  readonly max: number;
}

export interface QuestionGateDecisionInputV1 {
  readonly schemaVersion: typeof QUESTION_GATE_SCHEMA_VERSION;
  readonly statement: string;
  readonly source: string;
  readonly confidence: number;
  readonly impact: QuestionGateImpact;
  readonly reversibility: QuestionGateReversibility;
  readonly derivable: boolean;
  readonly materiallyChangesProductOrTrustBoundary: boolean;
  readonly requiredForSafeProgress: boolean;
  readonly questionBudget: QuestionBudgetV1;
  readonly affectedNodeIds: readonly string[];
}

export interface AssumptionRecordV1 {
  readonly schemaVersion: typeof QUESTION_GATE_SCHEMA_VERSION;
  readonly assumptionId: AssumptionId;
  readonly statement: string;
  readonly source: string;
  readonly reason: QuestionGateReasonCode;
  readonly confidence: number;
  readonly impact: QuestionGateImpact;
  readonly reversibility: QuestionGateReversibility;
  readonly affectedNodeIds: readonly string[];
  readonly status: AssumptionStatus;
}

export interface QuestionGateResultV1 {
  readonly schemaVersion: typeof QUESTION_GATE_SCHEMA_VERSION;
  readonly outcome: QuestionGateOutcome;
  readonly reason: QuestionGateReasonCode;
  readonly assumption: AssumptionRecordV1 | null;
}

export class QuestionGateError extends Error {
  readonly code: QuestionGateErrorCode;

  constructor(code: QuestionGateErrorCode, message: string) {
    super(message);
    this.name = "QuestionGateError";
    this.code = code;
  }
}

function fail(code: QuestionGateErrorCode, message: string): never {
  throw new QuestionGateError(code, message);
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    return fail("QUESTION_GATE_INVALID_SCHEMA", `${label} must be an object.`);
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return fail("QUESTION_GATE_INVALID_SCHEMA", `${label} must be a plain object.`);
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
    fail("QUESTION_GATE_INVALID_SCHEMA", `${label} has unknown keys: ${unknown.join(", ")}.`);
  }
}

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function boundedText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fail("QUESTION_GATE_INVALID_SCHEMA", `${label} must be non-empty text.`);
  }
  if (value.length > maxLength) {
    return fail("QUESTION_GATE_INVALID_SCHEMA", `${label} exceeds ${maxLength.toString()} chars.`);
  }
  return value;
}

function boolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") {
    return fail("QUESTION_GATE_INVALID_SCHEMA", `${label} must be boolean.`);
  }
  return value;
}

function confidence(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    return fail("QUESTION_GATE_INVALID_CONFIDENCE", "Question Gate confidence must be between 0 and 1.");
  }
  return value;
}

function impact(value: unknown): QuestionGateImpact {
  if (typeof value !== "string" || !QUESTION_GATE_IMPACTS.includes(value as QuestionGateImpact)) {
    return fail("QUESTION_GATE_INVALID_SCHEMA", "Question Gate impact is not supported.");
  }
  return value as QuestionGateImpact;
}

function reversibility(value: unknown): QuestionGateReversibility {
  if (
    typeof value !== "string" ||
    !QUESTION_GATE_REVERSIBILITIES.includes(value as QuestionGateReversibility)
  ) {
    return fail("QUESTION_GATE_INVALID_SCHEMA", "Question Gate reversibility is not supported.");
  }
  return value as QuestionGateReversibility;
}

function questionBudget(value: unknown): QuestionBudgetV1 {
  const candidate = record(value, "Question budget");
  exactKeys(candidate, ["used", "max"], "Question budget");
  const used = candidate.used;
  const max = candidate.max;
  if (
    typeof used !== "number" ||
    !Number.isSafeInteger(used) ||
    used < 0 ||
    typeof max !== "number" ||
    !Number.isSafeInteger(max) ||
    max < 0 ||
    max > QUESTION_GATE_MAX_QUESTIONS_BEFORE_PREVIEW ||
    used > max
  ) {
    return fail(
      "QUESTION_GATE_INVALID_BUDGET",
      `Question budget must satisfy 0 <= used <= max <= ${QUESTION_GATE_MAX_QUESTIONS_BEFORE_PREVIEW.toString()}.`,
    );
  }
  return Object.freeze({ used, max });
}

function affectedNodeIds(value: unknown): readonly string[] {
  if (!Array.isArray(value) || value.length > QUESTION_GATE_MAX_AFFECTED_NODE_IDS) {
    return fail("QUESTION_GATE_INVALID_AFFECTED_NODE_IDS", "Invalid affected Product Graph node count.");
  }
  const ids = value.map((item) => {
    if (
      typeof item !== "string" ||
      item.trim().length === 0 ||
      item.length > QUESTION_GATE_MAX_NODE_ID_LENGTH
    ) {
      return fail(
        "QUESTION_GATE_INVALID_AFFECTED_NODE_IDS",
        "Affected Product Graph node IDs must be bounded non-empty strings.",
      );
    }
    return item;
  });
  return Object.freeze([...new Set(ids)].sort(compareText));
}

export function validateQuestionGateDecisionInput(value: unknown): QuestionGateDecisionInputV1 {
  const candidate = record(value, "Question Gate decision input");
  exactKeys(
    candidate,
    [
      "schemaVersion",
      "statement",
      "source",
      "confidence",
      "impact",
      "reversibility",
      "derivable",
      "materiallyChangesProductOrTrustBoundary",
      "requiredForSafeProgress",
      "questionBudget",
      "affectedNodeIds",
    ],
    "Question Gate decision input",
  );
  if (candidate.schemaVersion !== QUESTION_GATE_SCHEMA_VERSION) {
    return fail("QUESTION_GATE_INVALID_SCHEMA", "Question Gate schemaVersion must be 1.");
  }
  return Object.freeze({
    schemaVersion: QUESTION_GATE_SCHEMA_VERSION,
    statement: boundedText(candidate.statement, "Question Gate statement", QUESTION_GATE_MAX_TEXT_LENGTH),
    source: boundedText(candidate.source, "Question Gate source", QUESTION_GATE_MAX_TEXT_LENGTH),
    confidence: confidence(candidate.confidence),
    impact: impact(candidate.impact),
    reversibility: reversibility(candidate.reversibility),
    derivable: boolean(candidate.derivable, "Question Gate derivable"),
    materiallyChangesProductOrTrustBoundary: boolean(
      candidate.materiallyChangesProductOrTrustBoundary,
      "Question Gate materiallyChangesProductOrTrustBoundary",
    ),
    requiredForSafeProgress: boolean(
      candidate.requiredForSafeProgress,
      "Question Gate requiredForSafeProgress",
    ),
    questionBudget: questionBudget(candidate.questionBudget),
    affectedNodeIds: affectedNodeIds(candidate.affectedNodeIds),
  });
}

function assumptionId(
  input: QuestionGateDecisionInputV1,
  reason: QuestionGateReasonCode,
): AssumptionId {
  const canonical = JSON.stringify({
    schemaVersion: QUESTION_GATE_SCHEMA_VERSION,
    statement: input.statement,
    source: input.source,
    reason,
    confidence: input.confidence,
    impact: input.impact,
    reversibility: input.reversibility,
    affectedNodeIds: input.affectedNodeIds,
    status: "inferred",
  });
  return `assumption-${createHash("sha256").update(canonical).digest("hex")}`;
}

function assumption(
  input: QuestionGateDecisionInputV1,
  reason: QuestionGateReasonCode,
): AssumptionRecordV1 {
  return Object.freeze({
    schemaVersion: QUESTION_GATE_SCHEMA_VERSION,
    assumptionId: assumptionId(input, reason),
    statement: input.statement,
    source: input.source,
    reason,
    confidence: input.confidence,
    impact: input.impact,
    reversibility: input.reversibility,
    affectedNodeIds: input.affectedNodeIds,
    status: "inferred",
  });
}

function result(
  outcome: QuestionGateOutcome,
  reason: QuestionGateReasonCode,
  assumptionRecord: AssumptionRecordV1 | null = null,
): QuestionGateResultV1 {
  return Object.freeze({
    schemaVersion: QUESTION_GATE_SCHEMA_VERSION,
    outcome,
    reason,
    assumption: assumptionRecord,
  });
}

export function evaluateQuestionGate(value: unknown): QuestionGateResultV1 {
  const input = validateQuestionGateDecisionInput(value);

  if (input.derivable) {
    return result("derive", "DERIVABLE_FROM_CONTEXT");
  }

  if (input.impact === "low" || input.reversibility === "easy") {
    const reason = "REVERSIBLE_OR_LOW_IMPACT_DEFAULT" as const;
    return result("assume", reason, assumption(input, reason));
  }

  if (input.confidence >= QUESTION_GATE_HIGH_CONFIDENCE_THRESHOLD) {
    const reason = "HIGH_CONFIDENCE_DEFAULT" as const;
    return result("assume", reason, assumption(input, reason));
  }

  const isMaterialHardBlocker =
    input.materiallyChangesProductOrTrustBoundary &&
    input.reversibility === "hard" &&
    input.requiredForSafeProgress;

  if (isMaterialHardBlocker) {
    if (input.questionBudget.used < input.questionBudget.max) {
      return result("ask", "MATERIAL_BLOCKER_NEEDS_USER");
    }
    return result("defer", "QUESTION_BUDGET_EXHAUSTED");
  }

  return result("defer", "REVERSIBLE_PROTOTYPE");
}
