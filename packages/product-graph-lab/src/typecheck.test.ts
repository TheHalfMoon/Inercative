import path from "node:path";

import * as ts from "typescript";
import { expect, it } from "vitest";

it("typechecks the private Product Graph lab with its own tsconfig", () => {
  const configPath = path.resolve("packages/product-graph-lab/tsconfig.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

  expect(configFile.error).toBeUndefined();

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config as object,
    ts.sys,
    path.dirname(configPath),
    undefined,
    configPath,
  );
  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);

  expect(
    diagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")),
  ).toEqual([]);
});
