from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"{label} anchor not found")
    return text.replace(old, new, 1)


domain = Path("packages/product-graph/src/domain.ts")
s = domain.read_text()
s = replace_once(
    s,
    '  "syntheticdataset",\n] as const;',
    '  "syntheticdataset",\n  "datasource",\n  "field",\n] as const;',
    "DOMAIN_NODE_KINDS",
)

node_specs = "\n".join(
    [
        "  {",
        '    kind: "datasource",',
        '    required: { name: "string", provenanceRef: "string", sourceType: "string" },',
        "    optional: {",
        '      environment: "string",',
        '      status: "string",',
        '      verificationRefs: "string-list",',
        "    },",
        "  },",
        "  {",
        '    kind: "field",',
        '    required: { name: "string", provenanceRef: "string", valueType: "string" },',
        "    optional: {",
        '      description: "string",',
        '      status: "string",',
        '      verificationRefs: "string-list",',
        "    },",
        "  },",
    ]
)
node_anchor = "\n];\n\nexport const DOMAIN_EDGE_KIND_SPECS: readonly DomainEdgeKindSpec[] = ["
s = replace_once(s, node_anchor, "\n" + node_specs + node_anchor, "node spec closing")
domain.write_text(s)

tests = Path("packages/product-graph/src/domain.test.ts")
t = tests.read_text()
fixture = "\n".join(
    [
        "  datasource: {",
        '    name: "Orders source",',
        '    provenanceRef: "provenance:orders-source",',
        '    sourceType: "supabase-table",',
        "  },",
        "  field: {",
        '    name: "order_id",',
        '    provenanceRef: "provenance:orders-field",',
        '    valueType: "uuid",',
        "  },",
    ]
)
fixture_anchor = "\n};\n\nconst probeNodes: readonly ProductGraphNodeV1[] = DOMAIN_NODE_KINDS.map((kind) => ({"
t = replace_once(t, fixture_anchor, "\n" + fixture + fixture_anchor, "minimalAttributes closing")

focused = """  it("pins the two SG-000036 relation-endpoint metadata contracts", () => {
    expect(
      DOMAIN_NODE_KIND_SPECS.filter((spec) => ["datasource", "field"].includes(spec.kind)),
    ).toEqual([
      {
        kind: "datasource",
        required: { name: "string", provenanceRef: "string", sourceType: "string" },
        optional: {
          environment: "string",
          status: "string",
          verificationRefs: "string-list",
        },
      },
      {
        kind: "field",
        required: { name: "string", provenanceRef: "string", valueType: "string" },
        optional: {
          description: "string",
          status: "string",
          verificationRefs: "string-list",
        },
      },
    ]);
  });

  it("accepts bounded DataSource and Field evidence metadata without runtime authority", () => {
    expect(
      collectProductGraphDomainIssues(
        graphWith([
          {
            id: "source:orders",
            kind: "datasource",
            attributes: {
              ...minimalAttributes.datasource,
              environment: "development",
              status: "declared",
              verificationRefs: ["evidence:source-contract"],
            },
          },
          {
            id: "field:order-id",
            kind: "field",
            attributes: {
              ...minimalAttributes.field,
              description: "Stable order identifier",
              status: "declared",
              verificationRefs: ["evidence:field-contract"],
            },
          },
        ]),
      ),
    ).toEqual([]);
  });

  it("rejects connection and synchronization authority from DataSource metadata", () => {
    const issues = collectProductGraphDomainIssues(
      singleNode("datasource", {
        ...minimalAttributes.datasource,
        connectionString: "postgres://secret",
        synchronized: true,
      }),
    );
    expect(issues.map((issue) => [issue.code, issue.field])).toEqual([
      ["DOMAIN_UNKNOWN_FIELD", "connectionString"],
      ["DOMAIN_UNKNOWN_FIELD", "synchronized"],
    ]);
  });

  it("rejects ownership, storage, classification, and mapping authority from Field metadata", () => {
    const issues = collectProductGraphDomainIssues(
      singleNode("field", {
        ...minimalAttributes.field,
        classificationRef: "class:sensitive",
        entityRef: "entity:order",
        mappingRef: "mapping:order-id",
        storageRef: "column:orders.id",
      }),
    );
    expect(issues.map((issue) => [issue.code, issue.field])).toEqual([
      ["DOMAIN_UNKNOWN_FIELD", "classificationRef"],
      ["DOMAIN_UNKNOWN_FIELD", "entityRef"],
      ["DOMAIN_UNKNOWN_FIELD", "mappingRef"],
      ["DOMAIN_UNKNOWN_FIELD", "storageRef"],
    ]);
  });

  it("orders SG-000036 endpoint findings deterministically across node insertion order", () => {
    const broken = graphWith([
      {
        id: "probe:z",
        kind: "datasource",
        attributes: { ...minimalAttributes.datasource, connectionString: "forbidden" },
      },
      {
        id: "probe:a",
        kind: "field",
        attributes: { ...minimalAttributes.field, entityRef: "entity:order" },
      },
    ]);
    const reordered = graphWith([...broken.nodes].reverse());
    const baseline = collectProductGraphDomainIssues(broken);
    expect(baseline.map((issue) => [issue.target, issue.code, issue.field])).toEqual([
      ["probe:a", "DOMAIN_UNKNOWN_FIELD", "entityRef"],
      ["probe:z", "DOMAIN_UNKNOWN_FIELD", "connectionString"],
    ]);
    expect(collectProductGraphDomainIssues(reordered)).toEqual(baseline);
  });

"""
required_anchor = "  const requiredCases = DOMAIN_NODE_KIND_SPECS.flatMap((spec) =>\n"
t = replace_once(t, required_anchor, focused + required_anchor, "requiredCases")
tests.write_text(t)
