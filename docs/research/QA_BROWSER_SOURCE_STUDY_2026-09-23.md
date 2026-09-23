# Generated-App Testing and Browser Quality Source Study

**Status:** implementation-ready research addendum; no implementation authority  
**Date:** 2026-09-23  
**Repository:** TheHalfMoon/Inercative  
**Base reviewed:** fd3fd806b8941a03fc96ddfcc395f2da57622a5a

## 1. Purpose

This study inventories the strongest testing, browser-automation, quality, security, accessibility, and benchmark sources already present in the founder's GitHub estate and converts them into a bounded source strategy for Ineractive.

The objective is not to accumulate testing tools. The objective is to ensure that a generated application can be exercised as a user would exercise it, including real clicks and navigation, while preserving independent oracles, exact source/environment binding, truthful flake classification, visual/accessibility evidence, effect safety, and release-quality proof.

## 2. Primary internal source: Ascout

### 2.1 Spec 016 — Browser and Agentic Verification

Repository: `TheHalfMoon/Ascout`

High-value implementation/reference paths:

- `src/browser/playwright-adapter.ts`
- `src/browser/locators.ts`
- `src/browser/trace-artifacts.ts`
- browser evidence/oracle code under `src/browser/`
- `tests/browser-playwright.integration.test.ts`
- `tests/browser-benchmark.integration.test.ts`
- `benchmarks/browser/`
- `specs/016-browser-agentic-verification/`

Observed capabilities worth adapting:

- Playwright behind an internal executor contract rather than as canonical truth.
- Exact browser/package pin enforcement.
- User-facing locator priority instead of fragile selector-first behavior.
- Browser evidence separated into typed facts rather than one generic PASS.
- Trace, screenshot, log, DOM/accessibility, and execution evidence.
- Deterministic browser benchmark fixtures.
- Bounded recovery rather than arbitrary retry-to-green.
- Explicit separation between deterministic execution and model-assisted recovery.
- Source/browser/environment identity binding.
- Oracle classification and residual-risk rendering.

The browser benchmark corpus contains useful failure patterns that Ineractive should reproduce or adapt:

- happy path;
- ambiguous target;
- overlay/obstruction;
- sensitive input;
- missing step;
- duplicate submit;
- rename-equivalent target;
- noisy-green behavior.

**Disposition:** `PRIMARY_INTERNAL_ADAPTATION_SOURCE`.

Ineractive should reuse concepts and, where path-level review supports it, bounded internal code. Do not import Ascout as a second assurance control plane.

### 2.2 Spec 015 — Autonomous Quality Engineering

Repository: `TheHalfMoon/Ascout`

High-value paths:

- `src/quality/stability.ts`
- `src/quality/reproduction.ts`
- `specs/015-autonomous-quality-engineering/spec.md`
- `specs/015-autonomous-quality-engineering/plan.md`
- `specs/015-autonomous-quality-engineering/P015_03_FIRST_WEDGE_IMPLEMENTATION_AUTHORIZATION.md`

Observed capabilities worth adapting:

- requirement-derived test obligations;
- independent oracle classification;
- candidate-test admission;
- bounded rerun stability classification;
- flake versus environment-failure separation;
- discrimination proof before generated tests become acceptance evidence;
- failure reproduction/minimization;
- regression obligations;
- residual-risk rendering;
- no rerun-to-green;
- isolated candidate-test worktrees.

**Disposition:** `PRIMARY_ASSURANCE_SEMANTICS_SOURCE`.

This is especially important for AI-generated tests. A generated browser test that passes must remain a proposal until its oracle is independently grounded and the test demonstrates useful discriminating power.

## 3. Kernux — browser safety and authenticated-session boundaries

Repository: `TheHalfMoon/kernux`

High-value paths:

- `docs/canonical/SECURITY_MODEL.md`
- `docs/canonical/QUALITY_AND_EVIDENCE.md`
- `docs/research/EXTERNAL_REFERENCES.md`
- `docs/canonical/DONOR_PROVENANCE.md`
- `specs/tasks.md`

Relevant patterns:

- prompt injection -> privileged action attempts;
- secret exfiltration attempts;
- cross-project browser/session leakage;
- remote replay/duplicate side effects;
- stale grants;
- browser evidence containing origin, action method, observation, screenshot/artifact, and lineage;
- malicious page/WebMCP/tool-output injection fixtures;
- semantic targeting through AgentQL/TinyFish-derived capability behind a provider boundary.

Authorized donor/reference sources recorded in Kernux include:

- `tinyfish-io/agentql`
- founder-authorized TinyFish source
- `browser-use/browser-use`
- Playwright/CDP/WebMCP references

**Disposition:** `SECURITY_AND_SEMANTIC_TARGETING_SOURCE`.

Use these patterns for isolation and hostile-page testing. TinyFish/AgentQL-style semantic targeting may be a later fallback/adaptor candidate, never the primary acceptance oracle.

## 4. WePLD — stale-target, route, and benchmark discipline

Repository: `TheHalfMoon/wepld`

High-value paths:

- `specs/006-issueops-agentic-engineering-control-plane/product-capability-tracks-plan.md`
- `specs/006-issueops-agentic-engineering-control-plane/product-capability-tracks-tasks.md`
- `specs/006-issueops-agentic-engineering-control-plane/research/product-capability-source-study-2026-09-06.md`
- `specs/006-issueops-agentic-engineering-control-plane/research/adversarial-mechanism-recheck-2026-09-06.md`

Relevant patterns:

- semantic/structured route before raw visual input;
- fresh observation before effect;
- stale-target/stale-surface race testing;
- prompt-injection and origin/navigation-drift testing;
- explicit effect-time authority;
- BrowserGym/WebArena/WorkArena as test oracles;
- CDP/WebDriver BiDi as protocol/specification oracles;
- no silent fallback that changes semantics.

**Disposition:** `INTERACTIVE_SURFACE_AND_BENCHMARK_SOURCE`.

## 5. Ecra — browser-agent evaluation and fallback references

Repository: `TheHalfMoon/Ecra`

High-value paths:

- `research/donor-license-ledger.md`
- `specs/000-ecra-platform/benchmark-matrix.md`

Relevant references already catalogued there:

- ServiceNow BrowserGym / AgentLab;
- WebArena-Verified;
- Online-Mind2Web;
- OSWorld 2.0 / WeaveBench;
- `Skyvern-AI/rustwright`;
- `browser-use/browser-use`;
- Browserbase Stagehand;
- Chromium/CDP provider references.

The important lesson is architectural rather than dependency accumulation:

- deterministic browser execution first;
- benchmark harnesses as test oracles;
- model-assisted navigation as a bounded fallback;
- exact benchmark/environment identity;
- consequential side effects tested separately from task success.

**Disposition:** `BENCHMARK_AND_AGENTIC_FALLBACK_SOURCE`.

## 6. Sentrdel — reusable verification-worker isolation

Repository: `TheHalfMoon/Sentrdel`

High-value path:

- `specs/000-sentrdel-roadmap/security-control-plane-expansion-2026-09-12.md`

Key pattern:

A reusable bounded Verification Worker should isolate browser, HTTP, process, container, and later security verification instead of giving every rule bespoke sandbox authority.

**Disposition:** `VERIFICATION_ISOLATION_SOURCE`.

Ineractive should not create a browser-only privileged worker if the same isolation contract can support other verification surfaces.

## 7. Winds and Pluma — application-level E2E evidence patterns

Repositories:

- `TheHalfMoon/Winds`
- `TheHalfMoon/Pluma`

Useful patterns found:

- explicit visual-regression/screenshot strategy;
- performance qualification separate from correctness;
- executable application E2E harnesses;
- WebView/browser-debug evidence for packaged application flows.

**Disposition:** `SECONDARY_E2E_REFERENCE`.

These are useful for harness discipline but are not the primary web-generated-app testing architecture.

## 8. Existing Ineractive plan already has the correct anchors

Ineractive already contains important task anchors:

- `IN-P04-S05-T01` — Playwright-class browser runtime and evidence;
- `IN-P08-S11-T03` — Storybook/Vitest/axe + Playwright visual/accessibility quality loop;
- `IN-P10-S02-T01` — Ascout test/browser/security evidence adapters;
- `IN-P10-S06-T01` — Evaluation Lab benchmark corpus and live/recorded replay;
- `IN-P10-S06-T02` — multidimensional correctness/security/design/cost/latency/question regression reporting;
- `IN-P10-S08-T01` — i18n/RTL/SEO/accessibility/performance/cross-browser quality pack;
- `IN-P10-S10-T03` — exact-source FrontendEvidenceBundle.

The plan should therefore be strengthened through bounded implementation slices under these existing handles rather than by creating a second testing subsystem.

## 9. Recommended source hierarchy

### Tier A — direct architecture/implementation adaptation

1. Ascout Spec 016 browser executor/evidence/locator/benchmark work.
2. Ascout Spec 015 stability/admission/reproduction/residual-risk work.
3. Ineractive's existing Product Graph, evidence, capability, sandbox, and quality contracts.

### Tier B — security and isolation adaptation

4. Kernux browser/session/prompt-injection/security patterns.
5. Sentrdel reusable Verification Worker boundary.
6. WePLD stale-target/fresh-observation/effect-authority patterns.

### Tier C — benchmark oracles

7. BrowserGym / AgentLab.
8. WebArena-Verified / WorkArena.
9. Online-Mind2Web where live-web drift is specifically being studied.
10. OSWorld-class evaluation only if desktop/computer-use scope becomes active.

### Tier D — model-assisted fallback references

11. TinyFish / AgentQL semantic targeting.
12. browser-use.
13. Stagehand.
14. rustwright/CDP references.

Tier D must never become release authority merely because it can complete a task.

## 10. Explicit non-adoptions

The first Ineractive browser-quality implementation should not:

- build a browser farm;
- invent a browser protocol;
- make raw CSS selectors the preferred locator strategy;
- allow AI assertions to self-certify correctness;
- treat a screenshot similarity score as product correctness;
- treat axe as complete accessibility conformance;
- retry until green;
- auto-heal a locator and silently preserve PASS;
- reuse authenticated browser state across projects by default;
- allow a test to perform consequential external effects without explicit bounded authority;
- introduce Cypress alongside Playwright without a measured missing capability;
- add BrowserGym/WebArena as runtime production dependencies;
- make TinyFish/browser-use/Stagehand a correctness dependency.

## 11. Source admission rule

Any direct code reuse must record:

- source repository;
- immutable revision;
- exact source paths;
- license/permission basis;
- source-to-destination mapping;
- transformations;
- test evidence;
- security review;
- notices/third-party obligations.

Founder permission does not remove provenance or nested third-party obligations.

## 12. Conclusion

The GitHub estate already contains enough material to build a stronger testing architecture than a conventional E2E suite.

The best composition is:

```text
Ascout deterministic browser execution + assurance semantics
+ Ineractive Product Graph requirement authority
+ Kernux browser/session security
+ WePLD stale-target/effect authority
+ Sentrdel worker isolation
+ BrowserGym/WebArena/WorkArena benchmark oracles
+ Storybook/Vitest/axe/Playwright frontend evidence
+ bounded model-assisted targeting only after deterministic baselines
```

The companion canonical architecture document defines how these pieces fit without creating duplicate authority.
