import { describe, expect, it } from "vitest";

import {
  RUN_STATES,
  RUN_STATE_TRANSITIONS,
  TERMINAL_RUN_STATES,
  bindRevision,
  formatGitRevision,
  formatLogicalIdentity,
  isRunStateTransitionAllowed,
  validateRunContinuation,
  validateRunStateTransition,
  type RunLifecycleValidationResult,
  type RunRecord,
} from "./index.ts";

const PARENT_RUN_ID = formatLogicalIdentity("run", "018f9f3a-7b2a-7f11-8a4c-1234567890c1");
const CHILD_RUN_ID = formatLogicalIdentity("run", "018f9f3a-7b2a-7f11-8a4c-1234567890c2");
const OTHER_RUN_ID = formatLogicalIdentity("run", "018f9f3a-7b2a-7f11-8a4c-1234567890c3");
const PROJECT_ID = formatLogicalIdentity("project", "550e8400-e29b-41d4-a716-446655440010");
const OTHER_PROJECT_ID = formatLogicalIdentity(
  "project",
  "550e8400-e29b-41d4-a716-446655440011",
);
const TARGET = bindRevision(
  PROJECT_ID,
  formatGitRevision("0123456789abcdef0123456789abcdef01234567"),
);
const OTHER_REVISION_TARGET = bindRevision(
  PROJECT_ID,
  formatGitRevision("1111111111111111111111111111111111111111"),
);
const OTHER_IDENTITY_TARGET = bindRevision(
  OTHER_PROJECT_ID,
  formatGitRevision("0123456789abcdef0123456789abcdef01234567"),
);

const PARENT: RunRecord = {
  schemaVersion: 1,
  id: PARENT_RUN_ID,
  target: TARGET,
  state: "FAILED",
  parentRunId: null,
};

const CHILD: RunRecord = {
  schemaVersion: 1,
  id: CHILD_RUN_ID,
  target: TARGET,
  state: "PLANNED",
  parentRunId: PARENT_RUN_ID,
};

const ALLOWED_TRANSITIONS = new Set([
  "PLANNED->RUNNING",
  "PLANNED->CANCELLED",
  "PLANNED->BLOCKED",
  "RUNNING->COMPLETED",
  "RUNNING->FAILED",
  "RUNNING->CANCELLED",
  "RUNNING->BLOCKED",
]);

function issueCodes(result: RunLifecycleValidationResult<unknown>): readonly string[] {
  return result.ok ? [] : result.issues.map((item) => item.code);
}

describe("Run lifecycle transition contract", () => {
  it("pins the closed transition table", () => {
    expect(RUN_STATE_TRANSITIONS).toEqual({
      PLANNED: ["RUNNING", "CANCELLED", "BLOCKED"],
      RUNNING: ["COMPLETED", "FAILED", "CANCELLED", "BLOCKED"],
      COMPLETED: [],
      FAILED: [],
      CANCELLED: [],
      BLOCKED: [],
    });
  });

  it("covers the complete deterministic transition matrix", () => {
    for (const from of RUN_STATES) {
      for (const to of RUN_STATES) {
        const key = `${from}->${to}`;
        const expected = ALLOWED_TRANSITIONS.has(key);
        const first = validateRunStateTransition(from, to);
        const second = validateRunStateTransition(from, to);

        expect(isRunStateTransitionAllowed(from, to), key).toBe(expected);
        expect(second, key).toEqual(first);

        if (expected) {
          expect(first, key).toEqual({ ok: true, value: { from, to } });
        } else {
          expect(issueCodes(first), key).toEqual(["TRANSITION_NOT_ALLOWED"]);
        }
      }
    }
  });

  it("keeps all terminal states closed to in-place RUNNING transitions", () => {
    expect(TERMINAL_RUN_STATES).toEqual(["COMPLETED", "FAILED", "CANCELLED", "BLOCKED"]);
    for (const state of TERMINAL_RUN_STATES) {
      expect(isRunStateTransitionAllowed(state, "RUNNING"), state).toBe(false);
    }
  });

  it("rejects non-canonical transition state inputs with stable issue codes", () => {
    expect(issueCodes(validateRunStateTransition("QUEUED", "RUNNING"))).toEqual([
      "INVALID_FROM_STATE",
    ]);
    expect(issueCodes(validateRunStateTransition("PLANNED", "QUEUED"))).toEqual([
      "INVALID_TO_STATE",
    ]);
    expect(issueCodes(validateRunStateTransition(null, 3))).toEqual([
      "INVALID_FROM_STATE",
      "INVALID_TO_STATE",
    ]);
  });
});

describe("Run continuation contract", () => {
  it("accepts a distinct PLANNED child bound to the same exact target revision", () => {
    const first = validateRunContinuation(PARENT, CHILD);
    const second = validateRunContinuation(PARENT, CHILD);

    expect(first).toEqual({ ok: true, value: { parent: PARENT, child: CHILD } });
    expect(second).toEqual(first);
  });

  it("rejects reusing the parent Run identity", () => {
    expect(
      issueCodes(
        validateRunContinuation(PARENT, {
          ...CHILD,
          id: PARENT_RUN_ID,
          parentRunId: OTHER_RUN_ID,
        }),
      ),
    ).toContain("CONTINUATION_IDENTITY_REUSED");
  });

  it("requires parentRunId to bind the exact parent Run", () => {
    expect(
      issueCodes(validateRunContinuation(PARENT, { ...CHILD, parentRunId: OTHER_RUN_ID })),
    ).toEqual(["CONTINUATION_PARENT_MISMATCH"]);
  });

  it("requires the child to start in PLANNED state", () => {
    expect(issueCodes(validateRunContinuation(PARENT, { ...CHILD, state: "RUNNING" }))).toEqual([
      "CONTINUATION_CHILD_STATE_INVALID",
    ]);
  });

  it("rejects both revision and logical-target changes", () => {
    expect(
      issueCodes(validateRunContinuation(PARENT, { ...CHILD, target: OTHER_REVISION_TARGET })),
    ).toEqual(["CONTINUATION_TARGET_MISMATCH"]);
    expect(
      issueCodes(validateRunContinuation(PARENT, { ...CHILD, target: OTHER_IDENTITY_TARGET })),
    ).toEqual(["CONTINUATION_TARGET_MISMATCH"]);
  });

  it("composes with SG-000011 RunRecord validation instead of redefining it", () => {
    const invalidParent = validateRunContinuation(
      { ...PARENT, id: PROJECT_ID },
      CHILD,
    );
    expect(issueCodes(invalidParent)).toContain("INVALID_PARENT_RUN");
    if (!invalidParent.ok) {
      expect(invalidParent.issues.some((item) => item.protocolCode === "INVALID_IDENTITY")).toBe(
        true,
      );
    }

    const invalidChild = validateRunContinuation(PARENT, {
      ...CHILD,
      parentRunId: CHILD_RUN_ID,
    });
    expect(issueCodes(invalidChild)).toContain("INVALID_CHILD_RUN");
    if (!invalidChild.ok) {
      expect(invalidChild.issues.some((item) => item.protocolCode === "SEMANTIC_CONFLICT")).toBe(
        true,
      );
    }
  });

  it("returns the same ordered failure set for repeated validation", () => {
    const invalidChild = {
      ...CHILD,
      parentRunId: OTHER_RUN_ID,
      state: "RUNNING",
      target: OTHER_REVISION_TARGET,
    };
    const first = validateRunContinuation(PARENT, invalidChild);
    const second = validateRunContinuation(PARENT, invalidChild);

    expect(issueCodes(first)).toEqual([
      "CONTINUATION_PARENT_MISMATCH",
      "CONTINUATION_CHILD_STATE_INVALID",
      "CONTINUATION_TARGET_MISMATCH",
    ]);
    expect(second).toEqual(first);
  });
});
