# Canonical Plan Revision — Competitive Supremacy and Decision Plane — 2026-09-24

**Status:** CANONICAL PLANNING AMENDMENT — IMPLEMENTATION NOT ACTIVATED EARLY  
**Applies to:** `docs/canonical/ROADMAP.md`, `PRODUCT_CAPABILITY_MATRIX.md`, `SOURCE_LEDGER.md`  
**Execution authority:** `specs/CURRENT.md` remains authoritative for the active frontier.  
**Current main at study start:** `fd3fd806b8941a03fc96ddfcc395f2da57622a5a`  
**Browser-quality dependency:** PR #63 is complementary and should land or be reconciled independently; this amendment does not duplicate its generated-app browser verification architecture.

## 1. Decision

The existing P00-P15 architecture remains valid and is more complete than the current market baseline in several governance areas.

The 2026-09-24 review found **no reason to replace the roadmap**. It found a bounded set of missing or under-specified requirements that must be closed inside existing phase ownership.

This amendment therefore:

- adds no parallel architecture;
- creates no early implementation authority;
- preserves the P02 frontier;
- preserves existing stable task handles unless a later eligible SpecGrain explicitly reshapes a task;
- strengthens P03, P04, P07, P08, P10, P11, P13 and P14 acceptance;
- adds CLM-class contrastive decision providers to the provider-neutral decision fabric;
- converts provider retirement/deprecation into a first-class portability test;
- makes branch-safe agent delivery, preview parity and pre-publish security explicit.

## 2. Product thesis

Ineractive should not try to win by being the fastest demo generator.

It should win by being the first system in this class where the whole product lifecycle is one coherent, inspectable object:

```text
intent
  -> Product Graph
  -> design + data + policy truth
  -> bounded work plan
  -> isolated branch/sandbox execution
  -> generated source
  -> real runtime/browser/device evidence
  -> independent assurance
  -> preview/release manifest
  -> user-owned Git/backend/deployment
  -> observable operations
  -> governed project learning
  -> next evidence-backed change
```

The core moat is **truth + ownership + proof + portability**, with model/provider quality remaining replaceable.

## 3. Gap-closure register

Every new requirement has one roadmap owner and a falsifiable acceptance shape.

| ID | Requirement | Primary task | Dependencies / acceptance intent |
|---|---|---|---|
| IN-REV26-001 | CLM-class Decision Plane adapter | IN-P03-S03-T02 | Exact provider/head/candidate evidence; confidence/abstention; deterministic fallback; no authority transfer |
| IN-REV26-002 | Confidence/abstention escalation | IN-P03-S03-T01 | Low-confidence result escalates or returns unavailable; top-1 never silently becomes authority |
| IN-REV26-003 | Fast shortlist before expensive evaluator | IN-P10-S06-T02 | Use P03 decision providers only after protected correctness/security floors are met; record latency/cost delta |
| IN-REV26-004 | Branch-safe autonomous delivery | IN-P04-S04-T02 | Branch/worktree isolation; protected-main no-direct-write default; exact-head PR promotion |
| IN-REV26-005 | Merge/reconciliation evidence for parallel agents | IN-P07-S02-T04 | Explicit conflict/synthesis/disposition; retain loser evidence until policy cleanup |
| IN-REV26-006 | Production-like preview parity | IN-P11-S02-T02 | PreviewParityManifest; server/backend/env semantics; typed parity blockers |
| IN-REV26-007 | Pre-publish security gate | IN-P10-S05-T02 | Security summary binds exact evidence; unresolved release blockers propagate to ReleaseManifest |
| IN-REV26-008 | Safe-fix proposal mode | IN-P10-S05-T02 | Automatic fix is a proposed diff that re-enters normal qualification; never self-authorizes release |
| IN-REV26-009 | Generated-app MCP surface | IN-P13-S05-T03 | Product-owned typed tools/resources with auth, capabilities, audit, effects, rate/idempotency and revocation |
| IN-REV26-010 | Provider-sunset portability | IN-P11-S00-T05 | DEPRECATED/RETIRING/RETIRED states; replacement/export/reconnect fixtures; A-to-exit consumes the evidence |
| IN-REV26-011 | Portable design truth artifact | IN-P08-S07-T02 | Product-owned agent-readable import/export; external formats are adapters, not canonical truth |
| IN-REV26-012 | Live parallel design/build variants | IN-P08-S09-T03 | Isolated variants, visible task/canvas state, early steering, qualified selective merge |
| IN-REV26-013 | Competitive regression corpus | IN-P10-S06-T03 | Dated benchmark cases with observed source date and reproducible Evaluation Lab execution |
| IN-REV26-014 | Real-device mobile proof | IN-P14-S02-T02 | Physical-device run; user-owned signing; TestFlight/internal-track evidence when store delivery is in scope |
| IN-REV26-015 | Mobile/remote builder steering | IN-P12-S03-T02 | Queue/inspect/approve builder actions without ambient host authority; later mobile clients consume this contract |
| IN-REV26-016 | Voice as evidence, not authority | IN-P12-S03-T03 | Transcript revisions/provenance; Arabic/code-switch; no hidden cloud fallback; current confirmation for material effects |
| IN-REV26-017 | Generated-product provider ownership | IN-P13-S05-T02 | Generated app providers/credentials stay product-scoped and never inherit Ineractive control-plane secrets |
| IN-REV26-018 | Market-lifecycle revalidation | IN-P10-S06-T03 | Implementation shaping re-checks dated feature/deprecation assumptions; benchmark metadata preserves observation date |

## 4. P03 — Decision Plane amendment

### 4.1 Architecture

Add a dedicated `DecisionPlaneAdapter` family under the existing P03-S03 bounded-decision contract.

Eligible provider classes:

- deterministic/rule baseline;
- CLM-class contrastive scorer;
- Jev-class typed decision model;
- generative evaluator;
- specialized future providers.

The router chooses only among **already policy-eligible** decision providers.

### 4.2 Decision flow

```text
candidate discovery
  -> hard eligibility/capability/security filter
  -> bounded DecisionRequest
  -> rank / typed decision
  -> confidence policy
      -> accept ranking for next verification step
      -> abstain/escalate
  -> independent verification where required
  -> capability/action authorization
```

This ordering is normative. Ranking never precedes hard policy filtering and never replaces authorization.

### 4.3 Candidate applications

- tool selection;
- model selection;
- retrieval shortlist;
- repair shortlist;
- design variant shortlist;
- test-priority shortlist;
- plan candidate ranking;
- best-of-N verifier;
- generated-product MCP tool routing.

## 5. P04/P07 — Git-safe parallel execution amendment

Autonomous changes default to isolated branch/worktree identity.

Required evidence:

- base revision;
- agent/run/work-unit identity;
- branch/worktree identity;
- generated commits;
- tests/assurance bound to exact head;
- merge-base and reconciliation state;
- final PR/promotion identity.

Direct writes to a protected canonical branch are never the default autonomous path.

Parallel work may share Product Graph/context truth, but source mutation remains isolated until reconciliation.

## 6. P08 — Live design/build amendment

The existing design architecture already supports direct manipulation, annotations, design variants and semantic bindings. Strengthen it with:

- parallel design alternatives that render simultaneously;
- a canvas/task-manager view that shows active alternatives and build state;
- early steering before an agent finishes a whole redesign;
- portable product-owned design truth, not provider-only design metadata;
- import/export of DESIGN.md-like rules without making any external format canonical;
- explicit responsive/device state comparison;
- independent rendered evaluator before a design branch becomes canonical.

## 7. P10 — Publish assurance and competitive regression amendment

### Pre-publish gate

Before a release candidate may be promoted, the UI must surface a compact release-security summary derived from exact evidence.

Required categories where applicable:

- dependency vulnerabilities;
- secret exposure;
- auth/authorization gaps;
- RLS/data-access gaps;
- external-effect policy violations;
- browser-origin/session issues;
- supply-chain/NOTICE/SBOM issues;
- unresolved critical assurance findings.

Safe automatic repair is a **proposal** that goes back through normal diff/test/review qualification.

### Competitive regression corpus

Evaluation Lab gains dated benchmark workflows such as:

- idea -> authenticated CRUD product;
- existing GitHub repo -> bounded change -> PR;
- design artifact -> editable implementation -> round-trip reconcile;
- spreadsheet -> typed data model -> working table/admin;
- product -> production-like preview -> security gate -> release manifest;
- web product -> PWA/native target -> physical device;
- app -> generated MCP tool surface -> authenticated read/action;
- provider revoked/deprecated -> export/reconnect without loss;
- parallel agent variants -> merge one qualified result;
- Arabic/RTL business product workflow.

The corpus is evidence for Ineractive's own quality, not a claim that competitors fail it.

## 8. P11 — Preview, ownership and provider-lifecycle amendment

### Preview parity contract

Every preview declares:

- runtime image/runtime family;
- server capabilities;
- environment variables/secrets-by-reference;
- backend identity;
- migrations/schema identity;
- network policy;
- build artifact digest;
- source revision;
- known parity differences from production.

A preview that cannot exercise a required production feature returns an explicit parity blocker.

### Provider lifecycle

ProviderAdapter gains lifecycle states at least equivalent to:

`AVAILABLE / DEGRADED / REVOKED / PLAN_BLOCKED / DEPRECATED / RETIRING / RETIRED`.

P11-S11 exit/reconnect adds retirement/deprecation fixtures.

## 9. P13 — Generated-app MCP amendment

A generated product may optionally expose an MCP-compatible surface.

That surface is generated from Product Graph/API/action semantics and is governed independently from Ineractive's internal MCP client.

Required properties:

- explicit tool/resource schemas;
- user/product authentication;
- least-privilege capabilities;
- consequence/effect class;
- confirmation policy;
- idempotency/reconciliation where required;
- rate/abuse bounds;
- audit events;
- revocation;
- secret handles rather than secret values;
- versioning/backward-compatibility declaration.

This turns generated products into safe participants in the wider AI ecosystem instead of static endpoints.

## 10. P14 — Native mobile qualification amendment

Responsive web is not native mobile proof.

Before a native-mobile claim:

- Expo/React Native build succeeds;
- relevant device capabilities are declared;
- app runs on at least one real supported device class;
- deep links/auth/network/storage behavior are exercised;
- crash/log evidence is captured;
- signing credentials remain user-owned;
- TestFlight/internal-track submission is proven through a user-owned developer account when release scope includes store delivery;
- rollback/version identity is recorded.

## 11. Durable context and memory amendment

No new memory subsystem is needed. P03/P12 should explicitly adopt the strongest existing internal contracts:

- `ContextSource`;
- `ContextItem`;
- `ContextBundle`;
- scoped `MemoryRecord`;
- provenance/trust/taint/freshness;
- derived indexes/embeddings/graphs;
- user-inspectable durable memory;
- source revocation/deletion invalidation;
- live authoritative source beats stale memory;
- ranking cannot raise authority.

This should be considered a product capability, not only internal agent plumbing.

## 12. Voice amendment

Voice remains later than core compiler quality, but its architecture is now fixed enough to avoid a future rewrite:

- capture/source lineage;
- conditioning/VAD;
- replaceable speech providers;
- Arabic + Arabic/English code-switch benchmark;
- transcript revision;
- intent extraction;
- current explicit confirmation for material effects;
- no hidden cloud fallback;
- push-to-talk before wake-word;
- speech evidence never grants capabilities.

## 13. No-gap ownership audit

The amendment is complete only if every category below has exactly one primary owner:

| Surface | Primary owner |
|---|---|
| intent/product semantics | P02 |
| bounded decisions/routing/context | P03 |
| capability/sandbox/Git/browser/tool trust | P04 |
| web compiler | P05 |
| backend/data/auth/RLS | P06 |
| orchestration/repair/parallel work | P07 |
| design/visual round trip | P08 |
| import/brownfield | P09 |
| assurance/security/evaluation | P10 |
| GitHub/preview/deploy/portability | P11 |
| collaboration/project intelligence | P12 |
| ecosystem/MCP/generated AI products | P13 |
| mobile/cross-surface | P14 |
| managed commercial/enterprise scale | P15 |

No requirement introduced by this amendment requires a new top-level phase. The executable task index now contains dedicated handles for each gap that was not already represented precisely enough by an existing task.

## 14. Sequencing

1. **Now:** keep the live P02 execution chain unchanged. Merge/reconcile planning-only work normally.
2. **P03 eligibility:** implement DecisionPlane contract first, then qualify CLM/Jev/generative adapters as replaceable providers.
3. **P04/P07 eligibility:** enforce branch-safe agent execution before broad parallel autonomy.
4. **P08 eligibility:** implement live variants/portable design truth on top of semantic design bindings.
5. **P10/P11 eligibility:** make pre-publish security and preview parity mandatory for release promotion.
6. **P13 eligibility:** generate a bounded MCP surface only after internal tool/capability contracts are mature.
7. **P14 eligibility:** require real-device/store-path evidence before native-mobile product claims.
8. **Every release:** run dated competitive regression cases and provider-lifecycle fixtures.

## 15. Done criteria for this planning amendment

Planning can be considered closed when:

- the research refresh is recorded;
- CLM exact source identity and adoption posture are recorded;
- each new requirement maps to a phase owner;
- canonical roadmap points to the amendment;
- capability matrix contains the strengthened surfaces;
- source ledger includes CLM and refreshed competitor/lifecycle references;
- current frontier remains truthful;
- PR #63 is referenced rather than duplicated;
- no implementation PASS is claimed from planning evidence.

