/**
 * `@ineractive/protocol` — provider-neutral public protocol primitives.
 *
 * SG-000010 earns only stable opaque identities and immutable revision references.
 * Run/Event/Evidence/Finding schemas and the remaining protocol contracts stay
 * dependency-ordered work for later P01/P03/P04 Grains.
 */

export {
  PROTOCOL_ID_NAMESPACES,
  createIdentityRevisionRef,
  createProtocolId,
  isProtocolId,
  isRevisionRef,
  parseIdentityRevisionRef,
  parseProtocolId,
  parseRevisionRef,
  serializeIdentityRevisionRef,
  serializeProtocolId,
  serializeRevisionRef,
} from "./identity-revision.ts";

export type {
  IdentityRevisionRef,
  ProtocolId,
  ProtocolIdNamespace,
  RevisionRef,
} from "./identity-revision.ts";
