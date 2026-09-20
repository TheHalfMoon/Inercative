/**
 * @ineractive/protocol
 *
 * Public dependency-free protocol primitives.
 *
 * SG-000010 owns only logical identity and immutable exact-revision primitives.
 * Run/event/evidence/finding schemas and higher-level protocol contracts remain
 * dependency-ordered work for later P01 Grains.
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

export type {
  ExactRevision,
  GitRevision,
  LogicalIdentity,
  ParsedExactRevision,
  ParsedLogicalIdentity,
  RevisionBinding,
  Sha256Revision,
} from "./identity-revision.ts";
