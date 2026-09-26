import { describe, expect, it } from "vitest";

import {
  INTENT_INTERPRETATION_MAX_UNCERTAINTIES,
  USER_CHANGE_REQUEST_MAX_TEXT_LENGTH,
  compileUserRequestInterpretation,
  createIntentInterpretation,
  createProductGraphRevision,
  createUserChangeRequest,
  validateIntentInterpretation,
  validateUserChangeRequest,
  type ProductGraphRevisionDocumentV1,
} from "./index.ts";

function baseGraph(name = "request-intent"): ProductGraphRevisionDocumentV1 {
  return createProductGraphRevision({
    schemaVersion: 1,
    graphId: `graph:${name}`,
    nodes: [{ id: "entity:account", kind: "entity", attributes: { name: "Account" } }],
    edges: [],
  });
}

function request(base: ProductGraphRevisionDocumentV1) {
  return createUserChangeRequest({
    baseRevision: base.revision,
    text: "Add an overview page for the account.",
    provenance: { source: "user", reference: "message:42" },
  });
}

function interpretation(base: ProductGraphRevisionDocumentV1) {
  const userRequest = request(base);
  return {
    userRequest,
    interpretation: createIntentInterpretation(userRequest, {
      provenance: { source: "system", reference: "interpretation:fixture" },
      confidence: 0.82,
      uncertainties: ["The requested page title may need confirmation."],
      operations: [{ kind: "no-op" }],
    }),
  };
}

describe("request intent boundary", () => {
  it("creates stable identities and preserves proposal metadata without mutating inputs", () => {
    const base = baseGraph();
    const firstRequest = request(base);
    const secondRequest = request(base);
    expect(firstRequest).toEqual(secondRequest);
    expect(firstRequest.requestId).toMatch(/^request-[0-9a-f]{64}$/);

    const first = createIntentInterpretation(firstRequest, {
      provenance: { source: "system", reference: "interpretation:fixture" },
      confidence: 0.82,
      uncertainties: ["The requested page title may need confirmation."],
      operations: [{ kind: "no-op" }],
    });
    const second = createIntentInterpretation(secondRequest, {
      provenance: { source: "system", reference: "interpretation:fixture" },
      confidence: 0.82,
      uncertainties: ["The requested page title may need confirmation."],
      operations: [{ kind: "no-op" }],
    });
    expect(first).toEqual(second);
    expect(first.interpretationId).toMatch(/^interpretation-[0-9a-f]{64}$/);

    const beforeBase = structuredClone(base);
    const beforeRequest = structuredClone(firstRequest);
    const beforeInterpretation = structuredClone(first);
    const proposal = compileUserRequestInterpretation(base, firstRequest, first);

    expect(proposal.requestId).toBe(firstRequest.requestId);
    expect(proposal.interpretationId).toBe(first.interpretationId);
    expect(proposal.confidence).toBe(0.82);
    expect(proposal.uncertainties).toEqual(["The requested page title may need confirmation."]);
    expect(proposal.requestProvenance).toEqual(firstRequest.provenance);
    expect(proposal.interpretationProvenance).toEqual(first.provenance);
    expect(proposal.proposedDelta.operations).toEqual([{ kind: "no-op" }]);
    expect(base).toEqual(beforeBase);
    expect(firstRequest).toEqual(beforeRequest);
    expect(first).toEqual(beforeInterpretation);
  });

  it("fails closed when request identity or exact base binding is stale", () => {
    const base = baseGraph();
    const userRequest = request(base);
    expect(() =>
      validateUserChangeRequest({ ...userRequest, text: "Tampered request" }),
    ).toThrowError(expect.objectContaining({ code: "REQUEST_INTENT_REQUEST_ID_MISMATCH" }));

    const otherBase = baseGraph("other");
    const { interpretation: parsed } = interpretation(base);
    expect(() => compileUserRequestInterpretation(otherBase, userRequest, parsed)).toThrowError(
      expect.objectContaining({ code: "REQUEST_INTENT_BASE_MISMATCH" }),
    );
  });

  it("rejects interpretations bound to another request or base revision", () => {
    const base = baseGraph();
    const pair = interpretation(base);
    const otherRequest = createUserChangeRequest({
      baseRevision: base.revision,
      text: "A different request.",
      provenance: { source: "user", reference: "message:43" },
    });
    expect(() => validateIntentInterpretation(otherRequest, pair.interpretation)).toThrowError(
      expect.objectContaining({ code: "REQUEST_INTENT_INTERPRETATION_REQUEST_MISMATCH" }),
    );
    expect(() =>
      validateIntentInterpretation(pair.userRequest, {
        ...pair.interpretation,
        baseRevision: baseGraph("stale").revision,
      }),
    ).toThrowError(expect.objectContaining({ code: "REQUEST_INTENT_BASE_MISMATCH" }));
  });

  it("rejects malformed confidence, provenance, uncertainty, bounds, and unknown fields", () => {
    const base = baseGraph();
    const pair = interpretation(base);
    expect(() =>
      validateIntentInterpretation(pair.userRequest, { ...pair.interpretation, confidence: 1.1 }),
    ).toThrowError(expect.objectContaining({ code: "REQUEST_INTENT_INVALID_CONFIDENCE" }));
    expect(() =>
      validateUserChangeRequest({
        ...pair.userRequest,
        provenance: { source: "provider", reference: "untrusted" },
      }),
    ).toThrowError(expect.objectContaining({ code: "REQUEST_INTENT_INVALID_PROVENANCE" }));
    expect(() =>
      validateIntentInterpretation(pair.userRequest, {
        ...pair.interpretation,
        uncertainties: Array.from(
          { length: INTENT_INTERPRETATION_MAX_UNCERTAINTIES + 1 },
          () => "unknown",
        ),
      }),
    ).toThrowError(expect.objectContaining({ code: "REQUEST_INTENT_INVALID_UNCERTAINTY" }));
    expect(() =>
      createUserChangeRequest({
        baseRevision: base.revision,
        text: "x".repeat(USER_CHANGE_REQUEST_MAX_TEXT_LENGTH + 1),
        provenance: { source: "user", reference: "message:44" },
      }),
    ).toThrowError(expect.objectContaining({ code: "REQUEST_INTENT_INVALID_SCHEMA" }));
    expect(() =>
      validateUserChangeRequest({ ...pair.userRequest, authority: "admin" }),
    ).toThrowError(expect.objectContaining({ code: "REQUEST_INTENT_INVALID_SCHEMA" }));
  });

  it("forwards ordered operations into the existing deterministic Change Intent compiler", () => {
    const base = baseGraph();
    const userRequest = request(base);
    const parsed = createIntentInterpretation(userRequest, {
      provenance: { source: "system", reference: "interpretation:add-page" },
      confidence: 0.94,
      uncertainties: [],
      operations: [
        {
          kind: "upsert-node",
          node: { id: "page:overview", kind: "page", attributes: { name: "Overview" } },
        },
      ],
    });
    const first = compileUserRequestInterpretation(base, userRequest, parsed);
    const second = compileUserRequestInterpretation(base, userRequest, parsed);

    expect(first).toEqual(second);
    expect(first.proposedDelta.intentId).toBe(parsed.interpretationId);
    expect(first.proposedDelta.operations).toEqual(parsed.operations);
    expect(first.proposedDelta.candidateRevision.graph.nodes).toHaveLength(2);
  });

  it("preserves Change Intent domain-validation failures instead of bypassing them", () => {
    const base = baseGraph();
    const userRequest = request(base);
    const parsed = createIntentInterpretation(userRequest, {
      provenance: { source: "system", reference: "interpretation:invalid-page" },
      confidence: 0.7,
      uncertainties: ["Page metadata is incomplete."],
      operations: [
        {
          kind: "upsert-node",
          node: { id: "page:invalid", kind: "page", attributes: {} },
        },
      ],
    });

    expect(() => compileUserRequestInterpretation(base, userRequest, parsed)).toThrowError(
      expect.objectContaining({ code: "CHANGE_INTENT_DOMAIN_INVALID" }),
    );
  });
});
