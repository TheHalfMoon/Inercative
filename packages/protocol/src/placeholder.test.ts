import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import * as protocolModule from "./index.ts";

describe("@ineractive/protocol SG-000010 public boundary", () => {
  it("exports only the earned identity/revision runtime surface", () => {
    expect(Object.keys(protocolModule).sort()).toEqual(
      [
        "PROTOCOL_ID_NAMESPACES",
        "createIdentityRevisionRef",
        "createProtocolId",
        "isProtocolId",
        "isRevisionRef",
        "parseIdentityRevisionRef",
        "parseProtocolId",
        "parseRevisionRef",
        "serializeIdentityRevisionRef",
        "serializeProtocolId",
        "serializeRevisionRef",
      ].sort(),
    );
  });

  it("still declares no runtime dependencies", async () => {
    const rawPackageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
    const manifest = JSON.parse(rawPackageJson) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(manifest.dependencies).toBeUndefined();
    expect(manifest.devDependencies).toBeUndefined();
  });
});
