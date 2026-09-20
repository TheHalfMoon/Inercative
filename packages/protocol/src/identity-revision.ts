const IDENTITY_PREFIX = "ineractive";
const IDENTITY_KIND_PATTERN = /^[a-z][a-z0-9-]{0,31}$/u;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const GIT_OBJECT_PATTERN = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/u;
const SHA256_PATTERN = /^[0-9a-f]{64}$/u;

declare const logicalIdentityBrand: unique symbol;
declare const gitRevisionBrand: unique symbol;
declare const sha256RevisionBrand: unique symbol;

export type LogicalIdentity<Kind extends string = string> = string & {
  readonly [logicalIdentityBrand]: Kind;
};

export type GitRevision = string & {
  readonly [gitRevisionBrand]: "git";
};

export type Sha256Revision = string & {
  readonly [sha256RevisionBrand]: "sha256";
};

export type ExactRevision = GitRevision | Sha256Revision;

export interface ParsedLogicalIdentity<Kind extends string = string> {
  readonly kind: Kind;
  readonly uuid: string;
  readonly value: LogicalIdentity<Kind>;
}

export interface ParsedExactRevision {
  readonly scheme: "git" | "sha256";
  readonly digest: string;
  readonly value: ExactRevision;
}

export interface RevisionBinding<Kind extends string = string> {
  readonly identity: LogicalIdentity<Kind>;
  readonly revision: ExactRevision;
}

function isCanonicalIdentityKind(value: string): boolean {
  return IDENTITY_KIND_PATTERN.test(value);
}

function isCanonicalUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function isCanonicalGitObject(value: string): boolean {
  return GIT_OBJECT_PATTERN.test(value);
}

function isCanonicalSha256(value: string): boolean {
  return SHA256_PATTERN.test(value);
}

export function formatLogicalIdentity<Kind extends string>(
  kind: Kind,
  uuid: string,
): LogicalIdentity<Kind> {
  if (!isCanonicalIdentityKind(kind)) {
    throw new TypeError(
      "Identity kind must match /^[a-z][a-z0-9-]{0,31}$/ and already be canonical lowercase.",
    );
  }
  if (!isCanonicalUuid(uuid)) {
    throw new TypeError("Identity UUID must be a canonical lowercase RFC UUID value.");
  }
  return `${IDENTITY_PREFIX}:${kind}:${uuid}` as LogicalIdentity<Kind>;
}

export function parseLogicalIdentity(value: string): ParsedLogicalIdentity | null {
  const parts = value.split(":");
  if (parts.length !== 3 || parts[0] !== IDENTITY_PREFIX) {
    return null;
  }

  const kind = parts[1];
  const uuid = parts[2];
  if (
    kind === undefined ||
    uuid === undefined ||
    !isCanonicalIdentityKind(kind) ||
    !isCanonicalUuid(uuid)
  ) {
    return null;
  }

  return {
    kind,
    uuid,
    value: value as LogicalIdentity,
  };
}

export function parseLogicalIdentityForKind<Kind extends string>(
  expectedKind: Kind,
  value: string,
): LogicalIdentity<Kind> | null {
  if (!isCanonicalIdentityKind(expectedKind)) {
    return null;
  }
  const parsed = parseLogicalIdentity(value);
  return parsed !== null && parsed.kind === expectedKind
    ? (parsed.value as LogicalIdentity<Kind>)
    : null;
}

export function formatGitRevision(objectId: string): GitRevision {
  if (!isCanonicalGitObject(objectId)) {
    throw new TypeError(
      "Git revision must be a canonical lowercase full 40- or 64-hex object identifier.",
    );
  }
  return `git:${objectId}` as GitRevision;
}

export function formatSha256Revision(digest: string): Sha256Revision {
  if (!isCanonicalSha256(digest)) {
    throw new TypeError("SHA-256 revision must be a canonical lowercase 64-hex digest.");
  }
  return `sha256:${digest}` as Sha256Revision;
}

export function parseExactRevision(value: string): ParsedExactRevision | null {
  const separator = value.indexOf(":");
  if (separator <= 0 || separator !== value.lastIndexOf(":")) {
    return null;
  }

  const scheme = value.slice(0, separator);
  const digest = value.slice(separator + 1);

  if (scheme === "git" && isCanonicalGitObject(digest)) {
    return {
      scheme,
      digest,
      value: value as GitRevision,
    };
  }

  if (scheme === "sha256" && isCanonicalSha256(digest)) {
    return {
      scheme,
      digest,
      value: value as Sha256Revision,
    };
  }

  return null;
}

export function bindRevision<Kind extends string>(
  identity: LogicalIdentity<Kind>,
  revision: ExactRevision,
): RevisionBinding<Kind> {
  return Object.freeze({ identity, revision });
}
