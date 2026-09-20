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

export const NOTICE_INVENTORY_SCHEMA_VERSION = 1 as const;

export interface NoticeInventoryEntry {
  readonly sourceRepository: string;
  readonly sourceRevision: string;
  readonly sourcePaths: readonly string[];
  readonly destinationPaths: readonly string[];
  readonly useMode: ImportUseMode;
  readonly authorityKind: AuthorityKind;
  readonly authorityReference: string;
  readonly licenseExpression: string;
  readonly noticeRequired: boolean;
  readonly noticeReference: string | null;
}

export interface NoticeInventory {
  readonly schemaVersion: typeof NOTICE_INVENTORY_SCHEMA_VERSION;
  readonly sourceRecordCount: number;
  readonly entries: readonly NoticeInventoryEntry[];
}

export type ImportAdmissionIssueCode =
  "EXPECTED_ARRAY" | "RECORD_INVALID" | "DEPENDENCY_CLOSURE_INCOMPLETE" | "DESTINATION_COLLISION";

export interface ImportAdmissionIssue {
  readonly code: ImportAdmissionIssueCode;
  readonly recordIndex: number | null;
  readonly path: string;
  readonly message: string;
}

export type ImportAdmissionResult =
  | {
      readonly ok: true;
      readonly records: readonly DonorImportRecord[];
      readonly noticeInventory: NoticeInventory;
    }
  | {
      readonly ok: false;
      readonly issues: readonly ImportAdmissionIssue[];
    };

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sortedStrings(values: readonly string[]): readonly string[] {
  return [...values].sort(compareText);
}

function noticeInventoryEntry(record: DonorImportRecord): NoticeInventoryEntry {
  return {
    sourceRepository: record.source.repository,
    sourceRevision: record.source.revision,
    sourcePaths: sortedStrings(record.source.paths),
    destinationPaths: sortedStrings(record.destination.paths),
    useMode: record.useMode,
    authorityKind: record.authority.kind,
    authorityReference: record.authority.reference,
    licenseExpression: record.licensing.licenseExpression,
    noticeRequired: record.licensing.noticeRequired,
    noticeReference: record.licensing.noticeReference,
  };
}

function noticeInventoryEntryKey(entry: NoticeInventoryEntry): string {
  return JSON.stringify([
    entry.sourceRepository,
    entry.sourceRevision,
    entry.sourcePaths,
    entry.destinationPaths,
    entry.useMode,
    entry.authorityKind,
    entry.authorityReference,
    entry.licenseExpression,
    entry.noticeRequired,
    entry.noticeReference,
  ]);
}

function buildNoticeInventory(records: readonly DonorImportRecord[]): NoticeInventory {
  const byKey = new Map<string, NoticeInventoryEntry>();
  for (const record of records) {
    const entry = noticeInventoryEntry(record);
    byKey.set(noticeInventoryEntryKey(entry), entry);
  }

  const entries = [...byKey.entries()]
    .sort(([left], [right]) => compareText(left, right))
    .map(([, entry]) => entry);

  return {
    schemaVersion: NOTICE_INVENTORY_SCHEMA_VERSION,
    sourceRecordCount: records.length,
    entries,
  };
}

function canonicalJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalJsonValue(item));
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort(compareText)
        .map((key) => [key, canonicalJsonValue(value[key])]),
    );
  }
  return value;
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalJsonValue(value)) ?? "undefined";
}

function admissionIssue(
  issues: ImportAdmissionIssue[],
  code: ImportAdmissionIssueCode,
  recordIndex: number | null,
  path: string,
  message: string,
): void {
  issues.push({ code, recordIndex, path, message });
}

export function validateImportAdmission(input: unknown): ImportAdmissionResult {
  if (!Array.isArray(input)) {
    return {
      ok: false,
      issues: [
        {
          code: "EXPECTED_ARRAY",
          recordIndex: null,
          path: "$",
          message: "Import admission input must be an array of donor import records.",
        },
      ],
    };
  }

  const issues: ImportAdmissionIssue[] = [];
  const records: DonorImportRecord[] = [];
  const destinationOwners = new Map<string, number>();

  for (const [recordIndex, candidate] of input.entries()) {
    const validation = validateDonorImportRecord(candidate);
    if (!validation.ok) {
      for (const validationIssue of validation.issues) {
        const suffix = validationIssue.path === "$" ? "" : validationIssue.path.slice(1);
        admissionIssue(
          issues,
          "RECORD_INVALID",
          recordIndex,
          `$[${recordIndex.toString()}]${suffix}`,
          validationIssue.message,
        );
      }
      continue;
    }

    const record = validation.value;
    records.push(record);

    if (record.dependencyClosure.status !== "COMPLETE") {
      admissionIssue(
        issues,
        "DEPENDENCY_CLOSURE_INCOMPLETE",
        recordIndex,
        `$[${recordIndex.toString()}].dependencyClosure.status`,
        "Only COMPLETE dependency closure can enter the admitted-source set.",
      );
    }

    for (const destinationPath of record.destination.paths) {
      const previousOwner = destinationOwners.get(destinationPath);
      if (previousOwner !== undefined) {
        admissionIssue(
          issues,
          "DESTINATION_COLLISION",
          recordIndex,
          `$[${recordIndex.toString()}].destination.paths`,
          `Destination path ${destinationPath} is already claimed by record ${previousOwner.toString()}.`,
        );
      } else {
        destinationOwners.set(destinationPath, recordIndex);
      }
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    records,
    noticeInventory: buildNoticeInventory(records),
  };
}

export function noticeInventoryMatches(
  admittedRecords: readonly DonorImportRecord[],
  candidateInventory: unknown,
): boolean {
  return canonicalJson(buildNoticeInventory(admittedRecords)) === canonicalJson(candidateInventory);
}
