import { describe, expect, it } from "vitest";

import {
  type OcrReviewEvidence,
  validateOcrReviewEvidence,
} from "./ocr-review-evidence.ts";

const BASE = "1111111111111111111111111111111111111111";
const HEAD = "2222222222222222222222222222222222222222";
const NEXT_HEAD = "3333333333333333333333333333333333333333";

const VALID_BLOCKED_EVIDENCE: OcrReviewEvidence = {
  schemaVersion: 1,
  target: {
    base: BASE,
    head: HEAD,
    mergeBase: BASE,
  },
  tool: {
    name: "alibaba/open-code-review",
    release: "v1.12.7",
    binarySha256: "56649575421b8ca3be3cfaededc0a9037ae7cc9ae560f167bf504bfb4054451a",
    configIdentity: "p00-default-rules-v1",
  },
  fileAccounting: {
    changedFiles: [
      { path: "src/reviewable.ts", changeType: "MODIFIED" },
      { path: "docs/governance.md", changeType: "MODIFIED" },
    ],
    reviewableFiles: ["src/reviewable.ts"],
    excludedFiles: [
      {
        path: "docs/governance.md",
        excludeReason: "unsupported_ext",
        material: true,
      },
    ],
    separateReviews: [
      {
        path: "docs/governance.md",
        method: "manual-governance-review",
        evidenceReference: "evidence:governance-review",
      },
    ],
  },
  ruleResolution: [
    {
      path: "src/reviewable.ts",
      ruleSetIdentity: "ocr-default:correctness-security-maintainability-tests",
      evidenceReference: "ocr:delegate-rule:src/reviewable.ts",
    },
  ],
  semanticReview: {
    state: "BLOCKED",
    blocker: {
      code: "LLM_ENDPOINT_NOT_CONFIGURED",
      reason: "No scoped OCR LLM endpoint/token is provisioned.",
      evidenceReference: "docs/evidence/P00_S05_T01_OCR_PROCEDURE_2026-09-20.md",
    },
    output: null,
    findings: [],
  },
  reconciliation: null,
};

function mutableEvidence(): Record<string, unknown> {
  return structuredClone(VALID_BLOCKED_EVIDENCE) as unknown as Record<string, unknown>;
}

function issueCodes(input: unknown, candidateHead = HEAD): readonly string[] {
  const result = validateOcrReviewEvidence(input, candidateHead);
  return result.ok ? [] : result.issues.map((issue) => issue.code);
}

describe("validateOcrReviewEvidence", () => {
  it("accepts exact-head BLOCKED evidence with complete accounting", () => {
    expect(validateOcrReviewEvidence(VALID_BLOCKED_EVIDENCE, HEAD).ok).toBe(true);
  });

  it("rejects a changed file missing from reviewable/excluded accounting", () => {
    const evidence = mutableEvidence();
    const accounting = evidence.fileAccounting as Record<string, unknown>;
    accounting.reviewableFiles = [];

    expect(issueCodes(evidence)).toContain("FILE_ACCOUNTING_MISMATCH");
  });

  it("rejects one path appearing in both reviewable and excluded accounting", () => {
    const evidence = mutableEvidence();
    const accounting = evidence.fileAccounting as Record<string, unknown>;
    accounting.reviewableFiles = ["src/reviewable.ts", "docs/governance.md"];

    expect(issueCodes(evidence)).toContain("FILE_ACCOUNTING_MISMATCH");
  });

  it("requires separate review for material excluded files", () => {
    const evidence = mutableEvidence();
    const accounting = evidence.fileAccounting as Record<string, unknown>;
    accounting.separateReviews = [];

    expect(issueCodes(evidence)).toContain("SEPARATE_REVIEW_REQUIRED");
  });

  it("requires deterministic rule resolution for every reviewable file", () => {
    const evidence = mutableEvidence();
    evidence.ruleResolution = [];

    expect(issueCodes(evidence)).toContain("RULE_RESOLUTION_MISSING");
  });

  it("rejects BLOCKED semantic state without blocker evidence", () => {
    const evidence = mutableEvidence();
    const semantic = evidence.semanticReview as Record<string, unknown>;
    semantic.blocker = null;

    expect(issueCodes(evidence)).toContain("SEMANTIC_BLOCKER_REQUIRED");
  });

  it("rejects semantic findings when the semantic layer did not run", () => {
    const evidence = mutableEvidence();
    const semantic = evidence.semanticReview as Record<string, unknown>;
    semantic.findings = [
      {
        findingId: "OCR-1",
        path: "src/reviewable.ts",
        material: true,
        disposition: "FIXED",
        rationale: "candidate repaired",
        evidenceReference: "commit:repair",
      },
    ];

    expect(issueCodes(evidence)).toContain("SEMANTIC_FINDINGS_FOR_NON_RUN");
  });

  it("rejects unresolved material findings from RUN evidence", () => {
    const evidence = mutableEvidence();
    evidence.semanticReview = {
      state: "RUN",
      blocker: null,
      output: {
        format: "JSON",
        reference: "artifact:ocr-findings.json",
        sha256: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
      findings: [
        {
          findingId: "OCR-1",
          path: "src/reviewable.ts",
          material: true,
          disposition: "UNRESOLVED",
          rationale: "requires follow-up",
          evidenceReference: "artifact:ocr-findings.json#OCR-1",
        },
      ],
    };

    expect(issueCodes(evidence)).toContain("MATERIAL_FINDING_BLOCKS_COMPLETION");
  });

  it("rejects stale evidence without deterministic reconciliation", () => {
    expect(issueCodes(VALID_BLOCKED_EVIDENCE, NEXT_HEAD)).toContain("STALE_HEAD");
  });

  it("accepts stale reviewed head only with explicit unchanged-diff reconciliation", () => {
    const evidence: OcrReviewEvidence = {
      ...VALID_BLOCKED_EVIDENCE,
      reconciliation: {
        fromHead: HEAD,
        toHead: NEXT_HEAD,
        diffUnchanged: true,
        evidenceReference: "diffcipline:exact-diff-reconciliation",
      },
    };

    expect(validateOcrReviewEvidence(evidence, NEXT_HEAD).ok).toBe(true);
  });

  it("rejects a generic bot name as designated OCR evidence", () => {
    const evidence = mutableEvidence();
    const tool = evidence.tool as Record<string, unknown>;
    tool.name = "generic-review-bot";

    expect(issueCodes(evidence)).toContain("INVALID_LITERAL");
  });
});
