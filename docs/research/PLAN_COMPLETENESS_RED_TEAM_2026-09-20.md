# Ineractive Plan Completeness Red-Team Audit

**Date:** 2026-09-20  
**Status:** planning gap audit  
**Baseline:** `main@e8014ea1feb9cb9c37a05f2399f23b33465490fa` plus Draft PR #6 research proposal  
**Purpose:** identify material gaps before promoting the expanded plan into canonical implementation authority.

## 1. Audit method

The plan was reviewed across:

- product semantics;
- generated-product quality;
- model/harness architecture;
- context and skills;
- runtime and capability security;
- Supabase/backend compilation;
- design/code round-trip;
- import/brownfield workflows;
- verification/evaluation;
- release/deployment/recovery;
- generated-product operations;
- collaboration;
- extensibility;
- cost/usage controls;
- privacy/data lifecycle;
- internationalization/accessibility;
- supply chain;
- commercial/enterprise hardening.

The audit also compared current official product directions from:

- Anthropic Claude Design / Claude agent harness;
- Figma Make and codebase workflows;
- Manus;
- Replit Agent 4;
- Bolt;
- v0;
- Lovable security direction.

This document distinguishes **architectural gaps** from features that can safely remain later.

---

# 2. Executive result

The original plan is strong in:

- Product Graph;
- evidence-first delivery;
- Supabase compilation;
- sandbox/capability security;
- portability;
- design quality;
- exact-diff review;
- recovery semantics;
- model neutrality.

The Claude/Figma/Manus research strengthened:

- Design OS;
- Skills OS;
- Project Context OS;
- Agent Harness OS.

The red-team found **12 material gaps** that should be closed in the candidate canonical plan.

---

# 3. Material gap register

| ID | Gap | Severity | Why it matters | Proposed placement |
|---|---|---:|---|---|
| G01 | Harness benchmark/replay laboratory | Critical | Ineractive cannot scientifically improve its harness or detect regressions without repeatable fixed tasks, replay, and quality/cost/time metrics | P03 + P10 |
| G02 | Budget governor | Critical | Model/tool/cloud/browser/Supabase spend must be bounded per run/project without relying on provider UI | P03 |
| G03 | Early durable project-context substrate | Critical | Skills, long-running tasks, design context, and repair learning cannot wait until collaboration beta | P03 |
| G04 | Early System/Project Skills substrate | High | Reusable operating knowledge is part of the harness, not merely an ecosystem marketplace feature | P03 |
| G05 | Untrusted-content and intent-alignment safety layers | Critical | Web/MCP/tool content and high-risk actions require explicit separation from model trust | P04 |
| G06 | Data lifecycle/privacy semantics | Critical | Secure generated apps need classification, retention, export, deletion, audit, and residency semantics before backend compilation | P02 + P06 |
| G07 | Integration/notification compiler | High | Product Graph already has Integration/Notification, but no explicit compiler path covers webhooks/email/API side effects end-to-end | P06 |
| G08 | Production web semantics | High | i18n/RTL, SEO metadata, performance budgets, asset/font handling are required to ship credible public products | P05 + P10 |
| G09 | Generated-app operations baseline | Critical | Production apps require health, logs, errors, telemetry, deploy identity, and optional product analytics | P11 |
| G10 | Release promotion and app/schema compatibility | Critical | Separate code deploy and database migration paths can create unsafe releases without a unified release manifest/promotion protocol | P11 |
| G11 | Generated AI-app primitives | High | A leading 2026 builder must compile safe AI features, not only ordinary CRUD products | P13 |
| G12 | Supply-chain / artifact provenance before production | Critical | Dependency, artifact, SBOM, asset, and release integrity must be proven before publish, not only during late commercial hardening | P08 + P10 + P11 |

---

# 4. G01 — Harness benchmark and replay laboratory

## Gap

The current quality plan mentions a benchmark corpus, but the roadmap/task graph does not give the harness-evaluation system enough explicit authority.

## Required capability

Create an **Ineractive Evaluation Lab** with:

- fixed benchmark products;
- fixed change tasks;
- fixed failure/repair tasks;
- security-negative tasks;
- design-quality tasks;
- brownfield tasks;
- runtime interruption/recovery tasks;
- context-selection tasks;
- tool-routing tasks;
- unnecessary-question tasks.

Every benchmark records:

~~~text
task identity
input revision
context bundle revision
skill set revision
tool catalog revision
model/provider evidence
budget policy
generated diff
runtime result
verification evidence
cost
latency
attempts
human intervention
final verdict
~~~

## Replay

Support two replay classes:

1. **Live replay** — real providers/tools where safe.
2. **Recorded-observation replay** — deterministic fixtures for harness policy/regression testing without repeating external side effects.

## Metrics

Do not optimize one leaderboard number.

Track dimensions:

- task completion;
- requirement coverage;
- security correctness;
- design quality;
- exact-diff quality;
- repair success;
- questions asked;
- context cost;
- model/tool cost;
- latency;
- regression rate.

---

# 5. G02 — Budget Governor

## Gap

The plan has budgets conceptually but lacks a first-class policy component.

## Required capability

Introduce **BudgetPolicy / BudgetGovernor** covering:

~~~text
model tokens/cost
decision calls
tool calls
browser steps
sandbox CPU/time
network bytes/domains
remote API spend
Supabase branch/project spend
deployment spend
retry count
repair count
wall-clock
parallelism
~~~

Budget state must be visible to routing decisions.

A model cannot extend its own budget.

Budget outcomes:

~~~text
CONTINUE
DEGRADE_TO_CHEAPER_PATH
REDUCE_PARALLELISM
STOP_OPTIONAL_WORK
REQUIRE_APPROVAL
BLOCK
~~~

Support quality modes later without coupling core architecture to provider names.

---

# 6. G03 — Project Context substrate

## Gap

Project memory is currently placed late in P12, but several earlier systems depend on durable project context.

## Plan correction

Split the concept:

### P03: Project Context substrate

Low-level governed context:

- accepted decisions;
- assumptions;
- domain vocabulary;
- architecture facts;
- design references;
- source/runtime facts;
- skill registry;
- context provenance;
- versioning.

### P12: Collaboration/memory product experience

- team review;
- context proposal approval;
- shared memory UX;
- comments;
- branch comparison;
- team skills.

This preserves scope while removing an architectural dependency gap.

---

# 7. G04 — Skills substrate

## Gap

Broad MCP/Skills ecosystem is P13, but System/Project skills are needed by the harness much earlier.

## Plan correction

Implement only:

- SYSTEM skills;
- PROJECT skills;
- manifest validation;
- selective loading;
- provenance;
- capability separation;
- fixture/eval support.

Keep marketplace/community import/plugin SDK in P13.

---

# 8. G05 — Untrusted content + action alignment

## Gap

Capability policy is strong, but model-visible content and high-risk intended actions need explicit independent safeguards.

## Required pipeline

~~~text
External observation
→ provenance/trust tagging
→ injection/untrusted-content probe
→ Context Compiler
→ agent proposal
→ deterministic capability policy
→ risk-triggered intent-alignment guard
→ execute
~~~

The intent guard receives:

- user-authorized intent;
- executable action;
- target/resource;
- capability state.

It should not receive generator chain-of-thought.

Denial should allow a safer alternative path and only escalate after bounded repeated denials.

---

# 9. G06 — Data lifecycle and privacy semantics

## Gap

The Product Graph contains entities and permissions but lacks a complete first-class data-governance model.

## Add semantic types

~~~text
DataClass
DataPolicy
RetentionPolicy
ResidencyConstraint
ExportRequirement
DeletionRequirement
AuditRequirement
ConsentRequirement
~~~

Example classifications:

~~~text
PUBLIC
INTERNAL
PERSONAL
SENSITIVE
SECRET
REGULATED
~~~

These do not imply legal compliance automatically.

They compile into candidate:

- database/storage policy;
- retention jobs;
- deletion flows;
- export flows;
- audit events;
- log redaction;
- secret boundaries;
- test requirements.

## Rule

Ineractive must not claim GDPR/HIPAA/etc. compliance merely because these mechanisms exist.

---

# 10. G07 — Integration and notification compiler

## Gap

Integration and Notification are Product Graph nodes, but explicit compiler authority is missing.

## V1 compiler targets

Start with:

- generic REST API client;
- signed webhook producer/consumer;
- transactional email adapter;
- in-app notification;
- provider-neutral secret/config references.

Compile:

~~~text
Integration / Notification
→ typed contract
→ secret references
→ server-side execution boundary
→ retry/idempotency
→ external-effect receipt
→ failure UI
→ test fixture
→ verification
~~~

SMS, WhatsApp, payments, and irreversible external actions remain separately qualified high-risk adapters.

---

# 11. G08 — Production web semantics

## Gap

The product matrix mentions Arabic/RTL/i18n but implementation tasks do not make them first-class compiler requirements. SEO/performance are also implicit rather than explicit.

## Add compiler semantics

### Internationalization

- locale routing/config;
- message catalogs;
- interpolation/pluralization;
- date/number formatting;
- timezone behavior;
- RTL layout;
- logical CSS properties where practical;
- locale-aware browser tests.

### SEO/public web

Where product type requires it:

- title/meta;
- canonical URLs;
- robots;
- sitemap;
- social previews;
- structured metadata where appropriate.

### Performance

Define budgets for:

- initial JS;
- largest assets;
- image strategy;
- font loading;
- route-level performance;
- obvious N+1/backend inefficiency.

Performance remains evidence-based, not guaranteed by template.

---

# 12. G09 — Generated-app Operations baseline

## Gap

Ineractive itself has observability direction, but generated products need an explicit production-operations contract.

## Required baseline

Generated apps should be able to expose/own:

- health/readiness endpoint where applicable;
- structured application logs;
- request/correlation identity where applicable;
- deploy/source version;
- error boundary/reporting adapter;
- backend function/job logs;
- basic runtime health;
- optional OpenTelemetry-compatible instrumentation;
- optional product analytics/events.

Analytics must be opt-in/configurable and portable.

No generated product should require Ineractive telemetry to operate.

---

# 13. G10 — Release manifest and promotion protocol

## Gap

Code deployment and Supabase migration planning exist separately.

A production release must bind them together.

## Introduce ReleaseManifest

~~~text
release_id
source_head
ProductGraphRevision
DesignSystemRevision
build_artifact
backend migration set
minimum/maximum schema compatibility
environment config revision
secret references
required feature flags
proof bundle
recovery plan
~~~

## Promotion state

~~~text
CANDIDATE
PREVIEW
QUALIFIED
PROMOTED
DEGRADED
ROLLED_BACK
SUPERSEDED
~~~

## Rule

Promotion only happens when application and backend compatibility are jointly proven.

Database rollback is not assumed.

Use expand/contract where required.

Maintain last-known-good release identity.

---

# 14. G11 — Generated AI-app primitives

## Gap

Ineractive uses models internally but the plan does not explicitly define how users build AI-powered products.

## Beta compiler pack

Provider-neutral generated-app AI primitives:

- text/chat completion;
- streaming;
- structured output;
- embeddings;
- vector retrieval;
- tool/function calling;
- moderation/policy hook;
- prompt/version configuration;
- usage/cost limit;
- rate limit;
- secret isolation;
- eval fixture.

Do not force the generated product to use Ineractive's internal model provider.

AI dependencies belong to the generated app and remain exportable.

---

# 15. G12 — Supply chain and asset provenance

## Gap

Late P15 supply-chain hardening is too late for production publication.

## Before first production publish require candidate support for:

- lockfile integrity;
- dependency vulnerability scan;
- license/notice inventory;
- generated/imported source provenance;
- build artifact identity;
- source-to-artifact binding;
- secret scan;
- asset provenance;
- font/license metadata where known;
- optional SBOM.

P15 can add organization-wide policy, signing, provenance attestations, and advanced release governance.

---

# 16. Additional important but non-blocking areas

These are real capabilities but do not need to become early critical-path work.

## Feature flags / staged rollout

BETA. Useful for safe production changes after ReleaseManifest exists.

## Payments / commerce

BETA/LATER high-risk adapter pack. It requires external-effect receipts, webhook correctness, idempotency, reconciliation, and financial-state tests.

## Advanced enterprise identity

P15:

- SSO/SAML;
- SCIM;
- enterprise audit;
- retention/residency policy;
- organization policy.

## Persistent cloud computer / authenticated local computer

Later. High-power capability; not required for V1 product compilation.

## Multi-artifact documents/slides/video

Later. Replit/Claude support it, but it must not dilute the first product compiler.

---

# 17. Competitive baseline implications

## Replit Agent 4

Current official direction includes:

- infinite design canvas;
- direct production-code design edits;
- variants;
- parallel isolated tasks;
- visible task state;
- collaboration;
- backend/auth/database work;
- multiple artifact types.

Ineractive should exceed it through Product Graph semantics, exact evidence, backend policy compilation, safe release contracts, and portability.

## Figma Make

Current codebase workflow includes:

- real repository;
- live app with real data;
- annotations;
- direct property editing;
- concurrent prompts;
- branches/commits/PRs.

Ineractive should exceed it by compiling backend/security/release semantics, not only UI.

## Bolt

Current product baseline includes:

- built-in database/auth/functions/storage/secrets;
- analytics;
- custom domains;
- external Supabase/Netlify;
- Stripe integration.

Ineractive therefore needs explicit generated-app operations/integration contracts, even if payments stay later.

## v0

Current official educational path demonstrates prompt-to-live site with database, email notifications, custom domain, GitHub, Supabase/other databases, and Stripe integration.

Ineractive cannot consider basic third-party integrations and production web semantics optional indefinitely.

## Lovable

Recent public security work includes built-in scanning for dependencies, secrets, database security/RLS, and code vulnerabilities, plus external security integrations.

Ineractive's security differentiation must remain deeper: requirements-derived negative tests, exact source identity, capability/runtime policy, and independent evidence.

---

# 18. Plan-quality invariants after this audit

The improved plan should satisfy:

1. **No invisible product state.**
2. **No model is authorization authority.**
3. **No generated app depends on Ineractive to stay alive.**
4. **No production release is only "code deployed"; backend compatibility is part of release state.**
5. **No harness change is accepted without benchmark/regression evidence once the Evaluation Lab exists.**
6. **No long-running agent relies on transcript memory alone.**
7. **No Skill grants its own capabilities.**
8. **No external content becomes trusted instructions merely because it arrived through a tool/MCP/browser.**
9. **No production app is considered operational without health/log/error/release identity basics.**
10. **No public product claim such as accessibility/security/portability/recovery is stronger than executed evidence.**
11. **No high-cost agent loop can silently spend without a policy budget.**
12. **No design/code round trip silently resolves divergence.**
13. **No data classification implies regulatory compliance by itself.**
14. **No asset/import provenance is discarded.**
15. **No one aggregate benchmark score hides security or correctness failure.**

---

# 19. Readiness conclusion

After integrating G01-G12 into the candidate roadmap and task graph, no known architecture-level gap should block implementation of the intended Ineractive product class.

Future discoveries should be handled by rolling-wave SpecGrain refinement rather than speculative early architecture.

The target remains:

> **Ineractive is an AI Product Compiler and Product Operating System that can understand intent, design, build, operate, verify, ship, and evolve real software without sacrificing ownership or truth.**
