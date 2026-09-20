import type { PrototypeEdge, PrototypeGraphState, PrototypeNode } from "./model.ts";

export interface PrototypeGraphSlice {
  readonly graphId: string;
  readonly nodeIds: readonly string[];
  readonly edgeIds: readonly string[];
}

export interface PrototypeQuerySession {
  getNode(nodeId: string): PrototypeNode | null;
  outgoingEdges(nodeId: string): readonly PrototypeEdge[];
  sliceFrom(nodeId: string): PrototypeGraphSlice;
}

export interface PrototypePersistenceAdapter<Persisted> {
  readonly id: "structured-document" | "normalized-relational";
  persist(state: PrototypeGraphState): Persisted;
  restore(persisted: Persisted): PrototypeGraphState;
  serialize(persisted: Persisted): string;
  open(persisted: Persisted): PrototypeQuerySession;
}
