# Ineractive Canonical Architecture

**Status:** planning architecture  
**Date:** 2026-09-19

## 1. Architectural objective

Ineractive must combine AI generation, visual editing, backend construction, real execution, browser verification, review, and deployment without turning into a monolith whose behavior is hidden inside prompts.

The architecture is **typed-state first**:

- product intent becomes explicit product state;
- planning becomes explicit work state;
- model calls are adapters around typed responsibilities;
- tools operate through capabilities;
- runtime observations become evidence;
- backend changes become migrations and policies;
- UI changes remain code;
- completion is a proof state, not a chat message.

## 2. System shape

```text
+------------------------------------------------------------------+
|                         User Surfaces                            |
| Chat/Command | Product Preview | Visual Edit | Code | Data | Git |
+----------------------------------+-------------------------------+
                                   |
                                   v
+------------------------------------------------------------------+
|                       Product Compiler                           |
| Intent | Assumptions | Product Graph | Specs | Change Planner    |
+----------------------------------+-------------------------------+
                                   |
                                   v
+------------------------------------------------------------------+
|                        Harness Kernel                            |
| Context Compiler | Task Graph | Decision Fabric | Model Router   |
| Tool Router | Budget | Memory | Policy Requests | Repair Loop    |
+------------+---------------------+----------------+---------------+
             |                     |                |
             v                     v                v
+----------------------+ +------------------+ +--------------------+
| Generative Adapter   | | Decision Fabric  | | Deterministic Core |
| code/reasoning       | | typed decisions  | | rules/state/policy |
+----------------------+ +------------------+ +--------------------+
             |                     |                |
             +---------------------+----------------+
                                   |
                         typed capability requests
                                   |
                                   v
+------------------------------------------------------------------+
|                        Runtime Fabric                            |
| Sandbox | Filesystem | PTY | Browser | Git | Network | Secrets   |
+-------------------+------------------------+---------------------+
                    |                        |
                    v                        v
+--------------------------------+  +------------------------------+
| Application Runtime            |  | Supabase Compiler/Runtime   |
| Next.js V1 target              |  | DB/Auth/RLS/Storage/etc.    |
+--------------------------------+  +------------------------------+
                    |                        |
                    +------------+-----------+
                                 v
+------------------------------------------------------------------+
|                    Observation & Assurance                       |
| Runtime events | Browser | Tests | Security | Design | OCR       |
| Ascout adapters | Diffcipline | Exact-head Evidence             |
+----------------------------------+-------------------------------+
                                   |
                                   v
                       Preview / Git / Publish
```

## 3. Deep modules

The major modules must be deep: small stable interfaces with substantial behavior behind them.

### ProductCompiler

Input:

- user intent;
- imported project context;
- current Product Graph;
- Assumption Ledger.

Output:

- validated Product Graph revision;
- unresolved material decisions;
- requested change intent.

It does not write source files.

### WorkCompiler

Input:

- Product Graph diff;
- repository/runtime state;
- acceptance policy.

Output:

- dependency-ordered bounded work suitable for SpecGrain shaping.

It does not execute the work.

### Harness

Input:

- WorkPacket;
- project state;
- capabilities;
- budget.

Output:

- run events, artifacts, proposals, observations, and candidate change.

It does not grant itself privileges.

### CapabilityKernel

Input:

- typed capability request + provenance + current policy.

Output:

- deny, ask, or bounded grant.

No model is permitted to bypass it.

### SupabaseCompiler

Input:

- backend-relevant Product Graph revision.

Output:

- desired backend plan;
- migration/policy/function/storage/auth config candidates;
- validation plan.

It must be able to compare desired state with observed local/remote state before mutation.

### DesignEngine

Input:

- product/brand/design context;
- component/page representation;
- rendered observations.

Output:

- code-level design changes, tokens, variants, and findings.

The canvas is a view/editing surface over real code, not the canonical storage format.

### AssuranceKernel

Input:

- requested claim;
- exact candidate source identity;
- evidence/finding/coverage observations.

Output:

- typed qualification state and missing evidence.

It never infers PASS from omission.

## 4. Product Graph

The Product Graph is the semantic center.

It should represent at minimum:

- Product;
- Persona;
- Role;
- Organization/Workspace;
- Entity;
- Field;
- Relationship;
- Permission;
- Page;
- Route;
- Component;
- Action;
- Workflow;
- Event;
- Notification;
- Integration;
- DataSource;
- Metric;
- Feature;
- Requirement;
- Assumption;
- Decision;
- DesignTokenSet;
- DeploymentTarget.

Edges express relationships such as:

```text
Role -> MAY -> Action
Page -> READS -> Entity
Page -> TRIGGERS -> Workflow
Workflow -> WRITES -> Entity
Entity -> STORED_IN -> SupabaseTable
Permission -> ENFORCED_BY -> RlsPolicy
Feature -> REQUIRES -> Route
Requirement -> VERIFIED_BY -> EvidenceRequirement
```

Every graph revision must be diffable. User requests update the graph before broad code changes, except for tiny local edits where graph impact is explicitly none.

## 5. Initial technology direction

### Ineractive control plane

- TypeScript;
- React 19;
- a current production-grade React application framework selected during P01 qualification;
- Postgres/Supabase for hosted control-plane data where appropriate;
- typed schema validation at every external boundary;
- OpenTelemetry-compatible events.

The control-plane Supabase identity stores Ineractive accounts, organizations, project metadata, collaboration state, and run/task metadata. It is a separate trust and data domain from every generated application's Supabase backend.

Generated applications use independent local/remote backend identities, credentials, migrations, policies, and export/delete lifecycles. A generated application's service-role or secret authority never becomes ambient authority in the Ineractive browser/control plane.

Do not couple the compiler to a particular web framework used by the Ineractive UI.

### Generated web product target

V1 default target:

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- accessible component primitives;
- Supabase client/server integration;
- generated typed database interfaces.

This target is a product decision for V1, not a permanent restriction. Additional compiler targets require their own qualification.

### Runtime

- container/sandbox isolation as the default execution boundary;
- local Docker-compatible runtime for development;
- remote sandbox adapter for hosted execution;
- Playwright-class browser control;
- real PTY/process supervision;
- Git worktree/branch isolation where useful;
- egress and resource limits;
- brokered secrets.

Kernux patterns are the primary internal runtime/capability reference. OpenSandbox and other authorized donors may contribute selected implementation.

### Visual editing

Adapt the strongest patterns from Onlook, Plasmic, Webstudio, GrapesJS, ChaiBuilder, Puck, OpenUI, screenshot-to-code, and authorized design sources.

Requirements:

- DOM/component inspection maps back to source;
- edits become normal source changes;
- token changes propagate through the design system;
- responsive variants remain explicit;
- visual editing cannot silently create a second canonical UI representation.

## 6. Harness event model

Every run should emit typed events such as:

```text
run.started
context.selected
decision.requested
decision.resolved
model.requested
model.completed
capability.requested
capability.granted
tool.started
tool.completed
artifact.created
source.changed
runtime.started
runtime.observed
test.completed
finding.created
repair.proposed
repair.applied
review.completed
proof.completed
run.completed
```

Events carry:

- run/work identity;
- exact source revision where applicable;
- provider/model/config identity internally;
- tool/runtime identity;
- timing/cost/usage;
- provenance;
- redaction facts;
- error/uncertainty state.

Marketing need not disclose provider names. Operational evidence must retain enough identity to reproduce and diagnose behavior.

## 7. Project memory

Project memory is not a transcript dump.

Persist durable, scoped facts:

- accepted product decisions;
- assumptions and whether they were confirmed;
- domain vocabulary;
- design rules;
- architecture decisions;
- rejected approaches and rationale;
- successful/failed build patterns;
- known environment constraints;
- integration facts;
- repair outcomes;
- user/project preferences.

Morize patterns are the internal reference for governed memory. Never let retrieved memory directly grant capabilities or override current repository facts.

## 8. Context compiler

The context compiler should select the smallest useful context from:

1. active WorkPacket;
2. Product Graph slice;
3. exact impacted source;
4. applicable design/backend/runtime contracts;
5. recent relevant evidence;
6. scoped memory;
7. external documentation only when needed.

Do not send whole repositories to a model by default.

A bounded decision-model adapter may assist with keep/truncate/drop or routing decisions where typed choices are appropriate, but deterministic requirements are always retained regardless of model preference.

## 9. Multi-agent policy

Do not simulate a company of agents for marketing.

Parallelism is allowed only when work units are independent and their write surfaces do not conflict.

Specialist roles are capabilities, not personalities:

- product/domain;
- data/backend;
- UI/design;
- integration;
- test;
- security;
- review/release.

Each receives a bounded packet. Cross-cutting synthesis happens through typed state and evidence, not long agent-to-agent prose.

## 10. Repository target shape

```text
apps/
  web/                    Ineractive product surface
  worker/                 hosted orchestration worker, if needed

packages/
  product-graph/
  product-compiler/
  work-compiler/
  harness/
  decision-fabric/
  model-router/
  capability-policy/
  runtime-contract/
  sandbox-runtime/
  browser-runtime/
  git-runtime/
  supabase-compiler/
  design-engine/
  assurance/
  protocol/
  ui-system/

specs/
  CURRENT.md
  tasks.md

docs/
  canonical/
  adr/
  research/
  evidence/

third_party/
  provenance/
  notices/
```

Names may be refined during P00/P01. Module responsibilities must remain separated.

## 11. Change flow

```text
User intent
  -> Product Graph diff
  -> Assumption/decision gate
  -> SpecGrain shape/refine/grain
  -> WorkPacket
  -> isolated implementation run
  -> runtime/browser observation
  -> tests/design/security checks
  -> repair loop
  -> Alibaba OCR exact-diff review
  -> Diffcipline proof
  -> exact-head qualification
  -> merge/publish
```

## 12. Architectural rejection list

Reject these shortcuts:

- one giant system prompt as the architecture;
- hidden mutable project state that cannot be exported;
- model-generated SQL applied directly to production;
- granting shell/network/secrets because "the agent needs them";
- browser preview without interaction/testing;
- a canvas that diverges from source code;
- a generic "agent swarm" without bounded work and write ownership;
- automatic retry until green with discarded failure history;
- model confidence used as authorization;
- provider-specific types leaking through core contracts;
- asking the user questions that runtime/project context can answer.
