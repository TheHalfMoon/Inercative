import { describe, expect, it } from "vitest";

import {
  AssumptionLedgerError,
  evaluateQuestionGate,
  replayAssumptionLedger,
  validateAssumptionLedgerEventInput,
  type AssumptionLedgerEventInputV1,
  type AssumptionRecordV1,
  type QuestionGateDecisionInputV1,
} from "./index.ts";

function assumption(): AssumptionRecordV1 {
  const input: QuestionGateDecisionInputV1 = {
    schemaVersion: 1,
    statement: "Use email as the primary account identifier.",
    source: "intent:account-default",
    confidence: 0.9,
    impact: "medium",
    reversibility: "moderate",
    derivable: false,
    materiallyChangesProductOrTrustBoundary: false,
    requiredForSafeProgress: false,
    questionBudget: { used: 0, max: 3 },
    affectedNodeIds: ["entity:account", "page:settings"],
  };
  const result = evaluateQuestionGate(input);
  if (result.assumption === null) throw new Error("Test fixture did not produce an assumption.");
  return result.assumption;
}

function event(
  action: AssumptionLedgerEventInputV1["action"],
  overrides: Partial<AssumptionLedgerEventInputV1> = {},
): AssumptionLedgerEventInputV1 {
  const origin = assumption();
  return {
    schemaVersion: 1,
    assumptionId: origin.assumptionId,
    action,
    source: `user:${action}`,
    replacement:
      action === "confirm"
        ? null
        : {
            statement: "Use an immutable account UUID as the primary identifier.",
            source: "user:account-identity-correction",
          },
    dependentWorkRefs: action === "confirm" ? [] : ["task:two", "task:one"],
    evidenceRefs: action === "confirm" ? [] : ["evidence:two", "evidence:one"],
    ...overrides,
  };
}

describe("Assumption lifecycle ledger", () => {
  it("confirms an inferred assumption without changing the immutable origin", () => {
    const origin = assumption();
    const state = replayAssumptionLedger(origin, [event("confirm")]);

    expect(state.status).toBe("confirmed");
    expect(state.origin).toEqual(origin);
    expect(state.currentStatement).toBe(origin.statement);
    expect(state.currentSource).toBe(origin.source);
    expect(state.events).toHaveLength(1);
    expect(state.events[0]).toEqual(
      expect.objectContaining({
        action: "confirm",
        sequence: 1,
        replacement: null,
        dependentWorkRefs: [],
        evidenceRefs: [],
      }),
    );
    expect(state.events[0]?.eventId).toMatch(/^assumption-event-[0-9a-f]{64}$/);
    expect(state.invalidationManifests).toEqual([]);
    expect(state.stateId).toMatch(/^assumption-ledger-[0-9a-f]{64}$/);
  });

  it("corrects an assumption and emits canonical reference-only invalidation data", () => {
    const origin = assumption();
    const state = replayAssumptionLedger(origin, [
      event("correct", {
        dependentWorkRefs: ["task:z", "task:a", "task:z"],
        evidenceRefs: ["evidence:2", "evidence:1", "evidence:2"],
      }),
    ]);

    expect(state.status).toBe("corrected");
    expect(state.origin).toEqual(origin);
    expect(state.currentStatement).toBe("Use an immutable account UUID as the primary identifier.");
    expect(state.currentSource).toBe("user:account-identity-correction");
    expect(state.events[0]?.dependentWorkRefs).toEqual(["task:a", "task:z"]);
    expect(state.events[0]?.evidenceRefs).toEqual(["evidence:1", "evidence:2"]);
    expect(state.invalidationManifests).toEqual([
      expect.objectContaining({
        assumptionId: origin.assumptionId,
        dependentWorkRefs: ["task:a", "task:z"],
        evidenceRefs: ["evidence:1", "evidence:2"],
        effect: "reference-only",
      }),
    ]);
    expect(state.invalidationManifests[0]?.manifestId).toMatch(
      /^assumption-invalidation-[0-9a-f]{64}$/,
    );
  });

  it("supports correction after confirmation and iterative correction before supersession", () => {
    const origin = assumption();
    const firstCorrection = event("correct");
    const secondCorrection = event("correct", {
      source: "user:second-correction",
      replacement: {
        statement: "Use a stable account ID independent from authentication identifiers.",
        source: "user:second-correction",
      },
      dependentWorkRefs: [],
      evidenceRefs: [],
    });

    const state = replayAssumptionLedger(origin, [
      event("confirm"),
      firstCorrection,
      secondCorrection,
      event("supersede", {
        source: "architecture:identity-model-v2",
        replacement: {
          statement: "Account identity is defined by the identity-model-v2 decision record.",
          source: "adr:identity-model-v2",
        },
      }),
    ]);

    expect(state.status).toBe("superseded");
    expect(state.events.map((item) => item.sequence)).toEqual([1, 2, 3, 4]);
    expect(state.invalidationManifests).toHaveLength(3);
    expect(state.currentSource).toBe("adr:identity-model-v2");
  });

  it("keeps empty invalidation sets explicit for correction and supersession", () => {
    const corrected = replayAssumptionLedger(assumption(), [
      event("correct", { dependentWorkRefs: [], evidenceRefs: [] }),
    ]);
    const superseded = replayAssumptionLedger(assumption(), [
      event("supersede", { dependentWorkRefs: [], evidenceRefs: [] }),
    ]);

    expect(corrected.invalidationManifests[0]?.dependentWorkRefs).toEqual([]);
    expect(corrected.invalidationManifests[0]?.evidenceRefs).toEqual([]);
    expect(superseded.invalidationManifests[0]?.dependentWorkRefs).toEqual([]);
    expect(superseded.invalidationManifests[0]?.evidenceRefs).toEqual([]);
  });

  it("rejects contradictory or terminal lifecycle transitions", () => {
    expect(() =>
      replayAssumptionLedger(assumption(), [event("confirm"), event("confirm")]),
    ).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_INVALID_TRANSITION",
      }),
    );

    expect(() =>
      replayAssumptionLedger(assumption(), [event("correct"), event("confirm")]),
    ).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_INVALID_TRANSITION",
      }),
    );

    expect(() =>
      replayAssumptionLedger(assumption(), [event("supersede"), event("correct")]),
    ).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_INVALID_TRANSITION",
      }),
    );
  });

  it("rejects stale assumption identities and events targeting another assumption", () => {
    const origin = assumption();
    expect(() =>
      replayAssumptionLedger({ ...origin, statement: "Tampered statement." }, []),
    ).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_STALE_ASSUMPTION_ID",
      }),
    );

    expect(() =>
      replayAssumptionLedger(origin, [
        event("confirm", {
          assumptionId: `assumption-${"0".repeat(64)}`,
        }),
      ]),
    ).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_STALE_ASSUMPTION_ID",
      }),
    );
  });

  it("enforces action-specific replacement and invalidation fields", () => {
    expect(() =>
      validateAssumptionLedgerEventInput(
        event("confirm", {
          replacement: { statement: "Replacement", source: "user" },
        }),
      ),
    ).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_ACTION_FIELD_MISMATCH",
      }),
    );
    expect(() =>
      validateAssumptionLedgerEventInput(event("confirm", { dependentWorkRefs: ["task:one"] })),
    ).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_ACTION_FIELD_MISMATCH",
      }),
    );
    expect(() => validateAssumptionLedgerEventInput(event("correct", { replacement: null }))).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_ACTION_FIELD_MISMATCH",
      }),
    );
  });

  it("fails closed on malformed, unknown, unbounded, or non-plain input", () => {
    expect(() =>
      validateAssumptionLedgerEventInput({ ...event("confirm"), authority: "deploy" }),
    ).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_INVALID_SCHEMA",
      }),
    );
    expect(() =>
      validateAssumptionLedgerEventInput({ ...event("correct"), action: "approve" }),
    ).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_INVALID_SCHEMA",
      }),
    );
    expect(() =>
      validateAssumptionLedgerEventInput({
        ...event("correct"),
        dependentWorkRefs: Array.from({ length: 129 }, (_, index) => `task:${index.toString()}`),
      }),
    ).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_INVALID_REFERENCE_SET",
      }),
    );
    expect(() =>
      validateAssumptionLedgerEventInput({
        ...event("correct"),
        replacement: { statement: "ok", source: "user", authority: "admin" },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_INVALID_SCHEMA",
      }),
    );

    const inherited = Object.create({ authority: "admin" }) as Record<string, unknown>;
    Object.assign(inherited, event("confirm"));
    expect(() => validateAssumptionLedgerEventInput(inherited)).toThrowError(
      expect.objectContaining<Partial<AssumptionLedgerError>>({
        code: "ASSUMPTION_LEDGER_INVALID_SCHEMA",
      }),
    );
  });

  it("canonicalizes replay identities across equivalent reference ordering", () => {
    const origin = assumption();
    const first = replayAssumptionLedger(origin, [
      event("correct", {
        dependentWorkRefs: ["task:b", "task:a", "task:b"],
        evidenceRefs: ["evidence:b", "evidence:a"],
      }),
    ]);
    const second = replayAssumptionLedger(origin, [
      event("correct", {
        dependentWorkRefs: ["task:a", "task:b"],
        evidenceRefs: ["evidence:a", "evidence:b", "evidence:a"],
      }),
    ]);

    expect(first.events[0]?.eventId).toBe(second.events[0]?.eventId);
    expect(first.invalidationManifests[0]?.manifestId).toBe(
      second.invalidationManifests[0]?.manifestId,
    );
    expect(first.stateId).toBe(second.stateId);
    expect(first).toEqual(second);
  });

  it("does not mutate caller input and returns frozen canonical output", () => {
    const origin = structuredClone(assumption());
    const rawEvent = structuredClone(
      event("correct", {
        dependentWorkRefs: ["task:z", "task:a", "task:z"],
        evidenceRefs: ["evidence:z", "evidence:a"],
      }),
    );
    const originBefore = structuredClone(origin);
    const eventBefore = structuredClone(rawEvent);

    const state = replayAssumptionLedger(origin, [rawEvent]);

    expect(origin).toEqual(originBefore);
    expect(rawEvent).toEqual(eventBefore);
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.origin)).toBe(true);
    expect(Object.isFrozen(state.events)).toBe(true);
    expect(Object.isFrozen(state.events[0])).toBe(true);
    expect(Object.isFrozen(state.events[0]?.replacement)).toBe(true);
    expect(Object.isFrozen(state.events[0]?.dependentWorkRefs)).toBe(true);
    expect(Object.isFrozen(state.invalidationManifests)).toBe(true);
    expect(Object.isFrozen(state.invalidationManifests[0])).toBe(true);
  });
});
