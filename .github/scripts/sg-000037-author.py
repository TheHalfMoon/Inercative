from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one anchor, found {count}")
    return text.replace(old, new, 1)


domain_path = Path("packages/product-graph/src/domain.ts")
test_path = Path("packages/product-graph/src/domain.test.ts")

domain = domain_path.read_text()
domain = replace_once(
    domain,
    '  "syntheticdataset",\n] as const;',
    '  "syntheticdataset",\n  "component",\n  "feature",\n  "productrevision",\n  "deploymenttarget",\n] as const;',
    "node-kind list",
)

domain_specs = '''  {
    kind: "component",
    required: { name: "string", provenanceRef: "string" },
    optional: {
      description: "string",
      status: "string",
      verificationRefs: "string-list",
    },
  },
  {
    kind: "feature",
    required: { name: "string", provenanceRef: "string" },
    optional: {
      description: "string",
      status: "string",
      verificationRefs: "string-list",
    },
  },
  {
    kind: "productrevision",
    required: { provenanceRef: "string", revision: "string" },
    optional: { name: "string", status: "string", verificationRefs: "string-list" },
  },
  {
    kind: "deploymenttarget",
    required: {
      environment: "string",
      name: "string",
      provenanceRef: "string",
      targetType: "string",
    },
    optional: { status: "string", verificationRefs: "string-list" },
  },
'''
domain = replace_once(
    domain,
    '];\n\nexport const DOMAIN_EDGE_KIND_SPECS',
    domain_specs + '];\n\nexport const DOMAIN_EDGE_KIND_SPECS',
    "node-spec terminator",
)
domain_path.write_text(domain)

tests = test_path.read_text()
minimal = '''  component: {
    name: "Primary navigation",
    provenanceRef: "provenance:component-primary-navigation",
  },
  feature: {
    name: "Order management",
    provenanceRef: "provenance:feature-order-management",
  },
  productrevision: {
    provenanceRef: "provenance:product-revision-v1",
    revision: "sha256:product-revision-v1",
  },
  deploymenttarget: {
    environment: "preview",
    name: "Preview target",
    provenanceRef: "provenance:preview-target",
    targetType: "preview",
  },
'''
tests = replace_once(
    tests,
    '};\n\nconst probeNodes:',
    minimal + '};\n\nconst probeNodes:',
    "minimal-attributes terminator",
)

focused_tests = '''  it("pins the four SG-000037 semantic reference endpoint contracts", () => {
    expect(
      DOMAIN_NODE_KIND_SPECS.filter((spec) =>
        ["component", "feature", "productrevision", "deploymenttarget"].includes(spec.kind),
      ),
    ).toEqual([
      {
        kind: "component",
        required: { name: "string", provenanceRef: "string" },
        optional: {
          description: "string",
          status: "string",
          verificationRefs: "string-list",
        },
      },
      {
        kind: "feature",
        required: { name: "string", provenanceRef: "string" },
        optional: {
          description: "string",
          status: "string",
          verificationRefs: "string-list",
        },
      },
      {
        kind: "productrevision",
        required: { provenanceRef: "string", revision: "string" },
        optional: { name: "string", status: "string", verificationRefs: "string-list" },
      },
      {
        kind: "deploymenttarget",
        required: {
          environment: "string",
          name: "string",
          provenanceRef: "string",
          targetType: "string",
        },
        optional: { status: "string", verificationRefs: "string-list" },
      },
    ]);
  });

  it("accepts bounded SG-000037 metadata without granting runtime authority", () => {
    expect(
      collectProductGraphDomainIssues(
        graphWith([
          {
            id: "component:primary-navigation",
            kind: "component",
            attributes: {
              ...minimalAttributes.component,
              description: "Reusable navigation primitive",
              status: "declared",
              verificationRefs: ["evidence:component-contract"],
            },
          },
          {
            id: "feature:order-management",
            kind: "feature",
            attributes: {
              ...minimalAttributes.feature,
              description: "User-visible order management capability",
              status: "declared",
              verificationRefs: ["evidence:feature-contract"],
            },
          },
          {
            id: "revision:orders-v1",
            kind: "productrevision",
            attributes: {
              ...minimalAttributes.productrevision,
              name: "Orders v1",
              status: "immutable",
              verificationRefs: ["evidence:revision-contract"],
            },
          },
          {
            id: "target:preview",
            kind: "deploymenttarget",
            attributes: {
              ...minimalAttributes.deploymenttarget,
              status: "declared",
              verificationRefs: ["evidence:target-contract"],
            },
          },
        ]),
      ),
    ).toEqual([]);
  });

  it("rejects design-system and execution authority from Component and Feature metadata", () => {
    const componentIssues = collectProductGraphDomainIssues(
      singleNode("component", {
        ...minimalAttributes.component,
        designSystemRevisionRef: "design-system:canonical",
        rendered: true,
      }),
    );
    expect(componentIssues.map((issue) => [issue.code, issue.field])).toEqual([
      ["DOMAIN_UNKNOWN_FIELD", "designSystemRevisionRef"],
      ["DOMAIN_UNKNOWN_FIELD", "rendered"],
    ]);

    const featureIssues = collectProductGraphDomainIssues(
      singleNode("feature", {
        ...minimalAttributes.feature,
        capabilityGranted: true,
        skillRef: "skill:builder",
      }),
    );
    expect(featureIssues.map((issue) => [issue.code, issue.field])).toEqual([
      ["DOMAIN_UNKNOWN_FIELD", "capabilityGranted"],
      ["DOMAIN_UNKNOWN_FIELD", "skillRef"],
    ]);
  });

  it("rejects mutation, release, credential, and deployment authority from revision and target metadata", () => {
    const revisionIssues = collectProductGraphDomainIssues(
      singleNode("productrevision", {
        ...minimalAttributes.productrevision,
        deployed: true,
        released: true,
        sourceMutable: true,
      }),
    );
    expect(revisionIssues.map((issue) => [issue.code, issue.field])).toEqual([
      ["DOMAIN_UNKNOWN_FIELD", "deployed"],
      ["DOMAIN_UNKNOWN_FIELD", "released"],
      ["DOMAIN_UNKNOWN_FIELD", "sourceMutable"],
    ]);

    const targetIssues = collectProductGraphDomainIssues(
      singleNode("deploymenttarget", {
        ...minimalAttributes.deploymenttarget,
        authorized: true,
        credentialRef: "secret:deploy-token",
        reachable: true,
        secretRef: "secret:provider-token",
      }),
    );
    expect(targetIssues.map((issue) => [issue.code, issue.field])).toEqual([
      ["DOMAIN_UNKNOWN_FIELD", "authorized"],
      ["DOMAIN_UNKNOWN_FIELD", "credentialRef"],
      ["DOMAIN_UNKNOWN_FIELD", "reachable"],
      ["DOMAIN_UNKNOWN_FIELD", "secretRef"],
    ]);
  });

  it("orders SG-000037 endpoint findings deterministically across node insertion order", () => {
    const broken = graphWith([
      {
        id: "probe:z",
        kind: "deploymenttarget",
        attributes: { ...minimalAttributes.deploymenttarget, secretRef: "secret:token" },
      },
      {
        id: "probe:a",
        kind: "feature",
        attributes: { ...minimalAttributes.feature, skillRef: "skill:builder" },
      },
    ]);
    const reordered = graphWith([...broken.nodes].reverse());
    const baseline = collectProductGraphDomainIssues(broken);
    expect(baseline.map((issue) => [issue.target, issue.code, issue.field])).toEqual([
      ["probe:a", "DOMAIN_UNKNOWN_FIELD", "skillRef"],
      ["probe:z", "DOMAIN_UNKNOWN_FIELD", "secretRef"],
    ]);
    expect(collectProductGraphDomainIssues(reordered)).toEqual(baseline);
  });

'''
tests = replace_once(
    tests,
    '  const requiredCases = DOMAIN_NODE_KIND_SPECS.flatMap((spec) =>',
    focused_tests + '  const requiredCases = DOMAIN_NODE_KIND_SPECS.flatMap((spec) =>',
    "required-cases anchor",
)
tests = replace_once(
    tests,
    'const unknownKind = collectProductGraphDomainIssues(singleNode("feature", {}));',
    'const unknownKind = collectProductGraphDomainIssues(singleNode("unknown-node-kind", {}));',
    "unknown-node fixture",
)
test_path.write_text(tests)
