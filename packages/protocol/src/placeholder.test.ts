import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import * as protocolModule from "./index.ts";

describe("@ineractive/protocol P00 placeholder", () => {
  it("exposes no runtime API before the protocol Grain owns contracts", () => {
    expect(Object.keys(protocolModule)).toEqual([]);
  });

  it("declares no runtime dependencies", async () => {
    const rawPackageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
    const manifest = JSON.parse(rawPackageJson) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(manifest.dependencies).toBeUndefined();
    expect(manifest.devDependencies).toBeUndefined();
  });
});
