import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  EVIDENCE_OBSERVATION_STATUSES,
  FINDING_DISPOSITIONS,
  FINDING_SEVERITIES,
  FINDING_STATUSES,
  FRESHNESS_STATES,
  RUN_STATES,
  bindRevision,
  formatGitRevision,
  formatLogicalIdentity,
  validateEventRecord,
  validateEvidenceRecord,
  validateFindingRecord,
  validateRunRecord,
  type EventRecord,
  type EvidenceRecord,
  type FindingRecord,
  type RunRecord,
} from "./index.ts";

const RUN_ID = formatLogicalIdentity("run", "018f9f3a-7b2a-7f11-8a4c-1234567890ab");
const PARENT_RUN_ID = formatLogicalIdentity("run", "018f9f3a-7b2a-7f11-8a4c-1234567890ac");
const EVENT_ID = formatLogicalIdentity("event", "018f9f3a-7b2a-7f11-8a4c-1234567890ad");
const EVIDENCE_ID = formatLogicalIdentity("evidence", "018f9f3a-7b2a-7f11-8a4c-1234567890ae");
const NEXT_EVIDENCE_ID = formatLogicalIdentity("evidence", "018f9f3a-7b2a-7f11-8a4c-1234567890af");
const FINDING_ID = formatLogicalIdentity("finding", "018f9f3a-7b2a-7f11-8a4c-1234567890b0");
const NEXT_FINDING_ID = formatLogicalIdentity("finding", "018f9f3a-7b2a-7f11-8a4c-1234567890b1");
const PROJECT_ID = formatLogicalIdentity("project", "550e8400-e29b-41d4-a716-446655440000");
const PRODUCER_ID = formatLogicalIdentity("verifier", "550e8400-e29b-41d4-a716-446655440001");
const TARGET = bindRevision(
  PROJECT_ID,
  formatGitRevision("0123456789abcdef0123456789abcdef01234567"),
);

const RUN: RunRecord = {
  schemaVersion: 1,
  id: RUN_ID,
  target: TARGET,
  state: "RUNNING",
  parentRunId: PARENT_RUN_ID,
};

const EVENT: EventRecord = {
  schemaVersion: 1,
  id: EVENT_ID,
  runId: RUN_ID,
  sequence: 0,
  kind: "run.started",
  source: PRODUCER_ID,
  target: TARGET,
  references: ["artifact:bootstrap"],
};

const EVIDENCE: EvidenceRecord = {
  schemaVersion: 1,
  id: EVIDENCE_ID,
  runId: RUN_ID,
  producer: PRODUCER_ID,
  target: TARGET,
  kind: "test.vitest",
  observationStatus: "OBSERVED",
  freshness: "CURRENT",
  artifactReferences: ["artifact:test-results.json"],
  reason: null,
  supersededBy: null,
};

const FINDING: FindingRecord = {
  schemaVersion: 1,
  id: FINDING_ID,
  runId: RUN_ID,
  source: PRODUCER_ID,
  target: TARGET,
  category: "correctness.contract",
  severity: "HIGH",
  confidence: 0.9,
  locationReference: "packages/protocol/src/run-event-evidence-finding.ts:1",
  evidenceIds: [EVIDENCE_ID],
  requirementReferences: ["SG-000011:acceptance:1"],
  policyReferences: [],
  status: "OPEN",
  disposition: "UNRESOLVED",
  freshness: "CURRENT",
  supersededBy: null,
};

function issueCodes(
  result:
    | ReturnType<typeof validateRunRecord>
    | ReturnType<typeof validateEventRecord>
    | ReturnType<typeof validateEvidenceRecord>
    | ReturnType<typeof validateFindingRecord>,
): readonly string[] {
  return result.ok ? [] : result.issues.map((item) => item.code);
}

describe("RunRecord", () => {
  it("round-trips a canonical run record", () => {
    expect(validateRunRecord(RUN)).toEqual({ ok: true, value: RUN });
  });

  it("rejects the wrong logical identity kind", () => {
    expect(issueCodes(validateRunRecord({ ...RUN, id: PROJECT_ID }))).toContain("INVALID_IDENTITY");
  });

  it("rejects self-parenting", () => {
    expect(issueCodes(validateRunRecord({ ...RUN, parentRunId: RUN_ID }))).toContain(
      "SEMANTIC_CONFLICT",
    );
  });
});

describe("EventRecord", () => {
  it("round-trips an append-oriented event", () => {
    expect(validateEventRecord(EVENT)).toEqual({ ok: true, value: EVENT });
  });

  it("rejects negative and non-integer sequence values", () => {
    expect(issueCodes(validateEventRecord({ ...EVENT, sequence: -1 }))).toContain(
      "INVALID_INTEGER",
    );
    expect(issueCodes(validateEventRecord({ ...EVENT, sequence: 0.5 }))).toContain(
      "INVALID_INTEGER",
    );
  });

  it("rejects non-canonical event kind tokens", () => {
    expect(issueCodes(validateEventRecord({ ...EVENT, kind: "Run Started" }))).toContain(
      "INVALID_STRING",
    );
  });
});

describe("EvidenceRecord", () => {
  it("round-trips observed exact-revision evidence", () => {
    expect(validateEvidenceRecord(EVIDENCE)).toEqual({ ok: true, value: EVIDENCE });
  });

  it("does not provide a PASS observation state", () => {
    expect(EVIDENCE_OBSERVATION_STATUSES).not.toContain("PASS");
    expect(
      issueCodes(validateEvidenceRecord({ ...EVIDENCE, observationStatus: "PASS" })),
    ).toContain("INVALID_ENUM");
  });

  it("requires an artifact/reference when evidence was observed", () => {
    expect(issueCodes(validateEvidenceRecord({ ...EVIDENCE, artifactReferences: [] }))).toContain(
      "SEMANTIC_CONFLICT",
    );
  });

  it("requires a reason when evidence did not run", () => {
    expect(
      issueCodes(
        validateEvidenceRecord({
          ...EVIDENCE,
          observationStatus: "NOT_RUN",
          artifactReferences: [],
          reason: null,
        }),
      ),
    ).toContain("SEMANTIC_CONFLICT");
  });

  it("requires a successor only for SUPERSEDED freshness", () => {
    expect(
      issueCodes(
        validateEvidenceRecord({
          ...EVIDENCE,
          freshness: "SUPERSEDED",
          supersededBy: null,
        }),
      ),
    ).toContain("SEMANTIC_CONFLICT");
    expect(
      issueCodes(validateEvidenceRecord({ ...EVIDENCE, supersededBy: NEXT_EVIDENCE_ID })),
    ).toContain("SEMANTIC_CONFLICT");
    expect(
      validateEvidenceRecord({
        ...EVIDENCE,
        freshness: "SUPERSEDED",
        supersededBy: NEXT_EVIDENCE_ID,
      }).ok,
    ).toBe(true);
  });
});

describe("FindingRecord", () => {
  it("round-trips an unresolved open finding", () => {
    expect(validateFindingRecord(FINDING)).toEqual({ ok: true, value: FINDING });
  });

  it("requires at least one evidence identity", () => {
    expect(issueCodes(validateFindingRecord({ ...FINDING, evidenceIds: [] }))).toContain(
      "INVALID_ARRAY",
    );
  });

  it("rejects confidence outside the closed 0..1 interval", () => {
    expect(issueCodes(validateFindingRecord({ ...FINDING, confidence: 1.01 }))).toContain(
      "INVALID_NUMBER",
    );
  });

  it("keeps blocking state explicit instead of inferring it from severity", () => {
    const blocking: FindingRecord = {
      ...FINDING,
      status: "BLOCKING",
      disposition: "DEFERRED_BLOCKING",
    };
    expect(validateFindingRecord(blocking).ok).toBe(true);
    expect(issueCodes(validateFindingRecord({ ...blocking, disposition: "FIXED" }))).toContain(
      "SEMANTIC_CONFLICT",
    );
  });

  it("rejects unresolved disposition on a resolved finding", () => {
    expect(
      issueCodes(
        validateFindingRecord({
          ...FINDING,
          status: "RESOLVED",
          disposition: "UNRESOLVED",
        }),
      ),
    ).toContain("SEMANTIC_CONFLICT");
  });

  it("requires explicit supersession identity for superseded findings", () => {
    expect(
      issueCodes(
        validateFindingRecord({
          ...FINDING,
          freshness: "SUPERSEDED",
          supersededBy: null,
        }),
      ),
    ).toContain("SEMANTIC_CONFLICT");
    expect(
      validateFindingRecord({
        ...FINDING,
        freshness: "SUPERSEDED",
        supersededBy: NEXT_FINDING_ID,
      }).ok,
    ).toBe(true);
  });
});

describe("machine-readable record schema parity", () => {
  it("pins acceptance-critical enums to runtime constants", async () => {
    const raw = await readFile(
      new URL("../schema/run-event-evidence-finding.schema.json", import.meta.url),
      "utf8",
    );
    const schema = JSON.parse(raw) as {
      $defs: {
        runState: { enum: string[] };
        evidenceObservationStatus: { enum: string[] };
        freshness: { enum: string[] };
        findingSeverity: { enum: string[] };
        findingStatus: { enum: string[] };
        findingDisposition: { enum: string[] };
        event: { properties: { sequence: { minimum: number } } };
        evidence: { allOf: unknown[] };
        finding: {
          properties: { confidence: { minimum: number; maximum: number } };
          allOf: unknown[];
        };
      };
    };

    expect(schema.$defs.runState.enum).toEqual([...RUN_STATES]);
    expect(schema.$defs.evidenceObservationStatus.enum).toEqual([...EVIDENCE_OBSERVATION_STATUSES]);
    expect(schema.$defs.freshness.enum).toEqual([...FRESHNESS_STATES]);
    expect(schema.$defs.findingSeverity.enum).toEqual([...FINDING_SEVERITIES]);
    expect(schema.$defs.findingStatus.enum).toEqual([...FINDING_STATUSES]);
    expect(schema.$defs.findingDisposition.enum).toEqual([...FINDING_DISPOSITIONS]);
    expect(schema.$defs.event.properties.sequence.minimum).toBe(0);
    expect(schema.$defs.finding.properties.confidence).toMatchObject({
      minimum: 0,
      maximum: 1,
    });
    expect(schema.$defs.evidence.allOf).toHaveLength(2);
    expect(schema.$defs.finding.allOf).toHaveLength(2);
  });
});
