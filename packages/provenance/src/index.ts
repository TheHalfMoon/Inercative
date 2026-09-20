export const IMPORT_RECORD_SCHEMA_VERSION = 1 as const;

export const IMPORT_USE_MODES = ["COPY", "ADAPT", "DEPEND"] as const;
export type ImportUseMode = (typeof IMPORT_USE_MODES)[number];

export const AUTHORITY_KINDS = ["FOUNDER_PERMISSION", "LICENSE", "CONTRACT", "OTHER"] as const;
export type AuthorityKind = (typeof AUTHORITY_KINDS)[number];

export const DEPENDENCY_CLOSURE_STATES = ["COMPLETE", "PARTIAL", "UNRESOLVED"] as const;
export type DependencyClosureState = (typeof DEPENDENCY_CLOSURE_STATES)[number];

export const SECURITY_IMPACT_LEVELS = ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type SecurityImpactLevel = (typeof SECURITY_IMPACT_LEVELS)[number];

export interface DonorImportRecord {
  readonly schemaVersion: typeof IMPORT_RECORD_SCHEMA_VERSION;
  readonly source: {
    readonly repository: string;
    readonly revision: string;
    readonly paths: readonly string[];
  };
  readonly destination: {
    readonly paths: readonly string[];
  };
  readonly useMode: ImportUseMode;
  readonly authority: {
    readonly kind: AuthorityKind;
    readonly reference: string;
  };
  readonly licensing: {
    readonly licenseExpression: string;
    readonly noticeRequired: boolean;
    readonly noticeReference: string | null;
  };
  readonly dependencyClosure: {
    readonly status: DependencyClosureState;
    readonly references: readonly string[];
  };
  readonly modificationSummary: string;
  readonly securityImpact: {
    readonly level: SecurityImpactLevel;
    readonly summary: string;
  };
  readonly verificationEvidence: readonly string[];
  readonly reviewEvidence: readonly string[];
}

export type ImportRecordValidationIssueCode =
  | "EXPECTED_OBJECT"
  | "UNKNOWN_FIELD"
  | "MISSING_FIELD"
  | "INVALID_LITERAL"
  | "INVALID_ENUM"
  | "INVALID_STRING"
  | "INVALID_BOOLEAN"
  | "INVALID_ARRAY"
  | "DUPLICATE_ARRAY_ITEM";

export interface ImportRecordValidationIssue {
  readonly code: ImportRecordValidationIssueCode;
  readonly path: string;
  readonly message: string;
}

export type ImportRecordValidationResult =
  | {
      readonly ok: true;
      readonly value: DonorImportRecord;
    }
  | {
      readonly ok: false;
      readonly issues: readonly ImportRecordValidationIssue[];
    };

type UnknownRecord = Record<string, unknown>;

const ROOT_FIELDS = [
  "schemaVersion",
  "source",
  "destination",
  "useMode",
  "authority",
  "licensing",
  "dependencyClosure",
  "modificationSummary",
  "securityImpact",
  "verificationEvidence",
  "reviewEvidence",
] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function issue(
  issues: ImportRecordValidationIssue[],
  code: ImportRecordValidationIssueCode,
  path: string,
  message: string,
): void {
  issues.push({ code, path, message });
}

function requireObject(
  value: unknown,
  path: string,
  issues: ImportRecordValidationIssue[],
): UnknownRecord | null {
  if (!isRecord(value)) {
    issue(issues, "EXPECTED_OBJECT", path, `${path} must be an object.`);
    return null;
  }
  return value;
}

function rejectUnknownFields(
  value: UnknownRecord,
  allowed: readonly string[],
  path: string,
  issues: ImportRecordValidationIssue[],
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      issue(issues, "UNKNOWN_FIELD", `${path}.${key}`, `${path} contains unknown field ${key}.`);
    }
  }
}

function requiredField(
  value: UnknownRecord,
  key: string,
  path: string,
  issues: ImportRecordValidationIssue[],
): unknown {
  if (!(key in value)) {
    issue(issues, "MISSING_FIELD", `${path}.${key}`, `${path} is missing required field ${key}.`);
    return undefined;
  }
  return value[key];
}

const IMMUTABLE_REVISION_PATTERN = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/iu;

function nonEmptyString(
  value: unknown,
  path: string,
  issues: ImportRecordValidationIssue[],
  minimumLength = 1,
): string | null {
  if (typeof value !== "string" || value.trim().length < minimumLength) {
    issue(
      issues,
      "INVALID_STRING",
      path,
      `${path} must be a non-empty string of at least ${minimumLength.toString()} characters.`,
    );
    return null;
  }
  return value;
}

function enumValue<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  path: string,
  issues: ImportRecordValidationIssue[],
): T[number] | null {
  if (typeof value !== "string" || !allowed.includes(value)) {
    issue(issues, "INVALID_ENUM", path, `${path} must be one of: ${allowed.join(", ")}.`);
    return null;
  }
  return value;
}

function uniqueStringArray(
  value: unknown,
  path: string,
  issues: ImportRecordValidationIssue[],
  allowEmpty: boolean,
): readonly string[] | null {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    issue(
      issues,
      "INVALID_ARRAY",
      path,
      `${path} must be ${allowEmpty ? "an array" : "a non-empty array"} of non-empty strings.`,
    );
    return null;
  }

  const result: string[] = [];
  const seen = new Set<string>();
  for (const [index, item] of value.entries()) {
    const itemPath = `${path}[${index.toString()}]`;
    const parsed = nonEmptyString(item, itemPath, issues);
    if (parsed === null) {
      continue;
    }
    if (seen.has(parsed)) {
      issue(
        issues,
        "DUPLICATE_ARRAY_ITEM",
        itemPath,
        `${path} must not contain duplicate entries.`,
      );
      continue;
    }
    seen.add(parsed);
    result.push(parsed);
  }
  return result;
}

function parseSource(
  value: unknown,
  issues: ImportRecordValidationIssue[],
): DonorImportRecord["source"] | null {
  const record = requireObject(value, "$.source", issues);
  if (record === null) return null;
  rejectUnknownFields(record, ["repository", "revision", "paths"], "$.source", issues);

  const repository = nonEmptyString(
    requiredField(record, "repository", "$.source", issues),
    "$.source.repository",
    issues,
  );
  const revisionValue = requiredField(record, "revision", "$.source", issues);
  const revision = nonEmptyString(revisionValue, "$.source.revision", issues);
  if (revision !== null && !IMMUTABLE_REVISION_PATTERN.test(revision)) {
    issue(
      issues,
      "INVALID_STRING",
      "$.source.revision",
      "$.source.revision must be an immutable 40- or 64-hex digest.",
    );
  }
  const paths = uniqueStringArray(
    requiredField(record, "paths", "$.source", issues),
    "$.source.paths",
    issues,
    false,
  );

  return repository !== null &&
    revision !== null &&
    IMMUTABLE_REVISION_PATTERN.test(revision) &&
    paths !== null
    ? { repository, revision, paths }
    : null;
}

function parseDestination(
  value: unknown,
  issues: ImportRecordValidationIssue[],
): DonorImportRecord["destination"] | null {
  const record = requireObject(value, "$.destination", issues);
  if (record === null) return null;
  rejectUnknownFields(record, ["paths"], "$.destination", issues);

  const paths = uniqueStringArray(
    requiredField(record, "paths", "$.destination", issues),
    "$.destination.paths",
    issues,
    false,
  );
  return paths === null ? null : { paths };
}

function parseAuthority(
  value: unknown,
  issues: ImportRecordValidationIssue[],
): DonorImportRecord["authority"] | null {
  const record = requireObject(value, "$.authority", issues);
  if (record === null) return null;
  rejectUnknownFields(record, ["kind", "reference"], "$.authority", issues);

  const kind = enumValue(
    requiredField(record, "kind", "$.authority", issues),
    AUTHORITY_KINDS,
    "$.authority.kind",
    issues,
  );
  const reference = nonEmptyString(
    requiredField(record, "reference", "$.authority", issues),
    "$.authority.reference",
    issues,
  );

  return kind !== null && reference !== null ? { kind, reference } : null;
}

function parseLicensing(
  value: unknown,
  issues: ImportRecordValidationIssue[],
): DonorImportRecord["licensing"] | null {
  const record = requireObject(value, "$.licensing", issues);
  if (record === null) return null;
  rejectUnknownFields(
    record,
    ["licenseExpression", "noticeRequired", "noticeReference"],
    "$.licensing",
    issues,
  );

  const licenseExpression = nonEmptyString(
    requiredField(record, "licenseExpression", "$.licensing", issues),
    "$.licensing.licenseExpression",
    issues,
  );
  const noticeRequiredValue = requiredField(record, "noticeRequired", "$.licensing", issues);
  const noticeRequired = typeof noticeRequiredValue === "boolean" ? noticeRequiredValue : null;
  if (noticeRequired === null) {
    issue(
      issues,
      "INVALID_BOOLEAN",
      "$.licensing.noticeRequired",
      "$.licensing.noticeRequired must be a boolean.",
    );
  }

  const noticeReferenceValue = requiredField(record, "noticeReference", "$.licensing", issues);
  let noticeReference: string | null = null;
  let noticeReferenceValid = true;
  if (noticeReferenceValue !== null) {
    const parsed = nonEmptyString(noticeReferenceValue, "$.licensing.noticeReference", issues);
    if (parsed === null) {
      noticeReferenceValid = false;
    } else {
      noticeReference = parsed;
    }
  }

  if (noticeRequired === true && (noticeReferenceValue === null || noticeReference === null)) {
    noticeReferenceValid = false;
    issue(
      issues,
      "INVALID_STRING",
      "$.licensing.noticeReference",
      "$.licensing.noticeReference must be provided when noticeRequired is true.",
    );
  }

  return licenseExpression !== null && noticeRequired !== null && noticeReferenceValid
    ? { licenseExpression, noticeRequired, noticeReference }
    : null;
}

function parseDependencyClosure(
  value: unknown,
  issues: ImportRecordValidationIssue[],
): DonorImportRecord["dependencyClosure"] | null {
  const record = requireObject(value, "$.dependencyClosure", issues);
  if (record === null) return null;
  rejectUnknownFields(record, ["status", "references"], "$.dependencyClosure", issues);

  const status = enumValue(
    requiredField(record, "status", "$.dependencyClosure", issues),
    DEPENDENCY_CLOSURE_STATES,
    "$.dependencyClosure.status",
    issues,
  );
  const references = uniqueStringArray(
    requiredField(record, "references", "$.dependencyClosure", issues),
    "$.dependencyClosure.references",
    issues,
    true,
  );

  return status !== null && references !== null ? { status, references } : null;
}

function parseSecurityImpact(
  value: unknown,
  issues: ImportRecordValidationIssue[],
): DonorImportRecord["securityImpact"] | null {
  const record = requireObject(value, "$.securityImpact", issues);
  if (record === null) return null;
  rejectUnknownFields(record, ["level", "summary"], "$.securityImpact", issues);

  const level = enumValue(
    requiredField(record, "level", "$.securityImpact", issues),
    SECURITY_IMPACT_LEVELS,
    "$.securityImpact.level",
    issues,
  );
  const summary = nonEmptyString(
    requiredField(record, "summary", "$.securityImpact", issues),
    "$.securityImpact.summary",
    issues,
  );

  return level !== null && summary !== null ? { level, summary } : null;
}

export function validateDonorImportRecord(input: unknown): ImportRecordValidationResult {
  const issues: ImportRecordValidationIssue[] = [];
  const record = requireObject(input, "$", issues);
  if (record === null) {
    return { ok: false, issues };
  }

  rejectUnknownFields(record, ROOT_FIELDS, "$", issues);

  const schemaVersionValue = requiredField(record, "schemaVersion", "$", issues);
  const schemaVersion =
    schemaVersionValue === IMPORT_RECORD_SCHEMA_VERSION ? IMPORT_RECORD_SCHEMA_VERSION : null;
  if (schemaVersion === null) {
    issue(
      issues,
      "INVALID_LITERAL",
      "$.schemaVersion",
      `$.schemaVersion must equal ${IMPORT_RECORD_SCHEMA_VERSION.toString()}.`,
    );
  }

  const source = parseSource(requiredField(record, "source", "$", issues), issues);
  const destination = parseDestination(requiredField(record, "destination", "$", issues), issues);
  const useMode = enumValue(
    requiredField(record, "useMode", "$", issues),
    IMPORT_USE_MODES,
    "$.useMode",
    issues,
  );
  const authority = parseAuthority(requiredField(record, "authority", "$", issues), issues);
  const licensing = parseLicensing(requiredField(record, "licensing", "$", issues), issues);
  const dependencyClosure = parseDependencyClosure(
    requiredField(record, "dependencyClosure", "$", issues),
    issues,
  );
  const modificationSummary = nonEmptyString(
    requiredField(record, "modificationSummary", "$", issues),
    "$.modificationSummary",
    issues,
  );
  const securityImpact = parseSecurityImpact(
    requiredField(record, "securityImpact", "$", issues),
    issues,
  );
  const verificationEvidence = uniqueStringArray(
    requiredField(record, "verificationEvidence", "$", issues),
    "$.verificationEvidence",
    issues,
    false,
  );
  const reviewEvidence = uniqueStringArray(
    requiredField(record, "reviewEvidence", "$", issues),
    "$.reviewEvidence",
    issues,
    false,
  );

  if (
    issues.length > 0 ||
    schemaVersion === null ||
    source === null ||
    destination === null ||
    useMode === null ||
    authority === null ||
    licensing === null ||
    dependencyClosure === null ||
    modificationSummary === null ||
    securityImpact === null ||
    verificationEvidence === null ||
    reviewEvidence === null
  ) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      schemaVersion,
      source,
      destination,
      useMode,
      authority,
      licensing,
      dependencyClosure,
      modificationSummary,
      securityImpact,
      verificationEvidence,
      reviewEvidence,
    },
  };
}
