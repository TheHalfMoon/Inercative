import {
  RUN_STATES,
  validateRunRecord,
  type ProtocolRecordIssueCode,
  type RunRecord,
  type RunState,
} from "./run-event-evidence-finding.ts";

export const TERMINAL_RUN_STATES = Object.freeze([
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "BLOCKED",
] as const satisfies readonly RunState[]);

export const RUN_STATE_TRANSITIONS: Readonly<Record<RunState, readonly RunState[]>> = Object.freeze(
  {
    PLANNED: Object.freeze(["RUNNING", "CANCELLED", "BLOCKED"] as const),
    RUNNING: Object.freeze(["COMPLETED", "FAILED", "CANCELLED", "BLOCKED"] as const),
    COMPLETED: Object.freeze([] as const),
    FAILED: Object.freeze([] as const),
    CANCELLED: Object.freeze([] as const),
    BLOCKED: Object.freeze([] as const),
  },
);

export type RunLifecycleIssueCode =
  | "INVALID_FROM_STATE"
  | "INVALID_TO_STATE"
  | "TRANSITION_NOT_ALLOWED"
  | "INVALID_PARENT_RUN"
  | "INVALID_CHILD_RUN"
  | "CONTINUATION_IDENTITY_REUSED"
  | "CONTINUATION_PARENT_MISMATCH"
  | "CONTINUATION_CHILD_STATE_INVALID"
  | "CONTINUATION_TARGET_MISMATCH";

export interface RunLifecycleIssue {
  readonly code: RunLifecycleIssueCode;
  readonly path: string;
  readonly message: string;
  readonly protocolCode?: ProtocolRecordIssueCode;
}

export interface RunStateTransition {
  readonly from: RunState;
  readonly to: RunState;
}

export interface RunContinuation {
  readonly parent: RunRecord;
  readonly child: RunRecord;
}

export type RunLifecycleValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly issues: readonly RunLifecycleIssue[] };

function parseRunState(value: unknown): RunState | null {
  const match = RUN_STATES.find((state) => state === value);
  return match ?? null;
}

function prefixProtocolPath(prefix: string, path: string): string {
  return path === "$" ? prefix : prefix + path.slice(1);
}

function sameTarget(left: RunRecord["target"], right: RunRecord["target"]): boolean {
  return left.identity === right.identity && left.revision === right.revision;
}

export function isRunStateTransitionAllowed(from: RunState, to: RunState): boolean {
  return RUN_STATE_TRANSITIONS[from].includes(to);
}

export function validateRunStateTransition(
  fromInput: unknown,
  toInput: unknown,
): RunLifecycleValidationResult<RunStateTransition> {
  const issues: RunLifecycleIssue[] = [];
  const from = parseRunState(fromInput);
  const to = parseRunState(toInput);

  if (from === null) {
    issues.push({
      code: "INVALID_FROM_STATE",
      path: "$.from",
      message: "Run transition source must be a canonical RunState.",
    });
  }
  if (to === null) {
    issues.push({
      code: "INVALID_TO_STATE",
      path: "$.to",
      message: "Run transition target must be a canonical RunState.",
    });
  }
  if (from === null || to === null) {
    return { ok: false, issues };
  }

  if (!isRunStateTransitionAllowed(from, to)) {
    return {
      ok: false,
      issues: [
        {
          code: "TRANSITION_NOT_ALLOWED",
          path: "$.to",
          message: `Run state transition ${from} -> ${to} is not allowed.`,
        },
      ],
    };
  }

  return { ok: true, value: { from, to } };
}

export function validateRunContinuation(
  parentInput: unknown,
  childInput: unknown,
): RunLifecycleValidationResult<RunContinuation> {
  const parentResult = validateRunRecord(parentInput);
  const childResult = validateRunRecord(childInput);
  const issues: RunLifecycleIssue[] = [];

  if (!parentResult.ok) {
    for (const item of parentResult.issues) {
      issues.push({
        code: "INVALID_PARENT_RUN",
        path: prefixProtocolPath("$.parent", item.path),
        message: item.message,
        protocolCode: item.code,
      });
    }
  }
  if (!childResult.ok) {
    for (const item of childResult.issues) {
      issues.push({
        code: "INVALID_CHILD_RUN",
        path: prefixProtocolPath("$.child", item.path),
        message: item.message,
        protocolCode: item.code,
      });
    }
  }
  if (!parentResult.ok || !childResult.ok) {
    return { ok: false, issues };
  }

  const parent = parentResult.value;
  const child = childResult.value;

  if (child.id === parent.id) {
    issues.push({
      code: "CONTINUATION_IDENTITY_REUSED",
      path: "$.child.id",
      message: "A continuation must use a distinct child Run identity.",
    });
  }
  if (child.parentRunId !== parent.id) {
    issues.push({
      code: "CONTINUATION_PARENT_MISMATCH",
      path: "$.child.parentRunId",
      message: "A continuation child must bind parentRunId to the parent Run identity.",
    });
  }
  if (child.state !== "PLANNED") {
    issues.push({
      code: "CONTINUATION_CHILD_STATE_INVALID",
      path: "$.child.state",
      message: "A continuation child must start in PLANNED state.",
    });
  }
  if (!sameTarget(parent.target, child.target)) {
    issues.push({
      code: "CONTINUATION_TARGET_MISMATCH",
      path: "$.child.target",
      message: "A continuation child must preserve the parent's exact target revision binding.",
    });
  }

  return issues.length > 0 ? { ok: false, issues } : { ok: true, value: { parent, child } };
}
