import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  bindRevision,
  formatGitRevision,
  formatLogicalIdentity,
  formatSha256Revision,
  parseExactRevision,
  parseLogicalIdentity,
  parseLogicalIdentityForKind,
  type LogicalIdentity,
} from "./index.ts";

const PROJECT_UUID = "018f9f3a-7b2a-7f11-8a4c-1234567890ab";
const OTHER_UUID = "550e8400-e29b-41d4-a716-446655440000";
const GIT_SHA1 = "0123456789abcdef0123456789abcdef01234567";
const GIT_SHA256 = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const CONTENT_SHA256 = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";

describe("logical identity primitives", () => {
  it("formats and round-trips one canonical lowercase identity", () => {
    const identity = formatLogicalIdentity("project", PROJECT_UUID);

    expect(identity).toBe(`ineractive:project:${PROJECT_UUID}`);
    expect(parseLogicalIdentity(identity)).toEqual({
      kind: "project",
      uuid: PROJECT_UUID,
      value: identity,
    });
    expect(parseLogicalIdentityForKind("project", identity)).toBe(identity);
  });

  it("preserves kind as a typed opaque boundary", () => {
    const project: LogicalIdentity<"project"> = formatLogicalIdentity("project", PROJECT_UUID);
    const workspace = formatLogicalIdentity("workspace", OTHER_UUID);

    expect(parseLogicalIdentityForKind("project", workspace)).toBeNull();
    expect(project).not.toBe(workspace);
  });

  it.each([
    ["Project", PROJECT_UUID],
    ["project_", PROJECT_UUID],
    ["", PROJECT_UUID],
    ["project", PROJECT_UUID.toUpperCase()],
    ["project", "00000000-0000-0000-0000-000000000000"],
    ["project", "not-a-uuid"],
  ])("rejects non-canonical identity components", (kind, uuid) => {
    expect(() => formatLogicalIdentity(kind, uuid)).toThrow(TypeError);
  });

  it.each([
    "ineractive:Project:018f9f3a-7b2a-7f11-8a4c-1234567890ab",
    "ineractive:project:018F9F3A-7B2A-7F11-8A4C-1234567890AB",
    "project:018f9f3a-7b2a-7f11-8a4c-1234567890ab",
    "ineractive:project:main",
    "ineractive:project:018f9f3a-7b2a-7f11-8a4c-1234567890ab:extra",
  ])("rejects non-canonical serialized identity %s", (value) => {
    expect(parseLogicalIdentity(value)).toBeNull();
  });
});

describe("exact revision primitives", () => {
  it("round-trips full Git object identities", () => {
    const sha1 = formatGitRevision(GIT_SHA1);
    const sha256 = formatGitRevision(GIT_SHA256);

    expect(parseExactRevision(sha1)).toEqual({
      scheme: "git",
      digest: GIT_SHA1,
      value: sha1,
    });
    expect(parseExactRevision(sha256)).toEqual({
      scheme: "git",
      digest: GIT_SHA256,
      value: sha256,
    });
  });

  it("round-trips SHA-256 content revisions", () => {
    const revision = formatSha256Revision(CONTENT_SHA256);

    expect(parseExactRevision(revision)).toEqual({
      scheme: "sha256",
      digest: CONTENT_SHA256,
      value: revision,
    });
  });

  it.each(["main", "v1.0.0", "0123456", GIT_SHA1.toUpperCase()])(
    "rejects mutable/short/non-canonical Git revision %s",
    (value) => {
      expect(() => formatGitRevision(value)).toThrow(TypeError);
      expect(parseExactRevision(`git:${value}`)).toBeNull();
    },
  );

  it.each(["", "abc", CONTENT_SHA256.toUpperCase(), GIT_SHA1])(
    "rejects invalid SHA-256 revision %s",
    (value) => {
      expect(() => formatSha256Revision(value)).toThrow(TypeError);
      expect(parseExactRevision(`sha256:${value}`)).toBeNull();
    },
  );

  it("rejects unknown and ambiguous revision schemes", () => {
    expect(parseExactRevision(`branch:${GIT_SHA1}`)).toBeNull();
    expect(parseExactRevision(`git:${GIT_SHA1}:extra`)).toBeNull();
  });
});

describe("revision binding", () => {
  it("keeps logical identity separate from immutable revision", () => {
    const identity = formatLogicalIdentity("artifact", PROJECT_UUID);
    const firstRevision = formatGitRevision(GIT_SHA1);
    const nextRevision = formatSha256Revision(CONTENT_SHA256);

    const first = bindRevision(identity, firstRevision);
    const next = bindRevision(identity, nextRevision);

    expect(first.identity).toBe(next.identity);
    expect(first.revision).not.toBe(next.revision);
    expect(Object.isFrozen(first)).toBe(true);
    expect(JSON.parse(JSON.stringify(first))).toEqual({
      identity,
      revision: firstRevision,
    });
  });
});

describe("@ineractive/protocol package boundary", () => {
  it("keeps zero runtime dependencies", async () => {
    const rawPackageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
    const manifest = JSON.parse(rawPackageJson) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(manifest.dependencies).toBeUndefined();
    expect(manifest.devDependencies).toBeUndefined();
  });

  it("does not expose later protocol domains prematurely", async () => {
    const protocolModule = await import("./index.ts");

    expect(Object.keys(protocolModule).sort()).toEqual(
      [
        "bindRevision",
        "formatGitRevision",
        "formatLogicalIdentity",
        "formatSha256Revision",
        "parseExactRevision",
        "parseLogicalIdentity",
        "parseLogicalIdentityForKind",
      ].sort(),
    );
  });
});

describe("machine-readable identity/revision schema", () => {
  it("matches the canonical runtime formats", async () => {
    const rawSchema = await readFile(
      new URL("../schema/identity-revision.schema.json", import.meta.url),
      "utf8",
    );
    const schema = JSON.parse(rawSchema) as {
      $defs: {
        logicalIdentity: { pattern: string };
        gitRevision: { pattern: string };
        sha256Revision: { pattern: string };
        revisionBinding: {
          additionalProperties: boolean;
          required: string[];
        };
      };
    };

    const identityPattern = new RegExp(schema.$defs.logicalIdentity.pattern, "u");
    const gitPattern = new RegExp(schema.$defs.gitRevision.pattern, "u");
    const sha256Pattern = new RegExp(schema.$defs.sha256Revision.pattern, "u");

    expect(identityPattern.test(`ineractive:project:${PROJECT_UUID}`)).toBe(true);
    expect(identityPattern.test(`ineractive:Project:${PROJECT_UUID}`)).toBe(false);
    expect(gitPattern.test(`git:${GIT_SHA1}`)).toBe(true);
    expect(gitPattern.test(`git:${GIT_SHA256}`)).toBe(true);
    expect(gitPattern.test("git:main")).toBe(false);
    expect(sha256Pattern.test(`sha256:${CONTENT_SHA256}`)).toBe(true);
    expect(sha256Pattern.test(`sha256:${GIT_SHA1}`)).toBe(false);
    expect(schema.$defs.revisionBinding.additionalProperties).toBe(false);
    expect(schema.$defs.revisionBinding.required).toEqual(["identity", "revision"]);
  });
});
