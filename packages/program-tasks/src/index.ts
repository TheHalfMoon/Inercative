/**
 * Deterministic validation of the canonical program task index (`specs/tasks.md`).
 *
 * The canonical index is dependency-order navigation authority, never implementation
 * permission. Before P00 its structural claims were checked by hand: every handle is
 * unique, every dependency reference resolves to another handle or to the root
 * sentinel, and no task depends on itself or on a task that appears later in the table.
 *
 * This module turns those claims into deterministic checks so a broken dependency
 * graph fails CI instead of relying on a reviewer counting rows.
 */

export const PROGRAM_TASK_ID_PATTERN = /^IN-P(\d{2})-S(\d{2})-T(\d{2})$/u;

export const ROOT_DEPENDENCY_SENTINEL = "planning merge";

export interface ProgramTask {
  readonly id: string;
  readonly phase: string;
  readonly outcome: string;
  readonly dependencies: readonly string[];
  /** 1-based position of the task row inside the canonical index. */
  readonly position: number;
}

export interface ProgramTaskIndex {
  readonly tasks: readonly ProgramTask[];
  readonly parseViolations: readonly ProgramTaskViolation[];
}

export type ProgramTaskViolationCode =
  | "MALFORMED_ROW"
  | "MALFORMED_TASK_ID"
  | "PHASE_MISMATCH"
  | "EMPTY_OUTCOME"
  | "DUPLICATE_TASK_ID"
  | "UNKNOWN_DEPENDENCY"
  | "SELF_DEPENDENCY"
  | "FORWARD_DEPENDENCY";

export interface ProgramTaskViolation {
  readonly code: ProgramTaskViolationCode;
  readonly taskId: string | null;
  readonly message: string;
}

const TASK_ID_PREFIX = "IN-";
const TABLE_CELL_COUNT = 4;
const PHASE_CODE_LENGTH = 3;

function splitTableRow(line: string): readonly string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return null;
  }
  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function parseDependencies(cell: string): readonly string[] {
  return cell
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function parseProgramTaskIndex(markdown: string): ProgramTaskIndex {
  const tasks: ProgramTask[] = [];
  const parseViolations: ProgramTaskViolation[] = [];

  for (const line of markdown.split(/\r?\n/u)) {
    const cells = splitTableRow(line);
    if (cells === null) {
      continue;
    }

    const id = cells[0];
    if (id === undefined || !id.startsWith(TASK_ID_PREFIX)) {
      continue;
    }

    if (cells.length !== TABLE_CELL_COUNT) {
      parseViolations.push({
        code: "MALFORMED_ROW",
        taskId: id,
        message: `Task row for ${id} must have exactly ${TABLE_CELL_COUNT.toString()} columns.`,
      });
      continue;
    }

    const phase = cells[1] ?? "";
    const outcome = cells[2] ?? "";
    const dependencyCell = cells[3] ?? "";
    const position = tasks.length + 1;

    if (!PROGRAM_TASK_ID_PATTERN.test(id)) {
      parseViolations.push({
        code: "MALFORMED_TASK_ID",
        taskId: id,
        message: `Task handle ${id} must match IN-P##-S##-T##.`,
      });
    } else if (
      phase !== id.slice(TASK_ID_PREFIX.length, TASK_ID_PREFIX.length + PHASE_CODE_LENGTH)
    ) {
      parseViolations.push({
        code: "PHASE_MISMATCH",
        taskId: id,
        message: `Task ${id} declares phase ${phase}, which contradicts its handle.`,
      });
    }

    if (outcome.length === 0) {
      parseViolations.push({
        code: "EMPTY_OUTCOME",
        taskId: id,
        message: `Task ${id} must declare an outcome.`,
      });
    }

    tasks.push({
      id,
      phase,
      outcome,
      dependencies: parseDependencies(dependencyCell),
      position,
    });
  }

  return { tasks, parseViolations };
}

export function validateProgramTaskIndex(index: ProgramTaskIndex): readonly ProgramTaskViolation[] {
  const violations: ProgramTaskViolation[] = [...index.parseViolations];
  const firstPositionById = new Map<string, number>();

  for (const task of index.tasks) {
    const existingPosition = firstPositionById.get(task.id);
    if (existingPosition === undefined) {
      firstPositionById.set(task.id, task.position);
      continue;
    }
    violations.push({
      code: "DUPLICATE_TASK_ID",
      taskId: task.id,
      message: `Task handle ${task.id} appears at positions ${existingPosition.toString()} and ${task.position.toString()}.`,
    });
  }

  for (const task of index.tasks) {
    for (const dependency of task.dependencies) {
      if (dependency === ROOT_DEPENDENCY_SENTINEL) {
        continue;
      }
      if (dependency === task.id) {
        violations.push({
          code: "SELF_DEPENDENCY",
          taskId: task.id,
          message: `Task ${task.id} depends on itself.`,
        });
        continue;
      }
      const dependencyPosition = firstPositionById.get(dependency);
      if (dependencyPosition === undefined) {
        violations.push({
          code: "UNKNOWN_DEPENDENCY",
          taskId: task.id,
          message: `Task ${task.id} depends on ${dependency}, which the index does not declare.`,
        });
        continue;
      }
      if (dependencyPosition > task.position) {
        violations.push({
          code: "FORWARD_DEPENDENCY",
          taskId: task.id,
          message: `Task ${task.id} depends on ${dependency}, which appears later in the index.`,
        });
      }
    }
  }

  return violations;
}
