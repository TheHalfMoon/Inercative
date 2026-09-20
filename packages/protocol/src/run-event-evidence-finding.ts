import {
  bindRevision,
  parseExactRevision,
  parseLogicalIdentity,
  parseLogicalIdentityForKind,
  type ExactRevision,
  type LogicalIdentity,
  type RevisionBinding,
} from "./identity-revision.ts";

export const PROTOCOL_RECORD_SCHEMA_VERSION = 1 as const;

export const RUN_STATES = [
  "PLANNED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "BLOCKED",
] as const;
export type RunState = (typeof RUN_STATES)[number];

export const EVIDENCE_OBSERVATION_STATUSES = [
  "OBSERVED",
  "BLOCKED",
  "NOT_RUN",
  "INCONCLUSIVE",
] as const;
export type EvidenceObservationStatus = (typeof EVIDENCE_OBSERVATION_STATUSES)[number];

export const FRESHNESS_STATES = ["CURRENT", "STALE", "SUPERSEDED"] as const;
export type FreshnessState = (typeof FRESHNESS_STATES)[number];

export const FINDING_SEVERITIES = ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

export const FINDING_STATUSES = ["OPEN", "BLOCKING", "RESOLVED"] as const;
export type FindingStatus = (typeof FINDING_STATUSES)[number];

export const FINDING_DISPOSITIONS = [
  "UNRESOLVED",
  "FIXED",
  "ACCEPTED_RISK",
  "FALSE_POSITIVE",
  "DEFERRED_BLOCKING",
] as const;
export type FindingDisposition = (typeof FINDING_DISPOSITIONS)[number];

export interface RunRecord {
  readonly schemaVersion: typeof PROTOCOL_RECORD_SCHEMA_VERSION;
  readonly id: LogicalIdentity<"run">;
  readonly target: RevisionBinding;
  readonly state: RunState;
  readonly parentRunId: LogicalIdentity<"run"> | null;
}

export interface EventRecord {
  readonly schemaVersion: typeof PROTOCOL_RECORD_SCHEMA_VERSION;
  readonly id: LogicalIdentity<"event">;
  readonly runId: LogicalIdentity<"run">;
  readonly sequence: number;
  readonly kind: string;
  readonly source: LogicalIdentity;
  readonly target: RevisionBinding | null;
  readonly references: readonly string[];
}

export interface EvidenceRecord {
  readonly schemaVersion: typeof PROTOCOL_RECORD_SCHEMA_VERSION;
  readonly id: LogicalIdentity<"evidence">;
  readonly runId: LogicalIdentity<"run">;
  readonly producer: LogicalIdentity;
  readonly target: RevisionBinding;
  readonly kind: string;
  readonly observationStatus: EvidenceObservationStatus;
  readonly freshness: FreshnessState;
  readonly artifactReferences: readonly string[];
  readonly reason: string | null;
  readonly supersededBy: LogicalIdentity<"evidence"> | null;
}

export interface FindingRecord {
  readonly schemaVersion: typeof PROTOCOL_RECORD_SCHEMA_VERSION;
  readonly id: LogicalIdentity<"finding">;
  readonly runId: LogicalIdentity<"run">;
  readonly source: LogicalIdentity;
  readonly target: RevisionBinding;
  readonly category: string;
  readonly severity: FindingSeverity;
  readonly confidence: number;
  readonly locationReference: string | null;
  readonly evidenceIds: readonly LogicalIdentity<"evidence">[];
  readonly requirementReferences: readonly string[];
  readonly policyReferences: readonly string[];
  readonly status: FindingStatus;
  readonly disposition: FindingDisposition;
  readonly freshness: FreshnessState;
  readonly supersededBy: LogicalIdentity<"finding"> | null;
}

export type ProtocolRecordIssueCode =
  | "EXPECTED_OBJECT"
  | "UNKNOWN_FIELD"
  | "MISSING_FIELD"
  | "INVALID_LITERAL"
  | "INVALID_STRING"
  | "INVALID_INTEGER"
  | "INVALID_NUMBER"
  | "INVALID_ENUM"
  | "INVALID_IDENTITY"
  | "INVALID_REVISION"
  | "INVALID_ARRAY"
  | "DUPLICATE_VALUE"
  | "SEMANTIC_CONFLICT";

export interface ProtocolRecordIssue {
  readonly code: ProtocolRecordIssueCode;
  readonly path: string;
  readonly message: string;
}

export type ProtocolRecordValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly issues: readonly ProtocolRecordIssue[] };

type UnknownRecord = Record<string, unknown>;

const TOKEN_PATTERN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/u;
const MAX_TOKEN_LENGTH = 128;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function issue(
  issues: ProtocolRecordIssue[],
  code: ProtocolRecordIssueCode,
  path: string,
  message: string,
): void {
  issues.push({ code, path, message });
}

function objectValue(
  value: unknown,
  path: string,
  issues: ProtocolRecordIssue[],
): UnknownRecord | null {
  if (!isRecord(value)) {
    issue(issues, "EXPECTED_OBJECT", path, path + " must be an object.");
    return null;
  }
  return value;
}

function rejectUnknown(
  value: UnknownRecord,
  allowed: readonly string[],
  path: string,
  issues: ProtocolRecordIssue[],
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      issue(
        issues,
        "UNKNOWN_FIELD",
        path + "." + key,
        path + " contains unknown field " + key + ".",
      );
    }
  }
}

function required(
  value: UnknownRecord,
  key: string,
  path: string,
  issues: ProtocolRecordIssue[],
): unknown {
  if (!(key in value)) {
    issue(
      issues,
      "MISSING_FIELD",
      path + "." + key,
      path + " is missing required field " + key + ".",
    );
    return undefined;
  }
  return value[key];
}

function text(value: unknown, path: string, issues: ProtocolRecordIssue[]): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    issue(issues, "INVALID_STRING", path, path + " must be a non-empty string.");
    return null;
  }
  return value;
}

function token(value: unknown, path: string, issues: ProtocolRecordIssue[]): string | null {
  const parsed = text(value, path, issues);
  if (parsed !== null && (parsed.length > MAX_TOKEN_LENGTH || !TOKEN_PATTERN.test(parsed))) {
    issue(
      issues,
      "INVALID_STRING",
      path,
      path + " must be a canonical lowercase token no longer than 128 characters.",
    );
    return null;
  }
  return parsed;
}

function enumeration<const Values extends readonly string[]>(
  value: unknown,
  values: Values,
  path: string,
  issues: ProtocolRecordIssue[],
): Values[number] | null {
  const match = values.find((entry) => entry === value);
  if (match === undefined) {
    issue(issues, "INVALID_ENUM", path, path + " must be one of: " + values.join(", ") + ".");
    return null;
  }
  return match;
}

function schemaVersion(
  value: unknown,
  path: string,
  issues: ProtocolRecordIssue[],
): typeof PROTOCOL_RECORD_SCHEMA_VERSION | null {
  if (value !== PROTOCOL_RECORD_SCHEMA_VERSION) {
    issue(
      issues,
      "INVALID_LITERAL",
      path,
      path + " must equal " + PROTOCOL_RECORD_SCHEMA_VERSION.toString() + ".",
    );
    return null;
  }
  return PROTOCOL_RECORD_SCHEMA_VERSION;
}

function identityForKind<Kind extends string>(
  value: unknown,
  kind: Kind,
  path: string,
  issues: ProtocolRecordIssue[],
): LogicalIdentity<Kind> | null {
  if (typeof value !== "string") {
    issue(issues, "INVALID_IDENTITY", path, path + " must be a canonical logical identity.");
    return null;
  }
  const parsed = parseLogicalIdentityForKind(kind, value);
  if (parsed === null) {
    issue(
      issues,
      "INVALID_IDENTITY",
      path,
      path + " must be a canonical logical identity of kind " + kind + ".",
    );
  }
  return parsed;
}

function anyIdentity(
  value: unknown,
  path: string,
  issues: ProtocolRecordIssue[],
): LogicalIdentity | null {
  if (typeof value !== "string") {
    issue(issues, "INVALID_IDENTITY", path, path + " must be a canonical logical identity.");
    return null;
  }
  const parsed = parseLogicalIdentity(value);
  if (parsed === null) {
    issue(issues, "INVALID_IDENTITY", path, path + " must be a canonical logical identity.");
    return null;
  }
  return parsed.value;
}

function exactRevision(
  value: unknown,
  path: string,
  issues: ProtocolRecordIssue[],
): ExactRevision | null {
  if (typeof value !== "string") {
    issue(issues, "INVALID_REVISION", path, path + " must be an immutable exact revision.");
    return null;
  }
  const parsed = parseExactRevision(value);
  if (parsed === null) {
    issue(issues, "INVALID_REVISION", path, path + " must be an immutable exact revision.");
    return null;
  }
  return parsed.value;
}

function revisionBinding(
  value: unknown,
  path: string,
  issues: ProtocolRecordIssue[],
): RevisionBinding | null {
  const record = objectValue(value, path, issues);
  if (record === null) return null;
  rejectUnknown(record, ["identity", "revision"], path, issues);
  const identity = anyIdentity(
    required(record, "identity", path, issues),
    path + ".identity",
    issues,
  );
  const revision = exactRevision(
    required(record, "revision", path, issues),
    path + ".revision",
    issues,
  );
  return identity !== null && revision !== null ? bindRevision(identity, revision) : null;
}

function nonNegativeInteger(
  value: unknown,
  path: string,
  issues: ProtocolRecordIssue[],
): number | null {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    issue(issues, "INVALID_INTEGER", path, path + " must be a non-negative safe integer.");
    return null;
  }
  return value;
}

function confidence(value: unknown, path: string, issues: ProtocolRecordIssue[]): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    issue(issues, "INVALID_NUMBER", path, path + " must be a finite number between 0 and 1.");
    return null;
  }
  return value;
}

function uniqueStrings(
  value: unknown,
  path: string,
  issues: ProtocolRecordIssue[],
  minimumItems = 0,
): readonly string[] | null {
  if (!Array.isArray(value)) {
    issue(issues, "INVALID_ARRAY", path, path + " must be an array.");
    return null;
  }
  if (value.length < minimumItems) {
    issue(
      issues,
      "INVALID_ARRAY",
      path,
      path + " must contain at least " + minimumItems.toString() + " item(s).",
    );
  }
  const result: string[] = [];
  const seen = new Set<string>();
  for (const [index, item] of value.entries()) {
    const parsed = text(item, path + "[" + index.toString() + "]", issues);
    if (parsed === null) continue;
    if (seen.has(parsed)) {
      issue(
        issues,
        "DUPLICATE_VALUE",
        path + "[" + index.toString() + "]",
        path + " must not contain duplicate values.",
      );
      continue;
    }
    seen.add(parsed);
    result.push(parsed);
  }
  return result;
}

function identityArray<Kind extends string>(
  value: unknown,
  kind: Kind,
  path: string,
  issues: ProtocolRecordIssue[],
  minimumItems = 0,
): readonly LogicalIdentity<Kind>[] | null {
  if (!Array.isArray(value)) {
    issue(issues, "INVALID_ARRAY", path, path + " must be an array.");
    return null;
  }
  if (value.length < minimumItems) {
    issue(
      issues,
      "INVALID_ARRAY",
      path,
      path + " must contain at least " + minimumItems.toString() + " item(s).",
    );
  }
  const result: LogicalIdentity<Kind>[] = [];
  const seen = new Set<string>();
  for (const [index, item] of value.entries()) {
    const parsed = identityForKind(item, kind, path + "[" + index.toString() + "]", issues);
    if (parsed === null) continue;
    if (seen.has(parsed)) {
      issue(
        issues,
        "DUPLICATE_VALUE",
        path + "[" + index.toString() + "]",
        path + " must not contain duplicate identities.",
      );
      continue;
    }
    seen.add(parsed);
    result.push(parsed);
  }
  return result;
}

function nullableText(value: unknown, path: string, issues: ProtocolRecordIssue[]): string | null {
  return value === null ? null : text(value, path, issues);
}

function nullableIdentityForKind<Kind extends string>(
  value: unknown,
  kind: Kind,
  path: string,
  issues: ProtocolRecordIssue[],
): LogicalIdentity<Kind> | null {
  return value === null ? null : identityForKind(value, kind, path, issues);
}

function validateFreshness(
  freshness: FreshnessState,
  supersededBy: LogicalIdentity | null,
  selfId: LogicalIdentity,
  path: string,
  issues: ProtocolRecordIssue[],
): void {
  if (freshness === "SUPERSEDED") {
    if (supersededBy === null) {
      issue(
        issues,
        "SEMANTIC_CONFLICT",
        path,
        "SUPERSEDED freshness requires a superseding record identity.",
      );
    } else if (supersededBy === selfId) {
      issue(issues, "SEMANTIC_CONFLICT", path, "A record cannot supersede itself.");
    }
    return;
  }
  if (supersededBy !== null) {
    issue(
      issues,
      "SEMANTIC_CONFLICT",
      path,
      "Only SUPERSEDED freshness may carry a superseding record identity.",
    );
  }
}

export function validateRunRecord(input: unknown): ProtocolRecordValidationResult<RunRecord> {
  const issues: ProtocolRecordIssue[] = [];
  const record = objectValue(input, "$", issues);
  if (record === null) return { ok: false, issues };
  rejectUnknown(record, ["schemaVersion", "id", "target", "state", "parentRunId"], "$", issues);

  const version = schemaVersion(
    required(record, "schemaVersion", "$", issues),
    "$.schemaVersion",
    issues,
  );
  const id = identityForKind(required(record, "id", "$", issues), "run", "$.id", issues);
  const target = revisionBinding(required(record, "target", "$", issues), "$.target", issues);
  const state = enumeration(required(record, "state", "$", issues), RUN_STATES, "$.state", issues);
  const parentRunId = nullableIdentityForKind(
    required(record, "parentRunId", "$", issues),
    "run",
    "$.parentRunId",
    issues,
  );

  if (id !== null && parentRunId === id) {
    issue(issues, "SEMANTIC_CONFLICT", "$.parentRunId", "A run cannot be its own parent.");
  }

  if (issues.length > 0 || version === null || id === null || target === null || state === null) {
    return { ok: false, issues };
  }
  return { ok: true, value: { schemaVersion: version, id, target, state, parentRunId } };
}

export function validateEventRecord(input: unknown): ProtocolRecordValidationResult<EventRecord> {
  const issues: ProtocolRecordIssue[] = [];
  const record = objectValue(input, "$", issues);
  if (record === null) return { ok: false, issues };
  rejectUnknown(
    record,
    ["schemaVersion", "id", "runId", "sequence", "kind", "source", "target", "references"],
    "$",
    issues,
  );

  const version = schemaVersion(
    required(record, "schemaVersion", "$", issues),
    "$.schemaVersion",
    issues,
  );
  const id = identityForKind(required(record, "id", "$", issues), "event", "$.id", issues);
  const runId = identityForKind(required(record, "runId", "$", issues), "run", "$.runId", issues);
  const sequence = nonNegativeInteger(
    required(record, "sequence", "$", issues),
    "$.sequence",
    issues,
  );
  const kind = token(required(record, "kind", "$", issues), "$.kind", issues);
  const source = anyIdentity(required(record, "source", "$", issues), "$.source", issues);
  const targetValue = required(record, "target", "$", issues);
  const target = targetValue === null ? null : revisionBinding(targetValue, "$.target", issues);
  const references = uniqueStrings(
    required(record, "references", "$", issues),
    "$.references",
    issues,
  );

  if (
    issues.length > 0 ||
    version === null ||
    id === null ||
    runId === null ||
    sequence === null ||
    kind === null ||
    source === null ||
    references === null
  ) {
    return { ok: false, issues };
  }
  return {
    ok: true,
    value: { schemaVersion: version, id, runId, sequence, kind, source, target, references },
  };
}

export function validateEvidenceRecord(
  input: unknown,
): ProtocolRecordValidationResult<EvidenceRecord> {
  const issues: ProtocolRecordIssue[] = [];
  const record = objectValue(input, "$", issues);
  if (record === null) return { ok: false, issues };
  rejectUnknown(
    record,
    [
      "schemaVersion",
      "id",
      "runId",
      "producer",
      "target",
      "kind",
      "observationStatus",
      "freshness",
      "artifactReferences",
      "reason",
      "supersededBy",
    ],
    "$",
    issues,
  );

  const version = schemaVersion(
    required(record, "schemaVersion", "$", issues),
    "$.schemaVersion",
    issues,
  );
  const id = identityForKind(required(record, "id", "$", issues), "evidence", "$.id", issues);
  const runId = identityForKind(required(record, "runId", "$", issues), "run", "$.runId", issues);
  const producer = anyIdentity(required(record, "producer", "$", issues), "$.producer", issues);
  const target = revisionBinding(required(record, "target", "$", issues), "$.target", issues);
  const kind = token(required(record, "kind", "$", issues), "$.kind", issues);
  const observationStatus = enumeration(
    required(record, "observationStatus", "$", issues),
    EVIDENCE_OBSERVATION_STATUSES,
    "$.observationStatus",
    issues,
  );
  const freshness = enumeration(
    required(record, "freshness", "$", issues),
    FRESHNESS_STATES,
    "$.freshness",
    issues,
  );
  const artifactReferences = uniqueStrings(
    required(record, "artifactReferences", "$", issues),
    "$.artifactReferences",
    issues,
  );
  const reason = nullableText(required(record, "reason", "$", issues), "$.reason", issues);
  const supersededBy = nullableIdentityForKind(
    required(record, "supersededBy", "$", issues),
    "evidence",
    "$.supersededBy",
    issues,
  );

  if (observationStatus === "OBSERVED") {
    if (artifactReferences !== null && artifactReferences.length === 0) {
      issue(
        issues,
        "SEMANTIC_CONFLICT",
        "$.artifactReferences",
        "OBSERVED evidence requires at least one artifact/reference.",
      );
    }
    if (reason !== null) {
      issue(issues, "SEMANTIC_CONFLICT", "$.reason", "OBSERVED evidence must have reason=null.");
    }
  } else if (observationStatus !== null && reason === null) {
    issue(
      issues,
      "SEMANTIC_CONFLICT",
      "$.reason",
      observationStatus + " evidence requires a non-empty reason.",
    );
  }

  if (id !== null && freshness !== null) {
    validateFreshness(freshness, supersededBy, id, "$.supersededBy", issues);
  }

  if (
    issues.length > 0 ||
    version === null ||
    id === null ||
    runId === null ||
    producer === null ||
    target === null ||
    kind === null ||
    observationStatus === null ||
    freshness === null ||
    artifactReferences === null
  ) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      schemaVersion: version,
      id,
      runId,
      producer,
      target,
      kind,
      observationStatus,
      freshness,
      artifactReferences,
      reason,
      supersededBy,
    },
  };
}

export function validateFindingRecord(
  input: unknown,
): ProtocolRecordValidationResult<FindingRecord> {
  const issues: ProtocolRecordIssue[] = [];
  const record = objectValue(input, "$", issues);
  if (record === null) return { ok: false, issues };
  rejectUnknown(
    record,
    [
      "schemaVersion",
      "id",
      "runId",
      "source",
      "target",
      "category",
      "severity",
      "confidence",
      "locationReference",
      "evidenceIds",
      "requirementReferences",
      "policyReferences",
      "status",
      "disposition",
      "freshness",
      "supersededBy",
    ],
    "$",
    issues,
  );

  const version = schemaVersion(
    required(record, "schemaVersion", "$", issues),
    "$.schemaVersion",
    issues,
  );
  const id = identityForKind(required(record, "id", "$", issues), "finding", "$.id", issues);
  const runId = identityForKind(required(record, "runId", "$", issues), "run", "$.runId", issues);
  const source = anyIdentity(required(record, "source", "$", issues), "$.source", issues);
  const target = revisionBinding(required(record, "target", "$", issues), "$.target", issues);
  const category = token(required(record, "category", "$", issues), "$.category", issues);
  const severity = enumeration(
    required(record, "severity", "$", issues),
    FINDING_SEVERITIES,
    "$.severity",
    issues,
  );
  const parsedConfidence = confidence(
    required(record, "confidence", "$", issues),
    "$.confidence",
    issues,
  );
  const locationReference = nullableText(
    required(record, "locationReference", "$", issues),
    "$.locationReference",
    issues,
  );
  const evidenceIds = identityArray(
    required(record, "evidenceIds", "$", issues),
    "evidence",
    "$.evidenceIds",
    issues,
    1,
  );
  const requirementReferences = uniqueStrings(
    required(record, "requirementReferences", "$", issues),
    "$.requirementReferences",
    issues,
  );
  const policyReferences = uniqueStrings(
    required(record, "policyReferences", "$", issues),
    "$.policyReferences",
    issues,
  );
  const status = enumeration(
    required(record, "status", "$", issues),
    FINDING_STATUSES,
    "$.status",
    issues,
  );
  const disposition = enumeration(
    required(record, "disposition", "$", issues),
    FINDING_DISPOSITIONS,
    "$.disposition",
    issues,
  );
  const freshness = enumeration(
    required(record, "freshness", "$", issues),
    FRESHNESS_STATES,
    "$.freshness",
    issues,
  );
  const supersededBy = nullableIdentityForKind(
    required(record, "supersededBy", "$", issues),
    "finding",
    "$.supersededBy",
    issues,
  );

  if (status === "OPEN" && disposition !== null && disposition !== "UNRESOLVED") {
    issue(
      issues,
      "SEMANTIC_CONFLICT",
      "$.disposition",
      "OPEN findings must use UNRESOLVED disposition.",
    );
  }
  if (
    status === "BLOCKING" &&
    disposition !== null &&
    disposition !== "UNRESOLVED" &&
    disposition !== "DEFERRED_BLOCKING"
  ) {
    issue(
      issues,
      "SEMANTIC_CONFLICT",
      "$.disposition",
      "BLOCKING findings must use UNRESOLVED or DEFERRED_BLOCKING disposition.",
    );
  }
  if (
    status === "RESOLVED" &&
    disposition !== null &&
    (disposition === "UNRESOLVED" || disposition === "DEFERRED_BLOCKING")
  ) {
    issue(
      issues,
      "SEMANTIC_CONFLICT",
      "$.disposition",
      "RESOLVED findings require FIXED, ACCEPTED_RISK, or FALSE_POSITIVE disposition.",
    );
  }

  if (id !== null && freshness !== null) {
    validateFreshness(freshness, supersededBy, id, "$.supersededBy", issues);
  }

  if (
    issues.length > 0 ||
    version === null ||
    id === null ||
    runId === null ||
    source === null ||
    target === null ||
    category === null ||
    severity === null ||
    parsedConfidence === null ||
    evidenceIds === null ||
    requirementReferences === null ||
    policyReferences === null ||
    status === null ||
    disposition === null ||
    freshness === null
  ) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      schemaVersion: version,
      id,
      runId,
      source,
      target,
      category,
      severity,
      confidence: parsedConfidence,
      locationReference,
      evidenceIds,
      requirementReferences,
      policyReferences,
      status,
      disposition,
      freshness,
      supersededBy,
    },
  };
}
