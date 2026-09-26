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

export const DOMAIN_VALIDATION_PHASES = ["core", "node", "edge", "relation", "governance"] as const;
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
  "localeconfig",
  "externaleffect",
  "designsystemrevisionref",
  "skillref",
  "explorationbranch",
  "release",
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
  "classified_as",
  "causes",
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
  /** Declared source kinds, derived from `pairs` in first-occurrence order. */
  readonly from: readonly DomainEndpointKind[];
  /** Declared target kinds, derived from `pairs` in first-occurrence order. */
  readonly to: readonly DomainEndpointKind[];
  /** Endpoint authority: every source/target combination the relation accepts. */
  readonly pairs: readonly DomainEndpointPair[];
}

/**
 * One accepted source/target combination for a relation kind. A relation name can therefore carry
 * source-specific targets (`governs` means `permission -> action` and `datapolicy -> entity`)
 * without widening a declared endpoint set into combinations the previous Grains rejected.
 */
export type DomainEndpointPair = readonly [DomainEndpointKind, DomainEndpointKind];

function edgeKindSpec(
  kind: DomainEdgeKind,
  pairs: readonly DomainEndpointPair[],
): DomainEdgeKindSpec {
  return Object.freeze({
    kind,
    from: Object.freeze([...new Set(pairs.map((pair) => pair[0]))]),
    pairs: Object.freeze(pairs.map((pair) => Object.freeze([pair[0], pair[1]] as const))),
    to: Object.freeze([...new Set(pairs.map((pair) => pair[1]))]),
  });
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
      collection: "string",
      consent: "string",
      deletion: "string",
      description: "string",
      export: "string",
      minimization: "string",
      purposes: "string-list",
      redaction: "string",
      residency: "string",
      retention: "string",
      visibility: "string",
    },
  },
  {
    kind: "localeconfig",
    required: { defaultLocale: "string", supportedLocales: "string-list" },
    optional: {
      fallbackLocale: "string",
      formattingLocale: "string",
      rtlLocales: "string-list",
      userSelectable: "boolean",
    },
  },
  {
    kind: "externaleffect",
    required: { consequence: "string", effect: "string" },
    optional: {
      confirmation: "string",
      idempotent: "boolean",
      name: "string",
      reconciliation: "string",
      target: "string",
    },
  },
  {
    kind: "designsystemrevisionref",
    required: { designSystemId: "string", revision: "string" },
    optional: { name: "string", status: "string" },
  },
  {
    kind: "skillref",
    required: { skillId: "string", version: "string" },
    optional: { name: "string", scope: "string" },
  },
  {
    kind: "explorationbranch",
    required: { baseRevision: "string", branchId: "string" },
    optional: { name: "string", status: "string" },
  },
  {
    kind: "release",
    required: { productRevision: "string", releaseId: "string" },
    optional: { name: "string", status: "string" },
  },
];

export const DOMAIN_EDGE_KIND_SPECS: readonly DomainEdgeKindSpec[] = [
  edgeKindSpec("may", [["role", "action"]]),
  edgeKindSpec("cannot", [["role", "action"]]),
  edgeKindSpec("displays", [["page", "entity"]]),
  edgeKindSpec("triggers", [["page", "action"]]),
  edgeKindSpec("starts", [["action", "workflow"]]),
  edgeKindSpec("reads", [["workflow", "entity"]]),
  edgeKindSpec("writes", [["workflow", "entity"]]),
  edgeKindSpec("requires", [
    ["requirement", "entity"],
    ["requirement", "page"],
    ["requirement", "action"],
    ["requirement", "workflow"],
    ["requirement", "datapolicy"],
  ]),
  edgeKindSpec("governs", [
    ["permission", "action"],
    ["datapolicy", "entity"],
  ]),
  edgeKindSpec("affects", [["assumption", DOMAIN_ANY_NODE_KIND]]),
  edgeKindSpec("classified_as", [["entity", "dataclass"]]),
  edgeKindSpec("causes", [
    ["workflow", "externaleffect"],
    ["action", "externaleffect"],
  ]),
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

/**
 * Classification levels whose data requires an explicit handling policy. Derived from the recorded
 * consistency defect "sensitive/secret data has no handling policy"
 * (`docs/canonical/PRODUCT_GRAPH.md` §12) applied over the closed v1 classification vocabulary.
 */
export const DOMAIN_POLICY_REQUIRED_CLASS_LEVELS = [
  "personal",
  "sensitive",
  "secret",
  "regulated",
] as const;

/** Classification levels whose data must never be continuously exported. */
export const DOMAIN_CONTINUOUS_EXPORT_BLOCKED_LEVELS = ["secret", "regulated"] as const;

/**
 * Closed v1 privacy vocabularies for the `datapolicy` node kind.
 *
 * `docs/canonical/PRODUCT_GRAPH.md` §3 (`DataPolicy`) and
 * `docs/canonical/RUNTIME_AND_SECURITY.md` §15 name consent, redaction, and the "minimum useful
 * data" rule; `docs/canonical/SUPABASE_PLATFORM.md` §17.1 requires user-visible preference/consent
 * state when applicable. The collection-source vocabulary follows the existing Dataset/DataImport
 * vocabulary for imported data.
 *
 * These values describe product behaviour only. They are never a legal or regulatory compliance
 * claim, and no jurisdiction-specific rule is encoded here.
 */
export const DOMAIN_COLLECTION_VALUES = [
  "user-provided",
  "system-generated",
  "imported",
  "derived",
] as const;
export const DOMAIN_VISIBILITY_VALUES = ["internal-only", "user-visible", "public"] as const;
export const DOMAIN_CONSENT_VALUES = ["not-required", "required", "policy-driven"] as const;
export const DOMAIN_REDACTION_VALUES = ["none", "sensitive-fields", "all-fields"] as const;
export const DOMAIN_MINIMIZATION_VALUES = ["unspecified", "required"] as const;

/** Consent declarations that require user-visible state. */
export const DOMAIN_USER_VISIBLE_CONSENT_VALUES = ["required", "policy-driven"] as const;

/** Visibility declarations that place data in front of the user or the world. */
export const DOMAIN_USER_VISIBLE_VISIBILITY_VALUES = ["user-visible", "public"] as const;

/** Visibility declarations that expose data beyond the product's user boundary. */
export const DOMAIN_PUBLIC_VISIBILITY_VALUES = ["public"] as const;

/** Redaction declarations that actually apply a redaction control. */
export const DOMAIN_REDACTION_CONTROL_VALUES = ["sensitive-fields", "all-fields"] as const;

/**
 * Accepted locale-tag subset for `localeconfig` attributes, as a source string so it is inspectable
 * and testable without constructing a regular expression.
 *
 * This is an **Ineractive validation subset**, not a claim of full BCP-47 conformance: a
 * two-or-three-letter lowercase language subtag, an optional four-letter script subtag, and an
 * optional two-letter uppercase or three-digit region subtag. Extensions, variants, and private-use
 * subtags are out of the subset and are reported rather than silently accepted.
 */
export const DOMAIN_LOCALE_TAG_PATTERN =
  "^[a-z]{2,3}(-[A-Z][a-z]{3})?(-([A-Z]{2}|[0-9]{3}))?$" as const;

const LOCALE_TAG_REGEXP = new RegExp(DOMAIN_LOCALE_TAG_PATTERN, "u");

/** Returns true when `value` is inside the documented locale-tag subset. */
export function isAcceptedLocaleTag(value: string): boolean {
  return LOCALE_TAG_REGEXP.test(value);
}

/** Locale attributes that hold a single locale tag. */
export const DOMAIN_LOCALE_REFERENCE_FIELDS = [
  "defaultLocale",
  "fallbackLocale",
  "formattingLocale",
] as const;

/** Locale attributes that hold a list of locale tags. */
export const DOMAIN_LOCALE_LIST_FIELDS = ["supportedLocales", "rtlLocales"] as const;

/**
 * Closed v1 external-effect vocabularies for the `externaleffect` node kind.
 *
 * `docs/canonical/PRODUCT_GRAPH.md` §3 defines `ExternalEffect` as webhook delivery, email/SMS send,
 * payment mutation, remote deployment, or an irreversible API action, and §12 records "destructive
 * Action lacks consequence classification" and "external effect has no consequence/reconciliation
 * policy" as consistency defects. `docs/canonical/RUNTIME_AND_SECURITY.md` §14 requires a
 * side-effect class per action, and `docs/canonical/PRODUCT_CAPABILITY_MATRIX.md` lists
 * consequence/idempotency/reconciliation as V1 CORE.
 *
 * Validation describes semantics only. No value here causes, attempts, or simulates an effect.
 */
export const DOMAIN_EFFECT_KINDS = [
  "network-request",
  "api-call",
  "message-send",
  "payment",
  "deployment",
  "authentication",
  "data-mutation",
  "file-write",
  "notification",
  "destructive-action",
] as const;

/** Effect kinds that address a remote system and therefore require an explicit target. */
export const DOMAIN_REMOTE_EFFECT_KINDS = [
  "network-request",
  "api-call",
  "message-send",
  "payment",
  "deployment",
  "authentication",
] as const;

export const DOMAIN_EFFECT_CONSEQUENCE_VALUES = [
  "informational",
  "material",
  "irreversible",
] as const;
export const DOMAIN_RECONCILIATION_VALUES = ["none", "receipt", "manual"] as const;
export const DOMAIN_CONFIRMATION_VALUES = ["not-required", "required"] as const;

/** Consequence classes that always require a reconciliation policy. */
export const DOMAIN_RECONCILIATION_REQUIRED_CONSEQUENCE_VALUES = [
  "material",
  "irreversible",
] as const;

/** Consequence classes that cannot be undone. */
export const DOMAIN_IRREVERSIBLE_CONSEQUENCE_VALUES = ["irreversible"] as const;

/** Reconciliation declarations that actually reconcile an effect. */
export const DOMAIN_RECONCILIATION_CONTROL_VALUES = ["receipt", "manual"] as const;

/** Confirmation declarations that gate an effect behind an explicit decision. */
export const DOMAIN_REQUIRED_CONFIRMATION_VALUES = ["required"] as const;

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
  { field: "collection", kind: "datapolicy", values: DOMAIN_COLLECTION_VALUES },
  { field: "consent", kind: "datapolicy", values: DOMAIN_CONSENT_VALUES },
  { field: "deletion", kind: "datapolicy", values: DOMAIN_DELETION_VALUES },
  { field: "export", kind: "datapolicy", values: DOMAIN_EXPORT_VALUES },
  { field: "minimization", kind: "datapolicy", values: DOMAIN_MINIMIZATION_VALUES },
  { field: "redaction", kind: "datapolicy", values: DOMAIN_REDACTION_VALUES },
  { field: "residency", kind: "datapolicy", values: DOMAIN_RESIDENCY_VALUES },
  { field: "retention", kind: "datapolicy", values: DOMAIN_RETENTION_VALUES },
  { field: "visibility", kind: "datapolicy", values: DOMAIN_VISIBILITY_VALUES },
  { field: "confirmation", kind: "externaleffect", values: DOMAIN_CONFIRMATION_VALUES },
  { field: "consequence", kind: "externaleffect", values: DOMAIN_EFFECT_CONSEQUENCE_VALUES },
  { field: "effect", kind: "externaleffect", values: DOMAIN_EFFECT_KINDS },
  { field: "reconciliation", kind: "externaleffect", values: DOMAIN_RECONCILIATION_VALUES },
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
  "DOMAIN_CONFLICTING_CLASSIFICATION",
  "DOMAIN_SENSITIVE_DATA_WITHOUT_POLICY",
  "DOMAIN_CLASS_POLICY_CONFLICT",
  "DOMAIN_CONSENT_WITHOUT_USER_VISIBILITY",
  "DOMAIN_MISSING_REDACTION_CONTROL",
  "DOMAIN_PUBLIC_VISIBILITY_OF_CLASSIFIED_DATA",
  "DOMAIN_INVALID_LOCALE_TAG",
  "DOMAIN_UNSUPPORTED_LOCALE_REFERENCE",
  "DOMAIN_MISSING_EFFECT_TARGET",
  "DOMAIN_MISSING_RECONCILIATION_POLICY",
  "DOMAIN_IRREVERSIBLE_EFFECT_WITHOUT_CONFIRMATION",
  "DOMAIN_CLASSIFIED_DATA_EXTERNAL_EFFECT",
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

function allowedTargetsFor(
  spec: DomainEdgeKindSpec,
  fromKind: string,
): readonly DomainEndpointKind[] {
  return spec.pairs.filter((pair) => pair[0] === fromKind).map((pair) => pair[1]);
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
  collectLocaleIssues(node, spec, issues);
  collectExternalEffectIssues(node, spec, issues);
}

function declaredFieldType(spec: DomainNodeKindSpec, field: string): DomainFieldType | null {
  return spec.required[field] ?? spec.optional[field] ?? null;
}

function passesDeclaredType(
  node: ProductGraphNodeV1,
  spec: DomainNodeKindSpec,
  field: string,
): boolean {
  const type = declaredFieldType(spec, field);
  if (type === null) return false;
  const value = ownField(node.attributes, field);
  return value !== undefined && fieldTypeMatches(value, type);
}

/**
 * External-effect consequence semantics. A remote effect must name its target; a material,
 * irreversible, or non-idempotent effect must declare how it is reconciled; and an irreversible
 * effect must require confirmation. A value that already failed its declared type or vocabulary is
 * not re-evaluated, so one offending value still yields one complaint. This function reads
 * attributes only: it performs, attempts, and simulates nothing.
 */
function collectExternalEffectIssues(
  node: ProductGraphNodeV1,
  spec: DomainNodeKindSpec,
  issues: DomainIssue[],
): void {
  if (spec.kind !== "externaleffect") return;
  const { attributes } = node;

  if (
    passesDeclaredType(node, spec, "effect") &&
    declaredValue(DOMAIN_REMOTE_EFFECT_KINDS, ownField(attributes, "effect")) &&
    ownField(attributes, "target") === undefined
  ) {
    issues.push({
      code: "DOMAIN_MISSING_EFFECT_TARGET",
      phase: "node",
      target: node.id,
      field: "target",
      message: `Node ${node.id} declares a remote effect kind without a target.`,
    });
  }

  if (!passesDeclaredType(node, spec, "consequence")) return;
  const consequence = ownField(attributes, "consequence");
  const consequenceLabel = typeof consequence === "string" ? consequence : "declared";
  const requiresReconciliation =
    declaredValue(DOMAIN_RECONCILIATION_REQUIRED_CONSEQUENCE_VALUES, consequence) ||
    ownField(attributes, "idempotent") === false;
  if (
    requiresReconciliation &&
    !declaredValue(DOMAIN_RECONCILIATION_CONTROL_VALUES, ownField(attributes, "reconciliation"))
  ) {
    issues.push({
      code: "DOMAIN_MISSING_RECONCILIATION_POLICY",
      phase: "node",
      target: node.id,
      field: "reconciliation",
      message: `Node ${node.id} declares a ${consequenceLabel} effect without a reconciliation policy.`,
    });
  }

  if (
    declaredValue(DOMAIN_IRREVERSIBLE_CONSEQUENCE_VALUES, consequence) &&
    !declaredValue(DOMAIN_REQUIRED_CONFIRMATION_VALUES, ownField(attributes, "confirmation"))
  ) {
    issues.push({
      code: "DOMAIN_IRREVERSIBLE_EFFECT_WITHOUT_CONFIRMATION",
      phase: "node",
      target: node.id,
      field: "confirmation",
      message: `Node ${node.id} declares an irreversible effect that does not require confirmation.`,
    });
  }
}

function localeListEntries(value: JsonValue): readonly string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

/**
 * Locale semantics for the `localeconfig` kind: the documented tag-subset check plus the rule that
 * every locale reference resolves to a declared supported locale. A field that already failed its
 * declared type check is not re-evaluated, so one offending value still yields one complaint. When
 * no usable supported list exists there is no membership to judge, and the reference rule is
 * skipped rather than guessed at.
 */
function collectLocaleIssues(
  node: ProductGraphNodeV1,
  spec: DomainNodeKindSpec,
  issues: DomainIssue[],
): void {
  if (spec.kind !== "localeconfig") return;

  const tagMessage = (field: string, entry: string | null): string => {
    const subject =
      entry === null ? `attribute "${field}"` : `attribute "${field}" entry "${entry}"`;
    return `Node ${node.id} ${subject} must be a locale tag of the accepted subset: language, optional script, optional region.`;
  };

  for (const field of DOMAIN_LOCALE_REFERENCE_FIELDS) {
    if (!passesDeclaredType(node, spec, field)) continue;
    const value = ownField(node.attributes, field);
    if (typeof value !== "string" || isAcceptedLocaleTag(value)) continue;
    issues.push({
      code: "DOMAIN_INVALID_LOCALE_TAG",
      phase: "node",
      target: node.id,
      field,
      message: tagMessage(field, null),
    });
  }

  for (const field of DOMAIN_LOCALE_LIST_FIELDS) {
    if (!passesDeclaredType(node, spec, field)) continue;
    for (const entry of localeListEntries(ownField(node.attributes, field) ?? null)) {
      if (isAcceptedLocaleTag(entry)) continue;
      issues.push({
        code: "DOMAIN_INVALID_LOCALE_TAG",
        phase: "node",
        target: node.id,
        field,
        message: tagMessage(field, entry),
      });
    }
  }

  const supported = localeListEntries(ownField(node.attributes, "supportedLocales") ?? null);
  const supportedIsUsable =
    supported.length > 0 &&
    passesDeclaredType(node, spec, "supportedLocales") &&
    supported.every((entry) => isAcceptedLocaleTag(entry));
  if (!supportedIsUsable) return;

  for (const field of DOMAIN_LOCALE_REFERENCE_FIELDS) {
    const value = ownField(node.attributes, field);
    if (typeof value !== "string" || !isAcceptedLocaleTag(value)) continue;
    if (supported.some((declared) => declared === value)) continue;
    issues.push({
      code: "DOMAIN_UNSUPPORTED_LOCALE_REFERENCE",
      phase: "node",
      target: node.id,
      field,
      message: `Node ${node.id} attribute "${field}" must reference a locale declared in supportedLocales.`,
    });
  }

  for (const entry of localeListEntries(ownField(node.attributes, "rtlLocales") ?? null)) {
    if (!isAcceptedLocaleTag(entry)) continue;
    if (supported.some((declared) => declared === entry)) continue;
    issues.push({
      code: "DOMAIN_UNSUPPORTED_LOCALE_REFERENCE",
      phase: "node",
      target: node.id,
      field: "rtlLocales",
      message: `Node ${node.id} attribute "rtlLocales" entry "${entry}" must be declared in supportedLocales.`,
    });
  }
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
  const targets = from === undefined ? [] : allowedTargetsFor(spec, from.kind);
  if (from !== undefined && targets.length === 0) {
    issues.push({
      code: "DOMAIN_ENDPOINT_KIND_MISMATCH",
      phase: "edge",
      target: edge.id,
      field: "from",
      message: `Edge ${edge.id} of kind "${spec.kind}" does not accept a "${from.kind}" source.`,
    });
  }

  const to = nodeById.get(edge.to);
  if (targets.length > 0 && to !== undefined && !endpointKindAllowed(targets, to.kind)) {
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

function pushDistinct(bucket: Map<string, string[]>, key: string, value: string): void {
  const existing = bucket.get(key);
  if (existing === undefined) {
    bucket.set(key, [value]);
    return;
  }
  if (!existing.includes(value)) existing.push(value);
}

function includesLevel(levels: readonly string[], level: string): boolean {
  return levels.some((entry) => entry === level);
}

function declaredValue(values: readonly string[], value: unknown): boolean {
  return typeof value === "string" && values.some((entry) => entry === value);
}

/**
 * Policy-local privacy rules. A malformed value is never evaluated here: the node phase already
 * reports an out-of-vocabulary value, so one offending value still yields one complaint.
 */
function collectPrivacyIssues(
  policy: ProductGraphNodeV1,
  governedLevels: readonly string[],
  issues: DomainIssue[],
): void {
  const consent = ownField(policy.attributes, "consent");
  const visibility = ownField(policy.attributes, "visibility");
  const redaction = ownField(policy.attributes, "redaction");
  const audit = ownField(policy.attributes, "audit");
  const minimization = ownField(policy.attributes, "minimization");

  const requiresUserVisibleState = declaredValue(DOMAIN_USER_VISIBLE_CONSENT_VALUES, consent);
  const declaresUserVisibleData = declaredValue(DOMAIN_USER_VISIBLE_VISIBILITY_VALUES, visibility);
  if (requiresUserVisibleState && !declaresUserVisibleData) {
    issues.push({
      code: "DOMAIN_CONSENT_WITHOUT_USER_VISIBILITY",
      phase: "governance",
      target: policy.id,
      field: "visibility",
      message: `Data policy ${policy.id} requires consent without declaring user-visible data.`,
    });
  }

  const requiresControl = audit === "required" || minimization === "required";
  const redactionIsDeclared =
    redaction === undefined || declaredValue(DOMAIN_REDACTION_VALUES, redaction);
  if (
    requiresControl &&
    redactionIsDeclared &&
    !declaredValue(DOMAIN_REDACTION_CONTROL_VALUES, redaction)
  ) {
    issues.push({
      code: "DOMAIN_MISSING_REDACTION_CONTROL",
      phase: "governance",
      target: policy.id,
      field: "redaction",
      message: `Data policy ${policy.id} requires audit or minimization without a redaction control.`,
    });
  }

  if (declaredValue(DOMAIN_PUBLIC_VISIBILITY_VALUES, visibility)) {
    const exposed = governedLevels.filter((level) =>
      includesLevel(DOMAIN_POLICY_REQUIRED_CLASS_LEVELS, level),
    );
    if (exposed.length > 0) {
      issues.push({
        code: "DOMAIN_PUBLIC_VISIBILITY_OF_CLASSIFIED_DATA",
        phase: "governance",
        target: policy.id,
        field: "visibility",
        message: `Data policy ${policy.id} declares public visibility while governing ${exposed.join(
          ", ",
        )} data.`,
      });
    }
  }
}

/**
 * Cross-node data-governance rules. These compose node semantics (the classification level of a
 * `dataclass`) with relations (`classified_as` and `governs`), so they are reported in the
 * `governance` phase after `relation`. Only structurally admissible relations participate: an edge
 * that already failed endpoint validation cannot make an entity governed. Core validation sorts
 * nodes and edges by id before this phase runs, so every reported order is deterministic.
 */
function collectGovernanceIssues(graph: ProductGraphStateV1, issues: DomainIssue[]): void {
  const kindById = new Map<string, string>();
  const levelByClassId = new Map<string, string>();
  for (const node of graph.nodes) {
    kindById.set(node.id, node.kind);
    if (node.kind !== "dataclass") continue;
    const level = ownField(node.attributes, "level");
    if (typeof level === "string" && level.trim().length > 0) levelByClassId.set(node.id, level);
  }

  const levelsByEntity = new Map<string, string[]>();
  const policiesByEntity = new Map<string, string[]>();
  const entitiesByPolicy = new Map<string, string[]>();

  for (const edge of graph.edges) {
    if (edge.kind === "classified_as") {
      if (kindById.get(edge.from) !== "entity") continue;
      const level = levelByClassId.get(edge.to);
      if (level !== undefined) pushDistinct(levelsByEntity, edge.from, level);
      continue;
    }
    if (edge.kind === "governs") {
      if (kindById.get(edge.from) !== "datapolicy" || kindById.get(edge.to) !== "entity") continue;
      pushDistinct(policiesByEntity, edge.to, edge.from);
      pushDistinct(entitiesByPolicy, edge.from, edge.to);
    }
  }

  for (const [entityId, levels] of levelsByEntity) {
    if (levels.length > 1) {
      issues.push({
        code: "DOMAIN_CONFLICTING_CLASSIFICATION",
        phase: "governance",
        target: entityId,
        field: null,
        message: `Entity ${entityId} is classified as more than one level: ${levels.join(", ")}.`,
      });
    }
    const requiresPolicy = levels.some((level) =>
      includesLevel(DOMAIN_POLICY_REQUIRED_CLASS_LEVELS, level),
    );
    if (requiresPolicy && (policiesByEntity.get(entityId) ?? []).length === 0) {
      issues.push({
        code: "DOMAIN_SENSITIVE_DATA_WITHOUT_POLICY",
        phase: "governance",
        target: entityId,
        field: null,
        message: `Entity ${entityId} is classified as ${levels.join(
          ", ",
        )} but no data policy governs it.`,
      });
    }
  }

  const policyById = new Map<string, ProductGraphNodeV1>();
  const effectById = new Map<string, ProductGraphNodeV1>();
  for (const node of graph.nodes) {
    if (node.kind === "datapolicy") policyById.set(node.id, node);
    if (node.kind === "externaleffect") effectById.set(node.id, node);
  }

  const levelsByPolicy = new Map<string, string[]>();
  for (const [policyId, entityIds] of entitiesByPolicy) {
    for (const entityId of entityIds) {
      for (const level of levelsByEntity.get(entityId) ?? []) {
        pushDistinct(levelsByPolicy, policyId, level);
      }
    }
  }

  const writtenEntitiesBySource = new Map<string, string[]>();
  const effectSources = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (
      edge.kind === "writes" &&
      kindById.get(edge.from) === "workflow" &&
      kindById.get(edge.to) === "entity"
    ) {
      pushDistinct(writtenEntitiesBySource, edge.from, edge.to);
      continue;
    }
    if (edge.kind === "causes" && kindById.get(edge.to) === "externaleffect") {
      const sourceKind = kindById.get(edge.from);
      if (sourceKind === "workflow" || sourceKind === "action") {
        pushDistinct(effectSources, edge.to, edge.from);
      }
    }
  }

  for (const [policyId, entityIds] of entitiesByPolicy) {
    const policy = policyById.get(policyId);
    if (policy === undefined || ownField(policy.attributes, "export") !== "continuous") continue;
    const blocked = [
      ...new Set(
        entityIds
          .flatMap((entityId) => levelsByEntity.get(entityId) ?? [])
          .filter((level) => includesLevel(DOMAIN_CONTINUOUS_EXPORT_BLOCKED_LEVELS, level)),
      ),
    ];
    if (blocked.length === 0) continue;
    issues.push({
      code: "DOMAIN_CLASS_POLICY_CONFLICT",
      phase: "governance",
      target: policyId,
      field: "export",
      message: `Data policy ${policyId} allows continuous export while governing ${blocked.join(
        ", ",
      )} data.`,
    });
  }

  for (const policy of policyById.values()) {
    collectPrivacyIssues(policy, levelsByPolicy.get(policy.id) ?? [], issues);
  }

  for (const [effectId, sourceIds] of effectSources) {
    const effect = effectById.get(effectId);
    if (effect === undefined) continue;
    if (
      declaredValue(
        DOMAIN_REQUIRED_CONFIRMATION_VALUES,
        ownField(effect.attributes, "confirmation"),
      )
    ) {
      continue;
    }
    const classifiedLevels = [
      ...new Set(
        sourceIds
          .flatMap((sourceId) => writtenEntitiesBySource.get(sourceId) ?? [])
          .flatMap((entityId) => levelsByEntity.get(entityId) ?? [])
          .filter((level) => includesLevel(DOMAIN_POLICY_REQUIRED_CLASS_LEVELS, level)),
      ),
    ];
    if (classifiedLevels.length === 0) continue;
    issues.push({
      code: "DOMAIN_CLASSIFIED_DATA_EXTERNAL_EFFECT",
      phase: "governance",
      target: effectId,
      field: "confirmation",
      message: `External effect ${effectId} is caused by a source that writes ${classifiedLevels.join(
        ", ",
      )} data without requiring confirmation.`,
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
  collectGovernanceIssues(graph, issues);

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
