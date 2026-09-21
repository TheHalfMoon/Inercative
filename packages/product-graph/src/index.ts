export {
  PRODUCT_GRAPH_MAX_JSON_DEPTH,
  PRODUCT_GRAPH_REPRESENTATION,
  PRODUCT_GRAPH_SCHEMA_VERSION,
  canonicalProductGraphJson,
  createProductGraphRevision,
  openProductGraphRevision,
  parseProductGraphRevision,
  semanticProductGraphRevision,
  serializeProductGraphRevision,
  validateProductGraphRevision,
  validateProductGraphState,
} from "./contracts.ts";

export {
  DOMAIN_FIELD_TYPES,
  DOMAIN_ISSUE_CODES,
  DOMAIN_NODE_KINDS,
  DOMAIN_NODE_KIND_SPECS,
  DOMAIN_SCHEMA_VERSION,
  DOMAIN_VALIDATION_PHASES,
  DomainValidationError,
  collectProductGraphDomainIssues,
  validateProductGraphDomain,
} from "./domain.ts";

export type {
  JsonObject,
  JsonScalar,
  JsonValue,
  ProductGraphEdgeV1,
  ProductGraphNodeV1,
  ProductGraphQueryV1,
  ProductGraphRevision,
  ProductGraphRevisionDocumentV1,
  ProductGraphSliceV1,
  ProductGraphStateV1,
} from "./contracts.ts";

export type {
  DomainFieldType,
  DomainIssue,
  DomainIssueCode,
  DomainNodeKind,
  DomainNodeKindSpec,
  DomainValidationPhase,
} from "./domain.ts";
