/**
 * Synthetic index fragments used as negative controls. Each fragment isolates one
 * structural defect so a passing test cannot hide a broken dependency graph.
 */

const HEADER = ["| ID | Phase | Outcome | Depends on |", "|---|---|---|---|"].join("\n");

function table(rows: readonly string[]): string {
  return [HEADER, ...rows].join("\n");
}

export const PROGRAM_TASK_INDEX_FIXTURES = {
  valid: table([
    "| IN-P00-S01-T01 | P00 | First task | planning merge |",
    "| IN-P00-S01-T02 | P00 | Second task | IN-P00-S01-T01 |",
  ]),
  duplicateId: table([
    "| IN-P00-S01-T01 | P00 | First task | planning merge |",
    "| IN-P00-S01-T01 | P00 | Repeated handle | planning merge |",
  ]),
  unknownDependency: table([
    "| IN-P00-S01-T01 | P00 | First task | planning merge |",
    "| IN-P00-S01-T02 | P00 | Second task | IN-P00-S02-T09 |",
  ]),
  selfDependency: table(["| IN-P00-S01-T01 | P00 | Self dependent | IN-P00-S01-T01 |"]),
  forwardDependency: table([
    "| IN-P00-S01-T01 | P00 | Depends on a later row | IN-P00-S01-T02 |",
    "| IN-P00-S01-T02 | P00 | Later row | planning merge |",
  ]),
  malformedHandle: table(["| IN-P00-S1-T02 | P00 | Bad handle | planning merge |"]),
  phaseMismatch: table(["| IN-P00-S01-T01 | P01 | Wrong phase column | planning merge |"]),
  emptyOutcome: table(["| IN-P00-S01-T01 | P00 |  | planning merge |"]),
  malformedRow: table(["| IN-P00-S01-T01 | P00 | Missing dependency column |"]),
} as const;
