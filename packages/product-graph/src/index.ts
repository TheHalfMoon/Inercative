export {
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
