export const PROTOCOL_ID_NAMESPACES = [
  "project",
  "workspace",
  "work",
  "run",
  "event",
  "artifact",
  "evidence",
  "finding",
  "resource",
] as const;

export type ProtocolIdNamespace = (typeof PROTOCOL_ID_NAMESPACES)[number];

declare const protocolIdBrand: unique symbol;
declare const revisionRefBrand: unique symbol;

export type ProtocolId<N extends ProtocolIdNamespace = ProtocolIdNamespace> = string & {
  readonly [protocolIdBrand]: N;
};

export type RevisionRef = string & {
  readonly [revisionRefBrand]: "revision";
};

export interface IdentityRevisionRef {
  readonly identity: ProtocolId;
  readonly revision: RevisionRef;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const PROTOCOL_ID_PATTERN =
  /^ineractive:([a-z][a-z0-9-]{0,31}):([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/u;
const GIT_REVISION_PATTERN = /^git:[0-9a-f]{40}$/u;
const SHA256_REVISION_PATTERN = /^sha256:[0-9a-f]{64}$/u;

function isProtocolIdNamespace(value: string): value is ProtocolIdNamespace {
  return (PROTOCOL_ID_NAMESPACES as readonly string[]).includes(value);
}

export function parseProtocolId(input: unknown): ProtocolId | null {
  if (typeof input !== "string" || input !== input.trim()) {
    return null;
  }

  const match = PROTOCOL_ID_PATTERN.exec(input);
  if (match === null) {
    return null;
  }

  const namespace = match[1];
  const uuid = match[2];
  if (
    namespace === undefined ||
    uuid === undefined ||
    !isProtocolIdNamespace(namespace) ||
    !UUID_PATTERN.test(uuid)
  ) {
    return null;
  }

  return input as ProtocolId;
}

export function isProtocolId(input: unknown): input is ProtocolId {
  return parseProtocolId(input) !== null;
}

export function createProtocolId<N extends ProtocolIdNamespace>(
  namespace: N,
  uuid: string,
): ProtocolId<N> | null {
  const parsed = parseProtocolId(`ineractive:${namespace}:${uuid}`);
  return parsed as ProtocolId<N> | null;
}

export function serializeProtocolId(identity: ProtocolId): string {
  return identity;
}

export function parseRevisionRef(input: unknown): RevisionRef | null {
  if (typeof input !== "string" || input !== input.trim()) {
    return null;
  }

  if (!GIT_REVISION_PATTERN.test(input) && !SHA256_REVISION_PATTERN.test(input)) {
    return null;
  }

  return input as RevisionRef;
}

export function isRevisionRef(input: unknown): input is RevisionRef {
  return parseRevisionRef(input) !== null;
}

export function serializeRevisionRef(revision: RevisionRef): string {
  return revision;
}

export function createIdentityRevisionRef(
  identityInput: unknown,
  revisionInput: unknown,
): IdentityRevisionRef | null {
  const identity = parseProtocolId(identityInput);
  const revision = parseRevisionRef(revisionInput);

  return identity !== null && revision !== null ? { identity, revision } : null;
}

export function serializeIdentityRevisionRef(reference: IdentityRevisionRef): string {
  return `${reference.identity}@${reference.revision}`;
}

export function parseIdentityRevisionRef(input: unknown): IdentityRevisionRef | null {
  if (typeof input !== "string" || input !== input.trim()) {
    return null;
  }

  const separator = input.indexOf("@");
  if (separator <= 0 || separator !== input.lastIndexOf("@")) {
    return null;
  }

  return createIdentityRevisionRef(input.slice(0, separator), input.slice(separator + 1));
}
