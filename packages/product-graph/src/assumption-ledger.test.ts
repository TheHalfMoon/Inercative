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
    confidence: 0.9,
    impact: "medium",
    reversibility: "moderate",
    derivable: false,
    materiallyChangesProductOrTrustBoundary: false,
    requiredForSafeProgress: false,
    questionBudget: { used: 0, max: 3 },
    affectedNodeIds: ["page:settings", "entity:account"],
  });
  if (result.assumption === null) throw new Error("Fixture did not produce an assumption.");
  return result.assumption;
}

function event(
  action: AssumptionLedgerEventInputV1["action"],
  overrides: Partial<AssumptionLedgerEventInputV1> = {},
): AssumptionLedgerEventInputV1 {
  return {
    schemaVersion: 1,
    assumptionId: origin().assumptionId,
    action,
    source: `user:${action}`,
    replacement:
      action === "confirm"
        ? null
        : {
            statement: "Use an immutable account UUID as the primary identifier.",
            source: "user:account-correction",
          },
    dependentWorkRefs: action === "confirm" ? [] : ["task:b", "task:a"],
    evidenceRefs: action === "confirm" ? [] : ["evidence:b", "evidence:a"],
    ...overrides,
  };
}

describe("Assumption lifecycle ledger", () => {
  it("confirms while preserving the immutable origin and emitting no invalidation", () => {
    const input = origin();
    const state = replayAssumptionLedger(input, [event("confirm")]);

    expect(state.status).toBe("confirmed");
    expect(state.origin).toEqual(input);
    expect(state.currentStatement).toBe(input.statement);
    expect(state.events[0]).toEqual(
      expect.objectContaining({ action: "confirm", sequence: 1, replacement: null }),
    );
    expect(state.invalidationManifests).toEqual([]);
    expect(state.stateId).toMatch(/^assumption-ledger-[0-9a-f]{64}$/);
  });

  it("corrects with canonical bounded invalidation references", () => {
    const state = replayAssumptionLedger(origin(), [
      event("correct", {
        dependentWorkRefs: ["task:z", "task:a", "task:z"],
        evidenceRefs: ["evidence:2", "evidence:1", "evidence:2"],
      }),
    ]);

    expect(state.status).toBe("corrected");
    expect(state.currentSource).toBe("user:account-correction");
    expect(state.events[0]?.dependentWorkRefs).toEqual(["task:a", "task:z"]);
    expect(state.invalidationManifests[0]).toEqual(
      expect.objectContaining({
        dependentWorkRefs: ["task:a", "task:z"],
        evidenceRefs: ["evidence:1", "evidence:2"],
        effect: "reference-only",
      }),
    );
    expect(state.invalidationManifests[0]?.manifestId).toMatch(
      /^assumption-invalidation-[0-9a-f]{64}$/,
    );
  });

  it("supports confirm -> correct -> correct -> supersede and keeps empty manifests explicit", () => {
    const state = replayAssumptionLedger(origin(), [
      event("confirm"),
      event("correct", { dependentWorkRefs: [], evidenceRefs: [] }),
      event("correct", {
        replacement: { statement: "Use stable internal account IDs.", source: "user:revision-2" },
        dependentWorkRefs: [],
        evidenceRefs: [],
      }),
      event("supersede", {
        replacement: { statement: "Identity follows ADR-22.", source: "adr:22" },
      }),
    ]);

    expect(state.status).toBe("superseded");
    expect(state.events.map((item) => item.sequence)).toEqual([1, 2, 3, 4]);
    expect(state.invalidationManifests).toHaveLength(3);
    expect(state.invalidationManifests[0]?.dependentWorkRefs).toEqual([]);
    expect(state.currentSource).toBe("adr:22");
  });

  it("rejects contradictory, terminal, stale-identity, and cross-assumption transitions", () => {
    expect(() => replayAssumptionLedger(origin(), [event("confirm"), event("confirm")])).toThrowError(
      expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_TRANSITION" }),
    );
    expect(() => replayAssumptionLedger(origin(), [event("correct"), event("confirm")])).toThrowError(
      expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_TRANSITION" }),
    );
    expect(() => replayAssumptionLedger(origin(), [event("supersede"), event("correct")])).toThrowError(
      expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_TRANSITION" }),
    );
    const stale = origin();
    expect(() => replayAssumptionLedger({ ...stale, statement: "tampered" }, [])).toThrowError(
      expect.objectContaining({ code: "ASSUMPTION_LEDGER_STALE_ASSUMPTION_ID" }),
    );
    expect(() =>
      replayAssumptionLedger(origin(), [
        event("confirm", { assumptionId: `assumption-${"0".repeat(64)}` }),
      ]),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_STALE_ASSUMPTION_ID" }));
  });

  it("enforces closed action-specific schemas and reference bounds", () => {
    expect(() =>
      validateAssumptionLedgerEventInput(
        event("confirm", { replacement: { statement: "x", source: "user" } }),
      ),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_ACTION_FIELD_MISMATCH" }));
    expect(() =>
      validateAssumptionLedgerEventInput(event("correct", { replacement: null })),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_ACTION_FIELD_MISMATCH" }));
    expect(() =>
      validateAssumptionLedgerEventInput({ ...event("confirm"), authority: "deploy" }),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_SCHEMA" }));
    expect(() =>
      validateAssumptionLedgerEventInput({
        ...event("correct"),
        dependentWorkRefs: Array.from({ length: 129 }, (_, index) => `task:${index.toString()}`),
      }),
    ).toThrowError(expect.objectContaining({ code: "ASSUMPTION_LEDGER_INVALID_REFERENCE_SET" }));
  });

  it("produces byte-equivalent semantic identities for equivalent canonical replay", () => {
    const first = replayAssumptionLedger(origin(), [
      event("correct", {
        dependentWorkRefs: ["task:b", "task:a", "task:b"],
        evidenceRefs: ["evidence:b", "evidence:a"],
      }),
    ]);
    const second = replayAssumptionLedger(origin(), [
      event("correct", {
        dependentWorkRefs: ["task:a", "task:b"],
        evidenceRefs: ["evidence:a", "evidence:b", "evidence:a"],
      }),
    ]);

    expect(first).toEqual(second);
    expect(first.events[0]?.eventId).toBe(second.events[0]?.eventId);
    expect(first.stateId).toBe(second.stateId);
  });

  it("does not mutate caller input and freezes canonical nested output", () => {
    const inputOrigin = structuredClone(origin());
    const inputEvent = structuredClone(event("correct"));
    const beforeOrigin = structuredClone(inputOrigin);
    const beforeEvent = structuredClone(inputEvent);
    const state = replayAssumptionLedger(inputOrigin, [inputEvent]);

    expect(inputOrigin).toEqual(beforeOrigin);
    expect(inputEvent).toEqual(beforeEvent);
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.origin)).toBe(true);
    expect(Object.isFrozen(state.events)).toBe(true);
    expect(Object.isFrozen(state.events[0]?.replacement)).toBe(true);
    expect(Object.isFrozen(state.invalidationManifests[0])).toBe(true);
  });
});
