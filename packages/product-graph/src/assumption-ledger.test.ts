import { describe, expect, it } from "vitest";

import {
  evaluateQuestionGate,
  replayAssumptionLedger,
  validateAssumptionLedgerEventInput,
  type AssumptionLedgerEventInputV1,
  type AssumptionRecordV1,
} from "./index.ts";

function origin(): AssumptionRecordV1 {
  const result = evaluateQuestionGate({
    schemaVersion: 1,
    statement: "Use email as the primary account identifier.",
    source: "intent:account-default",
    confidence: 0.7,
    impact: "low",
    reversibility: "moderate",
    derivable: false,
    materiallyChangesProductOrTrustBoundary: false,
    requiredForSafeProgress: false,
    questionBudget: { used: 0, max: 3 },
    affectedNodeIds: ["page:settings", "entity:account"],
  });
  if (result.assumption === null) throw new Error("Expected an inferred assumption.");
  return result.assumption;
}

function event(
  assumption: AssumptionRecordV1,
  overrides: Partial<AssumptionLedgerEventInputV1> = {},
): AssumptionLedgerEventInputV1 {
  return {
    schemaVersion: 1,
    assumptionId: assumption.assumptionId,
    action: "confirm",
    source: "user:confirmation",
    correctedStatement: null,
    replacementAssumptionId: null,
    dependentWorkRefs: [],
    evidenceRefs: [],
    ...overrides,
  };
}

describe("Assumption Ledger", () => {
  it("confirms an inferred assumption without creating invalidation authority", () => {
    const assumption = origin();
    const state = replayAssumptionLedger(assumption, [event(assumption)]);

    expect(state.status).toBe("confirmed");
    expect(state.invalidations).toEqual([]);
    expect(state.events[0]?.eventId).toMatch(/^assumption-event-[0-9a-f]{64}$/);
    expect(state.ledgerRevisionId).toMatch(/^assumption-ledger-[0-9a-f]{64}$/);
  });

  it("corrects an assumption and canonicalizes an explicit invalidation manifest", () => {
    const assumption = origin();
    const input = event(assumption, {
      action: "correct",
      source: "user:correction",
      correctedStatement: "Use a generated account ID.",
      dependentWorkRefs: ["task:b", "task:a", "task:b"],
      evidenceRefs: ["evidence:2", "evidence:1"],
    });
    const state = replayAssumptionLedger(assumption, [input]);

    expect(state.status).toBe("corrected");
    expect(state.effectiveStatement).toBe("Use a generated account ID.");
    expect(state.originAssumption).toEqual(assumption);
    expect(state.invalidations[0]).toEqual(
      expect.objectContaining({
        dependentWorkRefs: ["task:a", "task:b"],
        evidenceRefs: ["evidence:1", "evidence:2"],
      }),
    );
    expect(state.invalidations[0]?.manifestId).toMatch(/^assumption-invalidation-[0-9a-f]{64}$/);
  });

  it("supersedes an assumption with a different canonical assumption identity", () => {
    const assumption = origin();
    const replacement = `assumption-${"a".repeat(64)}`;
    const state = replayAssumptionLedger(assumption, [
      event(assumption, {
        action: "supersede",
        source: "user:replacement",
        replacementAssumptionId: replacement,
      }),
    ]);

    expect(state.status).toBe("superseded");
    expect(state.replacementAssumptionId).toBe(replacement);
    expect(state.invalidations).toHaveLength(1);
  });

  it("allows correction after confirmation and replays deterministically without input mutation", () => {
    const assumption = origin();
    const inputs = [
      event(assumption),
      event(assumption, {
        action: "correct",
        source: "user:later-correction",
        correctedStatement: "Use a generated account ID.",
        dependentWorkRefs: ["task:1"],
      }),
    ];
    const before = structuredClone(inputs);

    const first = replayAssumptionLedger(assumption, inputs);
    const second = replayAssumptionLedger(assumption, structuredClone(inputs));

    expect(first).toEqual(second);
    expect(inputs).toEqual(before);
    expect(first.status).toBe("corrected");
    expect(Object.isFrozen(first.events)).toBe(true);
  });

  it("rejects contradictory or terminal lifecycle transitions", () => {
    const assumption = origin();
    expect(() =>
      replayAssumptionLedger(assumption, [event(assumption), event(assumption)]),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_TRANSITION" }));

    const correction = event(assumption, {
      action: "correct",
      correctedStatement: "Use a generated account ID.",
    });
    expect(() => replayAssumptionLedger(assumption, [correction, event(assumption)])).toThrowError(
      expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_TRANSITION" }),
    );
  });

  it("enforces action-specific fields and stale assumption binding", () => {
    const assumption = origin();
    expect(() =>
      validateAssumptionLedgerEventInput({
        ...event(assumption),
        dependentWorkRefs: ["task:unexpected"],
      }),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_ACTION_FIELDS" }));
    expect(() =>
      validateAssumptionLedgerEventInput({
        ...event(assumption, { action: "correct" }),
        correctedStatement: null,
      }),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_ACTION_FIELDS" }));
    expect(() =>
      replayAssumptionLedger(assumption, [
        { ...event(assumption), assumptionId: `assumption-${"b".repeat(64)}` },
      ]),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_STALE_ASSUMPTION" }));
  });

  it("enforces reference and replay bounds", () => {
    const assumption = origin();
    expect(() =>
      validateAssumptionLedgerEventInput({
        ...event(assumption, { action: "correct", correctedStatement: "Corrected." }),
        dependentWorkRefs: Array.from({ length: 129 }, (_, index) => `task:${index}`),
      }),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_REFERENCES" }));
    expect(() =>
      replayAssumptionLedger(assumption, Array.from({ length: 65 }, () => event(assumption))),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_SCHEMA" }));
  });

  it("fails closed on malformed schemas, references, and tampered origin identity", () => {
    const assumption = origin();
    expect(() =>
      validateAssumptionLedgerEventInput({ ...event(assumption), authority: "admin" }),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_SCHEMA" }));
    expect(() =>
      validateAssumptionLedgerEventInput({
        ...event(assumption, { action: "correct", correctedStatement: "Corrected." }),
        evidenceRefs: [""],
      }),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_REFERENCES" }));
    expect(() =>
      replayAssumptionLedger({ ...assumption, assumptionId: `assumption-${"c".repeat(64)}` }, []),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_ASSUMPTION" }));
  });
});
