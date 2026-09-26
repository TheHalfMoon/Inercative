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
  type JsonObject,
  type JsonValue,
  type ProductGraphRevision,
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

interface RequestParts {
  readonly baseRevision: ProductGraphRevision;
  readonly text: string;
  readonly provenance: ChangeIntentProvenanceV1;
}

interface InterpretationParts {
  readonly provenance: ChangeIntentProvenanceV1;
  readonly confidence: number;
  readonly uncertainties: readonly string[];
  readonly operations: readonly ChangeIntentOperationV1[];
}

function fail(code: RequestIntentErrorCode, message: string): never {
  throw new RequestIntentError(code, message);
}

function array(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (value === null || array(value) || typeof value !== "object") {
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
    return fail("REQUEST_INTENT_INVALID_SCHEMA", `${label} must be non-empty text.`);
  }
  if (value.length > maxLength) {
    return fail("REQUEST_INTENT_INVALID_SCHEMA", `${label} exceeds ${maxLength.toString()} chars.`);
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

function canonical(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    const items = value as readonly JsonValue[];
    return items.map((item) => canonical(item));
  }
  if (value !== null && typeof value === "object") {
    const object = value as JsonObject;
    return Object.fromEntries(
      Object.keys(object)
        .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0))
        .map((key) => [key, canonical(object[key] as JsonValue)]),
    );
  }
  return value;
}

function json(value: unknown): JsonValue {
  const parsed: unknown = JSON.parse(JSON.stringify(value));
  return parsed as JsonValue;
}

function digest(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonical(json(value))))
    .digest("hex");
}

function requestParts(value: unknown, envelope: boolean): RequestParts {
  const candidate = record(value, envelope ? "User change request" : "User change request input");
  exactKeys(
    candidate,
    envelope
      ? ["schemaVersion", "requestId", "baseRevision", "text", "provenance"]
      : ["baseRevision", "text", "provenance"],
    envelope ? "User change request" : "User change request input",
  );
  if (envelope && candidate.schemaVersion !== REQUEST_INTENT_SCHEMA_VERSION) {
    return fail("REQUEST_INTENT_INVALID_SCHEMA", "User change request schemaVersion must be 1.");
  }
  return {
    baseRevision: revision(candidate.baseRevision, "User change request baseRevision"),
    text: boundedText(
      candidate.text,
      "User change request text",
      USER_CHANGE_REQUEST_MAX_TEXT_LENGTH,
    ),
    provenance: provenance(candidate.provenance, "User change request provenance"),
  };
}

function requestFrom(parts: RequestParts): UserChangeRequestV1 {
  const requestId: UserChangeRequestId = `request-${digest({
    schemaVersion: REQUEST_INTENT_SCHEMA_VERSION,
    ...parts,
  })}`;
  return Object.freeze({ schemaVersion: REQUEST_INTENT_SCHEMA_VERSION, requestId, ...parts });
}

function confidence(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    return fail("REQUEST_INTENT_INVALID_CONFIDENCE", "Confidence must be between 0 and 1.");
  }
  return value;
}

function uncertaintyList(value: unknown): readonly string[] {
  if (!array(value) || value.length > INTENT_INTERPRETATION_MAX_UNCERTAINTIES) {
    return fail("REQUEST_INTENT_INVALID_UNCERTAINTY", "Invalid uncertainty-note count.");
  }
  return Object.freeze(
    value.map((item) => {
      if (
        typeof item !== "string" ||
        item.trim().length === 0 ||
        item.length > INTENT_INTERPRETATION_MAX_UNCERTAINTY_LENGTH
      ) {
        return fail("REQUEST_INTENT_INVALID_UNCERTAINTY", "Invalid uncertainty note.");
      }
      return item;
    }),
  );
}

function operationList(value: unknown): readonly ChangeIntentOperationV1[] {
  if (!array(value) || value.length === 0 || value.length > CHANGE_INTENT_MAX_OPERATIONS) {
    return fail("REQUEST_INTENT_INVALID_OPERATIONS", "Invalid interpretation operation count.");
  }
  return Object.freeze(structuredClone(value) as ChangeIntentOperationV1[]);
}

function interpretationParts(
  value: unknown,
  request: UserChangeRequestV1,
  envelope: boolean,
): InterpretationParts {
  const candidate = record(
    value,
    envelope ? "Intent interpretation" : "Intent interpretation input",
  );
  exactKeys(
    candidate,
    envelope
      ? [
          "schemaVersion",
          "interpretationId",
          "requestId",
          "baseRevision",
          "provenance",
          "confidence",
          "uncertainties",
          "operations",
        ]
      : ["provenance", "confidence", "uncertainties", "operations"],
    envelope ? "Intent interpretation" : "Intent interpretation input",
  );
  if (envelope) {
    if (candidate.schemaVersion !== REQUEST_INTENT_SCHEMA_VERSION) {
      return fail(
        "REQUEST_INTENT_INVALID_SCHEMA",
        "Intent interpretation schemaVersion must be 1.",
      );
    }
    if (candidate.requestId !== request.requestId) {
      return fail(
        "REQUEST_INTENT_INTERPRETATION_REQUEST_MISMATCH",
        "Intent interpretation is bound to another request.",
      );
    }
    if (candidate.baseRevision !== request.baseRevision) {
      return fail("REQUEST_INTENT_BASE_MISMATCH", "Intent interpretation baseRevision is stale.");
    }
  }
  return {
    provenance: provenance(candidate.provenance, "Intent interpretation provenance"),
    confidence: confidence(candidate.confidence),
    uncertainties: uncertaintyList(candidate.uncertainties),
    operations: operationList(candidate.operations),
  };
}

function interpretationFrom(
  request: UserChangeRequestV1,
  parts: InterpretationParts,
): IntentInterpretationV1 {
  const interpretationId: IntentInterpretationId = `interpretation-${digest({
    schemaVersion: REQUEST_INTENT_SCHEMA_VERSION,
    requestId: request.requestId,
    baseRevision: request.baseRevision,
    ...parts,
  })}`;
  return Object.freeze({
    schemaVersion: REQUEST_INTENT_SCHEMA_VERSION,
    interpretationId,
    requestId: request.requestId,
    baseRevision: request.baseRevision,
    ...parts,
  });
}

export function createUserChangeRequest(
  input: CreateUserChangeRequestInputV1,
): UserChangeRequestV1 {
  return requestFrom(requestParts(input, false));
}

export function validateUserChangeRequest(value: unknown): UserChangeRequestV1 {
  const candidate = record(value, "User change request");
  const parsed = requestFrom(requestParts(candidate, true));
  if (candidate.requestId !== parsed.requestId) {
    return fail("REQUEST_INTENT_REQUEST_ID_MISMATCH", "User change request content changed.");
  }
  return parsed;
}

export function createIntentInterpretation(
  requestValue: unknown,
  input: CreateIntentInterpretationInputV1,
): IntentInterpretationV1 {
  const request = validateUserChangeRequest(requestValue);
  return interpretationFrom(request, interpretationParts(input, request, false));
}

export function validateIntentInterpretation(
  requestValue: unknown,
  value: unknown,
): IntentInterpretationV1 {
  const request = validateUserChangeRequest(requestValue);
  const candidate = record(value, "Intent interpretation");
  const parsed = interpretationFrom(request, interpretationParts(candidate, request, true));
  if (candidate.interpretationId !== parsed.interpretationId) {
    return fail(
      "REQUEST_INTENT_INTERPRETATION_ID_MISMATCH",
      "Intent interpretation content changed.",
    );
  }
  return parsed;
}

export function compileUserRequestInterpretation(
  baseValue: unknown,
  requestValue: unknown,
  interpretationValue: unknown,
): UserRequestProposalV1 {
  let base;
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
    return fail("REQUEST_INTENT_BASE_MISMATCH", "User change request baseRevision is stale.");
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
