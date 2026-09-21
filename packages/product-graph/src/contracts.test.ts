import { describe, expect, it } from "vitest";

import {
  createProductGraphRevision,
  openProductGraphRevision,
  parseProductGraphRevision,
  serializeProductGraphRevision,
  validateProductGraphRevision,
  validateProductGraphState,
  type ProductGraphStateV1,
} from "./index.ts";

const graph: ProductGraphStateV1 = {
  schemaVersion: 1,
  graphId: "graph:demo",
  nodes: [
    { id: "page:home", kind: "page", attributes: { z: 2, a: { y: 2, x: 1 } } },
    { id: "entity:item", kind: "entity", attributes: { labels: ["a", "b"] } },
  ],
  edges: [
    {
      id: "edge:home-item",
      kind: "displays",
      from: "page:home",
      to: "entity:item",
      attributes: {},
    },
  ],
};

describe("Product Graph v1 contracts", () => {
  it("creates immutable canonical revisions with deterministic round trips", () => {
    const document = createProductGraphRevision(graph);
    const restored = parseProductGraphRevision(serializeProductGraphRevision(document));

    expect(restored).toEqual(document);
    expect(Object.isFrozen(restored)).toBe(true);
    expect(Object.isFrozen(restored.graph.nodes)).toBe(true);
  });

  it("is stable across node, edge, and JSON object key insertion order", () => {
    const reordered: ProductGraphStateV1 = {
      ...graph,
      nodes: [
        { id: "entity:item", kind: "entity", attributes: { labels: ["a", "b"] } },
        { id: "page:home", kind: "page", attributes: { a: { x: 1, y: 2 }, z: 2 } },
      ],
      edges: [...graph.edges].reverse(),
    };

    expect(createProductGraphRevision(reordered).revision).toBe(
      createProductGraphRevision(graph).revision,
    );
  });

  it("keeps JSON array order semantic", () => {
    const changed: ProductGraphStateV1 = {
      ...graph,
      nodes: [
        graph.nodes[0]!,
        { id: "entity:item", kind: "entity", attributes: { labels: ["b", "a"] } },
      ],
    };

    expect(createProductGraphRevision(changed).revision).not.toBe(
      createProductGraphRevision(graph).revision,
    );
  });

  it("rejects duplicate node and edge identities", () => {
    expect(() => validateProductGraphState({ ...graph, nodes: [graph.nodes[0], graph.nodes[0]] }))
      .toThrow(/Duplicate Product Graph node id/);
    expect(() => validateProductGraphState({ ...graph, edges: [graph.edges[0], graph.edges[0]] }))
      .toThrow(/Duplicate Product Graph edge id/);
  });

  it("rejects dangling edge endpoints", () => {
    expect(() =>
      validateProductGraphState({
        ...graph,
        edges: [{ ...graph.edges[0]!, to: "entity:missing" }],
      }),
    ).toThrow(/references a missing node/);
  });

  it.each([
    [{ ...graph, schemaVersion: 2 }, /schemaVersion must be 1/],
    [{ ...graph, graphId: " " }, /graphId must be a non-empty string/],
    [{ ...graph, nodes: [{ ...graph.nodes[0]!, id: " " }] }, /node id must be/],
    [{ ...graph, nodes: [{ ...graph.nodes[0]!, kind: "" }] }, /node kind must be/],
    [{ ...graph, edges: [{ ...graph.edges[0]!, id: "" }] }, /edge id must be/],
    [{ ...graph, edges: [{ ...graph.edges[0]!, kind: " " }] }, /edge kind must be/],
    [{ ...graph, edges: [{ ...graph.edges[0]!, from: " " }] }, /edge from must be/],
    [{ ...graph, edges: [{ ...graph.edges[0]!, to: "" }] }, /edge to must be/],
  ])("rejects malformed graph identity contracts", (candidate, expected) => {
    expect(() => validateProductGraphState(candidate)).toThrow(expected);
  });

  it("rejects non-finite JSON values", () => {
    expect(() =>
      validateProductGraphState({
        ...graph,
        nodes: [{ ...graph.nodes[0]!, attributes: { bad: Number.POSITIVE_INFINITY } }],
      }),
    ).toThrow(/numbers must be finite/);
  });

  it("rejects revision tampering and invalid representation", () => {
    const document = createProductGraphRevision(graph);
    expect(() =>
      validateProductGraphRevision({ ...document, revision: `sha256:${"0".repeat(64)}` }),
    ).toThrow(/does not match canonical graph state/);
    expect(() => validateProductGraphRevision({ ...document, representation: "relational" }))
      .toThrow(/structured-document-v1/);
  });

  it("provides deterministic node, outgoing-edge, and one-hop slice queries", () => {
    const query = openProductGraphRevision(createProductGraphRevision(graph));

    expect(query.getNode("page:home")?.kind).toBe("page");
    expect(query.outgoingEdges("page:home").map((edge) => edge.id)).toEqual(["edge:home-item"]);
    expect(query.sliceFrom("page:home")).toEqual({
      graphId: "graph:demo",
      nodeIds: ["entity:item", "page:home"],
      edgeIds: ["edge:home-item"],
    });
    expect(query.sliceFrom("missing")).toEqual({
      graphId: "graph:demo",
      nodeIds: [],
      edgeIds: [],
    });
  });
});
