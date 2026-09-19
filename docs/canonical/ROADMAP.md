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

### P00-S04 Provenance
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

**Exit:** shell runs with typed event/contracts and no fake generation claims.

## P02 — Product Graph and intent compiler

**Goal:** create the semantic product core.

### P02-S01 Product Graph model
- prototype at least two persistence/interface designs;
- choose representation by evidence;
- implement stable typed node/edge/revision contracts.

### P02-S02 Domain and requirements model
- personas, roles, entities, pages, actions, workflows, permissions, assumptions, requirements;
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

**Exit:** representative product intents become inspectable graph revisions and bounded unresolved decisions.

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

**Exit:** one synthetic WorkPacket can route decisions/generation through typed adapters with full run provenance.

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

**Exit:** harness can modify a toy app in an isolated workspace, run it, inspect it in a browser, and produce exact evidence without host-ambient authority.

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

**Exit:** static and stateful UI benchmark products compile, run, and survive incremental change.

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
- recreate-from-empty proof.

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

**Exit:** multi-tenant authenticated CRUD benchmark with RLS and storage reconstructs from source and passes negative security tests.

## P07 — Full product build and repair loop

**Goal:** make intent-to-product continuous.

### P07-S01 Work compiler
- graph diff -> bounded dependency graph;
- map to SpecGrain-ready work;
- expected change surfaces/evidence.

### P07-S02 Build orchestrator
- execute independent units;
- avoid write conflicts;
- checkpoint after proven slices.

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

**Exit:** B03 multi-tenant CRM can be produced from intent to proven local product with no manual code edits in the golden path.

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

**Exit:** B01 and B08 reach design/a11y/responsive quality gates and visual edits remain clean source diffs.

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

### P09-S04 Design import
- Figma/design integration where authorized;
- asset/token/component mapping.

### P09-S05 Brownfield change
- add feature to imported app without unnecessary rewrite.

**Exit:** B09 passes on a non-trivial existing project.

## P10 — Assurance, review, and security convergence

**Goal:** make proof a product feature.

### P10-S01 Assurance kernel
- normalized findings/evidence/coverage;
- claim requirements;
- freshness/staleness.

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

**Exit:** golden product produces a machine-readable proof bundle with zero unresolved material review findings.

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

### P11-S03 Production deployment
Initial qualified targets:
- one simple managed web deployment path;
- Docker/self-host export.

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

**Exit:** a user can build locally, inspect proof, push source, connect their Supabase, and publish a working product they own.

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

### P12-S03 Project memory
Adapt Morize/HarnessMind patterns for:
- decisions;
- assumptions;
- conventions;
- successful repairs;
- rejected approaches;
- scoped preferences.

### P12-S04 Tasks/issues
- connect Product Graph/SpecGrain work to lightweight project activity;
- do not build a generic project-management suite.

**Exit:** two users can safely collaborate on a product with shared durable decisions and source ownership.

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

**Exit:** external capabilities can extend Ineractive without bypassing core policy/evidence.

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
- SBOM/provenance;
- dependency policy;
- disaster recovery;
- penetration/security qualification.

**Exit:** hosted operation has evidence for tenant isolation, recovery, cost control, and user ownership.

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
