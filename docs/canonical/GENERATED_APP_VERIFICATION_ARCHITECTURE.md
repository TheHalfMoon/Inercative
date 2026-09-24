# Ineractive Generated-App Verification Architecture

**Status:** canonical planning addendum; implementation requires the owning SpecGrain
**Date:** 2026-09-23
**Planning base:** `fd3fd806b8941a03fc96ddfcc395f2da57622a5a`

## 1. Decision and scope

Ineractive must verify generated applications through real user journeys, not only a successful build or unit suite. The browser-quality program uses one non-compensating evidence path:

```text
Product Graph requirement / invariant / risk
  -> TestObligation
  -> JourneySpec
  -> isolated BrowserExecutor
  -> typed observations
  -> OracleRecord
  -> stability and discrimination evidence
  -> FrontendEvidenceBundle / AssuranceKernel decision
```

This addendum covers generated web applications, Ineractive-owned frontend surfaces, and later qualified browser-driven verification. It does not activate P04, P08, or P10 work during the current P02 frontier. `specs/CURRENT.md` and the active Grain remain authoritative.

No score can compensate for an unauthorized effect, cross-project session leak, wrong-target success, critical-journey failure, secret-bearing durable artifact, missing required browser evidence, or unresolved external-effect outcome.

## 2. Core contracts

### 2.1 TestObligation

Every acceptance-critical journey cites one or more independent obligations. A record contains:

- stable obligation and source-revision identity;
- requirement, invariant, or risk provenance;
- criticality and required evidence classes;
- allowed oracle classes;
- side-effect allowance and effect budget;
- required browser, device, viewport, and locale matrix;
- expected negative paths and cleanup/reconciliation policy.

A model-generated test is a candidate until its oracle is independently grounded and its discriminating power is demonstrated.

### 2.2 JourneySpec

`JourneySpec` is a serializable intent-level contract above Playwright syntax. It contains journey and revision identity, obligation references, preconditions, actor/role, starting route/state, ordered actions, expected observations, oracle policy, bounded recovery, effect budget, environment/browser requirements, data classification, and cleanup.

Natural language may help author a journey but is never the acceptance oracle. Playwright types, selectors, and traces are adapter details rather than canonical product truth.

### 2.3 BrowserExecutor

The first qualified implementation may use Playwright behind an Ineractive-owned contract. The executor:

- creates an isolated browser context and records exact browser/runtime identity;
- resolves qualified targets and performs only authorized actions;
- captures DOM/accessibility, actionability, console, page error, network, state/storage, screenshot, and trace references;
- enforces timeout, effect, and artifact budgets;
- preserves typed observations rather than collapsing them into one PASS.

The executor has no publish, production, credential, filesystem, or host-ambient authority. Downloads, uploads, clipboard, persistent profiles, and external navigation remain separately gated.

### 2.4 OracleRecord

Every observation maps to an allowed oracle class: deterministic Product Graph or schema invariant, independent requirement fixture, real backend outcome, capability-policy denial/receipt, accessibility rule, visual comparison, or explicitly qualified semantic evaluation.

A DOM acknowledgement is insufficient for a business mutation. The oracle checks the persisted outcome, authorization result, route/state transition, and expected reconciliation record. Generated or healed tests remain `PROPOSAL` until obligation provenance, oracle independence, exact identity, bounded stability, discrimination, security/effect policy, and explicit admission are proven.

## 3. Evidence and decisions

A bounded `FrontendEvidenceBundle` records source/build SHA, Product Graph and JourneySpec revisions, browser/runtime/environment/fixture identity, action observations, oracle records, console/page/network evidence, artifact references and digests, accessibility/visual findings, effect receipts, recovery events, stability classification, final non-compensating verdict, and residual risks.

Secrets and sensitive data are redacted before durable publication. Full traces and screenshots are retained only when required by policy and bounded by data classification.

`NOT_RUN`, `BLOCKED`, `FAIL`, flaky/contradictory, and insufficient evidence never become PASS. A screenshot similarity score, axe result, model judgment, or global coverage percentage cannot grant release by itself.

## 4. Required verification layers

| Layer | Required evidence |
|---|---|
| L0 | schemas, Product Graph validators, route/action contracts, provenance, supply-chain rules |
| L1 | deterministic unit tests for pure logic and validators |
| L2 | component interaction/state tests where justified |
| L3 | semantic roles/names, keyboard/focus, automated axe findings, reflow where required |
| L4 | real requirement-derived browser journeys |
| L5 | exact-environment visual, responsive, theme, RTL/LTR, reduced-motion evidence |
| L6 | offline, timeout, 4xx/5xx, duplicate callback, stale response, navigation race, retry semantics |
| L7 | prompt injection, origin/session drift, cross-project leakage, secret exposure, auth/role denial, upload/download and effect denial |
| L8 | route/interaction budgets and runtime diagnostics, separate from correctness |
| L9 | generated/healed-test admission |
| L10 | versioned live and recorded Evaluation Lab replay |

Automated accessibility evidence is partial. A conformance claim requires the declared assistive-technology and manual evidence class. A Chromium-only run cannot justify a Firefox, WebKit, touch, or mobile-support claim.

## 5. Action, locator, and effect correctness

The initial locator priority is:

```text
role/name > label > placeholder > alt > title > stable test-id > explicit structural fallback
```

Acceptance-critical actions refuse ambiguous, hidden, disabled, stale, obscured, or semantically renamed targets. There is no first-match fallback. The negative fixture set covers duplicate roles/names and test IDs, detached handles after rerender, overlay interception, navigation between resolution and action, equivalent rename, different-meaning rename, and structural change.

Browser coverage includes navigation, click, keyboard activation, fill/type, select, checkbox/radio, menu/dialog/popover, form submit, back/forward, route transition, popup/new tab, upload, download, drag/drop, focus, scroll/visibility, and touch only where support is declared.

A consequential action requires effect-time authority, idempotency or reconciliation policy, an observation that the intended target is still current, and a receipt or typed unknown outcome. Duplicate clicks must not duplicate a non-idempotent mutation. Destructive actions require the applicable current confirmation.

## 6. Browser security boundary

Default rules are:

- one isolated browser context per project/run unless explicit reuse is authorized;
- no ambient reuse of a developer's authenticated browser;
- credentials remain outside prompts and ordinary artifacts;
- page, tool, MCP, and downloaded content are untrusted data;
- origin/navigation drift invalidates stale target and session assumptions;
- external effects require fresh authority at effect time;
- uploads, downloads, clipboard, and external navigation are capability gated;
- artifacts follow classification, redaction, retention, and export policy.

TestBrowser, ResearchBrowser, AuthenticatedUserBrowser, and persistent or local-computer surfaces are distinct trust classes. A lower-trust run cannot silently claim evidence for a higher-trust class.

## 7. Failure and recovery policy

Never rerun until green. Classify outcomes as deterministic pass/fail, flaky/contradictory, environment failure, insufficient evidence, recovered-but-not-equivalent, or not run.

Allowed recovery is bounded by the JourneySpec: Playwright-native actionability wait, approved re-resolution, explicitly allowed reload, or restoration of a defined fixture. Disallowed recovery includes arbitrary timeout inflation, repeated clicks until state changes, silent target switching, assertion removal, or accepting a screenshot because a model says it is close enough.

Material failures are reproduced under the same identity, classified as product/test/environment failure, minimized where feasible, and bound to the first divergence. Root cause remains a hypothesis until comparative evidence supports it. Repair must pass both the reproducer and neighboring invariants.

The failure taxonomy includes product/test/environment, flaky target, stale/obscured target, navigation/origin drift, authority denial, blocked or unknown external effect, insufficient oracle, visual/accessibility/performance/security regression, and not-run budget/environment.

## 8. Visual, accessibility, responsive, and performance evidence

Visual regression detects layout, clipping, overlap, asset/font, responsive-transition, theme/contrast, and component-state drift. Dynamic regions use semantic assertions and bounded/masked visual regions rather than inflated global tolerance. Visual evidence never becomes the sole correctness oracle.

Accessibility combines semantic primitives, component states, axe findings, keyboard/focus browser journeys, reflow, and external assistive-technology/manual evidence when a conformance claim requires it.

Performance evidence includes route and interaction budgets, runtime diagnostics, and bundle/runtime cost where applicable. It remains a separate dimension and cannot compensate for correctness or security failure.

The declared support matrix names engine, version strategy, viewport/device, locale/RTL, touch, and assistive-technology evidence. Claims are limited to the executed matrix.

## 9. Verification Worker boundary

Browser, HTTP, process, container, and later security verification should share a bounded worker contract when practical. It carries filesystem, network, secret, and process scope; timeout; artifact limit; cancellation; cleanup; environment identity; and immutable run/evidence identity. It must not become a privileged Playwright daemon with broader authority than the job requires.

## 10. Existing task ownership

No second testing subsystem or early P02 authority is created.

| Existing handle | Browser-quality responsibility |
|---|---|
| `IN-P04-S05-T01` | `BrowserExecutor`, isolated context, locator policy, journey execution, typed browser evidence |
| `IN-P08-S11-T03` | component/browser design-quality loop and independent rendered critique |
| `IN-P10-S02-T01` | obligation/oracle, stability, discrimination, reproduction, and residual-risk adapters |
| `IN-P10-S06-T01/T02` | versioned live/recorded benchmark corpus and multidimensional regression reporting |
| `IN-P10-S08-T01` | declared browser/device, locale/RTL, accessibility, SEO, performance, and cross-browser pack |
| `IN-P10-S10-T03` | exact-source `FrontendEvidenceBundle` |

Each handle must still be shaped into independently verifiable SpecGrains when eligible. A candidate that exceeds Diffcipline limits is split; tests and safety semantics are not deleted to fit a budget.


## 11. Required benchmark classes

The deterministic corpus must include happy path; ambiguous, hidden, disabled, stale, and renamed targets; overlay obstruction; duplicate submit; missing step; async transition; 4xx/5xx; offline/timeout; wrong role; auth/session isolation; prompt injection; secret redaction; responsive reflow; RTL; visual and accessibility regression; destructive confirmation; idempotent and non-idempotent effects; unknown outcome/reconciliation; generated-test false positive; healed-locator drift; flaky test; and unstable environment.

Each fixture declares its oracle and expected classification before execution. Live and recorded replay bind exact source, environment, browser, fixture, and artifact identities. Replay does not repeat irreversible external effects.

## 12. Source and adaptation boundary

The dated source study and immutable donor revisions are recorded in `docs/research/QA_BROWSER_SOURCE_STUDY_2026-09-23.md`. It is research input, not import authority.

Every future adaptation Grain must record source repository, immutable revision, exact paths, destination mapping, license/permission basis, dependency and asset closure, modifications, security review, notices, characterization/regression tests, and removal/upgrade strategy. Founder permission does not remove third-party obligations. No donor or third-party code executes in trusted runtime before admission.

## 13. Definition of ready and done

A browser-quality Grain is ready only when it binds:

- exact obligation and canonical base;
- scope in/out and intended change surface;
- dependencies and source provenance posture;
- security/effect/privacy boundary;
- evidence schema and negative fixtures;
- browser/device/accessibility matrix;
- Diffcipline risk and size class;
- exact-head CI and review requirements;
- dependency rollback/removal strategy.

The browser-quality program is done only when critical journeys are independent of Playwright syntax; real clicks, keyboard, forms, navigation, data, error, locale/RTL, device, and effect behavior run in qualified isolated browsers; wrong/stale/ambiguous targets and duplicate consequences are tested; failures are reproducible and classified; generated/healed tests cannot self-admit; evidence is redacted, typed, and exact-source bound; declared support matrices are truthful; and release decisions consume the bundle without creating a second authority plane.

## 14. Implementation order

The dependency-safe order remains P04, then P08/P10, and later release integration:

1. shape the smallest eligible SpecGrain;
2. pin and qualify source provenance;
3. implement deterministic contracts and negative fixtures before a model-assisted path;
4. qualify the isolated deterministic browser baseline;
5. integrate evidence, assurance, accessibility, visual, security, and support-matrix decisions;
6. preserve exact-head OCR, Jev, Diffcipline, CI, and post-merge evidence.

This addendum does not pull later work into P02 and does not claim that any browser, accessibility, security, or cross-browser capability is already implemented.
