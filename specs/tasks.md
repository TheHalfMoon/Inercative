# Ineractive Program Tasks

**Status:** roadmap task index; not Grain authority  
**Date:** 2026-09-19

This file provides stable dependency-order handles. SpecGrain is the authority for executable Grain state once initialized.

Every dependency is expressed as a full stable task ID except the root sentinel `planning merge`. No bare `T01`/phase shorthand is authoritative.

| ID | Phase | Outcome | Depends on |
|---|---|---|---|
| IN-P00-S01-T01 | P00 | Qualify and pin initial workspace/toolchain | planning merge |
| IN-P00-S01-T02 | P00 | Create minimum monorepo/module skeleton and baseline checks | IN-P00-S01-T01 |
| IN-P00-S01-T03 | P00 | Add CI baseline with exact command evidence | IN-P00-S01-T02 |
| IN-P00-S02-T01 | P00 | Initialize SpecGrain from canonical roadmap | IN-P00-S01-T02 |
| IN-P00-S03-T01 | P00 | Initialize Diffcipline risk/proof policy | IN-P00-S01-T02 |
| IN-P00-S03-T02 | P00 | Prove one harmless exact-diff change end to end | IN-P00-S03-T01 |
| IN-P00-S04-T01 | P00 | Select and commit Ineractive-owned code license and third-party notice policy | IN-P00-S01-T02 |
| IN-P00-S04-T02 | P00 | Implement donor provenance/import record schema | IN-P00-S04-T01 |
| IN-P00-S04-T03 | P00 | Add provenance validation and notice inventory | IN-P00-S04-T02 |
| IN-P00-S05-T01 | P00 | Establish Alibaba OCR local exact-diff review procedure | IN-P00-S01-T02 |
| IN-P00-S05-T02 | P00 | Define OCR review evidence/file-accounting contract | IN-P00-S05-T01 |
| IN-P01-S01-T01 | P01 | Qualify control-plane framework | IN-P00-S01-T03, IN-P00-S02-T01, IN-P00-S03-T02, IN-P00-S04-T03, IN-P00-S05-T02 |
| IN-P01-S02-T01 | P01 | Implement protocol identity/revision primitives | IN-P01-S01-T01 |
| IN-P01-S02-T02 | P01 | Implement run/event/evidence/finding schemas | IN-P01-S02-T01 |
| IN-P01-S03-T01 | P01 | Build project/workspace shell | IN-P01-S02-T02 |
| IN-P01-S04-T01 | P01 | Build first accessible tokenized UI system | IN-P01-S03-T01 |
| IN-P01-S05-T01 | P01 | Establish minimum Supabase-backed control-plane user/project store with generated-app data-plane separation | IN-P01-S01-T01, IN-P01-S02-T02, IN-P01-S03-T01 |
| IN-P02-S01-T01 | P02 | Prototype Product Graph persistence/interface alternatives | IN-P01-S04-T01, IN-P01-S05-T01 |
| IN-P02-S01-T02 | P02 | Select and implement Product Graph v1 contracts | IN-P02-S01-T01 |
| IN-P02-S02-T01 | P02 | Implement domain nodes/edges and deterministic validators | IN-P02-S01-T02 |
| IN-P02-S02-T02 | P02 | Implement data classification/lifecycle/privacy/locale/external-effect semantics and validators | IN-P02-S02-T01 |
| IN-P02-S06-T01 | P02 | Implement semantic references for design-system revisions, skills, exploration branches, and releases | IN-P02-S02-T02 |
| IN-P02-S07-T01 | P02 | Implement Dataset/DatasetVersion/import/mapping/profile/quality/seed/synthetic semantic contracts | IN-P02-S02-T02 |
| IN-P02-S08-T01 | P02 | Implement ProductCompletenessManifest category/state semantics and deterministic validators | IN-P02-S02-T02, IN-P02-S07-T01 |
| IN-P02-S03-T01 | P02 | Implement Change Intent -> proposed graph delta | IN-P02-S02-T01 |
| IN-P02-S04-T01 | P02 | Implement Question Gate and Assumption Ledger | IN-P02-S03-T01 |
| IN-P02-S05-T01 | P02 | Build Product Graph user views | IN-P02-S02-T01, IN-P02-S04-T01 |
| IN-P03-S01-T01 | P03 | Implement Run lifecycle/event store | IN-P01-S02-T02, IN-P01-S05-T01 |
| IN-P03-S02-T01 | P03 | Implement provider-neutral generative adapter | IN-P03-S01-T01 |
| IN-P03-S03-T01 | P03 | Implement bounded decision adapter and thresholds | IN-P03-S01-T01 |
| IN-P03-S04-T01 | P03 | Implement model capability registry/router | IN-P03-S02-T01, IN-P03-S03-T01 |
| IN-P03-S05-T01 | P03 | Implement context compiler and context provenance | IN-P02-S05-T01, IN-P02-S06-T01, IN-P03-S04-T01 |
| IN-P03-S06-T01 | P03 | Implement durable Project Context store, revisions, Execution Header, and continuation policy | IN-P03-S05-T01, IN-P03-S01-T01 |
| IN-P03-S07-T01 | P03 | Implement System/Project Skill registry, manifest validation, provenance, and selective loading | IN-P03-S05-T01, IN-P00-S04-T03 |
| IN-P03-S08-T01 | P03 | Implement BudgetGovernor for model/tool/browser/sandbox/network/backend spend and parallelism | IN-P03-S01-T01, IN-P03-S04-T01 |
| IN-P03-S09-T01 | P03 | Implement Artifact Store with stable artifact identity/provenance | IN-P03-S01-T01 |
| IN-P03-S09-T02 | P03 | Implement live and recorded-observation harness replay contract | IN-P03-S06-T01, IN-P03-S07-T01, IN-P03-S08-T01, IN-P03-S09-T01 |
| IN-P04-S01-T01 | P04 | Implement capability request/grant kernel | IN-P01-S02-T02, IN-P03-S01-T01 |
| IN-P04-S02-T01 | P04 | Implement sandbox runtime contract | IN-P04-S01-T01 |
| IN-P04-S02-T02 | P04 | Qualify first local Docker-compatible sandbox adapter | IN-P04-S02-T01 |
| IN-P04-S03-T01 | P04 | Implement network policy and secret broker | IN-P04-S01-T01, IN-P04-S02-T02 |
| IN-P04-S04-T01 | P04 | Implement Git runtime/checkpoint primitives | IN-P04-S02-T02 |
| IN-P04-S05-T01 | P04 | Implement Playwright-class browser runtime and evidence | IN-P04-S02-T02, IN-P04-S03-T01 |
| IN-P04-S06-T01 | P04 | Implement stable Tool Catalog identities and capability/eligibility masking | IN-P04-S01-T01, IN-P03-S07-T01 |
| IN-P04-S06-T02 | P04 | Implement connector/MCP trust metadata and untrusted-content probe | IN-P04-S06-T01, IN-P03-S05-T01 |
| IN-P04-S06-T03 | P04 | Implement risk-triggered intent-aware action guard with bounded deny-and-continue | IN-P04-S06-T01, IN-P04-S06-T02, IN-P04-S03-T01 |
| IN-P04-S06-T04 | P04 | Implement typed Lifecycle Hook Bus and runtime/browser trust classes | IN-P04-S06-T03, IN-P04-S05-T01 |
| IN-P05-S01-T01 | P05 | Qualify/generated-project V1 scaffold | IN-P02-S05-T01, IN-P03-S06-T01, IN-P04-S04-T01, IN-P04-S05-T01, IN-P04-S06-T04 |
| IN-P05-S02-T01 | P05 | Compile routes/pages/components from Product Graph | IN-P05-S01-T01 |
| IN-P05-S03-T01 | P05 | Compile forms/validation/actions | IN-P05-S01-T01, IN-P05-S02-T01 |
| IN-P05-S04-T01 | P05 | Implement incremental bounded source edits | IN-P05-S02-T01, IN-P05-S03-T01 |
| IN-P05-S05-T01 | P05 | Implement locale/i18n/timezone/RTL compiler semantics and Arabic-English fixtures | IN-P05-S02-T01, IN-P05-S03-T01 |
| IN-P05-S06-T01 | P05 | Implement production-web metadata, asset-loading, and route performance-budget contracts | IN-P05-S02-T01, IN-P05-S03-T01, IN-P04-S05-T01 |
| IN-P06-S01-T01 | P06 | Integrate isolated local Supabase CLI stack | IN-P04-S02-T02, IN-P04-S03-T01 |
| IN-P06-S02-T01 | P06 | Implement schema/migration/type compiler | IN-P02-S02-T01, IN-P06-S01-T01 |
| IN-P06-S02-T02 | P06 | Implement migration risk classification, expand/contract, and recovery planning | IN-P06-S02-T01 |
| IN-P06-S03-T01 | P06 | Implement auth/organization/membership compiler | IN-P06-S02-T01 |
| IN-P06-S04-T01 | P06 | Implement explicit Data API/RLS compiler | IN-P06-S02-T01, IN-P06-S03-T01 |
| IN-P06-S04-T02 | P06 | Implement cross-tenant negative policy tests | IN-P06-S04-T01 |
| IN-P06-S05-T01 | P06 | Implement Storage compiler and policy tests | IN-P06-S01-T01, IN-P06-S04-T01 |
| IN-P06-S06-T01 | P06 | Implement Realtime/functions/jobs subset | IN-P06-S03-T01, IN-P06-S04-T01 |
| IN-P06-S07-T01 | P06 | Implement Supabase OAuth/Management API connection flow | IN-P04-S03-T01, IN-P06-S01-T01 |
| IN-P06-S07-T02 | P06 | Implement remote drift/migration plan | IN-P06-S02-T02, IN-P06-S07-T01 |
| IN-P06-S08-T01 | P06 | Implement data lifecycle/export/delete/audit compiler from Product Graph policy semantics | IN-P02-S02-T02, IN-P06-S04-T01, IN-P06-S06-T01 |
| IN-P06-S09-T01 | P06 | Implement REST/webhook/email/in-app integration and notification compiler | IN-P02-S02-T02, IN-P04-S03-T01, IN-P06-S06-T01 |
| IN-P06-S09-T02 | P06 | Implement integration idempotency/reconciliation/external-effect receipt fixtures | IN-P06-S09-T01 |
| IN-P06-S10-T01 | P06 | Implement Data Workspace import/profile/mapping/quality/lineage pipeline for CSV/XLSX/JSON and qualified sources | IN-P02-S07-T01, IN-P06-S01-T01, IN-P06-S02-T01, IN-P06-S08-T01 |
| IN-P06-S10-T02 | P06 | Implement verified dataset-to-Supabase import/transformation/reconciliation pipeline | IN-P06-S10-T01, IN-P06-S04-T01 |
| IN-P06-S10-T03 | P06 | Implement staged/chunked dataset import with durable batch resume, count reconciliation, and masked-nonproduction policy | IN-P06-S10-T02, IN-P03-S09-T01, IN-P04-S01-T01 |
| IN-P06-S11-T01 | P06 | Implement deterministic seed/synthetic dataset generation with role/state/edge-case coverage | IN-P02-S07-T01, IN-P06-S02-T01 |
| IN-P07-S01-T01 | P07 | Implement Product Graph delta -> bounded WorkPlan | IN-P02-S05-T01, IN-P03-S06-T01 |
| IN-P07-S01-T02 | P07 | Implement requirements-derived Build Contract compiler | IN-P07-S01-T01, IN-P02-S02-T02 |
| IN-P07-S01-T03 | P07 | Implement independent evaluator challenge/acceptance handshake for high-risk or novel work | IN-P07-S01-T02, IN-P04-S05-T01 |
| IN-P07-S01-T04 | P07 | Compile and maintain ProductCompletenessManifest from Product Graph, product type, blockers, and evidence-status inputs | IN-P02-S08-T01, IN-P07-S01-T02, IN-P01-S02-T02 |
| IN-P07-S02-T01 | P07 | Implement build orchestrator and write ownership | IN-P07-S01-T01, IN-P04-S04-T01, IN-P04-S05-T01 |
| IN-P07-S02-T02 | P07 | Implement durable checkpoints, external-effect receipts, and ambiguity reconciliation | IN-P07-S02-T01 |
| IN-P07-S02-T03 | P07 | Implement Wide Work/context-branch orchestration with isolated write ownership and synthesis | IN-P07-S02-T02, IN-P03-S06-T01, IN-P03-S08-T01, IN-P04-S04-T01 |
| IN-P07-S03-T01 | P07 | Normalize build/browser/backend failures | IN-P07-S02-T02, IN-P05-S04-T01, IN-P06-S04-T02 |
| IN-P07-S03-T02 | P07 | Implement structured Failure Ledger with artifact/source/attempt provenance | IN-P07-S03-T01, IN-P03-S09-T01 |
| IN-P07-S04-T01 | P07 | Implement bounded repair loop | IN-P07-S03-T02 |
| IN-P07-S05-T01 | P07 | Complete golden multi-tenant CRM vertical slice | IN-P07-S01-T03, IN-P07-S01-T04, IN-P07-S02-T03, IN-P07-S04-T01, IN-P05-S04-T01, IN-P06-S04-T02, IN-P06-S08-T01, IN-P06-S09-T02 |
| IN-P08-S01-T01 | P08 | Generate compact product/brand/design artifacts | IN-P05-S04-T01 |
| IN-P08-S02-T01 | P08 | Integrate Impeccable-derived deterministic design checks | IN-P08-S01-T01 |
| IN-P08-S03-T01 | P08 | Implement render/critique/repair design loop | IN-P08-S02-T01, IN-P04-S05-T01 |
| IN-P08-S04-T01 | P08 | Implement rendered element -> source mapping | IN-P05-S04-T01 |
| IN-P08-S05-T01 | P08 | Implement first visual edits to real code | IN-P08-S03-T01, IN-P08-S04-T01 |
| IN-P08-S06-T01 | P08 | Finalize Ineractive brand system | IN-P08-S01-T01 |
| IN-P08-S07-T01 | P08 | Implement Design Context Compiler and versioned DesignSystemRevision | IN-P08-S01-T01, IN-P03-S06-T01 |
| IN-P08-S08-T01 | P08 | Implement semantic product/source/runtime/design component bindings and drift states | IN-P08-S04-T01, IN-P08-S07-T01 |
| IN-P08-S09-T01 | P08 | Implement Annotation Intent/locality and direct-manipulation semantic diffs | IN-P08-S05-T01, IN-P08-S08-T01 |
| IN-P08-S09-T02 | P08 | Implement design exploration branches and independent Design Evaluator | IN-P08-S03-T01, IN-P08-S09-T01, IN-P07-S02-T03 |
| IN-P08-S10-T01 | P08 | Implement asset/font provenance and inventory contract | IN-P00-S04-T03, IN-P08-S01-T01 |
| IN-P09-S01-T01 | P09 | Implement safe existing-repository discovery/import | IN-P04-S04-T01, IN-P04-S05-T01, IN-P05-S04-T01 |
| IN-P09-S02-T01 | P09 | Implement screenshot/image reconstruction flow | IN-P08-S03-T01, IN-P08-S05-T01 |
| IN-P09-S03-T01 | P09 | Implement URL/reference capture and reconstruction | IN-P04-S05-T01, IN-P08-S03-T01 |
| IN-P09-S04-T01 | P09 | Qualify provider-neutral DesignProvider import path | IN-P08-S08-T01, IN-P08-S10-T01 |
| IN-P09-S04-T02 | P09 | Qualify first native code/design round-trip adapter with drift reconciliation | IN-P09-S04-T01, IN-P08-S09-T01 |
| IN-P09-S06-T01 | P09 | Reconstruct existing backend/schema/auth/policy/storage/function semantics into Product Graph bindings | IN-P09-S01-T01, IN-P06-S07-T02, IN-P06-S08-T01 |
| IN-P09-S05-T01 | P09 | Pass brownfield feature-change benchmark | IN-P09-S01-T01, IN-P09-S06-T01, IN-P05-S04-T01 |
| IN-P10-S01-T01 | P10 | Implement assurance evidence/finding/claim kernel | IN-P01-S02-T02, IN-P03-S01-T01 |
| IN-P10-S01-T02 | P10 | Implement producer/verifier separation and independent oracle derivation | IN-P10-S01-T01 |
| IN-P10-S02-T01 | P10 | Integrate Ascout test/browser/security evidence adapters | IN-P10-S01-T02 |
| IN-P10-S03-T01 | P10 | Integrate Alibaba OCR machine-readable exact-diff review | IN-P10-S01-T01 |
| IN-P10-S04-T01 | P10 | Integrate Diffcipline exact-candidate proof | IN-P10-S01-T01 |
| IN-P10-S05-T01 | P10 | Complete generated-app security negative fixture pack | IN-P10-S01-T02, IN-P06-S04-T02 |
| IN-P10-S06-T01 | P10 | Implement Evaluation Lab benchmark corpus and live/recorded replay runner | IN-P03-S09-T02, IN-P07-S05-T01, IN-P08-S09-T02, IN-P09-S05-T01 |
| IN-P10-S06-T02 | P10 | Implement multidimensional harness correctness/security/design/cost/latency/question regression reports | IN-P10-S06-T01, IN-P03-S08-T01 |
| IN-P10-S07-T01 | P10 | Implement generated-app supply-chain/source/asset/build-artifact integrity pack and optional SBOM | IN-P00-S04-T03, IN-P05-S01-T01, IN-P08-S10-T01 |
| IN-P10-S08-T01 | P10 | Implement i18n/RTL/SEO/accessibility/performance production-web quality pack | IN-P05-S05-T01, IN-P05-S06-T01, IN-P04-S05-T01 |
| IN-P10-S09-T01 | P10 | Implement dataset quality/lineage/count/referential-integrity/privacy and deterministic-seed assurance pack | IN-P06-S10-T03, IN-P06-S11-T01, IN-P10-S01-T02 |
| IN-P11-S00-T01 | P11 | Implement ProviderAdapter, Connection, ResourceBinding, EnvironmentManifest, OwnershipManifest, and ProvisioningSaga contracts | IN-P02-S08-T01, IN-P03-S01-T01, IN-P04-S01-T01, IN-P04-S03-T01 |
| IN-P11-S00-T02 | P11 | Implement provider capability/preflight and typed ExternalBlocker model with permissions/plan/billing/quota/region/policy checks | IN-P11-S00-T01, IN-P03-S08-T01 |
| IN-P11-S00-T03 | P11 | Implement provider reconciliation/state-sync, async provisioning, revocation, reconnect, detach-vs-delete, and idempotent create semantics | IN-P11-S00-T02, IN-P07-S02-T02 |
| IN-P11-S00-T04 | P11 | Qualify platform lifecycle fixtures for permission denial, owner approval, expiry/revocation, rate limit, partial create, timeout, duplicate create, and plan/quota blockers | IN-P11-S00-T03, IN-P10-S01-T02 |
| IN-P11-S01-T01 | P11 | Implement GitHub repository/branch/push flow | IN-P11-S00-T04, IN-P04-S04-T01, IN-P10-S03-T01, IN-P10-S04-T01, IN-P10-S05-T01, IN-P10-S06-T02, IN-P10-S07-T01, IN-P10-S08-T01 |
| IN-P11-S01-T02 | P11 | Harden GitHub installation/authorization/repository-selection/token-expiry/revocation and repository-rules preflight lifecycle | IN-P11-S01-T01, IN-P11-S00-T03 |
| IN-P11-S02-T01 | P11 | Qualify first preview deployment target behind ProviderAdapter lifecycle contract | IN-P11-S01-T02, IN-P11-S00-T04 |
| IN-P11-S03-T01 | P11 | Qualify first production deployment + Docker export | IN-P11-S02-T01 |
| IN-P11-S03-T02 | P11 | Prove clean-room generated-product portability without Ineractive runtime services | IN-P11-S03-T01 |
| IN-P11-S04-T01 | P11 | Implement env/domain/secret deployment contracts | IN-P11-S02-T01 |
| IN-P11-S04-T02 | P11 | Implement SecretRef/SecretVersion/SecretBinding validation, rotation, expiry, revocation, and redeploy/reverification lifecycle | IN-P11-S04-T01, IN-P04-S03-T01 |
| IN-P11-S04-T03 | P11 | Implement DomainBinding/DNS record/propagation/verification/certificate lifecycle with manual fallback | IN-P11-S04-T01, IN-P11-S00-T03 |
| IN-P11-S05-T01 | P11 | Implement guarded Supabase remote publish | IN-P06-S02-T02, IN-P06-S07-T02, IN-P10-S05-T01, IN-P11-S02-T01 |
| IN-P11-S06-T01 | P11 | Implement ReleaseManifest, promotion states, last-known-good identity, and app/schema compatibility gate | IN-P11-S03-T01, IN-P11-S05-T01, IN-P10-S07-T01 |
| IN-P11-S07-T01 | P11 | Implement portable generated-app health/log/error/release-identity and optional telemetry/analytics baseline | IN-P11-S02-T01, IN-P05-S06-T01 |
| IN-P11-S08-T01 | P11 | Qualify production recovery across deploy/migration/credential/drift/last-known-good scenarios | IN-P11-S06-T01, IN-P11-S07-T01, IN-P06-S02-T02 |
| IN-P11-S09-T01 | P11 | Implement least-privilege GitHub App connect/create repository ownership flow | IN-P11-S01-T02, IN-P11-S00-T04, IN-P04-S03-T01 |
| IN-P11-S09-T02 | P11 | Implement user-owned Supabase connect/create ownership orchestration through qualified OAuth/Management surfaces | IN-P06-S07-T02, IN-P11-S05-T01, IN-P11-S00-T04, IN-P04-S03-T01 |
| IN-P11-S09-T03 | P11 | Bind GitHub/Supabase/deployment/environment identities into one Connected Ownership Orchestrator | IN-P11-S09-T01, IN-P11-S09-T02, IN-P11-S06-T01, IN-P11-S04-T02, IN-P11-S04-T03 |
| IN-P11-S09-T04 | P11 | Implement OwnershipManifest, provider detach/reconnect/transfer-export/delete distinctions, and connected-resource reconciliation UX contract | IN-P11-S09-T03, IN-P11-S00-T03 |
| IN-P11-S10-T02 | P11 | Generate minimal operational/ownership/recovery documentation from real manifests and enforce ProductCompleteness gate | IN-P07-S01-T04, IN-P11-S06-T01, IN-P11-S09-T04 |
| IN-P11-S10-T01 | P11 | Pass B17 idea+spreadsheet-to-owned-production-product end-to-end benchmark including post-launch change | IN-P06-S10-T03, IN-P06-S11-T01, IN-P10-S09-T01, IN-P11-S08-T01, IN-P11-S09-T04, IN-P11-S10-T02 |
| IN-P11-S11-T01 | P11 | Pass A-to-exit benchmark: revoke Ineractive access, preserve expected runtime/ownership, reconnect and reconcile without duplicate resources | IN-P11-S10-T01, IN-P11-S09-T04, IN-P11-S03-T02 |
| IN-P12-S01-T01 | P12 | Implement Ineractive teams/projects/roles | IN-P11-S11-T01 |
| IN-P12-S02-T01 | P12 | Implement collaboration/activity/comment primitives | IN-P12-S01-T01 |
| IN-P12-S03-T01 | P12 | Implement collaborative Project Context intelligence/provenance UX | IN-P03-S06-T01, IN-P12-S01-T01 |
| IN-P12-S05-T01 | P12 | Implement evidence-backed Project Learning proposals with approval/version/rollback | IN-P03-S06-T01, IN-P12-S01-T01 |
| IN-P12-S05-T02 | P12 | Implement team/project Skill proposal, qualification, and library UX | IN-P03-S07-T01, IN-P12-S05-T01 |
| IN-P12-S05-T03 | P12 | Implement ExplorationBranch compare/selective-merge UX across graph/design/source/evidence | IN-P07-S02-T03, IN-P08-S09-T02, IN-P12-S01-T01 |
| IN-P12-S04-T01 | P12 | Connect lightweight work/task view to SpecGrain state | IN-P00-S02-T01, IN-P12-S01-T01 |
| IN-P13-S01-T01 | P13 | Qualify second real generative provider adapter | IN-P03-S04-T01 |
| IN-P13-S02-T01 | P13 | Implement bounded MCP/Skills/OpenAPI tool discovery | IN-P04-S01-T01 |
| IN-P13-S03-T01 | P13 | Implement starter archetypes as normal graph/source accelerators | IN-P05-S04-T01, IN-P06-S06-T01 |
| IN-P13-S04-T01 | P13 | Define and prove plugin SDK/capability isolation | IN-P13-S02-T01, IN-P04-S01-T01 |
| IN-P13-S05-T01 | P13 | Implement provider-neutral generated-app AI primitives for streaming/structured output/embeddings/retrieval/tools | IN-P03-S04-T01, IN-P06-S04-T01, IN-P06-S06-T01 |
| IN-P13-S05-T02 | P13 | Implement AI-feature eval, policy, secret-isolation, usage/rate-limit fixture pack | IN-P13-S05-T01, IN-P10-S01-T02, IN-P03-S08-T01 |
| IN-P13-S06-T01 | P13 | Define and prove high-risk external-integration qualification harness | IN-P06-S09-T02, IN-P10-S05-T01 |
| IN-P13-S07-T01 | P13 | Implement Product Kit contract combining graph fragments, components, tokens, Skills, backend patterns, and verification | IN-P13-S03-T01, IN-P03-S07-T01, IN-P08-S07-T01 |
| IN-P14-S01-T01 | P14 | Harden PWA compiler behavior | IN-P11-S03-T01 |
| IN-P14-S02-T01 | P14 | Prototype/qualify Expo mobile target | IN-P02-S05-T01, IN-P06-S06-T01, IN-P14-S01-T01 |
| IN-P14-S03-T01 | P14 | Define cross-target portability/evidence contract | IN-P14-S02-T01 |
| IN-P15-S01-T01 | P15 | Harden hosted multi-tenant control plane | IN-P11-S03-T01, IN-P12-S02-T01 |
| IN-P15-S02-T01 | P15 | Implement metering/budget/spend controls | IN-P15-S01-T01 |
| IN-P15-S03-T01 | P15 | Qualify managed Supabase provisioning/transfer | IN-P15-S01-T01, IN-P11-S05-T01 |
| IN-P15-S04-T01 | P15 | Establish SLO/recovery/incident observability | IN-P15-S01-T01 |
| IN-P15-S05-T01 | P15 | Complete release/security/supply-chain hardening | IN-P10-S05-T01, IN-P10-S07-T01, IN-P15-S01-T01, IN-P15-S04-T01 |
| IN-P15-S06-T01 | P15 | Implement enterprise identity/policy/audit-export/retention-residency governance | IN-P15-S01-T01, IN-P15-S04-T01 |

## Rules

- These IDs are navigation handles, not permission to implement.
- Later tasks may split after earlier evidence.
- A task that grows beyond independent understanding/verification must be refined.
- Cross-phase opportunistic implementation is forbidden unless a canonical plan update changes dependencies.
