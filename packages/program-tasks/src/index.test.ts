import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { PROGRAM_TASK_INDEX_FIXTURES } from "./fixtures.ts";
import {
  type ProgramTaskIndex,
  type ProgramTaskViolation,
  ROOT_DEPENDENCY_SENTINEL,
  parseProgramTaskIndex,
  validateProgramTaskIndex,
} from "./index.ts";

const CANONICAL_INDEX_URL = new URL("../../../specs/tasks.md", import.meta.url);

/**
 * Expected number of P00 task handles in the canonical index. P00 is complete only
 * when every one of these rows has executed, so a silent deletion must fail here.
 */
const EXPECTED_P00_TASK_COUNT = 11;

/**
 * Expected number of stable program-task handles in the candidate canonical index.
 * Deliberate roadmap changes must update this pin so CI catches accidental task loss
 * or unreviewed task-surface expansion.
 */
const EXPECTED_PROGRAM_TASK_COUNT = 169;

/**
 * The dependency frontier that gates P01, exactly as declared in the canonical index.
 * P01 execution authority depends on this set, so it is pinned rather than inferred.
 */
const EXPECTED_P01_ENTRY_DEPENDENCIES = [
  "IN-P00-S01-T03",
  "IN-P00-S02-T01",
  "IN-P00-S03-T02",
  "IN-P00-S04-T03",
  "IN-P00-S05-T02",
];

function violationCodes(violations: readonly ProgramTaskViolation[]): readonly string[] {
  return violations.map((violation) => violation.code);
}

function taskById(index: ProgramTaskIndex, id: string): ProgramTaskIndex["tasks"][number] {
  const task = index.tasks.find((candidate) => candidate.id === id);
  if (task === undefined) {
    throw new Error(`Expected the canonical index to declare ${id}.`);
  }
  return task;
}

describe("parseProgramTaskIndex", () => {
  it("parses task rows and ignores table headers and narrative prose", () => {
    const index = parseProgramTaskIndex(PROGRAM_TASK_INDEX_FIXTURES.valid);

    expect(index.tasks).toHaveLength(2);
    expect(index.tasks[0]?.id).toBe("IN-P00-S01-T01");
    expect(index.tasks[0]?.dependencies).toEqual([ROOT_DEPENDENCY_SENTINEL]);
    expect(index.tasks[1]?.position).toBe(2);
    expect(index.parseViolations).toEqual([]);
  });
});

describe("validateProgramTaskIndex negative controls", () => {
  const cases: readonly (readonly [keyof typeof PROGRAM_TASK_INDEX_FIXTURES, string])[] = [
    ["duplicateId", "DUPLICATE_TASK_ID"],
    ["unknownDependency", "UNKNOWN_DEPENDENCY"],
    ["selfDependency", "SELF_DEPENDENCY"],
    ["forwardDependency", "FORWARD_DEPENDENCY"],
    ["malformedHandle", "MALFORMED_TASK_ID"],
    ["phaseMismatch", "PHASE_MISMATCH"],
    ["emptyOutcome", "EMPTY_OUTCOME"],
    ["malformedRow", "MALFORMED_ROW"],
  ];

  it.each(cases)("flags %s as %s", (fixtureName, expectedCode) => {
    const index = parseProgramTaskIndex(PROGRAM_TASK_INDEX_FIXTURES[fixtureName]);

    expect(violationCodes(validateProgramTaskIndex(index))).toContain(expectedCode);
  });

  it("reports no violation for the valid control", () => {
    const index = parseProgramTaskIndex(PROGRAM_TASK_INDEX_FIXTURES.valid);

    expect(validateProgramTaskIndex(index)).toEqual([]);
  });
});

describe("canonical program task index", () => {
  async function loadCanonicalIndex(): Promise<ProgramTaskIndex> {
    return parseProgramTaskIndex(await readFile(CANONICAL_INDEX_URL, "utf8"));
  }

  it("has no structural violation", async () => {
    const index = await loadCanonicalIndex();

    expect(validateProgramTaskIndex(index)).toEqual([]);
  });

  it(`declares ${EXPECTED_PROGRAM_TASK_COUNT.toString()} task handles`, async () => {
    const index = await loadCanonicalIndex();

    expect(index.tasks).toHaveLength(EXPECTED_PROGRAM_TASK_COUNT);
  });

  it(`declares ${EXPECTED_P00_TASK_COUNT.toString()} P00 task handles`, async () => {
    const index = await loadCanonicalIndex();

    expect(index.tasks.filter((task) => task.phase === "P00")).toHaveLength(
      EXPECTED_P00_TASK_COUNT,
    );
  });

  it("makes the root sentinel the only dependency of the first task", async () => {
    const index = await loadCanonicalIndex();
    const rootTasks = index.tasks.filter((task) =>
      task.dependencies.includes(ROOT_DEPENDENCY_SENTINEL),
    );

    expect(rootTasks.map((task) => task.id)).toEqual(["IN-P00-S01-T01"]);
    expect(taskById(index, "IN-P00-S01-T01").position).toBe(1);
  });

  it("gates P01 on the canonical P00 frontier", async () => {
    const index = await loadCanonicalIndex();

    expect(taskById(index, "IN-P01-S01-T01").dependencies).toEqual(EXPECTED_P01_ENTRY_DEPENDENCIES);
  });
});
