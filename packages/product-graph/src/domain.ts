import {
  validateProductGraphState,
  type JsonObject,
  type JsonValue,
  type ProductGraphEdgeV1,
  type ProductGraphNodeV1,
  type ProductGraphStateV1,
} from "./contracts.ts";

/**
 * Deterministic Product Graph **domain** semantics (IN-P02-S02-T01A node layer, IN-P02-S02-T01B
 * edge and relation layer).
 *
 * Structural Product Graph v1 validity is owned by `validateProductGraphState`. This module
 * composes on top of that contract and adds product-domain meaning:
 *
 * - a closed v1 vocabulary of domain node kinds;
 * - required and optional attribute fields with declared field types per kind;
 * - closed v1 data-classification and data-lifecycle vocabularies for the data-governance kinds;
 * - a closed v1 vocabulary of domain edge kinds with explicit endpoint-kind compatibility;
 * - relation-level rules: self-references, duplicate relations, and authorization conflicts;
 * - total deterministic validation with stable error codes.
 *
 * Issues are reported in phase order `core -> node -> edge -> relation` and, inside a phase, keyed
 * by
 * `(target, field, code)`. The layer never mutates, reorders, or normalizes its input and never
 * consults wall-clock time, randomness, the network, a model, or object-identity iteration order.
 * Unknown kinds, unknown fields, and malformed values fail closed rather than being coerced.
 * A value outside a declared classification or lifecycle vocabulary is reported as
 * `DOMAIN_INVALID_ENUM_VALUE`, and a bounded-retention policy without an accepted deletion path is
 * additionally reported as `DOMAIN_LIFECYCLE_CONTRADICTION`.
 */

export const DOMAIN_SCHEMA_VERSION = 1 as const;

export const DOMAIN_VALIDATION_PHASES = ["core", "node", "edge", "relation"] as const;
export type DomainValidationPhase = (typeof DOMAIN_VALIDATION_PHASES)[number];

export const DOMAIN_FIELD_TYPES = ["string", "string-list", "number", "boolean"] as const;
export type DomainFieldType = (typeof DOMAIN_FIELD_TYPES)[number];

export const DOMAIN_NODE_KINDS = [
  "persona",
  "role",
  "entity",
  "page",
  "action",
  "workflow",
  "permission",
  "assumption",
  "requirement",
  "dataclass",
  "datapolicy",
] as const;
export type DomainNodeKind = (typeof DOMAIN_NODE_KINDS)[number];

export const DOMAIN_EDGE_KINDS = [
  "may",
  "cannot",
  "displays",
  "triggers",
  "starts",
  "reads",
  "writes",
  "requires",
  "governs",
  "affects",
] as const;
export type DomainEdgeKind = (typeof DOMAIN_EDGE_KINDS)[number];

/**
 * Explicit wildcard endpoint for canonical `ProductNode` targets. Only the `affects` relation uses
 * it, because an assumption may point at any domain node; pointing at itself is still rejected by
 * the self-reference rule.
 */
export const DOMAIN_ANY_NODE_KIND = "any-domain-node" as const;

export type DomainEndpointKind = DomainNodeKind | typeof DOMAIN_ANY_NODE_KIND;

export interface DomainNodeKindSpec {
  readonly kind: DomainNodeKind;
  readonly required: Readonly<Record<string, DomainFieldType>>;
  readonly optional: Readonly<Record<string, DomainFieldType>>;
}

export interface DomainEdgeKindSpec {
  readonly kind: DomainEdgeKind;
  readonly from: readonly DomainEndpointKind[];
  readonly to: readonly DomainEndpointKind[];
}

export const DOMAIN_NODE_KIND_SPECS: readonly DomainNodeKindSpec[] = [
  {
    kind: "persona",
    required: { goals: "string-list", name: "string" },
    optional: { context: "string" },
  },
  { kind: "role", required: { name: "string" }, optional: { description: "string" } },
  {
    kind: "entity",
    required: { name: "string" },
    optional: { description: "string", tenantOwned: "boolean" },
  },
  {
    kind: "page",
    required: { name: "string" },
    optional: { description: "string", route: "string" },
  },
  {
    kind: "action",
    required: { name: "string" },
    optional: { consequence: "string", description: "string" },
  },
  {
    kind: "workflow",
    required: { name: "string", steps: "string-list" },
    optional: { description: "string" },
  },
  {
    kind: "permission",
    required: { effect: "string", name: "string" },
    optional: { description: "string" },
  },
  {
    kind: "assumption",
    required: { confidence: "number", statement: "string" },
    optional: { impact: "string", status: "string" },
  },
  { kind: "requirement", required: { statement: "string" }, optional: { verification: "string" } },
  {
    kind: "dataclass",
    required: { level: "string", name: "string" },
    optional: { description: "string" },
  },
  {
    kind: "datapolicy",
    required: { name: "string" },
    optional: {
      audit: "string",
      deletion: "string",
      description: "string",
      export: "string",
      residency: "string",
      retention: "string",
    },
  },
];

export const DOMAIN_EDGE_KIND_SPECS: readonly DomainEdgeKindSpec[] = [
  { kind: "may", from: ["role"], to: ["action"] },
  { kind: "cannot", from: ["role"], to: ["action"] },
  { kind: "displays", from: ["page"], to: ["entity"] },
  { kind: "triggers", from: ["page"], to: ["action"] },
  { kind: "starts", from: ["action"], to: ["workflow"] },
  { kind: "reads", from: ["workflow"], to: ["entity"] },
  { kind: "writes", from: ["workflow"], to: ["entity"] },
  { kind: "requires", from: ["requirement"], to: ["entity", "page", "action", "workflow"] },
  { kind: "governs", from: ["permission"], to: ["action"] },
  { kind: "affects", from: ["assumption"], to: [DOMAIN_ANY_NODE_KIND] },
];

/**
 * Closed v1 data-classification vocabulary.
 *
 * `docs/canonical/PRODUCT_GRAPH.md` §3 (`DataClass`) is the Product Graph authority and lists
 * `public`, `internal`, `personal`, `sensitive`, `secret`, and `regulated`. The parallel privacy
 * vocabulary in `docs/canonical/RUNTIME_AND_SECURITY.md` §15 is mapped onto these values rather
 * than introduced as a second competing taxonomy. Values are declared in sensitivity order.
 *
 * Declaring a class is a product-semantics statement and is never a legal or regulatory
 * compliance claim (`docs/canonical/GENERATED_PRODUCT_CONTRACT.md` §9).
 */
export const DOMAIN_DATA_CLASS_LEVELS = [
  "public",
  "internal",
  "personal",
  "sensitive",
  "secret",
  "regulated",
] as const;
export type DomainDataClassLevel = (typeof DOMAIN_DATA_CLASS_LEVELS)[number];

/** Closed v1 data-lifecycle vocabularies, derived from the `DataPolicy` definition in §3. */
export const DOMAIN_RETENTION_VALUES = ["bounded", "indefinite"] as const;
export const DOMAIN_DELETION_VALUES = ["none", "soft", "hard", "scheduled"] as const;
export const DOMAIN_EXPORT_VALUES = ["none", "on-request", "continuous"] as const;
export const DOMAIN_AUDIT_VALUES = ["none", "required"] as const;
export const DOMAIN_RESIDENCY_VALUES = ["unspecified", "single-region", "multi-region"] as const;

/** Declares that one node attribute is constrained to a closed vocabulary. */
export interface DomainEnumFieldSpec {
  readonly kind: DomainNodeKind;
  readonly field: string;
  readonly values: readonly string[];
}

/**
 * Data-driven enum constraint table. Every entry is checked after the declared field type, so a
 * value of the wrong type is reported once as `DOMAIN_INVALID_FIELD_TYPE` and a value of the right
 * type outside the vocabulary is reported once as `DOMAIN_INVALID_ENUM_VALUE`.
 */
export const DOMAIN_ENUM_FIELDS: readonly DomainEnumFieldSpec[] = [
  { field: "level", kind: "dataclass", values: DOMAIN_DATA_CLASS_LEVELS },
  { field: "audit", kind: "datapolicy", values: DOMAIN_AUDIT_VALUES },
  { field: "deletion", kind: "datapolicy", values: DOMAIN_DELETION_VALUES },
  { field: "export", kind: "datapolicy", values: DOMAIN_EXPORT_VALUES },
  { field: "residency", kind: "datapolicy", values: DOMAIN_RESIDENCY_VALUES },
  { field: "retention", kind: "datapolicy", values: DOMAIN_RETENTION_VALUES },
];

export const DOMAIN_ISSUE_CODES = [
  "DOMAIN_CORE_CONTRACT_INVALID",
  "DOMAIN_UNKNOWN_NODE_KIND",
  "DOMAIN_UNKNOWN_FIELD",
  "DOMAIN_MISSING_REQUIRED_FIELD",
  "DOMAIN_INVALID_FIELD_TYPE",
  "DOMAIN_INVALID_ENUM_VALUE",
  "DOMAIN_LIFECYCLE_CONTRADICTION",
  "DOMAIN_UNKNOWN_EDGE_KIND",
  "DOMAIN_ENDPOINT_KIND_MISMATCH",
  "DOMAIN_SELF_REFERENCE",
  "DOMAIN_DUPLICATE_RELATION",
  "DOMAIN_CONFLICTING_AUTHORIZATION",
] as const;
export type DomainIssueCode = (typeof DOMAIN_ISSUE_CODES)[number];

export interface DomainIssue {
  readonly code: DomainIssueCode;
  readonly phase: DomainValidationPhase;
  readonly target: string;
  readonly field: string | null;
  readonly message: string;
}

/** Thrown by `validateProductGraphDomain`; carries the exact ordered issue list it reports. */
export class DomainValidationError extends Error {
  readonly issues: readonly DomainIssue[];

  constructor(issues: readonly DomainIssue[]) {
    super(
      `Product Graph domain validation failed with ${issues.length.toString()} issue(s): ${issues
        .map((issue) => issue.code)
        .join(", ")}`,
    );
    this.name = "DomainValidationError";
    this.issues = issues;
  }
}

const NODE_KIND_SPECS: ReadonlyMap<string, DomainNodeKindSpec> = new Map(
  DOMAIN_NODE_KIND_SPECS.map((spec) => [spec.kind, spec]),
);
const EDGE_KIND_SPECS: ReadonlyMap<string, DomainEdgeKindSpec> = new Map(
  DOMAIN_EDGE_KIND_SPECS.map((spec) => [spec.kind, spec]),
);
const ENUM_FIELDS_BY_KIND: ReadonlyMap<string, readonly DomainEnumFieldSpec[]> = new Map(
  [...new Set(DOMAIN_ENUM_FIELDS.map((spec) => spec.kind))].map((kind) => [
    kind,
    DOMAIN_ENUM_FIELDS.filter((spec) => spec.kind === kind),
  ]),
);
const KEY_SEPARATOR = "\u0000";

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function ownField(attributes: JsonObject, field: string): JsonValue | undefined {
  return Object.hasOwn(attributes, field) ? attributes[field] : undefined;
}

function isJsonArray(value: JsonValue): value is readonly JsonValue[] {
  return Array.isArray(value);
}

function fieldTypeMatches(value: JsonValue, type: DomainFieldType): boolean {
  if (type === "string") return typeof value === "string" && value.trim().length > 0;
  if (type === "string-list") {
    return (
      isJsonArray(value) &&
      value.length > 0 &&
      value.every((item) => typeof item === "string" && item.trim().length > 0)
    );
  }
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === "boolean";
}

function endpointKindAllowed(allowed: readonly DomainEndpointKind[], kind: string): boolean {
  return allowed.some((entry) => entry === kind || entry === DOMAIN_ANY_NODE_KIND);
}

function relationKey(edge: ProductGraphEdgeV1): string {
  return [edge.kind, edge.from, edge.to].join(KEY_SEPARATOR);
}

function authorizationKey(edge: ProductGraphEdgeV1): string {
  return [edge.from, edge.to].join(KEY_SEPARATOR);
}

function issueSortKey(issue: DomainIssue): string {
  const phase = DOMAIN_VALIDATION_PHASES.indexOf(issue.phase).toString().padStart(2, "0");
  return [phase, issue.target, issue.field ?? "", issue.code].join(KEY_SEPARATOR);
}

function collectNodeIssues(node: ProductGraphNodeV1, issues: DomainIssue[]): void {
  const spec = NODE_KIND_SPECS.get(node.kind);
  if (spec === undefined) {
    issues.push({
      code: "DOMAIN_UNKNOWN_NODE_KIND",
      phase: "node",
      target: node.id,
      field: "kind",
      message: `Node ${node.id} has unknown domain kind "${node.kind}".`,
    });
    return;
  }

  for (const field of Object.keys(node.attributes).sort(compareText)) {
    if (Object.hasOwn(spec.required, field) || Object.hasOwn(spec.optional, field)) continue;
    issues.push({
      code: "DOMAIN_UNKNOWN_FIELD",
      phase: "node",
      target: node.id,
      field,
      message: `Node ${node.id} of kind "${spec.kind}" does not allow attribute "${field}".`,
    });
  }

  for (const [field, type] of Object.entries(spec.required)) {
    const value = ownField(node.attributes, field);
    if (value === undefined) {
      issues.push({
        code: "DOMAIN_MISSING_REQUIRED_FIELD",
        phase: "node",
        target: node.id,
        field,
        message: `Node ${node.id} of kind "${spec.kind}" requires attribute "${field}".`,
      });
    } else if (!fieldTypeMatches(value, type)) {
      issues.push({
        code: "DOMAIN_INVALID_FIELD_TYPE",
        phase: "node",
        target: node.id,
        field,
        message: `Node ${node.id} attribute "${field}" must be a non-empty ${type} value.`,
      });
    }
  }

  for (const [field, type] of Object.entries(spec.optional)) {
    const value = ownField(node.attributes, field);
    if (value !== undefined && !fieldTypeMatches(value, type)) {
      issues.push({
        code: "DOMAIN_INVALID_FIELD_TYPE",
        phase: "node",
        target: node.id,
        field,
        message: `Node ${node.id} attribute "${field}" must be a non-empty ${type} value.`,
      });
    }
  }

  for (const enumField of ENUM_FIELDS_BY_KIND.get(spec.kind) ?? []) {
    const value = ownField(node.attributes, enumField.field);
    if (typeof value !== "string" || value.trim().length === 0) continue;
    if (enumField.values.includes(value)) continue;
    issues.push({
      code: "DOMAIN_INVALID_ENUM_VALUE",
      phase: "node",
      target: node.id,
      field: enumField.field,
      message: `Node ${node.id} attribute "${enumField.field}" must be one of: ${enumField.values.join(
        ", ",
      )}.`,
    });
  }

  collectLifecycleIssues(node, issues);
}

/**
 * Policy-local lifecycle semantics. Bounded retention is a promise to stop holding the data, so it
 * is only coherent together with an accepted deletion path: a policy that declares bounded
 * retention while declaring no deletion path, or an explicit `none`, is reported here and never
 * silently accepted. A malformed deletion value is reported by the field-type and vocabulary checks
 * instead, so one offending value never produces two identical complaints. The check is node-local
 * and needs no edge, so it stays in the `node` phase.
 */
function collectLifecycleIssues(node: ProductGraphNodeV1, issues: DomainIssue[]): void {
  if (node.kind !== "datapolicy") return;
  if (ownField(node.attributes, "retention") !== "bounded") return;

  const deletion = ownField(node.attributes, "deletion");
  if (deletion !== undefined && deletion !== "none") return;

  issues.push({
    code: "DOMAIN_LIFECYCLE_CONTRADICTION",
    phase: "node",
    target: node.id,
    field: "deletion",
    message: `Node ${node.id} declares bounded retention without an accepted deletion path; bounded retention requires deletion "soft", "hard", or "scheduled".`,
  });
}

interface DomainValidationRun {
  readonly state: ProductGraphStateV1 | null;
  readonly issues: readonly DomainIssue[];
}

function collectEdgeIssues(
  edge: ProductGraphEdgeV1,
  nodeById: ReadonlyMap<string, ProductGraphNodeV1>,
  issues: DomainIssue[],
): void {
  if (edge.from === edge.to) {
    issues.push({
      code: "DOMAIN_SELF_REFERENCE",
      phase: "edge",
      target: edge.id,
      field: null,
      message: `Edge ${edge.id} must not reference the same node at both endpoints.`,
    });
  }

  const spec = EDGE_KIND_SPECS.get(edge.kind);
  if (spec === undefined) {
    issues.push({
      code: "DOMAIN_UNKNOWN_EDGE_KIND",
      phase: "edge",
      target: edge.id,
      field: "kind",
      message: `Edge ${edge.id} has unknown domain kind "${edge.kind}".`,
    });
    return;
  }

  // Core validation already rejects dangling endpoints, so an unresolved endpoint here can only be
  // an impossible state; it is skipped rather than reported a second time.
  const from = nodeById.get(edge.from);
  if (from !== undefined && !endpointKindAllowed(spec.from, from.kind)) {
    issues.push({
      code: "DOMAIN_ENDPOINT_KIND_MISMATCH",
      phase: "edge",
      target: edge.id,
      field: "from",
      message: `Edge ${edge.id} of kind "${spec.kind}" does not accept a "${from.kind}" source.`,
    });
  }

  const to = nodeById.get(edge.to);
  if (to !== undefined && !endpointKindAllowed(spec.to, to.kind)) {
    issues.push({
      code: "DOMAIN_ENDPOINT_KIND_MISMATCH",
      phase: "edge",
      target: edge.id,
      field: "to",
      message: `Edge ${edge.id} of kind "${spec.kind}" does not accept a "${to.kind}" target.`,
    });
  }
}

function collectRelationIssues(graph: ProductGraphStateV1, issues: DomainIssue[]): void {
  const firstEdgeByRelation = new Map<string, string>();
  const grantByAuthorization = new Map<string, string>();
  const denialByAuthorization = new Map<string, string>();

  for (const edge of graph.edges) {
    const relation = relationKey(edge);
    const duplicateOf = firstEdgeByRelation.get(relation);
    if (duplicateOf === undefined) {
      firstEdgeByRelation.set(relation, edge.id);
    } else {
      issues.push({
        code: "DOMAIN_DUPLICATE_RELATION",
        phase: "relation",
        target: edge.id,
        field: null,
        message: `Edge ${edge.id} duplicates the "${edge.kind}" relation already declared by ${duplicateOf}.`,
      });
    }

    const authorization = authorizationKey(edge);
    if (edge.kind === "may") grantByAuthorization.set(authorization, edge.id);
    if (edge.kind === "cannot") denialByAuthorization.set(authorization, edge.id);
  }

  for (const [authorization, grantId] of grantByAuthorization) {
    const denialId = denialByAuthorization.get(authorization);
    if (denialId === undefined) continue;
    issues.push({
      code: "DOMAIN_CONFLICTING_AUTHORIZATION",
      phase: "relation",
      target: grantId,
      field: null,
      message: `Edge ${grantId} grants an action that edge ${denialId} denies for the same role.`,
    });
    issues.push({
      code: "DOMAIN_CONFLICTING_AUTHORIZATION",
      phase: "relation",
      target: denialId,
      field: null,
      message: `Edge ${denialId} denies an action that edge ${grantId} grants for the same role.`,
    });
  }
}

function runDomainValidation(value: unknown): DomainValidationRun {
  let graph: ProductGraphStateV1;
  try {
    graph = validateProductGraphState(value);
  } catch (error) {
    return {
      state: null,
      issues: [
        {
          code: "DOMAIN_CORE_CONTRACT_INVALID",
          phase: "core",
          target: "",
          field: null,
          message: error instanceof Error ? error.message : "Product Graph state is invalid.",
        },
      ],
    };
  }

  const issues: DomainIssue[] = [];
  for (const node of graph.nodes) collectNodeIssues(node, issues);

  const nodeById = new Map<string, ProductGraphNodeV1>();
  for (const node of graph.nodes) nodeById.set(node.id, node);
  for (const edge of graph.edges) collectEdgeIssues(edge, nodeById, issues);
  collectRelationIssues(graph, issues);

  return {
    state: graph,
    issues: issues.sort((left, right) => compareText(issueSortKey(left), issueSortKey(right))),
  };
}

/**
 * Collects every domain issue for one Product Graph state without throwing, in deterministic
 * order. Core v1 structural validity is a prerequisite: when it fails, the only reported issue is
 * `DOMAIN_CORE_CONTRACT_INVALID`, carrying the core contract's own message.
 */
export function collectProductGraphDomainIssues(value: unknown): readonly DomainIssue[] {
  return Object.freeze([...runDomainValidation(value).issues]);
}

/**
 * Returns the canonical, frozen Product Graph state when it satisfies the v1 domain node contract
 * and throws `DomainValidationError` otherwise. The input is never mutated.
 */
export function validateProductGraphDomain(value: unknown): ProductGraphStateV1 {
  const run = runDomainValidation(value);
  if (run.state === null || run.issues.length > 0) {
    throw new DomainValidationError(run.issues);
  }
  return run.state;
}
