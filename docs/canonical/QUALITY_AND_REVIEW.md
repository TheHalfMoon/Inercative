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

## 3. SpecGrain role

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

## 4. Diffcipline role

Diffcipline is the proof-before-done layer.

Canonical semantics:

- PASS — required configured evidence executed and passed;
- REVIEW — no hard failure, but evidence/judgment remains;
- FAIL — hard policy or verification failure;
- execution/usage error — no proof verdict.

NOT RUN is never PASS.

Diffcipline operates on the exact candidate source state.

## 5. Alibaba Open Code Review

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

## 6. OCR coverage contract

Every changed material file ends as one of:

- reviewed;
- deterministically excluded with reason;
- separately reviewed because OCR does not support the surface.

Planning/spec/security/governance Markdown cannot disappear merely because a code-review engine filters it.

Review evidence records:

- base;
- head;
- OCR version/config;
- ruleset identity;
- reviewed/excluded files;
- findings;
- unresolved state.

## 7. Finding model

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

## 8. Verification classes

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

## 9. Browser proof

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

## 10. Changed-code evidence

Where practical, connect code changes to exercised behavior.

Do not equate global code coverage percentage with correctness.

Track:

- changed executable lines/branches where tooling supports it;
- related tests selected;
- wider fallback verification;
- unexercised material paths;
- unresolved instrumentation limits.

## 11. Design proof

A design gate combines:

- deterministic Impeccable-derived detectors;
- accessibility tooling;
- responsive overflow/layout checks;
- rendered screenshot inspection;
- visual regression where a baseline exists;
- semantic/UX critique for high-value surfaces.

Taste findings can be REVIEW rather than hard FAIL unless they violate explicit design requirements.

## 12. Security proof

Security-sensitive generated apps should include:

- RLS/auth negative tests;
- secret exposure scan;
- dependency audit;
- unsafe configuration scan;
- CSP/CORS/cookie/session checks as relevant;
- upload/path/SSRF checks where relevant;
- production capability denial tests.

Ascout/Sentrdel/Kodac patterns are the internal source pool for assurance architecture.

## 13. Repair and rerun discipline

When a check fails:

1. preserve failure evidence;
2. identify the smallest relevant scope;
3. repair;
4. rerun focused verification;
5. rerun required broader gates before acceptance.

Do not discard the first failure and report only the final green retry.

Repeated flaky/contradictory outcomes become FLAKY/INCONCLUSIVE, not clean PASS.

## 14. Exact-head rule

The reviewed/tested/proven head must equal the merge/publish head.

Any material source change after acceptance-critical evidence invalidates or requires explicit reconciliation of that evidence.

## 15. CI strategy

CI should eventually include:

- deterministic format/type/lint/tests;
- generated-app compiler fixtures;
- Supabase local integration suite;
- browser suite;
- security/advisor checks;
- source/provenance checks;
- Diffcipline gate;
- OCR review workflow on PRs when credentials/execution are configured.

Pin production actions/tools to reviewed immutable versions where practical.

## 16. Benchmark corpus

Maintain canonical build challenges:

### B01 — Product page

Responsive site with forms and strong design quality.

### B02 — Authenticated CRUD

Users, private records, validation, error states.

### B03 — Multi-tenant CRM

Organizations, invitations, roles, RLS, cross-tenant negative tests.

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

## 17. Metrics

Track:

- exact acceptance pass rate;
- first-pass success;
- repair attempts to convergence;
- OCR material finding rate and escape rate;
- tests generated vs meaningful behavior exercised;
- RLS/security failures caught before publish;
- browser journey success;
- design/a11y findings;
- flaky evidence rate;
- time/cost to proven vertical slice;
- regressions after accepted change.

The goal is not to maximize green checks. The goal is trustworthy product delivery.
