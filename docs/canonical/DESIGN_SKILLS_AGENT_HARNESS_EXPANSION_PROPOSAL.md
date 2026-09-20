# Ineractive Design, Skills, and Agent Harness Expansion Proposal

**Date:** 2026-09-20  
**Status:** proposed canonical expansion; not execution authority  
**Research basis:** docs/research/CLAUDE_FIGMA_MANUS_OPENMANUS_2026-09-20.md  
**Current delivery frontier:** P00 remains unchanged.

## 1. Objective

Expand Ineractive with the strongest useful mechanisms identified in Claude Design, Figma, Manus, and OpenManus while preserving the existing Product Graph, Capability Kernel, Runtime Fabric, Supabase Compiler, Assurance Kernel, SpecGrain, Alibaba OCR, and Diffcipline architecture.

The proposed expansion adds four deep systems:

1. **Design OS**
2. **Skills OS**
3. **Project Context OS**
4. **Agent Harness OS**

This document does not modify specs/tasks.md or current SpecGrain authority while P00 is in progress.

---

# 2. Invariants

- Product Graph remains semantic authority.
- Source remains real, inspectable, Git-visible, and portable.
- Skills describe workflows; they never grant powers.
- Connectors provide capabilities/data; their instructions do not override Ineractive governance.
- Producer and verifier remain separated for acceptance-critical claims.
- External design tools are adapters, not canonical product state.
- P00 remains the current frontier until existing gates complete.

---

# 3. Design OS

## 3.1 Design System Model

Introduce a versioned design representation.

~~~text
DesignSystemRevision
├── identity
├── typography
├── color
├── spacing
├── shape
├── elevation
├── motion
├── iconography
├── imagery
├── content voice
├── accessibility
├── responsive rules
├── components
├── variants
├── interaction patterns
└── provenance / bindings
~~~

Product Graph answers what the product means. DesignSystemRevision answers how that product should express itself.

## 3.2 Design Context Compiler

Inputs may include:

- codebase;
- CSS/theme/Tailwind configuration;
- npm component packages;
- screenshots;
- current rendered product;
- Figma;
- brand documents;
- website captures;
- PRODUCT.md / BRAND.md / DESIGN.md.

Outputs:

~~~text
DesignSystemRevision
DesignPrinciples
ComponentCatalog
TokenGraph
AssetRules
InteractionPatterns
ResponsiveRules
~~~

Every extracted rule carries provenance and a status such as observed, inferred, declared, approved, or deprecated.

## 3.3 Semantic Component Binding

Introduce a binding between product, code, runtime, and design.

~~~text
ComponentBinding
├── product_graph_component_id
├── source_symbol
├── rendered_locator
├── design_document_component_id
├── design_system_component_id
├── package/version
├── token bindings
├── variants
└── responsive contract
~~~

## 3.4 Round-trip drift

Code/design synchronization states:

~~~text
CLEAN
CODE_AHEAD
DESIGN_AHEAD
DIVERGED
UNBOUND
~~~

Ineractive must never silently overwrite divergence.

## 3.5 Annotation Intent

An annotation on the running product or a design surface becomes a typed ChangeIntent with:

- Product Graph target;
- rendered target;
- source binding;
- design binding;
- viewport;
- product state;
- author;
- requested change;
- locality.

Locality values:

~~~text
INSTANCE
COMPONENT
TOKEN
PAGE
PRODUCT
~~~

Multiple annotations may compile into one bounded WorkPacket.

## 3.6 Direct manipulation

Support:

- direct text changes;
- layout and spacing;
- token changes;
- typography;
- component variants;
- responsive behavior;
- asset changes;
- multi-selection;
- local-to-global promotion.

Every edit becomes semantic/source state, never opaque canvas-only state.

## 3.7 Design exploration branches

A design exploration can bind:

~~~text
Design System delta
Product Graph presentation delta
preview
source worktree delta
design evaluation evidence
~~~

The user can compare branches and selectively promote one direction.

## 3.8 Independent Design Evaluator

A separate evaluator should inspect the real rendered product and grade against a project-specific evaluation profile:

- identity/coherence;
- originality;
- product fit;
- hierarchy;
- typography;
- layout;
- color;
- interaction clarity;
- accessibility;
- responsive behavior;
- component consistency;
- content credibility;
- implementation quality.

Do not reduce all taste to one numeric score.

## 3.9 Design-to-Build Handoff

A typed handoff should include:

~~~text
product_revision
design_revision
selected_direction
design_intent
interaction_intent
component_bindings
tokens
responsive_contracts
assets
annotations
acceptance
evidence
~~~

---

# 4. Skills OS

## 4.1 Skill contract

A Skill is a versioned workflow package.

~~~text
SkillManifest
├── id
├── name
├── version
├── scope
├── purpose
├── trigger hints
├── context selectors
├── required tool categories
├── required capabilities
├── risk class
├── input schema
├── output contract
├── evidence contract
└── provenance
~~~

Package contents may include:

~~~text
SKILL.md
scripts/
templates/
fixtures/
references/
schemas/
~~~

## 4.2 Skill scopes

Conceptual scopes:

~~~text
SYSTEM
ORGANIZATION
PROJECT
USER
IMPORTED
~~~

First implementation should focus on SYSTEM and PROJECT.

## 4.3 Skill discovery

Do not inject every skill into every run.

The Skill Registry exposes compact metadata. The Context Compiler selects relevant skills from:

- WorkPacket;
- Product Graph slice;
- source surface;
- design/backend context;
- risk;
- available tools;
- project conventions.

Full skill material loads only after selection.

## 4.4 Skill activation is not authorization

~~~text
Skill selected
      ↓
Workflow instructions available
      ↓
Tool action proposed
      ↓
Capability Kernel
      ↓
Grant / Deny / Human Gate
~~~

## 4.5 Skill, connector, tool, grant separation

~~~text
Skill     = operating procedure
Connector = external capability/data transport
Tool      = callable operation
Grant     = authorization
~~~

## 4.6 Skill verification

Project skills should have:

- manifest validation;
- fixture tasks;
- expected output/evidence;
- risk tests;
- unnecessary-question measurement;
- context/token measurement;
- provenance.

---

# 5. Project Context OS

## 5.1 Durable context

Project context should contain durable state, not transcript accumulation.

~~~text
ProjectContext
├── accepted decisions
├── Product Graph
├── domain vocabulary
├── assumptions
├── architecture decisions
├── design constitution
├── backend/security rules
├── project skills
├── source/runtime facts
├── accepted repair patterns
├── rejected approaches
└── active WorkPacket
~~~

## 5.2 Inspectable context tree

A possible exported layout:

~~~text
.ineractive/
  context/
    product.md
    domain.md
    architecture.md
    decisions.md
    backend/
      authorization.md
    design/
      principles.md
      typography.md
      layout.md
      components/
  skills/
  bindings/
  evidence/
~~~

This can be a projection of richer persisted state rather than the sole database.

## 5.3 Project Learning Loop

After proven work:

~~~text
proven Grain
→ extract reusable learning candidates
→ classify
→ conflict check
→ proposed context/skill diff
→ approval/policy
→ versioned update
~~~

Candidate classes:

~~~text
DECISION
CONVENTION
DOMAIN_FACT
DESIGN_RULE
REPAIR_PATTERN
SKILL_UPDATE
SOURCE_BINDING
~~~

No silent permanent memory update.

## 5.4 Context conflicts

Conflicts must remain explicit. Live repository/runtime truth wins for observable facts; human product decisions require explicit resolution when competing durable decisions exist.

## 5.5 Exploration Branch

A branch point can bind:

- conversation revision;
- Product Graph revision;
- DesignSystemRevision;
- context revision;
- source worktree.

This supports alternative product directions without contaminating canonical state.

---

# 6. Agent Harness OS

## 6.1 Integrated execution path

~~~text
Intent
→ Context Compile
→ Product / Work Plan
→ Build Contract
→ Route
→ Generate
→ Action Proposal
→ Capability Admission
→ Execute
→ Observe
→ Independent Evaluate
→ Repair / Pivot
→ Alibaba OCR
→ Diffcipline
→ Exact-head check
→ Checkpoint
→ Optional Project Learning Proposal
→ Publish / Next
~~~

## 6.2 Build Contract

Before high-risk or novel implementation work, compile an explicit Build Contract from requirements.

~~~text
requested capability
Product Graph slice
expected behavior
negative behavior
UX states
data mutations
authorization invariants
browser journeys
backend assertions
design criteria
evidence requirements
~~~

The producer may propose it. The evaluator can challenge it before build when policy requires.

## 6.3 Stable Tool Catalog

Introduce:

~~~text
ToolCatalogRevision
ToolDescriptor
ToolNamespace
ToolProvider
ToolRisk
CapabilityRequirement
EligibilityState
~~~

Suggested namespaces:

~~~text
repo.*
git.*
shell.*
browser.preview.*
browser.test.*
browser.research.*
browser.user.*
supabase.*
design.*
figma.*
connector.*
deploy.*
research.*
~~~

Prefer stable tool identity. Gate eligibility through state/capability rather than uncontrolled model-visible tool churn.

## 6.4 Context Continuation Policy

Supported decisions:

~~~text
CONTINUE
COMPACT
RESET_WITH_HANDOFF
BRANCH
DELEGATE_FRESH
~~~

Inputs include:

- context pressure;
- model capability;
- task phase;
- accumulated failures;
- semantic drift;
- WorkPacket boundary;
- available artifacts.

## 6.5 Artifact Store

Externalize bulky observations:

- logs;
- screenshots;
- DOM snapshots;
- accessibility trees;
- network traces;
- browser captures;
- research;
- database plans;
- build outputs;
- test reports;
- design captures.

Active context receives summaries plus stable references and fetches detail on demand.

## 6.6 Execution Header

Each important turn receives a deterministic compact header:

~~~text
WorkPacket
current requirement
current attempt
allowed write surface
forbidden surface
required evidence
known failures
unresolved blockers
budget remaining
~~~

## 6.7 Failure Ledger

Keep structured failure evidence:

- action;
- environment;
- observation;
- source state;
- hypothesis;
- repair;
- result;
- recurrence.

Old failures may be compacted, never erased from evidence.

## 6.8 Independent Evaluator

The evaluator consumes:

- Build Contract;
- Product Graph requirements;
- live application;
- browser/backend tools;
- design profile;
- security policy;
- exact source identity.

Avoid feeding generator persuasion or private reasoning into acceptance judgment.

## 6.9 Untrusted-Content Probe

Screen:

- web content;
- browser content;
- downloaded files;
- tool output;
- MCP output;
- imported repository instructions.

The probe adds provenance/trust metadata and warnings. It does not erase source data.

## 6.10 Intent-aware Action Guard

For risk-bearing actions:

~~~text
user authority
+ proposed executable action
+ environment trust policy
+ deterministic capability state
→ ALLOW / DENY / REQUIRE_APPROVAL
~~~

The guard should not receive generator chain-of-thought.

## 6.11 Deny-and-continue

A denial returns a structured boundary so the agent can seek a safer route. Repeated denials eventually escalate/stop instead of creating an infinite bypass loop.

## 6.12 Lifecycle Hook Bus

Typed lifecycle events:

~~~text
before.plan
after.plan
before.graph_change
after.graph_change
before.source_write
after.source_write
before.tool
after.tool
before.commit
after.commit
before.preview
after.preview
before.deploy
after.deploy
on.failure
on.checkpoint
on.proven_work
~~~

Hooks run through capability policy.

## 6.13 Wide Work

Parallel execution contract:

~~~text
independent item set
shared rubric
per-item context
per-item budget
no conflicting write ownership
per-item evidence
explicit synthesis
~~~

Wide Work is for independent parallelizable units, not deeply sequential builds.

## 6.14 Runtime trust classes

Conceptually separate:

~~~text
BuildSandbox
PreviewBrowser
TestBrowser
ResearchBrowser
AuthenticatedUserBrowser
PersistentCloudComputer
ScopedLocalComputer
~~~

The first releases do not need every class.

## 6.15 Scheduled Ineractive work

Later support recurring builder operations with explicit:

- project;
- intent;
- capabilities;
- connectors;
- environment;
- spend budget;
- evidence;
- escalation;
- stop conditions.

Generated-app cron remains a separate product concern.

---

# 7. Design-provider architecture

Core design semantics must remain provider-neutral.

Conceptual interface:

~~~text
DesignProvider
├── inspectDocument
├── inspectSelection
├── listComponents
├── listTokens
├── createNativeContent
├── updateNativeContent
├── capturePreview
└── resolveBinding
~~~

Figma can be the first major external design adapter.

Figma adapter may use:

- MCP structured context;
- write-to-canvas;
- Code Connect mappings;
- code-to-canvas;
- design-to-code;
- variables/styles/components.

Every mutation remains capability-gated.

---

# 8. UX additions

## Design mode

Expose:

- select on preview;
- annotations;
- direct properties;
- design-system inspector;
- token editor;
- component/variant inspector;
- responsive state;
- compare directions;
- design evaluation evidence.

## Branch mode

Branch from:

- conversation point;
- Product Graph revision;
- design direction;
- source checkpoint.

Show ancestry, diffs, evidence, and merge choices.

## Skills surface

Project settings may show:

- active skills;
- version/provenance;
- required capabilities;
- latest use;
- qualification state;
- proposed updates.

Do not flood the main builder UI with a skill catalog.

## Context observability

Power users can inspect:

- assumptions;
- decisions;
- loaded context;
- selected skills;
- design rules;
- domain vocabulary;
- context provenance.

This aligns with HarnessMind-style observability.

---

# 9. Recommended roadmap reconciliation

This is guidance for a future canonical plan update only.

## P02

Add identities/references for:

- DesignSystemRevision;
- semantic component bindings;
- ExplorationBranch metadata;
- Skill references;
- learning proposals.

Do not build full Design OS at P02.

## P03

Move these substrates earlier:

- System/Project Skill Registry;
- Project Context Store;
- Artifact Store;
- Context Continuation Policy;
- Execution Header;
- Stable Tool Catalog.

## P04

Add interfaces for:

- untrusted-content probe;
- intent-aware action guard;
- runtime/browser trust classes;
- Lifecycle Hook Bus;
- connector/MCP trust metadata.

## P07

Add:

- Build Contract;
- evaluator challenge step when required;
- Wide Work;
- context branch execution;
- Failure Ledger.

## P08

Expand with:

- Design Context Compiler;
- Design System Model;
- semantic component bindings;
- Annotation Intent;
- direct manipulation;
- exploration branches;
- round-trip drift;
- DesignProvider contract;
- Figma adapter qualification.

## P11

Add last-known-good release state and proven-candidate promotion policy.

## P12

Expand with:

- Project Learning Loop;
- approved context updates;
- approved skill updates;
- branch compare/merge UX;
- team skill libraries.

## P13

Keep broad ecosystem work here:

- external/community Skills;
- MCP/OpenAPI discovery;
- connector ecosystem;
- plugin SDK.

## Later

Keep later until justified:

- authenticated local-computer automation;
- persistent cloud computer product;
- generic scheduled-agent marketplace;
- unconstrained large agent swarms.

---

# 10. Acceptance principles

## Skill

PASS requires:

- valid manifest;
- provenance;
- explicit capability separation;
- fixture/eval coverage;
- no secret leakage;
- measured context impact.

## Design round trip

PASS requires:

- native editable design objects;
- stable bindings;
- drift detection;
- no silent overwrite;
- clean code diff from design edit;
- clean design update from source edit.

## Project learning

PASS requires:

- evidence-backed candidate;
- explicit diff;
- conflict detection;
- approval/policy;
- versioning;
- rollback.

## Wide Work

PASS requires:

- independent decomposition;
- no conflicting writes;
- bounded budget;
- per-unit evidence;
- failure isolation;
- explicit synthesis.

## Action guard

PASS requires:

- authorized-action fixtures;
- overreach fixtures;
- prompt-injection-driven action fixtures;
- deterministic policy precedence;
- false-positive recovery;
- escalation limits.

---

# 11. Source adoption posture

## Claude

**REFERENCE / ADAPT PATTERNS**

Adopt concepts:

- design-context ingestion;
- planner/generator/evaluator;
- Build Contracts;
- evaluator criteria;
- adaptive context continuation;
- checkpoints/hooks/subagents;
- input/output safety layers.

Do not couple core contracts to Claude APIs.

## Figma

**INTEGRATE / ADAPT PATTERNS**

Adopt:

- MCP design adapter;
- native canvas writes;
- semantic design/code bindings;
- round trip;
- Skills and Guidelines;
- Product Kit concept inspired by Make kits.

Figma remains an external design provider, not semantic authority.

## Manus

**REFERENCE / ADAPT PATTERNS**

Adopt:

- persistent Projects;
- Project Skills;
- approved self-updating context;
- Branch;
- Wide Work;
- scheduled workflows;
- runtime trust classes;
- context engineering.

## OpenManus

**COPY_SELECTIVE / ADAPT only after provenance authorization**

Potential mechanisms:

- MCP client patterns;
- browser session patterns;
- sandbox adapters;
- bounded agent states;
- planning interaction patterns;
- tool-result multimodality.

Do not adopt its weaker authorization, memory, planning-proof, or observability model.

---

# 12. Final thesis

With this expansion, Ineractive should converge on:

> **A Product Operating System with a model-agnostic harness, durable project context, reusable Skills, design/code round-trip truth, secure computer/browser execution, backend compilation, and independent proof.**

The moat is not one model, one canvas, or one tool ecosystem.

It is the system that keeps product meaning, design, source, data, authority, context, skills, evidence, and ownership synchronized.


---

# 13. Completeness red-team integration

A subsequent architecture red-team reviewed the expanded plan against current product-builder baselines and production software lifecycle requirements.

The detailed audit is:

`docs/research/PLAN_COMPLETENESS_RED_TEAM_2026-09-20.md`

The candidate canonical plan now explicitly adds:

1. **Evaluation Lab** — fixed benchmarks plus live/recorded replay and multidimensional regression.
2. **Budget Governor** — model/tool/browser/sandbox/network/backend/time/parallelism ceilings.
3. **Early Project Context substrate** — durable context before collaboration UX.
4. **Early System/Project Skills substrate** — selective workflow knowledge before the open ecosystem.
5. **Untrusted-content + intent-aware action safety** — external observations remain untrusted; high-risk actions are independently aligned to user authority.
6. **Data lifecycle/privacy semantics** — classification, retention, export, deletion, audit, consent, residency, and redaction semantics without false regulatory claims.
7. **Integration/Notification compiler** — REST, signed webhooks, transactional email, in-app notifications, idempotency/reconciliation, and external-effect evidence.
8. **Production web semantics** — i18n, Arabic/RTL, SEO/public metadata where applicable, asset/font handling, and performance budgets.
9. **Generated-product Operations baseline** — health, structured logs, error/reporting adapters, release identity, optional OpenTelemetry-compatible instrumentation, and portable analytics.
10. **Release OS** — ReleaseManifest, app/schema compatibility, last-known-good identity, qualification/promotion states, and recovery drills.
11. **Generated AI-product primitives** — provider-neutral streaming, structured output, embeddings/retrieval, tool calling, policy hooks, usage/rate limits, and eval fixtures.
12. **Supply-chain/artifact integrity before production** — dependency/source/asset/build provenance and optional SBOM rather than deferring all supply-chain work to hosted-product hardening.

## 13.1 Candidate dependency graph

The proposed task index now contains **157 stable task handles**.

The update preserves all existing task IDs and P00 authority. New work is additive.

Automated structural validation after the expansion must continue to require:

- every dependency refers to an existing task;
- every dependency appears earlier in dependency order;
- no P00 task/evidence is rewritten by the planning expansion;
- later additions remain non-executable until SpecGrain makes them dependency-eligible.

## 13.2 Deep-module rule

The expansion deliberately avoids turning every market feature into a top-level subsystem.

Examples:

- many spend knobs collapse into **Budget Governor**;
- deploy/migration/recovery state collapses into **ReleaseManifest / Release OS**;
- model/tool logs and screenshots collapse into **Artifact Store**;
- durable agent memory collapses into **Project Context**;
- repeated operating knowledge collapses into **Skills OS**;
- design tokens/components/bindings collapse into **DesignSystemRevision**;
- benchmark/eval/regression workflows collapse into **Evaluation Lab**.

This keeps the plan implementable while increasing capability.

## 13.3 Explicit deferrals remain

"Best" does not mean implementing every adjacent category before the core is proven.

The plan still intentionally defers broad implementation of:

- persistent authenticated local-computer automation;
- general persistent cloud-computer product;
- unrestricted community/plugin marketplace;
- native mobile until web quality is proven;
- arbitrary cloud/IaC generation;
- unrestricted large agent swarms;
- broad payment/financial automation without independent qualification;
- a second backend compiler target.

## 13.4 A-to-Z lifecycle hardening

The subsequent end-to-end hardening adds:

- first-class Dataset/Data Workspace and deterministic seed/synthetic data;
- ProductCompletenessManifest;
- provider-neutral Platform Lifecycle layer;
- ProviderAdapter, Connection, ResourceBinding, EnvironmentManifest, OwnershipManifest, ProvisioningSaga, and ExternalBlocker contracts;
- staged/chunked/resumable data import and masked-nonproduction policy;
- least-privilege GitHub installation/authorization lifecycle;
- user-owned Supabase connect/create/reconcile lifecycle;
- provider preflight for permission/plan/billing/quota/region/policy blockers;
- secret rotation/revocation and DNS/certificate lifecycle;
- Connected Ownership Orchestrator;
- B17 idea+spreadsheet→owned-production→post-launch-change benchmark;
- A-to-exit revoke/reconnect benchmark.

The associated canonical contracts are:

- `docs/canonical/END_TO_END_PRODUCT_FACTORY.md`
- `docs/canonical/PLATFORM_LIFECYCLE_AND_OWNERSHIP.md`

## 13.5 Candidate readiness statement

After integration of the red-team gaps into the roadmap, Product Graph, capability matrix, harness/runtime/quality contracts, generated-product contract, source ledger, and dependency graph:

**KNOWN_ARCHITECTURE_BLOCKER_FOR_POST_P00_PLAN = NONE IDENTIFIED**

This is a planning statement, not a runtime/product qualification claim.

Future implementation evidence can still reveal incorrect assumptions. Those must be handled through SpecGrain rolling-wave refinement rather than defended because they appeared in a planning document.
