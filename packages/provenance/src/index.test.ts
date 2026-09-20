import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  type DonorImportRecord,
  noticeInventoryMatches,
  validateDonorImportRecord,
  validateImportAdmission,
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
    source.revision = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

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

  it("rejects duplicate review evidence", () => {
    const record = mutableRecord();
    record.reviewEvidence = ["ocr: exact-head finding set", "ocr: exact-head finding set"];

    expect(issueCodes(record)).toContain("DUPLICATE_ARRAY_ITEM");
  });
});

function secondRecord(): DonorImportRecord {
  return {
    ...structuredClone(VALID_RECORD),
    source: {
      repository: "https://github.com/example/second-donor",
      revision: "abcdef0123456789abcdef0123456789abcdef01",
      paths: ["src/second.ts"],
    },
    destination: {
      paths: ["packages/example/src/second.ts"],
    },
    licensing: {
      licenseExpression: "MIT",
      noticeRequired: false,
      noticeReference: null,
    },
  };
}

function admissionCodes(input: unknown): readonly string[] {
  const result = validateImportAdmission(input);
  return result.ok ? [] : result.issues.map((issue) => issue.code);
}

describe("validateImportAdmission", () => {
  it("admits a complete record and produces a non-empty notice inventory", () => {
    const result = validateImportAdmission([VALID_RECORD]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.records).toHaveLength(1);
      expect(result.noticeInventory.sourceRecordCount).toBe(1);
      expect(result.noticeInventory.entries).toHaveLength(1);
      expect(result.noticeInventory.entries[0]?.noticeReference).toBe("upstream/NOTICE");
    }
  });

  it("rejects partial dependency closure", () => {
    const record: DonorImportRecord = {
      ...VALID_RECORD,
      dependencyClosure: {
        status: "PARTIAL",
        references: ["package.json"],
      },
    };

    expect(admissionCodes([record])).toContain("DEPENDENCY_CLOSURE_INCOMPLETE");
  });

  it("rejects unresolved dependency closure", () => {
    const record: DonorImportRecord = {
      ...VALID_RECORD,
      dependencyClosure: {
        status: "UNRESOLVED",
        references: [],
      },
    };

    expect(admissionCodes([record])).toContain("DEPENDENCY_CLOSURE_INCOMPLETE");
  });

  it("rejects a notice-required record with no notice reference", () => {
    const record = structuredClone(VALID_RECORD) as unknown as Record<string, unknown>;
    const licensing = record.licensing as Record<string, unknown>;
    licensing.noticeReference = null;

    expect(admissionCodes([record])).toContain("RECORD_INVALID");
  });

  it("rejects destination collisions across otherwise valid records", () => {
    const second = secondRecord();
    const collision: DonorImportRecord = {
      ...second,
      destination: {
        paths: [...VALID_RECORD.destination.paths],
      },
    };

    expect(admissionCodes([VALID_RECORD, collision])).toContain("DESTINATION_COLLISION");
  });

  it("generates stable inventory independent of record order", () => {
    const first = validateImportAdmission([VALID_RECORD, secondRecord()]);
    const second = validateImportAdmission([secondRecord(), VALID_RECORD]);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(first.noticeInventory).toEqual(second.noticeInventory);
    }
  });

  it("accepts an empty inventory only for zero admitted records", () => {
    const currentInventory = JSON.parse(
      readFileSync("third_party/notice-inventory.json", "utf8"),
    ) as unknown;

    expect(noticeInventoryMatches([], currentInventory)).toBe(true);
    expect(noticeInventoryMatches([VALID_RECORD], currentInventory)).toBe(false);
  });

  it("matches the generated inventory for the admitted set", () => {
    const result = validateImportAdmission([VALID_RECORD, secondRecord()]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(noticeInventoryMatches(result.records, result.noticeInventory)).toBe(true);
    }
  });

  it("rejects non-array admission input", () => {
    expect(admissionCodes({ records: [VALID_RECORD] })).toContain("EXPECTED_ARRAY");
  });
});
