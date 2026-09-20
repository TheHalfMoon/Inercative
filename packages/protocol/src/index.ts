/**
 * @ineractive/protocol
 *
 * Public dependency-free protocol primitives.
 *
 * SG-000010 owns logical identity and immutable exact-revision primitives.
 * SG-000011 adds provider-neutral Run/Event/Evidence/Finding records without
 * persistence, authorization, clocks, provider payloads, or acceptance/PASS authority.
 */
export {
  bindRevision,
  formatGitRevision,
  formatLogicalIdentity,
  formatSha256Revision,
  parseExactRevision,
  parseLogicalIdentity,
  parseLogicalIdentityForKind,
} from "./identity-revision.ts";

export {
  EVIDENCE_OBSERVATION_STATUSES,
  FINDING_DISPOSITIONS,
  FINDING_SEVERITIES,
  FINDING_STATUSES,
  FRESHNESS_STATES,
  PROTOCOL_RECORD_SCHEMA_VERSION,
  RUN_STATES,
  validateEventRecord,
  validateEvidenceRecord,
  validateFindingRecord,
  validateRunRecord,
} from "./run-event-evidence-finding.ts";

export type {
  ExactRevision,
  GitRevision,
  LogicalIdentity,
  ParsedExactRevision,
  ParsedLogicalIdentity,
  RevisionBinding,
  Sha256Revision,
} from "./identity-revision.ts";

export type {
  EventRecord,
  EvidenceObservationStatus,
  EvidenceRecord,
  FindingDisposition,
  FindingRecord,
  FindingSeverity,
  FindingStatus,
  FreshnessState,
  ProtocolRecordIssue,
  ProtocolRecordIssueCode,
  ProtocolRecordValidationResult,
  RunRecord,
  RunState,
} from "./run-event-evidence-finding.ts";
