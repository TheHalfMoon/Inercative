import { describe, expect, it } from "vitest";

import {
  DomainValidationError,
  ProductGraphUserViewsError,
  buildProductGraphUserViews,
  createProductGraphRevision,
  evaluateQuestionGate,
  replayAssumptionLedger,
  type AssumptionRecordV1,
  type ProductGraphRevisionDocumentV1,
} from "./index.ts";

function graph(): ProductGraphRevisionDocumentV1 {
  return createProductGraphRevision({
    schemaVersion: 1,
    graphId: "graph:user-views",
    nodes: [
      { id: "workflow:fulfill", kind: "workflow", attributes: { name: "Fulfill", steps: ["pick"] } },
      { id: "page:orders", kind: "page", attributes: { name: "Orders", route: "/orders" } },
      { id: "entity:order", kind: "entity", attributes: { name: "Order" } },
      { id: "role:manager", kind: "role", attributes: { name: "Manager" } },
      { id: "action:fulfill", kind: "action", attributes: { name: "Fulfill order" } },
    ],
    edges: [
      { id: "edge:reads", kind: "reads", from: "workflow:fulfill", to: "entity:order", attributes: {} },
      { id: "edge:starts", kind: "starts", from: "action:fulfill", to: "workflow:fulfill", attributes: {} },
      { id: "edge:may", kind: "may", from: "role:manager", to: "action:fulfill", attributes: {} },
      { id: "edge:displays", kind: "displays", from: "page:orders", to: "entity:order", attributes: {} },
      { id: "edge:triggers", kind: "triggers", from: "page:orders", to: "action:fulfill", attributes: {} },
    ],
  });
}

function assumption(statement: string, affectedNodeIds = ["page:orders"]): AssumptionRecordV1 {
  const result = evaluateQuestionGate({
    schemaVersion: 1,
    statement,
    source: `intent:${statement}`,
    confidence: 0.7,
    impact: "low",
    reversibility: "moderate",
    derivable: false,
    materiallyChangesProductOrTrustBoundary: false,
    requiredForSafeProgress: false,
    questionBudget: { used: 0, max: 3 },
    affectedNodeIds,
  });
  if (result.assumption === null) throw new Error("Expected an inferred assumption.");
  return result.assumption;
}

function event(
  origin: AssumptionRecordV1,
  action: "confirm" | "correct" | "supersede",
  correctedStatement: string | null = null,
  replacementAssumptionId: string | null = null,
  dependentWorkRefs: readonly string[] = [],
  evidenceRefs: readonly string[] = [],
) {
  return {
    schemaVersion: 1,
    assumptionId: origin.assumptionId,
    action,
    source: `user:${action}`,
    correctedStatement,
    replacementAssumptionId,
    dependentWorkRefs,
    evidenceRefs,
  };
}

describe("Product Graph user views", () => {
  it("projects all five canonical view families with stable semantic identity", () => {
    const origin = assumption("Use email identity");
    const views = buildProductGraphUserViews(graph(), [replayAssumptionLedger(origin, [])]);

    expect(views.graphId).toBe("graph:user-views");
    expect(views.projectionId).toMatch(/^product-graph-user-views-[0-9a-f]{64}$/);
    expect(views.data.map((item) => item.nodeId)).toEqual(["entity:order"]);
    expect(views.roles.map((item) => item.nodeId)).toEqual(["role:manager"]);
    expect(views.pages.map((item) => item.nodeId)).toEqual(["page:orders"]);
    expect(views.workflows.map((item) => item.nodeId)).toEqual(["workflow:fulfill"]);
    expect(views.assumptions.map((item) => item.assumptionId)).toEqual([origin.assumptionId]);
    expect(views.pages[0]?.relations.map((item) => item.edgeId)).toEqual([
      "edge:displays",
      "edge:triggers",
    ]);
  });

  it("preserves inferred, confirmed, corrected, and superseded assumption state", () => {
    const inferred = assumption("Inferred");
    const confirmed = assumption("Confirmed");
    const corrected = assumption("Corrected");
    const superseded = assumption("Superseded");
    const replacement = assumption("Replacement");
    const states = [
      replayAssumptionLedger(inferred, []),
      replayAssumptionLedger(confirmed, [event(confirmed, "confirm")]),
      replayAssumptionLedger(corrected, [
        event(corrected, "correct", "Corrected statement", null, ["task:b", "task:a"], ["e:2", "e:1"]),
      ]),
      replayAssumptionLedger(superseded, [
        event(superseded, "supersede", null, replacement.assumptionId),
      ]),
    ];

    const rows = buildProductGraphUserViews(graph(), states).assumptions;
    const byStatus = new Map(rows.map((item) => [item.status, item]));
    expect([...byStatus.keys()].sort()).toEqual(["confirmed", "corrected", "inferred", "superseded"]);
    expect(byStatus.get("corrected")?.effectiveStatement).toBe("Corrected statement");
    expect(byStatus.get("corrected")?.dependentWorkRefs).toEqual(["task:a", "task:b"]);
    expect(byStatus.get("corrected")?.evidenceRefs).toEqual(["e:1", "e:2"]);
    expect(byStatus.get("superseded")?.replacementAssumptionId).toBe(replacement.assumptionId);
  });

  it("is deterministic across input ordering and exposes explicit empty collections", () => {
    const first = assumption("First");
    const second = assumption("Second");
    const states = [replayAssumptionLedger(first, []), replayAssumptionLedger(second, [])];
    const left = buildProductGraphUserViews(graph(), states);
    const right = buildProductGraphUserViews(graph(), [...states].reverse());
    expect(left).toEqual(right);

    const empty = buildProductGraphUserViews(
      createProductGraphRevision({ schemaVersion: 1, graphId: "graph:empty", nodes: [], edges: [] }),
      [],
    );
    expect(empty.data).toEqual([]);
    expect(empty.roles).toEqual([]);
    expect(empty.pages).toEqual([]);
    expect(empty.workflows).toEqual([]);
    expect(empty.assumptions).toEqual([]);
    expect(Object.isFrozen(empty)).toBe(true);
  });

  it("fails closed on stale assumption references and duplicate ledger identities", () => {
    const stale = assumption("Stale", ["page:missing"]);
    expect(() => buildProductGraphUserViews(graph(), [replayAssumptionLedger(stale, [])])).toThrowError(
      expect.objectContaining({ code: "USER_VIEWS_STALE_ASSUMPTION_REFERENCE" }),
    );

    const duplicate = replayAssumptionLedger(assumption("Duplicate"), []);
    expect(() => buildProductGraphUserViews(graph(), [duplicate, duplicate])).toThrowError(
      expect.objectContaining({ code: "USER_VIEWS_DUPLICATE_ASSUMPTION" }),
    );
  });

  it("rejects tampered ledger state and malformed domain input", () => {
    const state = replayAssumptionLedger(assumption("Tampered"), []);
    expect(() =>
      buildProductGraphUserViews(graph(), [{ ...state, ledgerRevisionId: "assumption-ledger-tampered" }]),
    ).toThrowError(ProductGraphUserViewsError);

    const malformed = createProductGraphRevision({
      schemaVersion: 1,
      graphId: "graph:malformed",
      nodes: [{ id: "node:unknown", kind: "unknown", attributes: {} }],
      edges: [],
    });
    expect(() => buildProductGraphUserViews(malformed, [])).toThrowError(DomainValidationError);
  });

  it("does not mutate caller-owned graph or assumption state", () => {
    const state = replayAssumptionLedger(assumption("Immutable"), []);
    const graphRevision = graph();
    const graphBefore = structuredClone(graphRevision);
    const states = [state];
    const statesBefore = structuredClone(states);

    buildProductGraphUserViews(graphRevision, states);

    expect(graphRevision).toEqual(graphBefore);
    expect(states).toEqual(statesBefore);
  });
});
