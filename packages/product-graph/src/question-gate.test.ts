import { describe, expect, it } from "vitest";

import {
  QUESTION_GATE_HIGH_CONFIDENCE_THRESHOLD,
  evaluateQuestionGate,
  validateQuestionGateDecisionInput,
  type QuestionGateDecisionInputV1,
} from "./index.ts";

function decision(
  overrides: Partial<QuestionGateDecisionInputV1> = {},
): QuestionGateDecisionInputV1 {
  return {
    schemaVersion: 1,
    statement: "Use email as the primary account identifier.",
    source: "intent:account-default",
    confidence: 0.6,
    impact: "medium",
    reversibility: "moderate",
    derivable: false,
    materiallyChangesProductOrTrustBoundary: false,
    requiredForSafeProgress: false,
    questionBudget: { used: 0, max: 3 },
    affectedNodeIds: ["entity:account"],
    ...overrides,
  };
}

describe("Question Gate", () => {
  it("derives from current context before considering assumptions or questions", () => {
    const input = decision({
      derivable: true,
      impact: "high",
      reversibility: "hard",
      confidence: 0,
      materiallyChangesProductOrTrustBoundary: true,
      requiredForSafeProgress: true,
      questionBudget: { used: 3, max: 3 },
    });
    const before = structuredClone(input);

    expect(evaluateQuestionGate(input)).toEqual({
      schemaVersion: 1,
      outcome: "derive",
      reason: "DERIVABLE_FROM_CONTEXT",
      assumption: null,
    });
    expect(input).toEqual(before);
  });

  it("assumes a low-impact default and records an inspectable inferred assumption", () => {
    const result = evaluateQuestionGate(
      decision({
        impact: "low",
        confidence: 0.1,
        materiallyChangesProductOrTrustBoundary: false,
      }),
    );

    expect(result.outcome).toBe("assume");
    expect(result.reason).toBe("REVERSIBLE_OR_LOW_IMPACT_DEFAULT");
    expect(result.assumption).toEqual(
      expect.objectContaining({
        statement: "Use email as the primary account identifier.",
        source: "intent:account-default",
        confidence: 0.1,
        impact: "low",
        reversibility: "moderate",
        affectedNodeIds: ["entity:account"],
        status: "inferred",
      }),
    );
    expect(result.assumption?.assumptionId).toMatch(/^assumption-[0-9a-f]{64}$/);
  });

  it("assumes an easy-to-reverse choice even when confidence is low", () => {
    const result = evaluateQuestionGate(
      decision({
        impact: "high",
        reversibility: "easy",
        confidence: 0.05,
        materiallyChangesProductOrTrustBoundary: true,
        requiredForSafeProgress: true,
      }),
    );

    expect(result.outcome).toBe("assume");
    expect(result.reason).toBe("REVERSIBLE_OR_LOW_IMPACT_DEFAULT");
  });

  it("uses the exact high-confidence boundary for a default assumption", () => {
    const atBoundary = evaluateQuestionGate(
      decision({
        confidence: QUESTION_GATE_HIGH_CONFIDENCE_THRESHOLD,
        impact: "high",
        reversibility: "hard",
        materiallyChangesProductOrTrustBoundary: true,
        requiredForSafeProgress: true,
      }),
    );
    const belowBoundary = evaluateQuestionGate(
      decision({
        confidence: QUESTION_GATE_HIGH_CONFIDENCE_THRESHOLD - 0.001,
        impact: "high",
        reversibility: "hard",
        materiallyChangesProductOrTrustBoundary: true,
        requiredForSafeProgress: true,
      }),
    );

    expect(atBoundary.outcome).toBe("assume");
    expect(atBoundary.reason).toBe("HIGH_CONFIDENCE_DEFAULT");
    expect(belowBoundary.outcome).toBe("ask");
    expect(belowBoundary.reason).toBe("MATERIAL_BLOCKER_NEEDS_USER");
  });

  it("asks only for a non-derivable material hard-to-reverse safe-progress blocker", () => {
    const blocker = decision({
      impact: "high",
      reversibility: "hard",
      confidence: 0.4,
      materiallyChangesProductOrTrustBoundary: true,
      requiredForSafeProgress: true,
      questionBudget: { used: 1, max: 3 },
    });

    expect(evaluateQuestionGate(blocker)).toEqual({
      schemaVersion: 1,
      outcome: "ask",
      reason: "MATERIAL_BLOCKER_NEEDS_USER",
      assumption: null,
    });

    const nonBlockingVariants: QuestionGateDecisionInputV1[] = [
      { ...blocker, materiallyChangesProductOrTrustBoundary: false },
      { ...blocker, reversibility: "moderate" },
      { ...blocker, requiredForSafeProgress: false },
    ];
    for (const variant of nonBlockingVariants) {
      expect(evaluateQuestionGate(variant)).toEqual({
        schemaVersion: 1,
        outcome: "defer",
        reason: "REVERSIBLE_PROTOTYPE",
        assumption: null,
      });
    }
  });

  it("cannot ask around an exhausted question budget", () => {
    const result = evaluateQuestionGate(
      decision({
        impact: "high",
        reversibility: "hard",
        confidence: 0.2,
        materiallyChangesProductOrTrustBoundary: true,
        requiredForSafeProgress: true,
        questionBudget: { used: 3, max: 3 },
      }),
    );

    expect(result).toEqual({
      schemaVersion: 1,
      outcome: "defer",
      reason: "QUESTION_BUDGET_EXHAUSTED",
      assumption: null,
    });
  });

  it("canonicalizes affected node IDs before deriving a stable assumption identity", () => {
    const first = evaluateQuestionGate(
      decision({
        impact: "low",
        affectedNodeIds: ["page:settings", "entity:account", "page:settings"],
      }),
    );
    const second = evaluateQuestionGate(
      decision({
        impact: "low",
        affectedNodeIds: ["entity:account", "page:settings"],
      }),
    );

    expect(first.assumption?.affectedNodeIds).toEqual(["entity:account", "page:settings"]);
    expect(first.assumption?.assumptionId).toBe(second.assumption?.assumptionId);
  });

  it("returns frozen canonical nested policy data without mutating the caller input", () => {
    const input = decision({
      impact: "low",
      affectedNodeIds: ["page:settings", "entity:account"],
      questionBudget: { used: 0, max: 2 },
    });
    const before = structuredClone(input);
    const parsed = validateQuestionGateDecisionInput(input);
    const result = evaluateQuestionGate(input);

    expect(input).toEqual(before);
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen(parsed.affectedNodeIds)).toBe(true);
    expect(Object.isFrozen(parsed.questionBudget)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.assumption)).toBe(true);
  });

  it("rejects malformed confidence, budget, node IDs, enums, and unknown fields", () => {
    expect(() => evaluateQuestionGate({ ...decision(), confidence: 1.01 })).toThrowError(
      expect.objectContaining({ code: "QUESTION_GATE_INVALID_CONFIDENCE" }),
    );
    expect(() =>
      evaluateQuestionGate({ ...decision(), questionBudget: { used: 2, max: 1 } }),
    ).toThrowError(expect.objectContaining({ code: "QUESTION_GATE_INVALID_BUDGET" }));
    expect(() =>
      evaluateQuestionGate({ ...decision(), questionBudget: { used: 0, max: 4 } }),
    ).toThrowError(expect.objectContaining({ code: "QUESTION_GATE_INVALID_BUDGET" }));
    expect(() => evaluateQuestionGate({ ...decision(), affectedNodeIds: [""] })).toThrowError(
      expect.objectContaining({ code: "QUESTION_GATE_INVALID_AFFECTED_NODE_IDS" }),
    );
    expect(() => evaluateQuestionGate({ ...decision(), impact: "critical" })).toThrowError(
      expect.objectContaining({ code: "QUESTION_GATE_INVALID_SCHEMA" }),
    );
    expect(() => evaluateQuestionGate({ ...decision(), authority: "admin" })).toThrowError(
      expect.objectContaining({ code: "QUESTION_GATE_INVALID_SCHEMA" }),
    );
  });

  it("rejects non-plain objects and wrong schema versions", () => {
    const inherited = Object.create({ authority: "admin" }) as Record<string, unknown>;
    Object.assign(inherited, decision());

    expect(() => evaluateQuestionGate(inherited)).toThrowError(
      expect.objectContaining({ code: "QUESTION_GATE_INVALID_SCHEMA" }),
    );
    expect(() => evaluateQuestionGate({ ...decision(), schemaVersion: 2 })).toThrowError(
      expect.objectContaining({ code: "QUESTION_GATE_INVALID_SCHEMA" }),
    );
  });
});
