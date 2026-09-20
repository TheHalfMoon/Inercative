export const OCR_REVIEW_EVIDENCE_SCHEMA_VERSION = 1 as const;
export const OCR_REVIEW_ENGINE = "alibaba/open-code-review" as const;

export const OCR_CHANGE_TYPES = ["ADDED", "MODIFIED", "DELETED", "RENAMED", "COPIED"] as const;
export type OcrChangeType = (typeof OCR_CHANGE_TYPES)[number];

export const OCR_SEMANTIC_STATES = ["RUN", "BLOCKED", "NOT_RUN"] as const;
export type OcrSemanticState = (typeof OCR_SEMANTIC_STATES)[number];

export const OCR_FINDING_DISPOSITIONS = [
  "FIXED",
  "ACCEPTED_RISK",
  "FALSE_POSITIVE",
  "DEFERRED_BLOCKING",
  "UNRESOLVED",
] as const;
export type OcrFindingDisposition = (typeof OCR_FINDING_DISPOSITIONS)[number];

export interface OcrChangedFile {
  readonly path: string;
  readonly changeType: OcrChangeType;
}

export interface OcrExcludedFile {
  readonly path: string;
  readonly excludeReason: string;
  readonly material: boolean;
}

export interface OcrSeparateReview {
  readonly path: string;
  readonly method: string;
  readonly evidenceReference: string;
}

export interface OcrRuleResolution {
  readonly path: string;
  readonly ruleSetIdentity: string;
  readonly evidenceReference: string;
}

export interface OcrFinding {
  readonly findingId: string;
  readonly path: string;
  readonly material: boolean;
  readonly disposition: OcrFindingDisposition;
  readonly rationale: string;
  readonly evidenceReference: string;
}

export interface OcrSemanticOutput {
  readonly format: "JSON" | "SARIF";
  readonly reference: string;
  readonly sha256: string;
}

export interface OcrSemanticBlocker {
  readonly code: string;
  readonly reason: string;
  readonly evidenceReference: string;
}

export type OcrSemanticReview =
  | {
      readonly state: "RUN";
      readonly blocker: null;
      readonly output: OcrSemanticOutput;
      readonly findings: readonly OcrFinding[];
    }
  | {
      readonly state: "BLOCKED" | "NOT_RUN";
      readonly blocker: OcrSemanticBlocker;
      readonly output: null;
      readonly findings: readonly [];
    };

export interface OcrHeadReconciliation {
  readonly fromHead: string;
  readonly toHead: string;
  readonly diffUnchanged: true;
  readonly evidenceReference: string;
}

export interface OcrReviewEvidence {
  readonly schemaVersion: typeof OCR_REVIEW_EVIDENCE_SCHEMA_VERSION;
  readonly target: {
    readonly base: string;
    readonly head: string;
    readonly mergeBase: string;
  };
  readonly tool: {
    readonly name: typeof OCR_REVIEW_ENGINE;
    readonly release: string;
    readonly binarySha256: string;
    readonly configIdentity: string;
  };
  readonly fileAccounting: {
    readonly changedFiles: readonly OcrChangedFile[];
    readonly reviewableFiles: readonly string[];
    readonly excludedFiles: readonly OcrExcludedFile[];
    readonly separateReviews: readonly OcrSeparateReview[];
  };
  readonly ruleResolution: readonly OcrRuleResolution[];
  readonly semanticReview: OcrSemanticReview;
  readonly reconciliation: OcrHeadReconciliation | null;
}

export type OcrEvidenceIssueCode =
  | "EXPECTED_OBJECT"
  | "UNKNOWN_FIELD"
  | "MISSING_FIELD"
  | "INVALID_LITERAL"
  | "INVALID_STRING"
  | "INVALID_BOOLEAN"
  | "INVALID_ENUM"
  | "INVALID_ARRAY"
  | "DUPLICATE_PATH"
  | "FILE_ACCOUNTING_MISMATCH"
  | "SEPARATE_REVIEW_REQUIRED"
  | "RULE_RESOLUTION_MISSING"
  | "SEMANTIC_BLOCKER_REQUIRED"
  | "SEMANTIC_OUTPUT_INVALID"
  | "SEMANTIC_FINDINGS_FOR_NON_RUN"
  | "MATERIAL_FINDING_BLOCKS_COMPLETION"
  | "STALE_HEAD"
  | "RECONCILIATION_INVALID";

export interface OcrEvidenceIssue {
  readonly code: OcrEvidenceIssueCode;
  readonly path: string;
  readonly message: string;
}

export type OcrEvidenceValidationResult =
  | {
      readonly ok: true;
      readonly value: OcrReviewEvidence;
    }
  | {
      readonly ok: false;
      readonly issues: readonly OcrEvidenceIssue[];
    };

type UnknownRecord = Record<string, unknown>;

const GIT_SHA_PATTERN = /^[0-9a-f]{40}$/iu;
const SHA256_PATTERN = /^[0-9a-f]{64}$/iu;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function addIssue(
  issues: OcrEvidenceIssue[],
  code: OcrEvidenceIssueCode,
  path: string,
  message: string,
): void {
  issues.push({ code, path, message });
}

function requireObject(
  value: unknown,
  path: string,
  issues: OcrEvidenceIssue[],
): UnknownRecord | null {
  if (!isRecord(value)) {
    addIssue(issues, "EXPECTED_OBJECT", path, `${path} must be an object.`);
    return null;
  }
  return value;
}

function rejectUnknownFields(
  value: UnknownRecord,
  allowed: readonly string[],
  path: string,
  issues: OcrEvidenceIssue[],
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      addIssue(issues, "UNKNOWN_FIELD", `${path}.${key}`, `${path} contains unknown field ${key}.`);
    }
  }
}

function requiredField(
  value: UnknownRecord,
  key: string,
  path: string,
  issues: OcrEvidenceIssue[],
): unknown {
  if (!(key in value)) {
    addIssue(issues, "MISSING_FIELD", `${path}.${key}`, `${path} is missing required field ${key}.`);
    return undefined;
  }
  return value[key];
}

function nonEmptyString(
  value: unknown,
  path: string,
  issues: OcrEvidenceIssue[],
): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    addIssue(issues, "INVALID_STRING", path, `${path} must be a non-empty string.`);
    return null;
  }
  return value;
}

function gitSha(value: unknown, path: string, issues: OcrEvidenceIssue[]): string | null {
  const parsed = nonEmptyString(value, path, issues);
  if (parsed !== null && !GIT_SHA_PATTERN.test(parsed)) {
    addIssue(issues, "INVALID_STRING", path, `${path} must be a 40-hex Git SHA.`);
    return null;
  }
  return parsed;
}

function sha256(value: unknown, path: string, issues: OcrEvidenceIssue[]): string | null {
  const parsed = nonEmptyString(value, path, issues);
  if (parsed !== null && !SHA256_PATTERN.test(parsed)) {
    addIssue(issues, "INVALID_STRING", path, `${path} must be a 64-hex SHA-256 digest.`);
    return null;
  }
  return parsed;
}

function enumValue<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  path: string,
  issues: OcrEvidenceIssue[],
): T[number] | null {
  if (typeof value !== "string" || !allowed.includes(value)) {
    addIssue(issues, "INVALID_ENUM", path, `${path} must be one of: ${allowed.join(", ")}.`);
    return null;
  }
  return value;
}

function booleanValue(
  value: unknown,
  path: string,
  issues: OcrEvidenceIssue[],
): boolean | null {
  if (typeof value !== "boolean") {
    addIssue(issues, "INVALID_BOOLEAN", path, `${path} must be boolean.`);
    return null;
  }
  return value;
}

function stringArray(
  value: unknown,
  path: string,
  issues: OcrEvidenceIssue[],
): readonly string[] | null {
  if (!Array.isArray(value)) {
    addIssue(issues, "INVALID_ARRAY", path, `${path} must be an array.`);
    return null;
  }

  const result: string[] = [];
  const seen = new Set<string>();
  for (const [index, item] of value.entries()) {
    const parsed = nonEmptyString(item, `${path}[${index.toString()}]`, issues);
    if (parsed === null) continue;
    if (seen.has(parsed)) {
      addIssue(
        issues,
        "DUPLICATE_PATH",
        `${path}[${index.toString()}]`,
        `${path} must not contain duplicate paths.`,
      );
      continue;
    }
    seen.add(parsed);
    result.push(parsed);
  }
  return result;
}

function parseTarget(
  value: unknown,
  issues: OcrEvidenceIssue[],
): OcrReviewEvidence["target"] | null {
  const record = requireObject(value, "$.target", issues);
  if (record === null) return null;
  rejectUnknownFields(record, ["base", "head", "mergeBase"], "$.target", issues);

  const base = gitSha(requiredField(record, "base", "$.target", issues), "$.target.base", issues);
  const head = gitSha(requiredField(record, "head", "$.target", issues), "$.target.head", issues);
  const mergeBase = gitSha(
    requiredField(record, "mergeBase", "$.target", issues),
    "$.target.mergeBase",
    issues,
  );

  return base !== null && head !== null && mergeBase !== null ? { base, head, mergeBase } : null;
}

function parseTool(
  value: unknown,
  issues: OcrEvidenceIssue[],
): OcrReviewEvidence["tool"] | null {
  const record = requireObject(value, "$.tool", issues);
  if (record === null) return null;
  rejectUnknownFields(
    record,
    ["name", "release", "binarySha256", "configIdentity"],
    "$.tool",
    issues,
  );

  const nameValue = requiredField(record, "name", "$.tool", issues);
  const name = nameValue === OCR_REVIEW_ENGINE ? OCR_REVIEW_ENGINE : null;
  if (name === null) {
    addIssue(
      issues,
      "INVALID_LITERAL",
      "$.tool.name",
      `$.tool.name must equal ${OCR_REVIEW_ENGINE}.`,
    );
  }
  const release = nonEmptyString(
    requiredField(record, "release", "$.tool", issues),
    "$.tool.release",
    issues,
  );
  const binarySha256 = sha256(
    requiredField(record, "binarySha256", "$.tool", issues),
    "$.tool.binarySha256",
    issues,
  );
  const configIdentity = nonEmptyString(
    requiredField(record, "configIdentity", "$.tool", issues),
    "$.tool.configIdentity",
    issues,
  );

  return name !== null && release !== null && binarySha256 !== null && configIdentity !== null
    ? { name, release, binarySha256, configIdentity }
    : null;
}

function parseChangedFiles(
  value: unknown,
  issues: OcrEvidenceIssue[],
): readonly OcrChangedFile[] | null {
  if (!Array.isArray(value)) {
    addIssue(issues, "INVALID_ARRAY", "$.fileAccounting.changedFiles", "changedFiles must be an array.");
    return null;
  }

  const result: OcrChangedFile[] = [];
  const seen = new Set<string>();
  for (const [index, item] of value.entries()) {
    const path = `$.fileAccounting.changedFiles[${index.toString()}]`;
    const record = requireObject(item, path, issues);
    if (record === null) continue;
    rejectUnknownFields(record, ["path", "changeType"], path, issues);
    const filePath = nonEmptyString(requiredField(record, "path", path, issues), `${path}.path`, issues);
    const changeType = enumValue(
      requiredField(record, "changeType", path, issues),
      OCR_CHANGE_TYPES,
      `${path}.changeType`,
      issues,
    );
    if (filePath !== null) {
      if (seen.has(filePath)) {
        addIssue(issues, "DUPLICATE_PATH", `${path}.path`, "changedFiles contains a duplicate path.");
      } else {
        seen.add(filePath);
      }
    }
    if (filePath !== null && changeType !== null) {
      result.push({ path: filePath, changeType });
    }
  }
  return result;
}

function parseExcludedFiles(
  value: unknown,
  issues: OcrEvidenceIssue[],
): readonly OcrExcludedFile[] | null {
  if (!Array.isArray(value)) {
    addIssue(issues, "INVALID_ARRAY", "$.fileAccounting.excludedFiles", "excludedFiles must be an array.");
    return null;
  }

  const result: OcrExcludedFile[] = [];
  const seen = new Set<string>();
  for (const [index, item] of value.entries()) {
    const path = `$.fileAccounting.excludedFiles[${index.toString()}]`;
    const record = requireObject(item, path, issues);
    if (record === null) continue;
    rejectUnknownFields(record, ["path", "excludeReason", "material"], path, issues);
    const filePath = nonEmptyString(requiredField(record, "path", path, issues), `${path}.path`, issues);
    const excludeReason = nonEmptyString(
      requiredField(record, "excludeReason", path, issues),
      `${path}.excludeReason`,
      issues,
    );
    const material = booleanValue(
      requiredField(record, "material", path, issues),
      `${path}.material`,
      issues,
    );
    if (filePath !== null) {
      if (seen.has(filePath)) {
        addIssue(issues, "DUPLICATE_PATH", `${path}.path`, "excludedFiles contains a duplicate path.");
      } else {
        seen.add(filePath);
      }
    }
    if (filePath !== null && excludeReason !== null && material !== null) {
      result.push({ path: filePath, excludeReason, material });
    }
  }
  return result;
}

function parseSeparateReviews(
  value: unknown,
  issues: OcrEvidenceIssue[],
): readonly OcrSeparateReview[] | null {
  if (!Array.isArray(value)) {
    addIssue(issues, "INVALID_ARRAY", "$.fileAccounting.separateReviews", "separateReviews must be an array.");
    return null;
  }

  const result: OcrSeparateReview[] = [];
  const seen = new Set<string>();
  for (const [index, item] of value.entries()) {
    const path = `$.fileAccounting.separateReviews[${index.toString()}]`;
    const record = requireObject(item, path, issues);
    if (record === null) continue;
    rejectUnknownFields(record, ["path", "method", "evidenceReference"], path, issues);
    const filePath = nonEmptyString(requiredField(record, "path", path, issues), `${path}.path`, issues);
    const method = nonEmptyString(requiredField(record, "method", path, issues), `${path}.method`, issues);
    const evidenceReference = nonEmptyString(
      requiredField(record, "evidenceReference", path, issues),
      `${path}.evidenceReference`,
      issues,
    );
    if (filePath !== null) {
      if (seen.has(filePath)) {
        addIssue(issues, "DUPLICATE_PATH", `${path}.path`, "separateReviews contains a duplicate path.");
      } else {
        seen.add(filePath);
      }
    }
    if (filePath !== null && method !== null && evidenceReference !== null) {
      result.push({ path: filePath, method, evidenceReference });
    }
  }
  return result;
}

function parseFileAccounting(
  value: unknown,
  issues: OcrEvidenceIssue[],
): OcrReviewEvidence["fileAccounting"] | null {
  const record = requireObject(value, "$.fileAccounting", issues);
  if (record === null) return null;
  rejectUnknownFields(
    record,
    ["changedFiles", "reviewableFiles", "excludedFiles", "separateReviews"],
    "$.fileAccounting",
    issues,
  );

  const changedFiles = parseChangedFiles(requiredField(record, "changedFiles", "$.fileAccounting", issues), issues);
  const reviewableFiles = stringArray(
    requiredField(record, "reviewableFiles", "$.fileAccounting", issues),
    "$.fileAccounting.reviewableFiles",
    issues,
  );
  const excludedFiles = parseExcludedFiles(
    requiredField(record, "excludedFiles", "$.fileAccounting", issues),
    issues,
  );
  const separateReviews = parseSeparateReviews(
    requiredField(record, "separateReviews", "$.fileAccounting", issues),
    issues,
  );

  if (
    changedFiles === null ||
    reviewableFiles === null ||
    excludedFiles === null ||
    separateReviews === null
  ) {
    return null;
  }
  return { changedFiles, reviewableFiles, excludedFiles, separateReviews };
}

function parseRuleResolution(
  value: unknown,
  issues: OcrEvidenceIssue[],
): readonly OcrRuleResolution[] | null {
  if (!Array.isArray(value)) {
    addIssue(issues, "INVALID_ARRAY", "$.ruleResolution", "$.ruleResolution must be an array.");
    return null;
  }

  const result: OcrRuleResolution[] = [];
  const seen = new Set<string>();
  for (const [index, item] of value.entries()) {
    const path = `$.ruleResolution[${index.toString()}]`;
    const record = requireObject(item, path, issues);
    if (record === null) continue;
    rejectUnknownFields(record, ["path", "ruleSetIdentity", "evidenceReference"], path, issues);
    const filePath = nonEmptyString(requiredField(record, "path", path, issues), `${path}.path`, issues);
    const ruleSetIdentity = nonEmptyString(
      requiredField(record, "ruleSetIdentity", path, issues),
      `${path}.ruleSetIdentity`,
      issues,
    );
    const evidenceReference = nonEmptyString(
      requiredField(record, "evidenceReference", path, issues),
      `${path}.evidenceReference`,
      issues,
    );
    if (filePath !== null) {
      if (seen.has(filePath)) {
        addIssue(issues, "DUPLICATE_PATH", `${path}.path`, "ruleResolution contains a duplicate path.");
      } else {
        seen.add(filePath);
      }
    }
    if (filePath !== null && ruleSetIdentity !== null && evidenceReference !== null) {
      result.push({ path: filePath, ruleSetIdentity, evidenceReference });
    }
  }
  return result;
}

function parseFindings(
  value: unknown,
  issues: OcrEvidenceIssue[],
): readonly OcrFinding[] | null {
  if (!Array.isArray(value)) {
    addIssue(issues, "INVALID_ARRAY", "$.semanticReview.findings", "$.semanticReview.findings must be an array.");
    return null;
  }

  const result: OcrFinding[] = [];
  for (const [index, item] of value.entries()) {
    const path = `$.semanticReview.findings[${index.toString()}]`;
    const record = requireObject(item, path, issues);
    if (record === null) continue;
    rejectUnknownFields(
      record,
      ["findingId", "path", "material", "disposition", "rationale", "evidenceReference"],
      path,
      issues,
    );
    const findingId = nonEmptyString(
      requiredField(record, "findingId", path, issues),
      `${path}.findingId`,
      issues,
    );
    const filePath = nonEmptyString(requiredField(record, "path", path, issues), `${path}.path`, issues);
    const material = booleanValue(requiredField(record, "material", path, issues), `${path}.material`, issues);
    const disposition = enumValue(
      requiredField(record, "disposition", path, issues),
      OCR_FINDING_DISPOSITIONS,
      `${path}.disposition`,
      issues,
    );
    const rationale = nonEmptyString(
      requiredField(record, "rationale", path, issues),
      `${path}.rationale`,
      issues,
    );
    const evidenceReference = nonEmptyString(
      requiredField(record, "evidenceReference", path, issues),
      `${path}.evidenceReference`,
      issues,
    );
    if (
      findingId !== null &&
      filePath !== null &&
      material !== null &&
      disposition !== null &&
      rationale !== null &&
      evidenceReference !== null
    ) {
      result.push({ findingId, path: filePath, material, disposition, rationale, evidenceReference });
    }
  }
  return result;
}

function parseSemanticOutput(
  value: unknown,
  issues: OcrEvidenceIssue[],
): OcrSemanticOutput | null {
  const record = requireObject(value, "$.semanticReview.output", issues);
  if (record === null) return null;
  rejectUnknownFields(record, ["format", "reference", "sha256"], "$.semanticReview.output", issues);
  const format = enumValue(
    requiredField(record, "format", "$.semanticReview.output", issues),
    ["JSON", "SARIF"] as const,
    "$.semanticReview.output.format",
    issues,
  );
  const reference = nonEmptyString(
    requiredField(record, "reference", "$.semanticReview.output", issues),
    "$.semanticReview.output.reference",
    issues,
  );
  const outputSha256 = sha256(
    requiredField(record, "sha256", "$.semanticReview.output", issues),
    "$.semanticReview.output.sha256",
    issues,
  );
  return format !== null && reference !== null && outputSha256 !== null
    ? { format, reference, sha256: outputSha256 }
    : null;
}

function parseSemanticBlocker(
  value: unknown,
  issues: OcrEvidenceIssue[],
): OcrSemanticBlocker | null {
  const record = requireObject(value, "$.semanticReview.blocker", issues);
  if (record === null) return null;
  rejectUnknownFields(record, ["code", "reason", "evidenceReference"], "$.semanticReview.blocker", issues);
  const code = nonEmptyString(
    requiredField(record, "code", "$.semanticReview.blocker", issues),
    "$.semanticReview.blocker.code",
    issues,
  );
  const reason = nonEmptyString(
    requiredField(record, "reason", "$.semanticReview.blocker", issues),
    "$.semanticReview.blocker.reason",
    issues,
  );
  const evidenceReference = nonEmptyString(
    requiredField(record, "evidenceReference", "$.semanticReview.blocker", issues),
    "$.semanticReview.blocker.evidenceReference",
    issues,
  );
  return code !== null && reason !== null && evidenceReference !== null
    ? { code, reason, evidenceReference }
    : null;
}

function parseSemanticReview(
  value: unknown,
  issues: OcrEvidenceIssue[],
): OcrSemanticReview | null {
  const record = requireObject(value, "$.semanticReview", issues);
  if (record === null) return null;
  rejectUnknownFields(record, ["state", "blocker", "output", "findings"], "$.semanticReview", issues);

  const state = enumValue(
    requiredField(record, "state", "$.semanticReview", issues),
    OCR_SEMANTIC_STATES,
    "$.semanticReview.state",
    issues,
  );
  const blockerValue = requiredField(record, "blocker", "$.semanticReview", issues);
  const outputValue = requiredField(record, "output", "$.semanticReview", issues);
  const findings = parseFindings(
    requiredField(record, "findings", "$.semanticReview", issues),
    issues,
  );
  if (state === null || findings === null) return null;

  if (state === "RUN") {
    if (blockerValue !== null) {
      addIssue(
        issues,
        "SEMANTIC_OUTPUT_INVALID",
        "$.semanticReview.blocker",
        "RUN semantic evidence must have blocker=null.",
      );
    }
    const output = parseSemanticOutput(outputValue, issues);
    return blockerValue === null && output !== null ? { state, blocker: null, output, findings } : null;
  }

  if (outputValue !== null) {
    addIssue(
      issues,
      "SEMANTIC_OUTPUT_INVALID",
      "$.semanticReview.output",
      "BLOCKED/NOT_RUN semantic evidence must have output=null.",
    );
  }
  if (findings.length > 0) {
    addIssue(
      issues,
      "SEMANTIC_FINDINGS_FOR_NON_RUN",
      "$.semanticReview.findings",
      "BLOCKED/NOT_RUN semantic evidence must not contain semantic findings.",
    );
  }
  const blocker = parseSemanticBlocker(blockerValue, issues);
  if (blocker === null) {
    addIssue(
      issues,
      "SEMANTIC_BLOCKER_REQUIRED",
      "$.semanticReview.blocker",
      "BLOCKED/NOT_RUN semantic evidence requires an explicit blocker/reason.",
    );
  }
  return outputValue === null && findings.length === 0 && blocker !== null
    ? { state, blocker, output: null, findings: [] }
    : null;
}

function parseReconciliation(
  value: unknown,
  issues: OcrEvidenceIssue[],
): OcrHeadReconciliation | null {
  if (value === null) return null;
  const record = requireObject(value, "$.reconciliation", issues);
  if (record === null) return null;
  rejectUnknownFields(
    record,
    ["fromHead", "toHead", "diffUnchanged", "evidenceReference"],
    "$.reconciliation",
    issues,
  );
  const fromHead = gitSha(
    requiredField(record, "fromHead", "$.reconciliation", issues),
    "$.reconciliation.fromHead",
    issues,
  );
  const toHead = gitSha(
    requiredField(record, "toHead", "$.reconciliation", issues),
    "$.reconciliation.toHead",
    issues,
  );
  const diffUnchangedValue = requiredField(record, "diffUnchanged", "$.reconciliation", issues);
  const diffUnchanged = diffUnchangedValue === true ? true : null;
  if (diffUnchanged === null) {
    addIssue(
      issues,
      "RECONCILIATION_INVALID",
      "$.reconciliation.diffUnchanged",
      "$.reconciliation.diffUnchanged must be true.",
    );
  }
  const evidenceReference = nonEmptyString(
    requiredField(record, "evidenceReference", "$.reconciliation", issues),
    "$.reconciliation.evidenceReference",
    issues,
  );

  return fromHead !== null && toHead !== null && diffUnchanged !== null && evidenceReference !== null
    ? { fromHead, toHead, diffUnchanged, evidenceReference }
    : null;
}

function validateCoverage(
  evidence: OcrReviewEvidence,
  candidateHead: string,
  issues: OcrEvidenceIssue[],
): void {
  const changed = new Set(evidence.fileAccounting.changedFiles.map((file) => file.path));
  const reviewable = new Set(evidence.fileAccounting.reviewableFiles);
  const excluded = new Map(evidence.fileAccounting.excludedFiles.map((file) => [file.path, file]));
  const separate = new Map(evidence.fileAccounting.separateReviews.map((item) => [item.path, item]));
  const rules = new Map(evidence.ruleResolution.map((item) => [item.path, item]));

  for (const path of reviewable) {
    if (excluded.has(path)) {
      addIssue(
        issues,
        "FILE_ACCOUNTING_MISMATCH",
        "$.fileAccounting",
        `Changed file ${path} appears in both reviewable and excluded accounting.`,
      );
    }
  }

  const accounted = new Set<string>([...reviewable, ...excluded.keys()]);
  for (const path of changed) {
    if (!accounted.has(path)) {
      addIssue(
        issues,
        "FILE_ACCOUNTING_MISMATCH",
        "$.fileAccounting",
        `Changed file ${path} is not accounted for.`,
      );
    }
  }
  for (const path of accounted) {
    if (!changed.has(path)) {
      addIssue(
        issues,
        "FILE_ACCOUNTING_MISMATCH",
        "$.fileAccounting",
        `Accounted path ${path} is not present in changedFiles.`,
      );
    }
  }

  for (const path of reviewable) {
    if (!rules.has(path)) {
      addIssue(
        issues,
        "RULE_RESOLUTION_MISSING",
        "$.ruleResolution",
        `Reviewable file ${path} has no deterministic rule-resolution evidence.`,
      );
    }
  }
  for (const path of rules.keys()) {
    if (!reviewable.has(path)) {
      addIssue(
        issues,
        "RULE_RESOLUTION_MISSING",
        "$.ruleResolution",
        `Rule-resolution path ${path} is not a reviewable file.`,
      );
    }
  }

  for (const excludedFile of evidence.fileAccounting.excludedFiles) {
    if (excludedFile.material && !separate.has(excludedFile.path)) {
      addIssue(
        issues,
        "SEPARATE_REVIEW_REQUIRED",
        "$.fileAccounting.separateReviews",
        `Material excluded file ${excludedFile.path} requires separate-review evidence.`,
      );
    }
  }
  for (const path of separate.keys()) {
    const excludedFile = excluded.get(path);
    if (excludedFile === undefined || !excludedFile.material) {
      addIssue(
        issues,
        "SEPARATE_REVIEW_REQUIRED",
        "$.fileAccounting.separateReviews",
        `Separate-review path ${path} must correspond to a material excluded file.`,
      );
    }
  }

  if (evidence.semanticReview.state === "RUN") {
    for (const finding of evidence.semanticReview.findings) {
      if (
        finding.material &&
        (finding.disposition === "UNRESOLVED" || finding.disposition === "DEFERRED_BLOCKING")
      ) {
        addIssue(
          issues,
          "MATERIAL_FINDING_BLOCKS_COMPLETION",
          "$.semanticReview.findings",
          `Material finding ${finding.findingId} remains blocking.`,
        );
      }
    }
  }

  if (evidence.target.head !== candidateHead) {
    const reconciliation = evidence.reconciliation;
    if (
      reconciliation === null ||
      reconciliation.fromHead !== evidence.target.head ||
      reconciliation.toHead !== candidateHead ||
      !reconciliation.diffUnchanged
    ) {
      addIssue(
        issues,
        "STALE_HEAD",
        "$.target.head",
        "OCR evidence head differs from the candidate head without valid deterministic reconciliation.",
      );
    }
  } else if (evidence.reconciliation !== null && evidence.reconciliation.toHead !== candidateHead) {
    addIssue(
      issues,
      "RECONCILIATION_INVALID",
      "$.reconciliation.toHead",
      "Reconciliation target must equal the candidate head.",
    );
  }
}

export function validateOcrReviewEvidence(
  input: unknown,
  candidateHead: string,
): OcrEvidenceValidationResult {
  const issues: OcrEvidenceIssue[] = [];
  if (!GIT_SHA_PATTERN.test(candidateHead)) {
    return {
      ok: false,
      issues: [
        {
          code: "INVALID_STRING",
          path: "$candidateHead",
          message: "candidateHead must be a 40-hex Git SHA.",
        },
      ],
    };
  }

  const record = requireObject(input, "$", issues);
  if (record === null) return { ok: false, issues };
  rejectUnknownFields(
    record,
    [
      "schemaVersion",
      "target",
      "tool",
      "fileAccounting",
      "ruleResolution",
      "semanticReview",
      "reconciliation",
    ],
    "$",
    issues,
  );

  const schemaVersionValue = requiredField(record, "schemaVersion", "$", issues);
  const schemaVersion =
    schemaVersionValue === OCR_REVIEW_EVIDENCE_SCHEMA_VERSION
      ? OCR_REVIEW_EVIDENCE_SCHEMA_VERSION
      : null;
  if (schemaVersion === null) {
    addIssue(
      issues,
      "INVALID_LITERAL",
      "$.schemaVersion",
      `$.schemaVersion must equal ${OCR_REVIEW_EVIDENCE_SCHEMA_VERSION.toString()}.`,
    );
  }

  const target = parseTarget(requiredField(record, "target", "$", issues), issues);
  const tool = parseTool(requiredField(record, "tool", "$", issues), issues);
  const fileAccounting = parseFileAccounting(
    requiredField(record, "fileAccounting", "$", issues),
    issues,
  );
  const ruleResolution = parseRuleResolution(
    requiredField(record, "ruleResolution", "$", issues),
    issues,
  );
  const semanticReview = parseSemanticReview(
    requiredField(record, "semanticReview", "$", issues),
    issues,
  );
  const reconciliation = parseReconciliation(
    requiredField(record, "reconciliation", "$", issues),
    issues,
  );

  if (
    issues.length > 0 ||
    schemaVersion === null ||
    target === null ||
    tool === null ||
    fileAccounting === null ||
    ruleResolution === null ||
    semanticReview === null
  ) {
    return { ok: false, issues };
  }

  const evidence: OcrReviewEvidence = {
    schemaVersion,
    target,
    tool,
    fileAccounting,
    ruleResolution,
    semanticReview,
    reconciliation,
  };

  validateCoverage(evidence, candidateHead, issues);
  return issues.length === 0 ? { ok: true, value: evidence } : { ok: false, issues };
}
