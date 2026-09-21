import {
  validateProductGraphState,
  type JsonObject,
  type JsonValue,
  type ProductGraphNodeV1,
  type ProductGraphStateV1,
} from "./contracts.ts";

/**
 * Deterministic Product Graph **domain** semantics — v1 node layer (IN-P02-S02-T01A).
 *
 * Structural Product Graph v1 validity is owned by `validateProductGraphState`. This module
 * composes on top of that contract and adds product-domain meaning for nodes:
 *
 * - a closed v1 vocabulary of domain node kinds;
 * - required and optional attribute fields with declared field types per kind;
 * - total deterministic validation with stable error codes.
 *
 * Issues are reported in phase order `core -> node` and, inside a phase, keyed by
 * `(target, field, code)`. The layer never mutates, reorders, or normalizes its input and never
 * consults wall-clock time, randomness, the network, a model, or object-identity iteration order.
 * Unknown kinds, unknown fields, and malformed values fail closed rather than being coerced.
 */

export const DOMAIN_SCHEMA_VERSION = 1 as const;

export const DOMAIN_VALIDATION_PHASES = ["core", "node"] as const;
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
] as const;
export type DomainNodeKind = (typeof DOMAIN_NODE_KINDS)[number];

export interface DomainNodeKindSpec {
  readonly kind: DomainNodeKind;
  readonly required: Readonly<Record<string, DomainFieldType>>;
  readonly optional: Readonly<Record<string, DomainFieldType>>;
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
];

export const DOMAIN_ISSUE_CODES = [
  "DOMAIN_CORE_CONTRACT_INVALID",
  "DOMAIN_UNKNOWN_NODE_KIND",
  "DOMAIN_UNKNOWN_FIELD",
  "DOMAIN_MISSING_REQUIRED_FIELD",
  "DOMAIN_INVALID_FIELD_TYPE",
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
}

interface DomainValidationRun {
  readonly state: ProductGraphStateV1 | null;
  readonly issues: readonly DomainIssue[];
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
