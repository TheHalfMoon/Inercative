# Ineractive Product Capability Matrix

**Status:** canonical planning scope map  
**Date:** 2026-09-19

## 1. Purpose

This matrix prevents two failure modes:

1. accidentally shipping a shallow page generator and calling it a product builder;
2. trying to build every possible application category before the core compiler is proven.

The matrix distinguishes:

- **V1 CORE** — required for the first credible product compiler;
- **BETA** — important after the core full-stack path is proven;
- **LATER** — explicitly deferred until evidence justifies expansion;
- **OUT** — not part of the current product direction.

## 2. Builder experience

| Capability | Scope | Notes |
|---|---|---|
| Natural-language product intent | V1 CORE | Primary entry point |
| Screenshot/image input | BETA | P09 |
| URL/reference-site input | BETA | P09 |
| Existing Git repository import | BETA | P09 |
| Figma/design import | BETA | P09 |
| Voice intent | LATER | Useful but not core to compiler quality |
| Assumption Ledger | V1 CORE | Replaces excessive questioning |
| Question Gate | V1 CORE | Zero questions by default |
| Product preview | V1 CORE | Real running app, not static mock |
| Build activity/proof surface | V1 CORE | No hidden "done" claim |
| Visual editing | BETA | P08 |
| Direct code editing | V1 CORE | Product remains normal code |
| Terminal/log access | V1 CORE | Developer mode |
| Undo/checkpoints | V1 CORE | Backed by Git/run state |
| Branch/PR workflows | BETA | P11 |
| Anchored UI annotations | BETA | P08 |
| Exploration branches / compare directions | BETA | Product/design/context/source branching |
| Plan/task visibility while building | BETA | SpecGrain-backed, not a second planning authority |
| Spreadsheet/data starting point | V1 CORE | Product can begin from business data, not only a prompt |
| Existing Supabase starting point | BETA | Reconcile backend truth before mutation |
| Connections/Ship readiness surface | BETA | Product-level provider/blocker/completeness UX |

## 3. Product semantics

| Capability | Scope | Notes |
|---|---|---|
| Product Graph | V1 CORE | Semantic center |
| Personas | V1 CORE | Product context |
| Roles/permissions | V1 CORE | Authorization model |
| Entities/relationships | V1 CORE | Backend compiler input |
| Dataset/Data Workspace | V1 CORE | Import/profile/map/version business data |
| Spreadsheet/CSV/JSON import | V1 CORE | Dataset pipeline, not raw table dump |
| Dataset quality/lineage | V1 CORE | Counts, constraints, transforms, provenance |
| Seed/synthetic data | V1 CORE | Deterministic dev/test fixtures |
| Pages/routes | V1 CORE | UI compiler input |
| Actions/workflows | V1 CORE | Behavior compiler input |
| Requirements | V1 CORE | Verification source |
| Assumptions | V1 CORE | Visible inference |
| Metrics | BETA | Product analytics semantics |
| Notifications | V1 CORE | Basic product behavior |
| Integration definitions | V1 CORE | Typed external boundaries |
| Data classification/policy | V1 CORE | Retention/export/delete/audit semantics when needed |
| External-effect semantics | V1 CORE | Consequence/idempotency/reconciliation |
| Design-system revision reference | BETA | Design OS binding |
| Skill references | BETA | Workflow semantics, not capability grants |
| Release/promotion semantics | BETA | App/backend compatibility |
| ProductCompletenessManifest | V1 CORE | Required/NA/blocked/ready/proven/stale categories |
| Deployment targets | BETA | P11 |
| Multi-target web/mobile semantics | LATER | P14 |

## 4. Generated web application

| Capability | Scope | Notes |
|---|---|---|
| Responsive application shell | V1 CORE | |
| Pages/routes/layouts | V1 CORE | |
| Reusable components | V1 CORE | |
| FrontendQualityProfile | V1 CORE | Compiler-owned frontend architecture/quality contract |
| One primary primitive base | V1 CORE | Avoid mixed focus/keyboard/portal semantics |
| Component reuse before synthesis | V1 CORE | Local/project/qualified registry first |
| Source-owned component registry | V1 CORE | Replaceable ComponentRegistryAdapter |
| Ineractive Qualified Registry | BETA | Curated source accelerators; no runtime lock-in |
| RegistryAdmissionGate | BETA | Provenance/security/a11y/compatibility before admission |
| Forms/validation | V1 CORE | |
| Loading/error/empty states | V1 CORE | |
| Server/client boundary | V1 CORE | Explicit |
| Search/filter/sort | V1 CORE | First benchmark |
| Tables/list/detail views | V1 CORE | Business-app baseline |
| Dashboards | V1 CORE | |
| File upload/download UI | V1 CORE | With Storage |
| Realtime UI updates | V1 CORE | Qualified subset |
| Accessibility baseline | V1 CORE | Build requirement |
| Internationalization framework | BETA | |
| Arabic/RTL | BETA | Required benchmark before broad launch |
| SEO/public metadata | BETA | Only for relevant public products |
| Performance budgets | BETA | Evidence-based |
| Server-first/client-boundary policy | V1 CORE | Minimize unnecessary client JavaScript |
| Next.js runtime diagnostic adapter | BETA | DevTools MCP under Tool Catalog/capability policy |
| Component workbench | BETA | Storybook where persistent component-state value exists |
| Agent component introspection | BETA | Storybook MCP or qualified equivalent |
| On-demand frontend dependencies | V1 CORE | Query/table/forms/i18n/motion only when justified |
| Health/release identity | BETA | Generated-app operations baseline |
| Structured logs/error adapter | BETA | Portable; no Ineractive runtime dependency |
| Product analytics/event schema | BETA | Opt-in/configurable |
| AI product primitives | BETA | Provider-neutral generated-app feature pack |
| PWA/installability | LATER | P14 |
| Native iOS/Android | LATER | Expo/React Native compiler target |

## 5. Supabase backend

| Capability | Scope | Notes |
|---|---|---|
| Local Supabase development stack | V1 CORE | Default build path |
| Postgres schema generation | V1 CORE | |
| Migrations | V1 CORE | Native artifacts |
| Constraints/indexes | V1 CORE | |
| Generated database types | V1 CORE | |
| Auth | V1 CORE | |
| Organizations/memberships | V1 CORE | Multi-tenant benchmark |
| RLS | V1 CORE | Deny by default |
| Explicit Data API exposure/grants | V1 CORE | Separate from RLS |
| Storage | V1 CORE | |
| Realtime | V1 CORE | Bounded subset |
| Edge Functions | V1 CORE | Trusted server-side behavior |
| Webhooks | V1 CORE | With signature/idempotency |
| Generic REST integration | V1 CORE | Typed server-side boundary |
| Transactional email | V1 CORE | Qualified adapter, external-effect receipt |
| In-app notifications | V1 CORE | |
| Data export/delete flows | BETA | Compile when product semantics require |
| Audit events | BETA | Product-level audit, not generic telemetry |
| Cron/background jobs | BETA | |
| Queues | BETA | |
| Vector/search | BETA | Only when product needs it |
| Remote project connect | V1 CORE | User-owned Supabase |
| Remote project create | BETA | Via scoped OAuth/Management API flow in user-owned org |
| Connected existing project reconciliation | V1 CORE | Source↔remote drift before mutation |
| Dataset import to Supabase | V1 CORE | Profile/map/verify before final binding |
| Drift detection | V1 CORE | Required before remote mutation |
| Migration risk classification | V1 CORE | Additive/transformative/restrictive/destructive |
| Expand/contract planning | V1 CORE | For risky production changes |
| Backup/restore awareness | BETA | Operational safety |
| Managed Supabase provisioning | LATER | Commercial hardening |

## 6. Runtime and execution

| Capability | Scope | Notes |
|---|---|---|
| Isolated filesystem | V1 CORE | |
| Process/PTY | V1 CORE | |
| Resource quotas | V1 CORE | |
| Network egress policy | V1 CORE | |
| Secret broker | V1 CORE | |
| Browser automation | V1 CORE | Playwright-class |
| Screenshots/DOM/a11y observations | V1 CORE | |
| Git runtime | V1 CORE | |
| Local Docker-compatible runtime | V1 CORE | |
| Remote sandbox adapter | BETA | Hosted execution |
| Resume/checkpoint | V1 CORE | |
| External-effect receipts | V1 CORE | |
| Ambiguous-state reconciliation | V1 CORE | |
| Artifact Store | V1 CORE | Externalize bulky logs/screenshots/traces/research |
| Stable Tool Catalog / capability mask | V1 CORE | Tool identity stable; eligibility policy-driven |
| Untrusted-content probe | V1 CORE | Web/MCP/tool content remains untrusted |
| Intent-aware high-risk action guard | V1 CORE | Independent of generator persuasion |
| Lifecycle Hook Bus | BETA | Typed/capability-scoped |
| Distinct browser trust classes | BETA | Preview/test/research/authenticated-user |
| Remote computer control | LATER | Not required for product compiler V1 |

## 7. Harness intelligence

| Capability | Scope | Notes |
|---|---|---|
| Provider-neutral generative adapter | V1 CORE | |
| Provider-neutral bounded decision adapter | V1 CORE | |
| Model capability registry | V1 CORE | |
| Routing by task/capability/privacy/budget | V1 CORE | |
| Fallback lineage | V1 CORE | No silent equivalence |
| Context Compiler | V1 CORE | |
| Project Context substrate | V1 CORE | Durable governed context; collaboration UX later |
| System/Project Skills substrate | V1 CORE | Selective loading; no capability grants |
| Context Continuation Policy | V1 CORE | Continue/compact/reset/branch/delegate |
| Budget Governor | V1 CORE | Cost/tool/time/parallelism ceilings |
| Harness replay contract | V1 CORE | Live + recorded-observation replay |
| Work compiler | V1 CORE | Product Graph diff -> bounded work |
| Build Contract | V1 CORE | Requirements-derived producer/verifier contract |
| Failure Ledger | V1 CORE | Structured persistent failures/repairs |
| Repair loop | V1 CORE | Finite and evidence-driven |
| Wide Work / parallel independent units | BETA | Evidence per unit; no write conflict |
| Project Learning Loop | BETA | Proposed durable updates, approval/versioning |
| MCP / Skills / OpenAPI ecosystem | BETA | P13 broad/community ecosystem |
| Plugin SDK | LATER | P13 after core stability |

## 8. Design system and visual quality

| Capability | Scope | Notes |
|---|---|---|
| Tokenized design system | V1 CORE | |
| Typography/layout hierarchy | V1 CORE | |
| Design anti-pattern detectors | V1 CORE | Impeccable-derived |
| Versioned design/frontend rule packs | V1 CORE | Impeccable + interface/React rule packs; findings not authority |
| Responsive viewport checks | V1 CORE | |
| Accessibility checks | V1 CORE | |
| Screenshot critique loop | BETA | P08 |
| DOM/source mapping | BETA | P08 |
| Visual source editing | BETA | P08 |
| Brand artifacts | BETA | PRODUCT/BRAND/DESIGN |
| Design variants | BETA | |
| Design Context Compiler | BETA | Normalize code/design/brand context |
| DesignSystemRevision | BETA | Versioned design truth |
| Semantic component bindings | BETA | Product ↔ source ↔ runtime ↔ design |
| Code/design drift detection | BETA | CLEAN/CODE_AHEAD/DESIGN_AHEAD/DIVERGED/UNBOUND |
| Native design-provider round trip | BETA | Figma first qualified adapter |
| Annotation Intent / locality | BETA | Instance/component/token/page/product |
| Asset/font provenance | V1 CORE | Rights metadata where known; no automatic clearance claim |
| VisualPromptProtocol | BETA | Structured, versioned creative-media intent compiled from product/design truth |
| Provider-neutral creative-media generation/editing | BETA | MediaGenerationRequest + MediaProviderAdapter; provider remains replaceable |
| Bounded creative-media routing | BETA | Deterministic eligibility first; decision model ranks only compatible options |
| CreativeAsset provenance/evaluation | BETA | Generation/edit lineage, rights metadata, Product Graph/design bindings, evidence |
| Bounded raster/compositing refinement | BETA | Product-asset finishing only; not a general Photoshop replacement |
| Independent Design Evaluator | BETA | Real rendered product |
| Component-state catalog/testing | BETA | Stories/interaction/a11y for reusable states |
| Qualified external UI discovery | BETA | Optional registries only through admission gate |
| Full freeform design-tool replacement | OUT | Ineractive edits products, not every design artifact category |

## 9. Verification and assurance

| Capability | Scope | Notes |
|---|---|---|
| Requirements-derived verification | V1 CORE | |
| Unit tests | V1 CORE | |
| Integration tests | V1 CORE | |
| Browser/E2E | V1 CORE | |
| Auth/RLS negative tests | V1 CORE | |
| Storage tests | V1 CORE | |
| Migration reconstruction tests | V1 CORE | |
| Accessibility checks | V1 CORE | |
| Dependency/security checks | V1 CORE | |
| Producer/verifier separation | V1 CORE | |
| Alibaba OCR semantic review | V1 CORE | Delivery gate after P00 |
| Diffcipline exact-diff proof | V1 CORE | |
| Changed-code exercise evidence | BETA | |
| Visual regression | BETA | |
| Performance regression | BETA | |
| Deterministic React quality scan | BETA | React Doctor candidate; score is not PASS |
| FrontendEvidenceBundle | BETA | Exact-source component/design/a11y/browser/perf evidence |
| Evaluation Lab benchmark/replay | BETA | Required before broad quality claims |
| Harness quality/cost/latency regression | BETA | Multi-dimensional, not one score |
| Supply-chain/source/artifact integrity | V1 CORE | Dependency/secret/provenance baseline before production |
| SBOM | BETA | Before production claim where supported |
| Mutation/fuzz/property testing | BETA | Risk-driven |
| Formal/model checking | LATER | Only where justified |

## 10. Ownership and deployment

| Capability | Scope | Notes |
|---|---|---|
| Local project ownership | V1 CORE | |
| Source export | V1 CORE | |
| Git repository ownership | V1 CORE | |
| GitHub App least-privilege connection | BETA | User chooses account/org/repos |
| Create/connect repository | BETA | User-owned destination |
| GitHub↔Supabase project identity binding | BETA | End-to-end ownership workflow |
| Supabase migration/config ownership | V1 CORE | |
| Docker/self-host export | BETA | P11 |
| First managed preview deploy | BETA | P11 |
| First managed production deploy | BETA | P11 |
| Clean-room portability proof | BETA | Required before portability claim |
| Custom domains | BETA | |
| ProviderAdapter lifecycle | BETA | Provider-neutral connect/discover/preflight/create/verify/reconcile/detach |
| Connection/ResourceBinding state | BETA | Authority and external resource identity are explicit |
| EnvironmentManifest | BETA | Source/backend/deploy/config/secrets/data/region/release mapping |
| OwnershipManifest | BETA | Owner/billing/export/transfer/detach/delete semantics |
| ProvisioningSaga | BETA | Multi-provider partial failure/reconciliation |
| ExternalBlocker manifest | BETA | Approval/plan/billing/quota/region/policy blockers |
| Environment secrets | BETA | Brokered |
| Secret rotation/revocation lifecycle | BETA | Versioned SecretRef/Binding, reverify consumers |
| Domain/DNS/certificate lifecycle | BETA | Async verification + manual fallback |
| ReleaseManifest | BETA | Source + backend + config + proof + recovery |
| Last-known-good promotion | BETA | Candidate cannot silently replace proven release |
| Generated-app operations baseline | BETA | Health/log/error/release identity |
| Connected Ownership Orchestrator | BETA | GitHub + Supabase + deployment identity flow |
| A-to-Z factory benchmark | BETA | Idea/data → owned production product → post-launch change |
| A-to-exit/reconnect benchmark | BETA | Revoke Ineractive access, preserve ownership/runtime, reconcile same resources |
| Product completeness gate | BETA | No overall Done while an applicable category is unresolved |
| Provider lifecycle failure fixtures | BETA | Permission/revocation/rate-limit/partial-create/timeout/plan blockers |
| Production recovery drill | BETA | App/schema compatibility + backup expectations |
| Feature flags/staged rollout | LATER | Useful after release model is proven |
| Multi-cloud arbitrary IaC | LATER | Avoid shallow breadth |
| Ineractive-only runtime dependency | OUT | Violates portability contract |

## 11. Collaboration

| Capability | Scope | Notes |
|---|---|---|
| Personal projects | V1 CORE | |
| Team organizations | BETA | P12 |
| Project roles | BETA | |
| Invitations | BETA | |
| Activity history | BETA | |
| Comments/mentions | BETA | |
| Shared preview | BETA | |
| Team project-learning approvals | BETA | Durable context changes are reviewable |
| Team Skills library | BETA | Governed/project-scoped |
| Exploration branch compare/merge | BETA | Graph/design/source/evidence |
| Real-time multi-cursor visual editing | LATER | Not required for product value |
| Generic Jira replacement | OUT | Keep work view lightweight |

## 12. Application categories

### Must prove before credible V1 claim

- responsive product site;
- authenticated CRUD SaaS;
- multi-tenant CRM/internal tool;
- file/storage application;
- realtime collaboration-like flow;
- external API/webhook/email integration;
- complex stateful workflow;
- Arabic/RTL application;
- release/schema compatibility and recovery drill;
- generated-app health/observability failure;
- brownfield feature change with existing backend reconstruction.

### Later specialization

- AI-enabled product after the AI primitive pack is qualified;
- commerce;
- payments;
- regulated clinical/financial workflows;
- native mobile;
- high-scale event systems;
- arbitrary infrastructure generation.

These can be built eventually, but they should not distort the first compiler around edge-case infrastructure.

## 13. Scope rule

A feature can move earlier only when it is a dependency of a proven benchmark or removes a material user blocker.

Popularity alone is not enough to pull a feature into V1.
