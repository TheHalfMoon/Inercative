import { describe, expect, it } from "vitest";

import {
  type DonorImportRecord,
  validateDonorImportRecord,
} from "./index.ts";

const VALID_RECORD: DonorImportRecord = {
  schemaVersion: 1,
  source: {
    repository: "https://github.com/example/donor",
    revision: "0123456789abcdef0123456789abcdef01234567",
    paths: ["src/feature.ts"],
  },
  destination: {
    paths: ["packages/example/src/feature.ts"],
  },
  useMode: "ADAPT",
  authority: {
    kind: "FOUNDER_PERMISSION",
    reference: "FD-009",
  },
  licensing: {
    licenseExpression: "Apache-2.0",
    noticeRequired: true,
    noticeReference: "upstream/NOTICE",
  },
  dependencyClosure: {
    status: "COMPLETE",
    references: ["package.json", "pnpm-lock.yaml"],
  },
  modificationSummary: "Adapt the bounded mechanism behind an Ineractive-owned interface.",
  securityImpact: {
    level: "MEDIUM",
    summary: "Introduces a parser at an untrusted-input boundary.",
  },
  verificationEvidence: ["vitest: packages/example/src/feature.test.ts"],
  reviewEvidence: ["ocr: exact-head finding set", "diffcipline: exact-diff proof"],
};

function mutableRecord(): Record<string, unknown> {
  return structuredClone(VALID_RECORD) as unknown as Record<string, unknown>;
}

function issueCodes(input: unknown): readonly string[] {
  const result = validateDonorImportRecord(input);
  return result.ok ? [] : result.issues.map((issue) => issue.code);
}

describe("validateDonorImportRecord", () => {
  it("accepts a complete deterministic record", () => {
    const result = validateDonorImportRecord(VALID_RECORD);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(VALID_RECORD);
    }
  });

  it("rejects a non-object record", () => {
    expect(issueCodes(null)).toContain("EXPECTED_OBJECT");
  });

  it("rejects a missing required top-level field", () => {
    const record = mutableRecord();
    delete record.reviewEvidence;

    expect(issueCodes(record)).toContain("MISSING_FIELD");
  });

  it("rejects a branch-like source revision even when it is long", () => {
    const record = mutableRecord();
    const source = record.source as Record<string, unknown>;
    source.revision = "release-candidate-main";

    expect(issueCodes(record)).toContain("INVALID_STRING");
  });

  it("accepts a 64-hex immutable digest", () => {
    const record = mutableRecord();
    const source = record.source as Record<string, unknown>;
    source.revision =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    expect(validateDonorImportRecord(record).ok).toBe(true);
  });

  it("rejects an empty source path set", () => {
    const record = mutableRecord();
    const source = record.source as Record<string, unknown>;
    source.paths = [];

    expect(issueCodes(record)).toContain("INVALID_ARRAY");
  });

  it("rejects unknown fields instead of silently accepting schema drift", () => {
    const record = mutableRecord();
    record.unreviewedEscapeHatch = true;

    expect(issueCodes(record)).toContain("UNKNOWN_FIELD");
  });

  it("requires a notice reference when noticeRequired is true", () => {
    const record = mutableRecord();
    const licensing = record.licensing as Record<string, unknown>;
    licensing.noticeReference = null;

    expect(issueCodes(record)).toContain("INVALID_STRING");
  });

  it("rejects duplicate source paths", () => {
    const record = mutableRecord();
    const source = record.source as Record<string, unknown>;
    source.paths = ["src/feature.ts", "src/feature.ts"];

    expect(issueCodes(record)).toContain("DUPLICATE_ARRAY_ITEM");
  });

  it("rejects unsupported use modes", () => {
    const record = mutableRecord();
    record.useMode = "COPY_WHOLE_REPOSITORY";

    expect(issueCodes(record)).toContain("INVALID_ENUM");
  });

  it("rejects empty verification evidence", () => {
    const record = mutableRecord();
    record.verificationEvidence = [];

    expect(issueCodes(record)).toContain("INVALID_ARRAY");
  });
});
