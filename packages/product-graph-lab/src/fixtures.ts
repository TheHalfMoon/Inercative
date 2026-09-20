import { canonicalGraphState, type PrototypeGraphState } from "./model.ts";

export const representativeGraphFixture: PrototypeGraphState = canonicalGraphState({
  schemaVersion: 1,
  graphId: "fixture:operations-console",
  nodes: [
    {
      id: "role:operator",
      kind: "role",
      attributes: { label: "Operator" },
    },
    {
      id: "entity:order",
      kind: "entity",
      attributes: { label: "Order", tenantOwned: true },
    },
    {
      id: "page:orders",
      kind: "page",
      attributes: { label: "Orders", route: "/orders" },
    },
    {
      id: "action:refund",
      kind: "action",
      attributes: { consequence: "external", label: "Refund" },
    },
    {
      id: "workflow:refund",
      kind: "workflow",
      attributes: { label: "Refund workflow" },
    },
    {
      id: "integration:payments",
      kind: "integration",
      attributes: { label: "Payments", secretRequired: true },
    },
    {
      id: "requirement:audit",
      kind: "requirement",
      attributes: { label: "Refunds require audit evidence" },
    },
    {
      id: "persona:support",
      kind: "persona",
      attributes: { label: "Support specialist" },
    },
  ],
  edges: [
    {
      id: "edge:page-order",
      kind: "reads",
      from: "page:orders",
      to: "entity:order",
      attributes: {},
    },
    {
      id: "edge:page-refund",
      kind: "offers",
      from: "page:orders",
      to: "action:refund",
      attributes: {},
    },
    {
      id: "edge:refund-workflow",
      kind: "starts",
      from: "action:refund",
      to: "workflow:refund",
      attributes: {},
    },
    {
      id: "edge:workflow-payments",
      kind: "uses",
      from: "workflow:refund",
      to: "integration:payments",
      attributes: {},
    },
    {
      id: "edge:workflow-audit",
      kind: "satisfies",
      from: "workflow:refund",
      to: "requirement:audit",
      attributes: {},
    },
    {
      id: "edge:operator-refund",
      kind: "permits",
      from: "role:operator",
      to: "action:refund",
      attributes: {},
    },
    {
      id: "edge:support-role",
      kind: "assumes",
      from: "persona:support",
      to: "role:operator",
      attributes: {},
    },
    {
      id: "edge:order-audit",
      kind: "governed-by",
      from: "entity:order",
      to: "requirement:audit",
      attributes: {},
    },
  ],
});
