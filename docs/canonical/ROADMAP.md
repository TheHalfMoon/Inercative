# Ineractive Canonical Roadmap

**Status:** implementation plan  
**Date:** 2026-09-19  
**Planning rule:** dependency-ordered, rolling-wave, evidence-first

## 1. Milestone summary

- **Foundation complete:** P00
- **Internal compiler shell:** P01-P04
- **First proven full-stack product:** P05-P07
- **Design-quality alpha:** P08
- **Import/edit alpha:** P09
- **Assurance-complete alpha:** P10
- **Publishable beta:** P11
- **Team/product-memory beta:** P12
- **Open ecosystem:** P13
- **Mobile expansion:** P14
- **Managed scale/commercial hardening:** P15

The earliest useful external alpha is after P08 and P10 gates, not when the first page renders.

## P00 — Repository and delivery foundation

**Goal:** create a trustworthy implementation substrate.

### P00-S01 Repository bootstrap
- choose and pin workspace/package/toolchain;
- establish TypeScript/React baseline and formatting/lint/type/test commands;
- create canonical folder skeleton without premature modules;
- add CI on supported development platforms.

### P00-S02 SpecGrain
- initialize canonical SpecGrain project using the current CLI;
- convert this roadmap into coarse program specs;
- shape only the first implementation frontier;
- verify packet/export workflow.

### P00-S03 Diffcipline
- initialize policy;
- map R0-R3 profiles;
- prove a harmless repository change end to end.

### P00-S04 License and provenance
- select and commit the license for Ineractive-owned code before importing donor product code;
- define third-party notice/attribution policy without pretending the Ineractive license overrides donor obligations;
- add machine-readable donor/import schema;
- add notice inventory mechanism;
- establish source-import checklist.

### P00-S05 Review integration
- document/install Alibaba Open Code Review in development workflow;
- define exact-base/head review evidence shape;
- add CI integration only when required credentials/execution are available and safely scoped.

**Exit:** repository can accept one bounded Grain and prove its exact diff without product code.

## P01 — Product shell and deep-module contracts

**Goal:** make architecture executable without building the whole product.

### P01-S01 Control-plane framework qualification
- compare current production framework choices;
- select control-plane web framework;
- record ADR if tradeoff is material.

### P01-S02 Protocol/contracts package
Define initial schemas for:
- ids/revisions;
- events;
- evidence;
- findings;
- ModelTask;
- DecisionTask;
- CapabilityRequest/Grant;
- runtime identities.

### P01-S03 Workspace shell
Build:
- project list;
- create/open project;
- primary workspace layout;
- activity/event panel;
- placeholder preview surface;
- command/change-intent entry.

### P01-S04 UI system
- tokens;
- typography;
- accessible primitives;
- responsive shell;
- first Ineractive brand system.

### P01-S05 Control-plane identity and project store
- establish the minimum Ineractive control-plane Supabase project;
- implement Ineractive user/session identity;
- persist Ineractive project metadata and membership needed by the shell;
- keep generated-application data in separate backend identities;
- use RLS and least-privilege service boundaries from the first persisted control-plane slice.

**Exit:** shell runs with typed event/contracts, real Ineractive user/project identity, and no fake generation claims. Generated-app backends remain isolated from the control plane.

## P02 — Product Graph and intent compiler

**Goal:** create the semantic product core.

### P02-S01 Product Graph model
- prototype at least two persistence/interface designs;
- choose representation by evidence;
- implement stable typed node/edge/revision contracts.

### P02-S02 Domain, requirements, and data-governance model
- personas, roles, entities, pages, actions, workflows, permissions, assumptions, requirements;
- data classification, retention, export, deletion, audit, consent, and residency constraints;
- locale/timezone semantics;
- external-effect/integration consequence semantics;
- deterministic validators.

### P02-S03 Change Intent
- parse a user request into proposed graph delta;
- preserve uncertainty/confidence/provenance;
- no source mutation yet.

### P02-S04 Question Gate and Assumption Ledger
- impact/reversibility/confidence policy;
- zero-question default;
- compact blocker questions;
- assumption correction invalidation.

### P02-S05 Graph views
- Data;
- Roles;
- Pages;
- Workflows;
- Assumptions.

### P02-S07 Dataset semantics
Define product-level semantics for:
- Dataset;
- DatasetVersion;
- DataImport;
- DataMapping;
- DataProfile;
- DataQualityRule;
- SeedDataset;
- SyntheticDataset;
- later VectorCorpus/EvalDataset references.

Dataset semantics carry provenance, privacy class, transformation lineage, environment, and verification requirements.

**Exit:** representative product intents and supplied business data become inspectable graph/data revisions with bounded unresolved decisions.

## P03 — Harness kernel and intelligence routing

**Goal:** make the system model-agnostic and measurable.

### P03-S01 Run/event kernel
- Run lifecycle;
- event persistence;
- artifacts;
- budgets;
- cancellation;
- resume semantics.

### P03-S02 Model adapter
- provider-neutral generative interface;
- initial configured generator adapter;
- private provider identity in evidence;
- timeouts/retries/errors.

### P03-S03 Decision fabric
- provider-neutral bounded decision adapter for typed choice/score/probability tasks;
- deterministic fallback/error policy;
- confidence thresholds;
- no permission authority.

### P03-S04 Model router
- capability registry;
- task requirements;
- routing;
- fallback lineage;
- budget/latency policy.

### P03-S05 Context compiler
- mandatory vs optional context;
- Product Graph slicing;
- source selection;
- memory hook;
- HarnessMind-style provenance.

### P03-S06 Project Context substrate
- governed durable project facts/decisions/assumptions;
- versioned context revisions;
- deterministic Execution Header;
- conflict/freshness rules;
- collaboration UI remains deferred to P12.

### P03-S07 System / Project Skills substrate
- versioned SkillManifest;
- selective skill discovery/loading;
- provenance;
- fixture/eval hooks;
- skills never grant capabilities.

### P03-S08 Budget Governor
- model/tool/browser/sandbox/network/backend budgets;
- cost/latency/parallelism policy;
- bounded retry/repair spend;
- cheaper-path/degrade/stop/approval outcomes;
- model cannot expand its own budget.

### P03-S09 Artifact Store and harness replay contract
- stable large-artifact references for logs/screenshots/DOM/traces/reports/research;
- deterministic metadata/provenance;
- live replay vs recorded-observation replay interfaces;
- no repeated external side effects during deterministic harness regression tests.

**Exit:** one synthetic WorkPacket can route decisions/generation through typed adapters with durable context, selective skills, bounded budgets, artifact provenance, and replayable run evidence.

## P04 — Runtime, sandbox, tools, browser, Git

**Goal:** give the harness real execution ability safely.

### P04-S01 Capability kernel
- typed requests/grants;
- deny/ask/allow policy;
- expiry/use limits;
- consequence/spend class.

### P04-S02 Sandbox runtime
- filesystem;
- process/PTY;
- resource limits;
- lifecycle;
- cleanup;
- artifact export;
- local Docker-compatible adapter.

### P04-S03 Network and secret broker
- egress policy;
- domain allowlists;
- secret references;
- injection without model exposure;
- redaction.

### P04-S04 Git runtime
- repository init/import;
- branches/worktrees;
- diff;
- checkpoints;
- commit;
- push as separate capability.

### P04-S05 Browser runtime
- launch/preview;
- DOM/accessibility inspection;
- console/network observations;
- screenshots;
- deterministic actions;
- browser journey evidence.

### P04-S06 Tool trust and action safety
- stable Tool Catalog identities/namespaces;
- capability/eligibility masking;
- MCP/connector trust metadata;
- untrusted-content/prompt-injection probe for external observations;
- independent intent-aware guard for risk-bearing executable actions;
- bounded deny-and-continue behavior;
- typed Lifecycle Hook Bus;
- distinguish build/test/research/authenticated-user browser trust classes.

**Exit:** harness can modify a toy app in an isolated workspace, run it, inspect it in a browser, and produce exact evidence without host-ambient authority or treating external content/tools as trusted instructions.

## P05 — Web product compiler V1

**Goal:** compile Product Graph slices into a real web product.

### P05-S01 Generated-project scaffold
Default V1 target:
- Next.js;
- React;
- TypeScript;
- Tailwind;
- accessible component primitives;
- test setup.

### P05-S02 Page/component compiler
- routes;
- layouts;
- pages;
- loading/error/empty states;
- reusable primitives;
- design tokens.

### P05-S03 Interaction compiler
- forms;
- client/server state;
- validation;
- action feedback;
- navigation.

### P05-S04 Incremental change compiler
- modify existing generated product;
- preserve unrelated code;
- source binding to Product Graph;
- bounded diff rather than regeneration.

### P05-S05 Internationalization and RTL
- locale-aware routing/config;
- message catalogs and formatting;
- timezone/date/number behavior;
- RTL and logical layout behavior;
- Arabic/English browser fixtures.

### P05-S06 Production web semantics
- metadata/canonical URL/social preview/sitemap/robots where relevant;
- image/font loading strategy;
- route performance budgets;
- accessible loading/error/empty states under realistic data;
- no claim that every product requires SEO.

**Exit:** static and stateful UI benchmark products compile, run, survive incremental change, and can meet production-grade locale/RTL/public-web contracts where applicable.

## P06 — Supabase compiler V1

**Goal:** build backend A-to-Z from semantics.

### P06-S01 Local Supabase runtime
- CLI integration discovered via current help/docs;
- isolated local stack lifecycle;
- reset/reconstruction;
- synthetic seed fixtures.

### P06-S02 Schema/migration compiler
- entities/fields;
- relations;
- constraints/indexes;
- migrations;
- generated types;
- recreate-from-empty proof;
- classify additive/transformative/restrictive/destructive changes;
- define expand/contract and recovery behavior before remote execution.

### P06-S03 Auth and tenancy
- user lifecycle;
- organizations/membership;
- roles;
- invite patterns;
- session/error flows.

### P06-S04 RLS and API exposure
- explicit grants/exposure;
- ownership/membership policies;
- cross-tenant negative tests;
- view/function safety.

### P06-S05 Storage
- buckets;
- object policies;
- signed/public behavior;
- upload/upsert/delete tests.

### P06-S06 Realtime/functions/jobs
- opt-in generation;
- server-side secret use;
- idempotency;
- local tests;
- supported realtime contracts.

### P06-S07 Remote project ownership
- Supabase OAuth/Management API;
- connect existing;
- create authorized project;
- local-to-remote migration plan;
- drift detection.

### P06-S08 Data lifecycle compiler
- compile data classification/retention/export/deletion/audit requirements;
- log/redaction implications;
- deletion/export browser and backend flows;
- no automatic regulatory-compliance claim.

### P06-S09 Integration and notification compiler
Initial V1 subset:
- generic REST API;
- signed webhook producer/consumer;
- transactional email;
- in-app notifications;
- typed secret/config references;
- retry/idempotency/reconciliation;
- external-effect receipts and failure UI.

SMS/WhatsApp/payments remain separately qualified high-risk adapters.

### P06-S10 Data Workspace and Dataset Compiler
Support authorized business-data starting points:
- CSV;
- XLSX/spreadsheets;
- JSON;
- existing Supabase tables;
- Postgres/SQL sources where qualified;
- API samples;
- manually described records.

Pipeline:
- inspect/profile;
- infer types/relationships;
- classify sensitive data;
- identify duplicates/missingness/outliers;
- propose normalization/mapping;
- preview before mutation;
- import/transform;
- verify row counts/constraints/relationships;
- version Dataset lineage;
- bind imported data to Product Graph/DataSource.

### P06-S11 Seed and synthetic data
- deterministic representative development/test data;
- role/workflow/edge-case coverage;
- no production-data cloning by default;
- reusable seed fixtures committed with generated source;
- later AI corpus/eval dataset preparation only after P13 qualification.

**Exit:** multi-tenant authenticated CRUD benchmark with RLS/storage/data-lifecycle semantics reconstructs from source, can ingest and verify a real business spreadsheet/data source, can generate safe representative seed data, and can execute one qualified external integration/notification path safely.

## P07 — Full product build and repair loop

**Goal:** make intent-to-product continuous.

### P07-S01 Work compiler
- graph diff -> bounded dependency graph;
- map to SpecGrain-ready work;
- expected change surfaces/evidence.

### P07-S02 Build orchestrator
- execute independent units;
- avoid write conflicts;
- checkpoint after proven slices;
- durable run state;
- external-effect receipts;
- reconcile ambiguous/disconnected operations before retry.

### P07-S03 Runtime observation
- build;
- server;
- browser;
- backend;
- logs;
- structured failure observations.

### P07-S04 Repair loop
- reproduce;
- minimize;
- hypothesize;
- patch;
- focused rerun;
- broader acceptance;
- bounded attempts.

### P07-S06 Build Contract, Failure Ledger, and Wide Work
- compile requirements into explicit Build Contract;
- independent evaluator may challenge high-risk/novel acceptance criteria before build;
- structured Failure Ledger retained across repair attempts;
- Context Continuation Policy can continue/compact/reset-with-handoff/branch/delegate-fresh;
- Wide Work only for dependency-independent subunits;
- isolated write ownership and explicit synthesis;
- per-unit budget/evidence.

### P07-S05 Golden vertical slice
Build from one product prompt:
- auth;
- organization;
- domain entities;
- CRUD;
- RLS;
- responsive UI;
- browser journeys;
- Git history.

**Exit:** B03 multi-tenant CRM can be produced from intent to proven local product with no manual code edits in the golden path, with a requirements-derived Build Contract and structured failure/repair evidence.

## P08 — Design engine and visual editing

**Goal:** make generated products visually strong and directly editable.

### P08-S01 Project design artifacts
- compact PRODUCT.md;
- BRAND.md;
- DESIGN.md;
- tokens/component catalog.

### P08-S02 Impeccable detector integration
- deterministic design anti-patterns;
- accessibility;
- responsive checks;
- hardening.

### P08-S03 Render/critique/repair
- screenshot + DOM evidence;
- vision/semantic critique where configured;
- bounded design repairs.

### P08-S04 Visual source mapping
- select rendered element;
- map to source/component/tokens;
- reliable source edit.

### P08-S05 Visual editor
- text;
- spacing;
- layout;
- type;
- color;
- responsive;
- component props;
- variants/assets.

### P08-S06 Brand system
- finalize Ineractive identity from a strong central concept;
- product/marketing motion and layout system;
- avoid donor/client identity copying.

### P08-S07 Design Context Compiler and DesignSystemRevision
- ingest source/design-system packages/tokens/brand artifacts/rendered evidence;
- normalize design principles/component catalog/token graph/interaction/responsive rules;
- every inferred rule carries confidence/provenance/status.

### P08-S08 Semantic component binding and drift
- Product Graph component ↔ source symbol ↔ rendered element ↔ design component;
- CLEAN / CODE_AHEAD / DESIGN_AHEAD / DIVERGED / UNBOUND states;
- no silent divergence resolution.

### P08-S09 Annotation Intent, direct manipulation, and design exploration
- anchored annotations compile to typed ChangeIntent/locality;
- direct manipulation remains real source/semantic diff;
- design branches can compare alternatives;
- independent Design Evaluator uses real rendered product.

### P08-S10 Asset/font provenance
- generated/imported asset provenance;
- font source/license metadata where known;
- source-to-asset inventory;
- no claim of rights merely because an asset was discovered/generated.

**Exit:** B01 and B08 reach design/a11y/responsive quality gates, visual edits remain clean source diffs, and design/code round-trip state is explicit rather than silently overwritten.

## P09 — Import and multimodal starting points

**Goal:** work with more than blank prompts.

### P09-S01 Existing repository import
- safe discovery without auto-executing scripts;
- infer routes/schema/components/tests;
- propose Product Graph with confidence.

### P09-S02 Screenshot/image to product
- image analysis;
- component/layout reconstruction;
- design-token inference;
- rendered comparison loop.

### P09-S03 URL/reference import
- browser capture;
- distinguish inspiration from copying;
- reconstruct behavior/design intent.

### P09-S04 Design import and provider adapter
- provider-neutral DesignProvider contract;
- Figma/design integration where authorized;
- native editable design context where supported;
- asset/token/component mapping;
- code/design round-trip reconciliation.

### P09-S05 Brownfield change
- add feature to imported app without unnecessary rewrite.

### P09-S06 Existing backend reconstruction
- inspect schema/migrations/auth/policies/storage/functions from an existing project;
- propose Product Graph/backend bindings with confidence;
- reconcile remote backend truth instead of assuming source is complete.

**Exit:** B09 passes on a non-trivial existing project with source/runtime/backend reconstruction and bounded feature change.

## P10 — Assurance, review, and security convergence

**Goal:** make proof a product feature.

### P10-S01 Assurance kernel
- normalized findings/evidence/coverage;
- claim requirements;
- freshness/staleness;
- producer/verifier separation for acceptance-critical claims;
- deterministic/independent oracles derived from requirements and runtime observations rather than trusting tests produced by the same generation path.

### P10-S02 Ascout adapters
- tests;
- browser;
- changed-code exercise;
- security evidence as available.

### P10-S03 Alibaba OCR
- exact diff;
- business/spec background;
- file accounting;
- structured findings;
- rerun after material repair.

### P10-S04 Diffcipline
- exact candidate proof;
- risk profiles;
- CI integration;
- no NOT-RUN green.

### P10-S05 Security pack
- RLS/auth;
- secrets;
- dependencies;
- generated-code risk;
- sandbox policy;
- negative fixtures.

### P10-S06 Ineractive Evaluation Lab
- fixed new-product, change, repair, brownfield, design, security, recovery, routing, and context benchmarks;
- live and recorded-observation replay;
- quality/correctness/security/cost/latency/question metrics;
- no single aggregate score can hide correctness or security failure;
- harness changes receive regression evidence.

### P10-S07 Supply-chain and artifact integrity
- lockfile/dependency integrity;
- vulnerability/license/notice checks;
- source/import provenance;
- secret scan;
- asset/font inventory;
- build artifact/source binding;
- optional SBOM before production publish.

### P10-S08 Production-web quality pack
- i18n/RTL fixtures;
- accessibility;
- SEO metadata where applicable;
- performance regression budgets;
- realistic-data browser journeys.

### P10-S09 Dataset quality and lineage assurance
- schema/type verification;
- row/object count reconciliation;
- duplicate/missingness/domain checks;
- referential-integrity verification;
- transformation lineage;
- sensitive-data handling assertions;
- deterministic seed/synthetic-data reproducibility.

**Exit:** golden and benchmark products produce machine-readable proof bundles with zero unresolved material review findings; imported/generated datasets have explicit lineage and quality evidence; and the harness has repeatable regression evidence.

## P11 — Git, preview, publish, and deployment

**Goal:** let users own and ship the result.

### P11-S01 GitHub integration
- create/connect repository;
- branch/commit/push;
- PR flow;
- source ownership.

### P11-S02 Preview deployment
- reproducible preview target;
- exact source/evidence binding;
- environment variables through broker.

### P11-S03 Production deployment and portability
Initial qualified targets:
- one simple managed web deployment path;
- Docker/self-host export.

Prove clean-room portability: exported source + documented dependencies must build, reconstruct its backend, run, and pass critical browser journeys without access to Ineractive-specific runtime services.

Add Vercel/Cloudflare/Netlify adapters based on qualification, not marketing breadth.

### P11-S04 Domains/environment/secrets
- environment-specific settings;
- custom domains;
- deploy smoke tests;
- rollback/recovery model.

### P11-S05 Supabase remote publish
- migration plan;
- production authorization;
- post-deploy verification;
- drift state.

### P11-S06 Release Manifest and promotion
Bind a production candidate to:
- source head;
- Product Graph/design revisions;
- build artifact;
- backend migration set;
- schema/application compatibility;
- environment config and secret references;
- proof bundle;
- recovery plan.

Promotion states include CANDIDATE / PREVIEW / QUALIFIED / PROMOTED / DEGRADED / ROLLED_BACK / SUPERSEDED.

Maintain last-known-good identity. Promotion requires joint app/backend compatibility evidence.

### P11-S07 Generated-product operations baseline
- health/readiness where applicable;
- structured logs and deploy/source identity;
- error boundary/reporting adapter;
- backend function/job logs;
- optional OpenTelemetry-compatible instrumentation;
- optional portable product analytics/events;
- generated product never requires Ineractive telemetry to run.

### P11-S08 Production recovery qualification
- backup/restore awareness and documented expectations;
- failed deploy after migration;
- app rollback against forward-compatible schema;
- credential revocation;
- environment drift;
- last-known-good recovery drill.

### P11-S09 Connected Ownership Orchestrator
Provide one coherent user-owned infrastructure flow:

#### GitHub
- install/authorize least-privilege GitHub App;
- connect existing repository or create one when authorized;
- initialize/push normal source, migrations, config, fixtures, and docs;
- branches/PR/checks remain normal GitHub truth.

#### Supabase
- connect existing user-owned project through qualified OAuth/integration flow;
- or create a project in an authorized user organization when supported and permitted;
- configure/link using supported Management API/CLI surfaces;
- preserve repository-owned migrations/configuration;
- reconcile drift before mutation.

#### Combined
- bind project/repository/backend identities;
- never require users to copy long-lived PATs/secrets through chat;
- manual fallback only where provider API, plan, or organization policy requires it;
- revocation/deauthorization is observable and safe.

### P11-S10 A-to-Z Product Factory benchmark
Prove **B17 — Idea to owned production product**:
- begin from a product brief plus business spreadsheet;
- derive Product Graph and DatasetVersion;
- build bilingual web product;
- compile/test Supabase backend;
- connect/create user-owned GitHub and Supabase through qualified authorization;
- preview, qualify, promote, observe, recover;
- perform one post-launch feature change;
- no manual developer coding in the golden path.

**Exit:** a user can move from idea/data to a tested, GitHub-owned, Supabase-connected, deployed and observable product through one coherent Ineractive workflow, with explicit external-account approval steps but no hidden developer handoff.

## P12 — Collaboration and durable project intelligence

**Goal:** move from solo builder to product team.

### P12-S01 Teams/projects/roles
- organizations;
- memberships;
- project roles;
- invitations.

### P12-S02 Collaboration
- comments/mentions;
- change activity;
- shared preview;
- conflict-aware edits.

### P12-S03 Project intelligence UX
Build the collaborative UX over the P03 Project Context substrate:
- decisions;
- assumptions;
- conventions;
- successful repairs;
- rejected approaches;
- scoped preferences;
- loaded-context/provenance visibility.

### P12-S04 Tasks/issues
- connect Product Graph/SpecGrain work to lightweight project activity;
- do not build a generic project-management suite.

### P12-S05 Project Learning, team Skills, and branch comparison
- evidence-backed learning proposals;
- approval/version/rollback for durable context updates;
- project/team Skill proposal and qualification UX;
- compare ExplorationBranches across graph/design/source/evidence;
- selective merge with conflict visibility.

**Exit:** two users can safely collaborate on a product with shared durable decisions, governed project learning, reusable team workflows, and source ownership.

## P13 — Extensibility and ecosystem

**Goal:** make Ineractive an open platform.

### P13-S01 Model providers
- multiple real generative adapters;
- router qualification;
- private-provider configuration.

### P13-S02 MCP / Skills / OpenAPI
- bounded tool discovery;
- capability mapping;
- approval policy.

### P13-S03 Templates as accelerators, not product identity
- starter archetypes;
- component packs;
- backend patterns;
- all compile into normal Product Graph/source.

### P13-S04 Plugin SDK
- versioned contracts;
- sandbox/permission model;
- compatibility tests.

### P13-S05 Generated AI-product primitives
Provider-neutral generated-app pack:
- text/chat;
- streaming;
- structured output;
- embeddings/vector retrieval;
- tool/function calling;
- moderation/policy hook;
- prompt/version configuration;
- usage/rate limits;
- secret isolation;
- eval fixtures.

Generated apps own/configure their provider dependencies; they never depend on Ineractive's internal model provider.

### P13-S06 High-risk integration qualification
Qualify adapters independently for side effects such as:
- payments;
- SMS/WhatsApp;
- financial/irreversible webhooks.

Require idempotency, reconciliation, external-effect receipts, negative tests, and explicit user authority.

### P13-S07 Product Kits
Combine reusable:
- component packages;
- design tokens;
- brand assets;
- Product Graph fragments;
- project Skills;
- backend patterns;
- verification rules.

Kits accelerate normal source/graph generation; they are not opaque templates.

**Exit:** external capabilities and reusable product intelligence can extend Ineractive without bypassing core policy/evidence or generated-product ownership.

## P14 — Mobile and cross-surface compiler targets

**Goal:** expand beyond responsive/PWA web after web quality is proven.

### P14-S01 PWA hardening
- installability;
- offline behavior where requested;
- device capabilities.

### P14-S02 Expo/React Native target
- shared Product Graph;
- mobile navigation/components;
- backend reuse;
- device preview.

### P14-S03 Cross-platform product logic
- identify portable vs target-specific nodes;
- evidence per target.

**Exit:** one qualified mobile benchmark shares product semantics/backend without pretending web code is automatically native.

## P15 — Managed scale and commercial hardening

**Goal:** operate Ineractive responsibly as a hosted product.

### P15-S01 Multi-tenant control plane
- tenant isolation;
- quotas;
- jobs;
- sandbox pool;
- rate limiting.

### P15-S02 Billing/cost controls
- transparent metering;
- budget ceilings;
- provider/sandbox/backend cost attribution;
- no surprise spend.

### P15-S03 Managed Supabase ownership/transfer
- provisioning;
- billing;
- export/transfer;
- deletion;
- backups/incident response.

### P15-S04 Reliability/observability
- SLOs;
- queue/run recovery;
- provider degradation;
- sandbox leaks;
- audit/incident tooling.

### P15-S05 Release/security hardening
- signing;
- organization-wide provenance policy;
- advanced SBOM/attestations;
- dependency policy;
- disaster recovery;
- penetration/security qualification.

### P15-S06 Enterprise identity/governance
- enterprise SSO/SAML where justified;
- SCIM/user lifecycle;
- organization policy;
- audit export;
- retention/residency controls;
- admin approval policy.

**Exit:** hosted operation has evidence for tenant isolation, recovery, cost control, user ownership, and enterprise governance.

## 2. Cross-phase invariants

Every phase preserves:

- provider-neutral core contracts;
- Product Graph/source ownership;
- capability-before-power;
- no secret in browser/model by default;
- local isolated verification before production;
- exact-head evidence;
- SpecGrain readiness;
- OCR semantic review;
- Diffcipline proof;
- provenance for copied/adapted code;
- producer/verifier separation for acceptance-critical proof;
- generated-product runtime independence from Ineractive;
- explicit partial-failure/recovery semantics for side effects;
- bounded cost/spend/parallelism through policy;
- durable project context is not transcript memory;
- skills never grant capabilities;
- external content/tool instructions are untrusted until policy admits them;
- production promotion binds application/backend compatibility and proof;
- generated products expose portable operational/release identity;
- no unnecessary user interrogation.

## 3. First benchmark product

Use a deliberately demanding but bounded CRM benchmark as the first golden product:

- organizations;
- owners/admin/members;
- contacts;
- companies;
- pipeline/deals;
- notes/tasks;
- file attachments;
- role-specific access;
- invitations;
- dashboard;
- search/filter;
- realtime update for one surface;
- responsive UI;
- Arabic/English variant later in design phase.

This exercises the architecture without requiring payments or high-risk external integrations.

Additional required benchmark families before broad launch:

- **B17 — Idea + spreadsheet → user-owned GitHub + Supabase → production product → post-launch change**;
- Arabic/English RTL product;
- one external API/webhook/email integration;
- production release + schema compatibility/rollback drill;
- generated-app observability/health failure;
- design/code divergence reconciliation;
- brownfield app with existing backend;
- AI-enabled product after P13;
- harness replay/regression benchmark.

## 4. What must remain deferred

Do not pre-implement later phases while earlier contracts are unstable.

Particularly defer:

- native mobile;
- broad cloud/IaC generation;
- generic workflow marketplace;
- arbitrary remote computer control;
- financial/payment automation;
- large multi-agent swarms;
- production destructive database actions without explicit approval;
- a second backend compiler target.

A strong first compiler is more valuable than shallow breadth.
