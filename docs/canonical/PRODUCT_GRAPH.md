# Ineractive Product Graph

**Status:** canonical planning direction  
**Date:** 2026-09-19

## 1. Purpose

The Product Graph is the semantic representation of what the user is building.

Source files are not enough. A codebase can tell us that a route exists; it does not necessarily tell us why it exists, who may use it, what requirement it satisfies, which workflow it belongs to, or what must remain true when it changes.

The Product Graph gives Ineractive a durable, diffable product model that can compile into code and be reconstructed/validated from code and runtime evidence.

## 2. Design requirements

The graph must be:

- typed;
- versioned;
- diffable;
- serializable;
- small enough to slice by work intent;
- human-inspectable;
- independent from any one model provider;
- independent from any one generated-app framework;
- capable of representing uncertainty/assumptions;
- linked to source/runtime evidence without making source locations the semantic identity.

## 3. Core node types

### Product

Name, purpose, audience, locale, operating context, high-level constraints.

### Persona

A human/user class described by goals and context, not necessarily an authorization role.

### Role

Authorization/permission identity used by the application.

### Organization / Workspace

Tenant or collaboration boundary.

### Entity

Durable business/data concept.

### Field

Typed entity property.

### Relationship

Entity association/cardinality/ownership.

### Feature

User-visible capability.

### Requirement

Something that must be true.

### Page

User-facing surface.

### Route

Navigable endpoint/surface identity.

### Component

Reusable UI/product primitive.

### Action

User/system operation.

### Workflow

Stateful multi-step behavior.

### Event

Domain/application event.

### Notification

Outbound/in-product communication behavior.

### Integration

External service/system contract.

### DataSource

Supabase table/view/function or other source.

### Permission

Authorization rule.

### Metric

Tracked product/business/operational measure.

### Assumption

Inferred choice pending confirmation/correction.

### Decision

Accepted durable product/architecture choice.

### DesignTokenSet

Brand/design-system semantics.

### DeploymentTarget

Preview/staging/production target configuration identity.

## 4. Edge examples

~~~text
Persona -> USES -> Feature
Role -> MAY -> Action
Role -> CANNOT -> Action
Organization -> OWNS -> Entity
Page -> DISPLAYS -> Entity
Page -> TRIGGERS -> Action
Action -> STARTS -> Workflow
Workflow -> READS -> Entity
Workflow -> WRITES -> Entity
Feature -> REQUIRES -> Page
Feature -> REQUIRES -> Requirement
Requirement -> VERIFIED_BY -> EvidenceRequirement
Entity -> STORED_IN -> DataSource
Permission -> ENFORCED_BY -> RlsPolicy
Component -> IMPLEMENTS -> ProductConcept
Page -> USES -> Component
Integration -> PROVIDES -> Capability
Assumption -> AFFECTS -> ProductNode
Decision -> SUPERSEDES -> Assumption
~~~

## 5. Identity

Semantic node identity must not be derived solely from filenames, route strings, or database table names.

A rename should not necessarily create a new semantic Product Graph node.

Each node has:

- stable id;
- type;
- revision;
- canonical name;
- status;
- provenance;
- attributes;
- optional source bindings.

## 6. Product revision

A Product Revision is an immutable snapshot/digest of graph state.

A user change intent produces a proposed graph delta.

~~~text
ProductRevision A
   + ChangeIntent
   + inferred assumptions
   -> Proposed ProductRevision B
~~~

The graph delta drives work planning.

## 7. Assumptions

Assumptions are first-class nodes so inference is visible.

Example:

~~~text
Assumption: "Each record belongs to exactly one organization"
confidence: 0.83
impact: high
reversibility: hard after production data
status: inferred
~~~

A high-impact low-confidence assumption may trigger the Question Gate.

## 8. Source bindings

Graph nodes can bind to implementation artifacts:

- source file;
- symbol;
- route;
- migration;
- table;
- RLS policy;
- function;
- test;
- design token;
- deployment resource.

Bindings are observations and can become stale.

Do not treat a stale source binding as semantic truth.

## 9. Compilation

### UI compilation

Pages/features/actions/design semantics compile into:

- routes;
- components;
- state/data access;
- forms;
- error/empty/loading states;
- accessibility requirements.

### Supabase compilation

Entities/relationships/permissions/workflows compile into:

- tables;
- types;
- constraints/indexes;
- policies;
- auth/member models;
- storage rules;
- functions/events;
- tests.

### Verification compilation

Requirements/workflows/permissions compile into candidate:

- unit/integration tests;
- browser journeys;
- RLS negative tests;
- design/a11y checks;
- security checks.

Generated tests are proposals until reviewed/validated.

## 10. Reconstruction

When importing an existing project, Ineractive can propose a graph from:

- routes;
- schema/migrations;
- types;
- components;
- API handlers;
- auth/policy code;
- tests;
- docs;
- runtime/browser observation.

Reconstruction carries confidence and unresolved conflicts.

The system must not pretend an inferred product model is user-confirmed.

## 11. Graph slicing

A WorkPacket should carry only the relevant graph slice plus mandatory global policy.

Example:

"Add invoice reminders" might select:

- Invoice;
- Customer;
- Notification;
- Reminder workflow;
- scheduler;
- permissions;
- related pages/settings;
- integration/secrets.

It should not load unrelated product areas.

## 12. Graph consistency rules

Deterministic validation should catch examples such as:

- Page references missing Entity;
- Role grants Action that has no implementation path;
- public Page writes private Entity without permission;
- Feature has no user-visible or API surface;
- Requirement has no planned verification;
- Entity marked tenant-owned without tenant key/policy;
- destructive Action lacks consequence classification;
- Integration requires secret but no secret reference exists.

## 13. Storage representation decision

The exact persisted representation is an implementation decision for P02.

Candidates may include structured JSON documents plus indexes, a relational representation, or a hybrid.

Selection criteria:

- deterministic diff;
- mergeability;
- migration/versioning;
- slice/query ergonomics;
- testability;
- human inspectability;
- performance on realistic project sizes.

Do not select a graph database merely because the model is called a graph.

## 14. User interaction

Most users should never need to edit the raw Product Graph.

Expose product-level views:

- Data model;
- Roles & access;
- Pages;
- Workflows;
- Integrations;
- Assumptions;
- Requirements.

Power users may inspect/export structured graph state.
