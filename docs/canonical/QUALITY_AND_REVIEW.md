# Ineractive Quality, Review, and Proof

**Status:** canonical planning direction  
**Date:** 2026-09-19

## 1. Quality thesis

Ineractive must be better at finishing software, not merely faster at starting it.

The finish line is evidence bound to the exact candidate revision.

## 2. Assurance layers

~~~text
SpecGrain
  defines what must be true
        |
        v
Implementation / repair
        |
        v
Runtime + test observations
        |
        v
Ascout-style assurance adapters
        |
        v
Alibaba Open Code Review
  semantic diff review
        |
        v
Diffcipline
  exact-diff + executed verification proof
        |
        v
Exact-head qualification
~~~

No layer silently substitutes for another.

## 3. Producer / verifier separation

The same generation path must not be allowed to define implementation, write self-confirming tests, and then grant its own acceptance claim.

Acceptance-critical proof should combine independent sources such as:

- deterministic invariants compiled from Product Graph requirements;
- repository/toolchain checks;
- Supabase policy tests executed under real roles/tokens;
- browser journeys derived from requirements rather than implementation details;
- seeded fault fixtures;
- independent semantic review through Alibaba OCR;
- Diffcipline exact-diff proof.

A model-generated test is a candidate test. It becomes acceptance evidence only after its oracle is grounded in an independent requirement, invariant, fixture, or observed external contract.

## 4. SpecGrain role

SpecGrain owns:

- bounded outcome;
- scope in/out;
- dependencies;
- acceptance;
- risk/recovery;
- context budget;
- expected change surface;
- evidence requirements;
- readiness.

If a unit cannot be independently verified, refine it further.

## 5. Diffcipline role

Diffcipline is the proof-before-done layer.

Canonical semantics:

- PASS — required configured evidence executed and passed;
- REVIEW — no hard failure, but evidence/judgment remains;
- FAIL — hard policy or verification failure;
- execution/usage error — no proof verdict.

NOT RUN is never PASS.

Diffcipline operates on the exact candidate source state.

## 6. Alibaba Open Code Review

Alibaba Open Code Review is Ineractive's designated AI code-review engine.

Use its deterministic engineering where possible:

- diff/file selection;
- filtering;
- semantic grouping;
- rule matching;
- review coverage;
- comment positioning/reflection;
- structured machine-readable output.

Use the agent layer for semantic review.

Preferred workflow:

~~~text
fixed base/head
  -> OCR preview/file accounting
  -> OCR review with product/business context
  -> machine-readable findings
  -> normalize into Ineractive finding model
  -> fix/disposition
  -> rerun affected verification
  -> rerun OCR if candidate changed materially
~~~

OCR is a reviewer, not the canonical acceptance authority.

## 7. OCR coverage contract

Every changed material file ends as one of:

- reviewed;
- deterministically excluded with reason;
- separately reviewed because OCR does not support the surface.

Planning/spec/security/governance Markdown cannot disappear merely because a code-review engine filters it.

Review evidence records:

- base/head/merge-base identity;
- OCR release, verified binary digest, and configuration identity;
- complete changed-file accounting;
- deterministic reviewable/excluded classification and exclusion reasons;
- separate-review evidence for material unsupported/excluded files;
- per-reviewable-file rule-resolution identity;
- semantic state (RUN / BLOCKED / NOT_RUN);
- structured findings and dispositions when semantic review ran;
- explicit blocker evidence when it did not;
- stale-head reconciliation when the candidate changes.

The bounded P00 machine-readable contract lives in
`packages/protocol/schema/ocr-review-evidence.schema.json`; its private validator is
not a public P01 protocol API.

## 8. Finding model

Normalize review, test, runtime, design, and security observations into a common Finding shape:

- finding_id;
- source engine;
- exact target/source identity;
- category;
- severity;
- confidence;
- location;
- evidence;
- requirement/policy mapping;
- status;
- disposition;
- superseded/stale state.

A model finding is not a fact merely because confidence is high.

## 9. Verification classes

Generated applications can require:

- format;
- typecheck;
- lint/static analysis;
- unit;
- integration;
- schema/migration;
- auth/RLS;
- storage;
- functions;
- contract;
- browser/E2E;
- accessibility;
- responsive;
- visual regression;
- security;
- dependency/supply chain;
- performance;
- recovery/failure injection;
- deployment smoke.

The active Grain chooses the required subset from policy/risk. A successful subset does not imply omitted classes passed.

## 10. Browser proof

Critical user journeys should be exercised in a real browser against the running application and real local backend.

Capture:

- route;
- viewport;
- actions;
- DOM/accessible observations;
- console errors;
- failed network requests;
- screenshots where useful;
- final assertion.

For generated CRUD/auth apps, browser proof should include negative paths, not only the happy path.

Every broad browser-support claim must name a support matrix. Critical journeys are executed on each browser engine and representative viewport actually claimed as supported. A Chromium-only run cannot justify a cross-browser claim; unsupported engines/viewports must be stated explicitly rather than implied.

## 11. Changed-code evidence

Where practical, connect code changes to exercised behavior.

Do not equate global code coverage percentage with correctness.

Track:

- changed executable lines/branches where tooling supports it;
- related tests selected;
- wider fallback verification;
- unexercised material paths;
- unresolved instrumentation limits.

## 12. Frontend and design proof

A frontend/design gate can combine:

- FrontendQualityProfile revision;
- component provenance and primitive-base identity;
- deterministic Impeccable findings;
- pinned Vercel Web Interface Guidelines findings;
- pinned Vercel React Best Practices findings;
- deterministic React quality findings through a qualified React Doctor adapter;
- component states/interactions through Storybook/Vitest or a qualified equivalent when configured;
- automated axe findings;
- explicit keyboard/focus browser journeys;
- responsive overflow/layout checks;
- rendered screenshot inspection;
- Playwright visual comparison where a controlled baseline exists;
- navigation/performance observations;
- semantic/UX critique for high-value surfaces;
- unresolved RegistryAdmissionGate findings for external component candidates.

These normalize into an exact-source FrontendEvidenceBundle.

No design score, React score, detector count, screenshot, or single external rule pack grants PASS.

Automated accessibility scanning is partial evidence and must not be presented as complete standards compliance.

Taste findings can be REVIEW rather than hard FAIL unless they violate explicit design requirements.

## 13. Security proof

Security-sensitive generated apps should include:

- RLS/auth negative tests;
- secret exposure scan;
- dependency audit;
- unsafe configuration scan;
- CSP/CORS/cookie/session checks as relevant;
- upload/path/SSRF checks where relevant;
- production capability denial tests.

Ascout/Sentrdel/Kodac patterns are the internal source pool for assurance architecture.

## 14. Repair and rerun discipline

When a check fails:

1. preserve failure evidence;
2. identify the smallest relevant scope;
3. repair;
4. rerun focused verification;
5. rerun required broader gates before acceptance.

Do not discard the first failure and report only the final green retry.

Repeated flaky/contradictory outcomes become FLAKY/INCONCLUSIVE, not clean PASS.

## 15. Exact-head rule

The reviewed/tested/proven head must equal the merge/publish head.

Any material source change after acceptance-critical evidence invalidates or requires explicit reconciliation of that evidence.

## 16. CI strategy

CI should eventually include:

- deterministic format/type/lint/tests;
- generated-app compiler fixtures;
- Supabase local integration suite;
- browser suite;
- security/advisor checks;
- source/provenance checks;
- supply-chain/secret/asset integrity checks;
- harness replay/regression fixtures;
- production-web quality fixtures;
- FrontendQualityProfile/compiler fixtures;
- component-registry/admission fixtures;
- deterministic React-quality fixtures;
- component-state/accessibility/browser/visual frontend evidence fixtures;
- Diffcipline gate;
- OCR review workflow on PRs when credentials/execution are configured.

Pin production actions/tools to reviewed immutable versions where practical.

## 17. Benchmark corpus

Maintain canonical build challenges:

### B01 — Product page

Responsive site with forms and strong design quality.

### B02 — Authenticated CRUD

Users, private records, validation, error states.

### B03 — Multi-tenant CRM

Organizations, invitations, roles, RLS, cross-tenant negative tests, and realistic search/filter/sort/pagination over tenant-scoped business data.

### B04 — Files and storage

Private upload, replacement, download, policy enforcement.

### B05 — Realtime product

Shared state with authorization and reconnect behavior.

### B06 — External integration

Scoped secret, webhook, idempotency, failure handling.

### B07 — Complex workflow

Multi-step state transition, audit/history, notifications.

### B08 — Arabic/RTL

Arabic + English product with true RTL/responsive behavior.

### B09 — Existing project change

Import a non-trivial repo and add a feature without unnecessary rewrite.

### B10 — Repair

Start from a deliberately broken build and converge using evidence.

### B11 — Release compatibility and recovery

Promote a candidate whose application and backend schema evolve together, discover the connected provider's backup/PITR/restore capabilities, then inject a deployment failure and prove last-known-good recovery without unsafe database rollback. Execute a bounded restore/PITR drill where supported; otherwise prove the typed blocker/manual-recovery path and do not claim restore coverage.

### B12 — Generated-product operations

Deploy a product with health/release identity/log/error surfaces, inject a production-like failure, and prove that the failure is observable without an Ineractive-only runtime dependency.

### B13 — Design/code divergence

Change bound code and external design state independently, detect DIVERGED state, and reconcile without silent overwrite.

### B14 — Brownfield backend reconstruction

Import a non-trivial source repository plus existing backend/schema/policies and add a feature without unnecessary rewrite or false semantic certainty.

### B15 — Harness replay regression

Replay a recorded-observation task after a harness/context/skill/router change and detect any correctness, security, cost, or unnecessary-question regression.

### B16 — AI-enabled product

After P13 qualification, build an exported AI-enabled product with provider-neutral generated-app integration, secret isolation, usage limits, and eval fixtures.

### B17 — Idea to owned production product

Start from a product brief plus business data and prove the complete GitHub/Supabase/deployment/recovery/post-launch lifecycle with no manual developer coding in the golden path, including search/filter/sort/list behavior, Product Admin/Data Studio administration, one applicable DataPolicy data-rights/consent flow, and explicit provider-aware backup/restore expectations.

### B18 — Frontend component supply and quality

Build and change a component-rich Next.js product while proving:

- local/project/qualified-registry reuse happens before synthesis;
- no duplicate primitive system is introduced;
- one primary primitive base remains coherent;
- external component admission is provenance/security/a11y/compatibility checked;
- server/client boundaries remain bounded;
- Arabic/RTL and responsive states survive;
- component states and critical browser journeys pass across the declared browser/device support matrix;
- visual/design quality evidence is exact-source bound;
- optional frontend dependencies are justified rather than injected by default.

## 18. Metrics

Track:

- exact acceptance pass rate;
- first-pass success;
- repair attempts to convergence;
- OCR material finding rate and escape rate;
- tests generated vs meaningful behavior exercised;
- RLS/security failures caught before publish;
- browser journey success;
- design/a11y findings;
- duplicate component/primitive introduction rate;
- registry reuse vs synthesis rate;
- unnecessary client-boundary expansion rate;
- frontend optional-dependency justification rate;
- FrontendEvidenceBundle completeness/freshness;
- flaky evidence rate;
- time/cost to proven vertical slice;
- budget adherence;
- latency;
- unnecessary-question rate;
- required context retained vs optional context waste;
- skill selection accuracy;
- tool-selection waste;
- release/recovery success;
- supply-chain/provenance failures caught before publish;
- regressions after accepted change.

The Evaluation Lab must preserve separate correctness, security, design, cost, latency, and usability dimensions. One aggregate score must never hide a material correctness/security failure.

The goal is not to maximize green checks. The goal is trustworthy product delivery.
