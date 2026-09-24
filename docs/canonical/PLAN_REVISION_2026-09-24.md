# Canonical Plan Revision — Decision Plane and Competitive Baseline — 2026-09-24

**Status:** canonical planning amendment; no early implementation authority
**Applies to:** `ROADMAP.md`, `PRODUCT_CAPABILITY_MATRIX.md`, `SOURCE_LEDGER.md`
**Execution authority:** `specs/CURRENT.md` and the active SpecGrain
**Study base:** `fd3fd806b8941a03fc96ddfcc395f2da57622a5a`

## 1. Decision

The P00-P15 architecture remains valid. The dated review found bounded gaps rather than a need for a parallel roadmap. This amendment preserves the P02 frontier, adds no early implementation authority, strengthens existing phase acceptance, and adds stable task handles only where the prior index was not precise enough.

PR #63 independently owns generated-app browser verification. This amendment references that work and does not duplicate its contracts.

The product remains a provider-neutral Product Operating System whose advantage is inspectable product truth, user ownership, exact evidence, safe authority, and exit portability—not raw prompt count or one model brand.

## 2. Decision Plane

P03 adds a provider-neutral `DecisionPlaneAdapter` family with deterministic/rule, CLM-class contrastive, Jev-class typed, generative, and later specialized providers.

```text
candidate discovery
  -> hard eligibility / capability / security filter
  -> bounded DecisionRequest
  -> provider decision
  -> confidence and abstention policy
  -> independent verification where required
  -> capability authorization
  -> action
```

Ranking occurs only after hard filtering. A score, rank, confidence value, or abstention recommendation is never permission or a security PASS. CLM is optional; deterministic/Jev/generative paths remain usable without it, local GPU, CLM, or founder-paid inference.

Candidate uses include tool/model routing, retrieval and patch shortlisting, plan/design/test prioritization, best-of-N evaluation, and generated-product MCP routing. The first P03 contract must bind provider/model/head, candidate-set digest, policy/context identity, latency/cost, typed output, confidence, abstention, evidence, and fallback lineage.

## 3. Gap-closure register

| ID | Requirement | Primary task | Acceptance intent |
|---|---|---|---|
| IN-REV26-001 | CLM-class Decision Plane adapter | IN-P03-S03-T02 | exact provider/head/candidate; confidence/abstention; deterministic fallback; no authority transfer |
| IN-REV26-002 | Confidence/abstention escalation | IN-P03-S03-T01 | low confidence escalates or returns unavailable; top-1 never becomes authority |
| IN-REV26-003 | Fast shortlist before expensive evaluator | IN-P10-S06-T02 | protected correctness/security floors remain first; record latency/cost delta |
| IN-REV26-004 | Branch-safe autonomous delivery | IN-P04-S04-T02 | branch/worktree isolation; protected-main no-direct-write default; exact-head PR promotion |
| IN-REV26-005 | Parallel merge/reconciliation evidence | IN-P07-S02-T04 | explicit conflict/synthesis/disposition; retain loser evidence until policy cleanup |
| IN-REV26-006 | Production-like preview parity | IN-P11-S02-T02 | `PreviewParityManifest`; source/build/runtime/backend/env identity; typed parity blockers |
| IN-REV26-007 | Pre-publish security gate | IN-P10-S05-T02 | exact evidence summary; critical blockers propagate to `ReleaseManifest` |
| IN-REV26-008 | Safe-fix proposal mode | IN-P10-S05-T02 | automatic repair remains a proposed diff and re-enters normal qualification |
| IN-REV26-009 | Generated-app MCP surface | IN-P13-S05-T03 | product-owned typed tools/resources; auth, capability, effect, audit, rate, idempotency, revocation |
| IN-REV26-010 | Provider-sunset portability | IN-P11-S00-T05 | DEPRECATED/RETIRING/RETIRED; export/replacement/reconnect fixtures |
| IN-REV26-011 | Portable design truth | IN-P08-S07-T02 | product-owned import/export; external formats remain adapters |
| IN-REV26-012 | Live design/build variants | IN-P08-S09-T03 | isolated alternatives, visible task state, early steering, qualified merge |
| IN-REV26-013 | Competitive regression corpus | IN-P10-S06-T03 | dated reproducible cases; no competitor-failure claims |
| IN-REV26-014 | Real-device mobile proof | IN-P14-S02-T02 | physical-device run; user-owned signing; store evidence when in scope |
| IN-REV26-015 | Mobile/remote builder steering | IN-P12-S03-T02 | queued bounded intent; explicit material-action approval; no ambient host authority |
| IN-REV26-016 | Voice as evidence | IN-P12-S03-T03 | revision/provenance; Arabic/code-switch benchmark; no hidden cloud fallback; current confirmation |
| IN-REV26-017 | Generated-product provider ownership | IN-P13-S05-T02 | product-scoped providers/credentials never inherit control-plane secrets |
| IN-REV26-018 | Market-lifecycle revalidation | IN-P10-S06-T03 | observation dates and reproducible re-check metadata |

## 4. Phase amendments

### P03 — bounded decisions and governed context

Decision providers rank only already eligible candidates. Context, Skills, memory, and retrieval preserve source revision, trust/taint, freshness, sensitivity, derivation, and revocation. Live authoritative source outranks stale derived memory. CLM admission retains exact code/weight/data rights, dependency and model provenance, cache invalidation, model-unavailable behavior, deterministic fallback, and adversarial candidate-text tests.

### P04/P07 — Git-safe execution and reconciliation

Autonomous changes default to branch/worktree isolation and exact-head PR promotion. Parallel units retain base, agent/run identity, write ownership, generated commits, exact verification, merge-base, conflict/synthesis disposition, and final promotion identity. Direct writes to protected canonical branches are not the default.

### P08 — design truth and live steering

Design alternatives remain isolated across source/design branches. Users can steer before completion and compare responsive/device states. Independent rendered evaluation precedes canonical selection. Portable product-owned design truth survives provider change; DESIGN.md-like artifacts are adapters, not a provider's private state.

### P10/P11 — assurance, preview, and lifecycle

The pre-publish gate summarizes exact dependency, secret, auth/authorization, RLS/backend, external-effect, browser-origin/session, supply-chain/NOTICE/SBOM, and unresolved critical findings. Safe automatic repair is only a proposed diff.

Every preview declares source, build, runtime, server capability, backend/schema, environment/secret references, network policy, artifact digest, and known production differences. An unavailable required production semantic is a typed blocker, not an assumed parity result.

ProviderAdapter lifecycle includes AVAILABLE, DEGRADED, REVOKED, PLAN_BLOCKED, DEPRECATED, RETIRING, and RETIRED. A-to-exit proves export, replacement/reconnect, continued runtime, ownership, and no duplicate resources.

### P13/P14/P12 — generated MCP, native mobile, and voice

A generated product's optional MCP surface is independent from Ineractive's internal tool identity and requires typed schemas, product authentication, least privilege, effect/confirmation, audit, rate/abuse bounds, idempotency/reconciliation, secret handles, compatibility, and revocation.

Responsive web is not native-mobile evidence. Native claims require a real supported device, deep-link/auth/network/storage/crash evidence, user-owned signing, store/internal-track evidence when in release scope, and rollback/version identity.

Voice is later than core quality. transcripts retain capture and revision provenance; Arabic and Arabic-English code-switch are benchmark lanes; speech is evidence rather than permission; no hidden cloud fallback is allowed; material effects require current confirmation; push-to-talk precedes opt-in wake word.

## 5. Sequencing and ownership

1. Keep P02 and the next `IN-P02-S03-T01` Grain unchanged.
2. Implement the provider-neutral Decision Plane contract before optional CLM/Jev/generative adapters.
3. Enforce branch/worktree isolation before broad parallel autonomy.
4. Add live design variants on semantic design bindings.
5. Make pre-publish assurance and preview parity release gates.
6. Generate product-owned MCP only after internal capability/tool contracts mature.
7. Require real-device and user-owned signing evidence before native claims.
8. Revalidate dated competitive and provider-lifecycle assumptions at each owning Grain and release.

Primary ownership remains P02 intent/semantics, P03 decisions/context, P04 capability/runtime/browser/Git trust, P05 web, P06 backend/data/auth/RLS, P07 orchestration/repair/parallel work, P08 design, P09 import, P10 assurance/security/evaluation, P11 publish/ownership/portability, P12 collaboration/intelligence, P13 ecosystem/MCP/generated AI, P14 mobile, and P15 managed hardening.

### Higgsfield open-source donor amendment

The founder explicitly authorizes copying/adapting Higgsfield source code. The 2026-09-24 source refresh verified multiple official public Higgsfield repositories useful to Ineractive, including Skills, CLI, Python/TypeScript clients, Cursor/MCP plugin packaging, and the older distributed-training framework.

Adoption is bounded:

- P03-S07 may adapt reusable Skill packaging/composition;
- P08-S12 may adapt branded creative-media workflow composition;
- P13-S04 may adapt plugin/MCP packaging patterns;
- P13-S07 may adapt compound workflow/Product Kit patterns such as BrandKit, product imagery, explainers, websites and browser games;
- P13-S08 may qualify Higgsfield as one optional MediaProviderAdapter and selectively reuse official open-source client/workflow code;
- P10-S06 remains the independent benchmark owner for quality/cost/latency/reliability.

Open-source client/Skill code does **not** make Higgsfield-hosted models or the hosted platform canonical Ineractive infrastructure. Hosted calls remain optional external-provider operations, credentials stay user/product owned, and Ineractive must remain functional when Higgsfield is unavailable.

See `docs/research/HIGGSFIELD_OPEN_SOURCE_DEEP_DIVE_2026-09-24.md` for exact reviewed revisions, license evidence, reuse posture and security requirements.

## 6. Completion criteria

This planning amendment closes only when the dated research is recorded, CLM identity/posture is pinned, all 18 requirements map to existing primary tasks, dedicated task handles close index gaps, task-graph validation passes, the current frontier is consistent, PR #63 is referenced rather than duplicated, Diffcipline size limits are satisfied, exact-head OCR/Jev/CI evidence is recorded, and no implementation PASS is inferred from planning.
