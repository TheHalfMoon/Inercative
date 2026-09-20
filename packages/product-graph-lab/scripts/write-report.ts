import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { buildPrototypeComparisonReportJson } from "../src/comparison.ts";

const target = fileURLToPath(
  new URL(
    "../../../docs/evidence/P02_S01_T01_PRODUCT_GRAPH_PROTOTYPE_COMPARISON_2026-09-20.json",
    import.meta.url,
  ),
);

writeFileSync(target, buildPrototypeComparisonReportJson(), "utf8");
console.log(target);
