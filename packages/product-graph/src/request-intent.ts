import { createHash } from "node:crypto";

import {
  CHANGE_INTENT_MAX_OPERATIONS,
  CHANGE_INTENT_PROVENANCE_SOURCES,
  compileChangeIntent,
  type ChangeIntentOperationV1,
  type ChangeIntentProvenanceSource,
  type ChangeIntentProvenanceV1,
  type ProposedGraphDeltaV1,
} from "./change-intent.ts";
import {
  validateProductGraphRevision,
  type JsonValue,
  type ProductGraphRevision,
  type ProductGraphRevisionDocumentV1,
} from "./contracts.ts";

export const REQUEST_INTENT_SCHEMA_VERSION = 1 as const;
export const USER_CHANGE_REQUEST_MAX_TEXT_LENGTH = 16_384 as const;
export const REQUEST_INTENT_MAX_REFERENCE_LENGTH = 1_024 as const;
export const INTENT_INTERPRETATION_MAX_UNCERTAINTIES = 16 as const;
export const INTENT_INTERPRETATION_MAX_UNCERTAINTY_LENGTH = 512 as const;

export const REQUEST_INTENT_ERROR_CODES = [
  "REQUEST_INTENT_INVALID_SCHEMA",
  "REQUEST_INTENT_BASE_MISMATCH",
  "REQUEST_INTENT_REQUEST_ID_MISMATCH",
  "REQUEST_INTENT_INTERPRETATION_REQUEST_MISMATCH",
  "REQUEST_INTENT_INTERPRETATION_ID_MISMATCH",
  "REQUEST_INTENT_INVALID_CONFIDENCE",
  "REQUEST_INTENT_INVALID_PROVENANCE",
  "REQUEST_INTENT_INVALID_UNCERTAINTY",
  "REQUEST_INTENT_INVALID_OPERATIONS",
] as const;

export type RequestIntentErrorCode = (typeof REQUEST_INTENT_ERROR_CODES)[number];
export type UserChangeRequestId = `request-${string}`;
export type IntentInterpretationId = `interpretation-${string}`;

export interface UserChangeRequestV1 {
  readonly schemaVersion: typeof REQUEST_INTENT_SCHEMA_VERSION;
  readonly requestId: UserChangeRequestId;
  readonly baseRevision: ProductGraphRevision;
  readonly text: string;
  readonly provenance: ChangeIntentProvenanceV1;
}

export interface IntentInterpretationV1 {
  readonly schemaVersion: typeof REQUEST_INTENT_SCHEMA_VERSION;
  readonly interpretationId: IntentInterpretationId;
  readonly requestId: UserChangeRequestId;
  readonly baseRevision: ProductGraphRevision;
  readonly provenance: ChangeIntentProvenanceV1;
  readonly confidence: number;
  readonly uncertainties: readonly string[];
  readonly operations: readonly ChangeIntentOperationV1[];
}

export interface CreateUserChangeRequestInputV1 {
  readonly baseRevision: ProductGraphRevision;
  readonly text: string;
  readonly provenance: ChangeIntentProvenanceV1;
}

export interface CreateIntentInterpretationInputV1 {
  readonly provenance: ChangeIntentProvenanceV1;
  readonly confidence: number;
  readonly uncertainties: readonly string[];
  readonly operations: readonly ChangeIntentOperationV1[];
}

export interface UserRequestProposalV1 {
  readonly schemaVersion: typeof REQUEST_INTENT_SCHEMA_VERSION;
  readonly requestId: UserChangeRequestId;
  readonly interpretationId: IntentInterpretationId;
  readonly baseRevision: ProductGraphRevision;
  readonly confidence: number;
  readonly uncertainties: readonly string[];
  readonly requestProvenance: ChangeIntentProvenanceV1;
  readonly interpretationProvenance: ChangeIntentProvenanceV1;
  readonly proposedDelta: ProposedGraphDeltaV1;
}

export class RequestIntentError extends Error {
  readonly code: RequestIntentErrorCode;

  constructor(code: RequestIntentErrorCode, message: string) {
    super(message);
    this.name = "RequestIntentError";
    this.code = code;
  }
}

function fail(code: RequestIntentErrorCode, message: string): never {
  throw new RequestIntentError(code, message);
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (value === null || isUnknownArray(value) || typeof value !== "object") {
    return fail("REQUEST_INTENT_INVALID_SCHEMA", `${label} must be an object.`);
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return fail("REQUEST_INTENT_INVALID_SCHEMA", `${label} must be a plain object.`);
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
    fail("REQUEST_INTENT_INVALID_SCHEMA", `${label} has unknown keys: ${unknown.join(", ")}.`);
  }
}

function boundedText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fail("REQUEST_INTENT_INVALID_SCHEMA", `${label} must be a non-empty string.`);
  }
  if (value.length > maxLength) {
    return fail(
      "REQUEST_INTENT_INVALID_SCHEMA",
      `${label} must not exceed ${maxLength.toString()} characters.`,
    );
  }
  return value;
}

function revision(value: unknown, label: string): ProductGraphRevision {
  if (typeof value !== "string" || !/^sha256:[0-9a-f]{64}$/.test(value)) {
    return fail("REQUEST_INTENT_INVALID_SCHEMA", `${label} must be a Product Graph revision.`);
  }
  return value as ProductGraphRevision;
}

function provenance(value: unknown, label: string): ChangeIntentProvenanceV1 {
  const candidate = record(value, label);
  exactKeys(candidate, ["source", "reference"], label);
  const source = candidate.source;
  if (
    typeof source !== "string" ||
    !CHANGE_INTENT_PROVENANCE_SOURCES.includes(source as ChangeIntentProvenanceSource)
  ) {
    return fail("REQUEST_INTENT_INVALID_PROVENANCE", `${label} source is not supported.`);
  }
  return Object.freeze({
    source: source as ChangeIntentProvenanceSource,
    reference: boundedText(
      candidate.reference,
      `${label} reference`,
      REQUEST_INTENT_MAX_REFERENCE_LENGTH,
    ),
  });
}

function canonicalValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map((item) => canonicalValue(item));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, item]) => [key, canonicalValue(item)]),
    );
  }
  return value;
}

function jsonValue(value: unknown): JsonValue {
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

function digest(value: JsonValue): string {
  return createHash("sha256").update(JSON.stringify(canonicalValue(value))).digest("hex");
}

function requestIdFor(
  baseRevision: ProductGraphRevision,
  text: string,
  requestProvenance: ChangeIntentProvenanceV1,
): UserChangeRequestId {
  return `request-${digest(
    jsonValue({
      schemaVersion: REQUEST_INTENT_SCHEMA_VERSION,
      baseRevision,
      text,
      provenance: requestProvenance,
    }),
  )}`;
}

function confidence(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    return fail(
      "REQUEST_INTENT_INVALID_CONFIDENCE",
      "Intent interpretation confidence must be between 0 and 1.",
    );
  }
  return value;
}

function uncertainties(value: unknown): readonly string[] {
  if (!isUnknownArray(value) || value.length > INTENT_INTERPRETATION_MAX_UNCERTAINTIES) {
    return fail(
      "REQUEST_INTENT_INVALID_UNCERTAINTY",
      `Intent interpretation accepts at most ${INTENT_INTERPRETATION_MAX_UNCERTAINTIES.toString()} uncertainty notes.`,
    );
  }
  return Object.freeze(
    value.map((item, index) => {
      if (typeof item !== "string" || item.trim().length === 0) {
        return fail(
          "REQUEST_INTENT_INVALID_UNCERTAINTY",
          `Intent interpretation uncertainty ${index.toString()} must be non-empty text.`,
        );
      }
      if (item.length > INTENT_INTERPRETATION_MAX_UNCERTAINTY_LENGTH) {
        return fail(
          "REQUEST_INTENT_INVALID_UNCERTAINTY",
          `Intent interpretation uncertainty ${index.toString()} is too long.`,
        );
      }
      return item;
    }),
  );
}

function operations(value: unknown): readonly ChangeIntentOperationV1[] {
  if (!isUnknownArray(value) || value.length === 0 || value.length > CHANGE_INTENT_MAX_OPERATIONS) {
    return fail(
      "REQUEST_INTENT_INVALID_OPERATIONS",
      `Intent interpretation requires 1-${CHANGE_INTENT_MAX_OPERATIONS.toString()} operations.`,
    );
  }
  return Object.freeze(
    JSON.parse(JSON.stringify(value)) as ChangeIntentOperationV1[],
  );
}

function interpretationIdFor(
  request: UserChangeRequestV1,
  interpretationProvenance: ChangeIntentProvenanceV1,
  interpretationConfidence: number,
  interpretationUncertainties: readonly string[],
  interpretationOperations: readonly ChangeIntentOperationV1[],
): IntentInterpretationId {
  return `interpretation-${digest(
    jsonValue({
      schemaVersion: REQUEST_INTENT_SCHEMA_VERSION,
      requestId: request.requestId,
      baseRevision: request.baseRevision,
      provenance: interpretationProvenance,
      confidence: interpretationConfidence,
      uncertainties: interpretationUncertainties,
      operations: interpretationOperations,
    }),
  )}`;
}

export function createUserChangeRequest(
  input: CreateUserChangeRequestInputV1,
): UserChangeRequestV1 {
  const baseRevision = revision(input.baseRevision, "User change request baseRevision");
  const text = boundedText(input.text, "User change request text", USER_CHANGE_REQUEST_MAX_TEXT_LENGTH);
  const requestProvenance = provenance(input.provenance, "User change request provenance");
  return Object.freeze({
    schemaVersion: REQUEST_INTENT_SCHEMA_VERSION,
    requestId: requestIdFor(baseRevision, text, requestProvenance),
    baseRevision,
    text,
    provenance: requestProvenance,
  });
}

export function validateUserChangeRequest(value: unknown): UserChangeRequestV1 {
  const candidate = record(value, "User change request");
  exactKeys(
    candidate,
    ["schemaVersion", "requestId", "baseRevision", "text", "provenance"],
    "User change request",
  );
  if (candidate.schemaVersion !== REQUEST_INTENT_SCHEMA_VERSION) {
    return fail("REQUEST_INTENT_INVALID_SCHEMA", "User change request schemaVersion must be 1.");
  }
  const baseRevision = revision(candidate.baseRevision, "User change request baseRevision");
  const text = boundedText(
    candidate.text,
    "User change request text",
    USER_CHANGE_REQUEST_MAX_TEXT_LENGTH,
  );
  const requestProvenance = provenance(candidate.provenance, "User change request provenance");
  const expected = requestIdFor(baseRevision, text, requestProvenance);
  if (candidate.requestId !== expected) {
    return fail(
      "REQUEST_INTENT_REQUEST_ID_MISMATCH",
      "User change request identity does not match its exact content.",
    );
  }
  return Object.freeze({
    schemaVersion: REQUEST_INTENT_SCHEMA_VERSION,
    requestId: expected,
    baseRevision,
    text,
    provenance: requestProvenance,
  });
}

export function createIntentInterpretation(
  requestValue: unknown,
  input: CreateIntentInterpretationInputV1,
): IntentInterpretationV1 {
  const request = validateUserChangeRequest(requestValue);
  const interpretationProvenance = provenance(
    input.provenance,
    "Intent interpretation provenance",
  );
  const interpretationConfidence = confidence(input.confidence);
  const interpretationUncertainties = uncertainties(input.uncertainties);
  const interpretationOperations = operations(input.operations);
  return Object.freeze({
    schemaVersion: REQUEST_INTENT_SCHEMA_VERSION,
    interpretationId: interpretationIdFor(
      request,
      interpretationProvenance,
      interpretationConfidence,
      interpretationUncertainties,
      interpretationOperations,
    ),
    requestId: request.requestId,
    baseRevision: request.baseRevision,
    provenance: interpretationProvenance,
    confidence: interpretationConfidence,
    uncertainties: interpretationUncertainties,
    operations: interpretationOperations,
  });
}

export function validateIntentInterpretation(
  requestValue: unknown,
  value: unknown,
): IntentInterpretationV1 {
  const request = validateUserChangeRequest(requestValue);
  const candidate = record(value, "Intent interpretation");
  exactKeys(
    candidate,
    [
      "schemaVersion",
      "interpretationId",
      "requestId",
      "baseRevision",
      "provenance",
      "confidence",
      "uncertainties",
      "operations",
    ],
    "Intent interpretation",
  );
  if (candidate.schemaVersion !== REQUEST_INTENT_SCHEMA_VERSION) {
    return fail("REQUEST_INTENT_INVALID_SCHEMA", "Intent interpretation schemaVersion must be 1.");
  }
  if (candidate.requestId !== request.requestId) {
    return fail(
      "REQUEST_INTENT_INTERPRETATION_REQUEST_MISMATCH",
      "Intent interpretation is not bound to the supplied request.",
    );
  }
  if (candidate.baseRevision !== request.baseRevision) {
    return fail(
      "REQUEST_INTENT_BASE_MISMATCH",
      "Intent interpretation baseRevision does not match the supplied request.",
    );
  }
  const interpretationProvenance = provenance(
    candidate.provenance,
    "Intent interpretation provenance",
  );
  const interpretationConfidence = confidence(candidate.confidence);
  const interpretationUncertainties = uncertainties(candidate.uncertainties);
  const interpretationOperations = operations(candidate.operations);
  const expected = interpretationIdFor(
    request,
    interpretationProvenance,
    interpretationConfidence,
    interpretationUncertainties,
    interpretationOperations,
  );
  if (candidate.interpretationId !== expected) {
    return fail(
      "REQUEST_INTENT_INTERPRETATION_ID_MISMATCH",
      "Intent interpretation identity does not match its exact content.",
    );
  }
  return Object.freeze({
    schemaVersion: REQUEST_INTENT_SCHEMA_VERSION,
    interpretationId: expected,
    requestId: request.requestId,
    baseRevision: request.baseRevision,
    provenance: interpretationProvenance,
    confidence: interpretationConfidence,
    uncertainties: interpretationUncertainties,
    operations: interpretationOperations,
  });
}

export function compileUserRequestInterpretation(
  baseValue: unknown,
  requestValue: unknown,
  interpretationValue: unknown,
): UserRequestProposalV1 {
  let base: ProductGraphRevisionDocumentV1;
  try {
    base = validateProductGraphRevision(baseValue);
  } catch (error) {
    return fail(
      "REQUEST_INTENT_BASE_MISMATCH",
      error instanceof Error ? error.message : "Supplied Product Graph base is invalid.",
    );
  }
  const request = validateUserChangeRequest(requestValue);
  if (request.baseRevision !== base.revision) {
    return fail(
      "REQUEST_INTENT_BASE_MISMATCH",
      "User change request baseRevision does not match the supplied Product Graph base.",
    );
  }
  const interpretation = validateIntentInterpretation(request, interpretationValue);
  const proposedDelta = compileChangeIntent(base, {
    schemaVersion: 1,
    intentId: interpretation.interpretationId,
    baseRevision: interpretation.baseRevision,
    provenance: interpretation.provenance,
    confidence: interpretation.confidence,
    operations: interpretation.operations,
  });
  return Object.freeze({
    schemaVersion: REQUEST_INTENT_SCHEMA_VERSION,
    requestId: request.requestId,
    interpretationId: interpretation.interpretationId,
    baseRevision: request.baseRevision,
    confidence: interpretation.confidence,
    uncertainties: Object.freeze([...interpretation.uncertainties]),
    requestProvenance: request.provenance,
    interpretationProvenance: interpretation.provenance,
    proposedDelta,
  });
}
