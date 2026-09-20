import { describe, expect, it } from "vitest";

import {
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

const PROJECT_ID = "ineractive:project:018f0a6f-7b52-7cc1-8f5f-6d76b310a123";
const GIT_REVISION = "git:0123456789abcdef0123456789abcdef01234567";
const SHA256_REVISION =
  "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("protocol identity primitives", () => {
  it("accepts a canonical namespace-qualified opaque identity", () => {
    expect(parseProtocolId(PROJECT_ID)).toBe(PROJECT_ID);
    expect(isProtocolId(PROJECT_ID)).toBe(true);
  });

  it("constructs and serializes a validated identity", () => {
    const identity = createProtocolId(
      "project",
      "018f0a6f-7b52-7cc1-8f5f-6d76b310a123",
    );

    expect(identity).not.toBeNull();
    if (identity !== null) {
      expect(serializeProtocolId(identity)).toBe(PROJECT_ID);
    }
  });

  it("rejects whitespace, unknown namespaces, and non-canonical UUID casing", () => {
    expect(parseProtocolId(` ${PROJECT_ID}`)).toBeNull();
    expect(
      parseProtocolId("ineractive:connection:018f0a6f-7b52-7cc1-8f5f-6d76b310a123"),
    ).toBeNull();
    expect(
      parseProtocolId("ineractive:project:018F0A6F-7B52-7CC1-8F5F-6D76B310A123"),
    ).toBeNull();
  });

  it("keeps the namespace allowlist explicit", () => {
    expect(PROTOCOL_ID_NAMESPACES).toEqual([
      "project",
      "workspace",
      "work",
      "run",
      "event",
      "artifact",
      "evidence",
      "finding",
      "resource",
    ]);
  });
});

describe("immutable revision primitives", () => {
  it("accepts exact Git and SHA-256 revision identities", () => {
    expect(parseRevisionRef(GIT_REVISION)).toBe(GIT_REVISION);
    expect(parseRevisionRef(SHA256_REVISION)).toBe(SHA256_REVISION);
    expect(isRevisionRef(GIT_REVISION)).toBe(true);
    expect(isRevisionRef(SHA256_REVISION)).toBe(true);
  });

  it("rejects branches, short SHAs, uppercase digests, and whitespace", () => {
    expect(parseRevisionRef("main")).toBeNull();
    expect(parseRevisionRef("git:0123456")).toBeNull();
    expect(
      parseRevisionRef("git:0123456789ABCDEF0123456789ABCDEF01234567"),
    ).toBeNull();
    expect(parseRevisionRef(`${GIT_REVISION} `)).toBeNull();
  });

  it("serializes validated revisions without rewriting them", () => {
    const revision = parseRevisionRef(SHA256_REVISION);
    expect(revision).not.toBeNull();
    if (revision !== null) {
      expect(serializeRevisionRef(revision)).toBe(SHA256_REVISION);
    }
  });
});

describe("identity revision references", () => {
  it("constructs only when both identity and revision validate", () => {
    expect(createIdentityRevisionRef(PROJECT_ID, GIT_REVISION)).toEqual({
      identity: PROJECT_ID,
      revision: GIT_REVISION,
    });
    expect(createIdentityRevisionRef("project:mutable", GIT_REVISION)).toBeNull();
    expect(createIdentityRevisionRef(PROJECT_ID, "git:main")).toBeNull();
  });

  it("round-trips through one canonical serialized representation", () => {
    const reference = createIdentityRevisionRef(PROJECT_ID, SHA256_REVISION);
    expect(reference).not.toBeNull();

    if (reference !== null) {
      const serialized = serializeIdentityRevisionRef(reference);
      expect(serialized).toBe(`${PROJECT_ID}@${SHA256_REVISION}`);
      expect(parseIdentityRevisionRef(serialized)).toEqual(reference);
    }
  });

  it("rejects malformed serialized references", () => {
    expect(parseIdentityRevisionRef(`${PROJECT_ID}@@${GIT_REVISION}`)).toBeNull();
    expect(parseIdentityRevisionRef(`${PROJECT_ID}@main`)).toBeNull();
    expect(parseIdentityRevisionRef(42)).toBeNull();
  });
});
