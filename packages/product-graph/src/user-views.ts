import { createHash } from "node:crypto";

import {
  replayAssumptionLedger,
  type AssumptionLedgerStateV1,
  type AssumptionLedgerStatus,
} from "./assumption-ledger.ts";
import {
  validateProductGraphRevision,
  type JsonObject,
  type ProductGraphEdgeV1,
  type ProductGraphRevision,
  type ProductGraphStateV1,
} from "./contracts.ts";
import { validateProductGraphDomain } from "./domain.ts";

export const PRODUCT_GRAPH_USER_VIEWS_SCHEMA_VERSION = 1 as const;
export const PRODUCT_GRAPH_USER_VIEW_FAMILIES = [
  "data",
  "roles",
  "pages",
  "workflows",
  "assumptions",
] as const;

const MAX_ASSUMPTIONS = 128;

export type ProductGraphUserViewFamily = (typeof PRODUCT_GRAPH_USER_VIEW_FAMILIES)[number];
export type ProductGraphUserViewsErrorCode =
  | "USER_VIEWS_INVALID_ASSUMPTION_STATE"
  | "USER_VIEWS_TOO_MANY_ASSUMPTIONS"
  | "USER_VIEWS_DUPLICATE_ASSUMPTION"
  | "USER_VIEWS_STALE_ASSUMPTION_REFERENCE";

export interface ProductGraphViewRelationV1 {
  readonly edgeId: string;
  readonly kind: string;
  readonly direction: "incoming" | "outgoing";
  readonly otherNodeId: string;
}

export interface ProductGraphViewItemV1 {
  readonly nodeId: string;
  readonly kind: string;
  readonly attributes: JsonObject;
  readonly relations: readonly ProductGraphViewRelationV1[];
}

export interface AssumptionUserViewItemV1 {
  readonly assumptionId: string;
  readonly ledgerRevisionId: string;
  readonly status: AssumptionLedgerStatus;
  readonly originStatement: string;
  readonly effectiveStatement: string;
  readonly source: string;
  readonly confidence: number;
  readonly impact: string;
  readonly reversibility: string;
  readonly affectedNodeIds: readonly string[];
  readonly replacementAssumptionId: string | null;
  readonly dependentWorkRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface ProductGraphUserViewsV1 {
  readonly schemaVersion: typeof PRODUCT_GRAPH_USER_VIEWS_SCHEMA_VERSION;
  readonly projectionId: `product-graph-user-views-${string}`;
  readonly graphId: string;
  readonly graphRevision: ProductGraphRevision;
  readonly data: readonly ProductGraphViewItemV1[];
  readonly roles: readonly ProductGraphViewItemV1[];
  readonly pages: readonly ProductGraphViewItemV1[];
  readonly workflows: readonly ProductGraphViewItemV1[];
  readonly assumptions: readonly AssumptionUserViewItemV1[];
}

export class ProductGraphUserViewsError extends Error {
  readonly code: ProductGraphUserViewsErrorCode;

  constructor(code: ProductGraphUserViewsErrorCode, message: string) {
    super(message);
    this.name = "ProductGraphUserViewsError";
    this.code = code;
  }
}

function fail(code: ProductGraphUserViewsErrorCode, message: string): never {
  throw new ProductGraphUserViewsError(code, message);
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    return fail("USER_VIEWS_INVALID_ASSUMPTION_STATE", `${label} must be an object.`);
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return fail("USER_VIEWS_INVALID_ASSUMPTION_STATE", `${label} must be a plain object.`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string,
): void {
  const unknownKeys = Object.keys(value)
    .filter((key) => !allowed.includes(key))
    .sort(compareText);
  if (unknownKeys.length > 0) {
    fail(
      "USER_VIEWS_INVALID_ASSUMPTION_STATE",
      `${label} has unknown keys: ${unknownKeys.join(", ")}.`,
    );
  }
}

function observedEvent(
  value: unknown,
  index: number,
): {
  readonly input: Record<string, unknown>;
  readonly event: Record<string, unknown>;
} {
  const candidate = record(value, `Assumption event ${index.toString()}`);
  const keys = [
    "schemaVersion",
    "assumptionId",
    "action",
    "source",
    "correctedStatement",
    "replacementAssumptionId",
    "dependentWorkRefs",
    "evidenceRefs",
    "eventId",
  ] as const;
  exactKeys(candidate, keys, `Assumption event ${index.toString()}`);
  const input = {
    schemaVersion: candidate.schemaVersion,
    assumptionId: candidate.assumptionId,
    action: candidate.action,
    source: candidate.source,
    correctedStatement: candidate.correctedStatement,
    replacementAssumptionId: candidate.replacementAssumptionId,
    dependentWorkRefs: candidate.dependentWorkRefs,
    evidenceRefs: candidate.evidenceRefs,
  };
  return {
    input,
    event: { ...input, eventId: candidate.eventId },
  };
}

function observedInvalidation(value: unknown, index: number): Record<string, unknown> {
  const candidate = record(value, `Assumption invalidation ${index.toString()}`);
  exactKeys(
    candidate,
    ["schemaVersion", "manifestId", "assumptionId", "eventId", "dependentWorkRefs", "evidenceRefs"],
    `Assumption invalidation ${index.toString()}`,
  );
  return {
    schemaVersion: candidate.schemaVersion,
    manifestId: candidate.manifestId,
    assumptionId: candidate.assumptionId,
    eventId: candidate.eventId,
    dependentWorkRefs: candidate.dependentWorkRefs,
    evidenceRefs: candidate.evidenceRefs,
  };
}

function canonicalAssumptionState(value: unknown, index: number): AssumptionLedgerStateV1 {
  const candidate = record(value, `Assumption state ${index.toString()}`);
  exactKeys(
    candidate,
    [
      "schemaVersion",
      "ledgerRevisionId",
      "originAssumption",
      "status",
      "effectiveStatement",
      "replacementAssumptionId",
      "events",
      "invalidations",
    ],
    `Assumption state ${index.toString()}`,
  );
  if (!Array.isArray(candidate.events) || !Array.isArray(candidate.invalidations)) {
    return fail(
      "USER_VIEWS_INVALID_ASSUMPTION_STATE",
      "Assumption events and invalidations must be arrays.",
    );
  }

  const eventRecords = candidate.events.map(observedEvent);
  const canonical = replayAssumptionLedger(
    candidate.originAssumption,
    eventRecords.map((item) => item.input),
  );
  const invalidations = candidate.invalidations.map(observedInvalidation);
  if (
    candidate.schemaVersion !== canonical.schemaVersion ||
    candidate.ledgerRevisionId !== canonical.ledgerRevisionId ||
    candidate.status !== canonical.status ||
    candidate.effectiveStatement !== canonical.effectiveStatement ||
    candidate.replacementAssumptionId !== canonical.replacementAssumptionId ||
    JSON.stringify(eventRecords.map((item) => item.event)) !== JSON.stringify(canonical.events) ||
    JSON.stringify(invalidations) !== JSON.stringify(canonical.invalidations)
  ) {
    return fail(
      "USER_VIEWS_INVALID_ASSUMPTION_STATE",
      "Assumption state does not match canonical ledger replay.",
    );
  }
  return canonical;
}

function relationFor(nodeId: string, edge: ProductGraphEdgeV1): ProductGraphViewRelationV1 {
  const outgoing = edge.from === nodeId;
  return Object.freeze({
    edgeId: edge.id,
    kind: edge.kind,
    direction: outgoing ? "outgoing" : "incoming",
    otherNodeId: outgoing ? edge.to : edge.from,
  });
}

function projectNodes(
  graph: ProductGraphStateV1,
  kinds: readonly string[],
): readonly ProductGraphViewItemV1[] {
  return Object.freeze(
    graph.nodes
      .filter((node) => kinds.includes(node.kind))
      .map((node) =>
        Object.freeze({
          nodeId: node.id,
          kind: node.kind,
          attributes: node.attributes,
          relations: Object.freeze(
            graph.edges
              .filter((edge) => edge.from === node.id || edge.to === node.id)
              .map((edge) => relationFor(node.id, edge))
              .sort((left, right) =>
                compareText(
                  `${left.edgeId}:${left.direction}`,
                  `${right.edgeId}:${right.direction}`,
                ),
              ),
          ),
        }),
      ),
  );
}

function canonicalReferences(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort(compareText));
}

function projectAssumption(state: AssumptionLedgerStateV1): AssumptionUserViewItemV1 {
  return Object.freeze({
    assumptionId: state.originAssumption.assumptionId,
    ledgerRevisionId: state.ledgerRevisionId,
    status: state.status,
    originStatement: state.originAssumption.statement,
    effectiveStatement: state.effectiveStatement,
    source: state.originAssumption.source,
    confidence: state.originAssumption.confidence,
    impact: state.originAssumption.impact,
    reversibility: state.originAssumption.reversibility,
    affectedNodeIds: state.originAssumption.affectedNodeIds,
    replacementAssumptionId: state.replacementAssumptionId,
    dependentWorkRefs: canonicalReferences(
      state.invalidations.flatMap((item) => item.dependentWorkRefs),
    ),
    evidenceRefs: canonicalReferences(state.invalidations.flatMap((item) => item.evidenceRefs)),
  });
}

function projectionId(value: unknown): ProductGraphUserViewsV1["projectionId"] {
  return `product-graph-user-views-${createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex")}`;
}

export function buildProductGraphUserViews(
  graphRevisionValue: unknown,
  assumptionStatesValue: unknown,
): ProductGraphUserViewsV1 {
  const revision = validateProductGraphRevision(graphRevisionValue);
  const graph = validateProductGraphDomain(revision.graph);
  if (!Array.isArray(assumptionStatesValue)) {
    return fail("USER_VIEWS_INVALID_ASSUMPTION_STATE", "Assumption states must be an array.");
  }
  if (assumptionStatesValue.length > MAX_ASSUMPTIONS) {
    return fail(
      "USER_VIEWS_TOO_MANY_ASSUMPTIONS",
      `Assumption states must not exceed ${MAX_ASSUMPTIONS.toString()} items.`,
    );
  }

  const assumptions = assumptionStatesValue
    .map(canonicalAssumptionState)
    .sort((left, right) =>
      compareText(left.originAssumption.assumptionId, right.originAssumption.assumptionId),
    );
  const assumptionIds = new Set<string>();
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  for (const state of assumptions) {
    const id = state.originAssumption.assumptionId;
    if (assumptionIds.has(id)) {
      return fail("USER_VIEWS_DUPLICATE_ASSUMPTION", `Duplicate assumption state: ${id}.`);
    }
    assumptionIds.add(id);
    const stale = state.originAssumption.affectedNodeIds.find((nodeId) => !nodeIds.has(nodeId));
    if (stale !== undefined) {
      return fail(
        "USER_VIEWS_STALE_ASSUMPTION_REFERENCE",
        `Assumption ${id} references missing Product Graph node ${stale}.`,
      );
    }
  }

  const content = Object.freeze({
    schemaVersion: PRODUCT_GRAPH_USER_VIEWS_SCHEMA_VERSION,
    graphId: graph.graphId,
    graphRevision: revision.revision,
    data: projectNodes(graph, ["entity", "dataclass", "datapolicy"]),
    roles: projectNodes(graph, ["role"]),
    pages: projectNodes(graph, ["page"]),
    workflows: projectNodes(graph, ["workflow"]),
    assumptions: Object.freeze(assumptions.map(projectAssumption)),
  });

  return Object.freeze({
    ...content,
    projectionId: projectionId(content),
  });
}
