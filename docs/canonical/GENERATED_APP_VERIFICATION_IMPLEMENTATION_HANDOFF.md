# Generated-App Browser Quality Implementation Handoff

**Status:** READY_AS_PLANNING / IMPLEMENTATION_REQUIRES_OWNING_GRAIN  
**Date:** 2026-09-23  
**Planning base:** fd3fd806b8941a03fc96ddfcc395f2da57622a5a

## 1. Decision

The testing architecture is ready to implement when the existing dependency graph reaches the owning task handles.

No new top-level subsystem is needed.

The program reuses:

- Ineractive Product Graph and evidence authority;
- Ascout browser/quality semantics;
- existing capability/sandbox/network policy;
- existing P04/P08/P10 roadmap handles.

## 2. No-gap implementation matrix

| Concern | Owner | Required implementation |
|---|---|---|
| Requirement-derived browser journeys | P04-S05 / P10-S02 | TestObligation -> JourneySpec mapping |
| Real browser clicks and typing | P04-S05 | Playwright-first BrowserExecutor |
| Browser/session isolation | P04-S05 / P04-S02 / P04-S03 | isolated context, source/build/browser/environment identity |
| Robust targeting | P04-S05 | semantic locator priority + stale/ambiguous target refusal |
| Duplicate click safety | P04-S05 + Product Graph external-effect semantics | action observations + effect/idempotency/reconciliation checks |
| Browser evidence | P04-S05 | DOM/a11y/network/console/state/trace/screenshot typed refs |
| Visual regression | P08-S11 / P10-S08 | exact-environment screenshot evidence with bounded regions |
| Accessibility | P08-S11 / P10-S08 | Storybook/Vitest + axe + keyboard/focus + external AT qualification when claimed |
| Responsive / RTL / locale | P08-S11 / P10-S08 | viewport/device/locale matrices |
| Cross-browser claims | P10-S08 | explicit declared support matrix and required engine runs |
| Flake classification | P10-S02 | Ascout stability semantics, bounded reruns, no rerun-to-green |
| Generated-test trust | P10-S02 | independent oracle + stability + discrimination + explicit admission |
| Failure reproduction | P10-S02 | reproduce/minimize/classify/regression obligation |
| Security | P04-S03 / P10-S05 | prompt injection, origin drift, session leakage, secret artifact leakage, unauthorized effects |
| Performance | P05-S06 / P10-S08 | separate production-web/performance evidence |
| Benchmark/replay | P10-S06 | versioned fixture corpus + live/recorded replay |
| Verification isolation | P04-S02 | reusable bounded Verification Worker |
| Artifact provenance | P03-S09 / P10-S10 | exact source/build/tool/browser/environment binding |
| Release decision | P10 | non-compensating blockers + residual risk |

Every row has an existing roadmap owner. No orphan quality concern remains.

## 3. Proposed SpecGrain decomposition

These are proposed bounded sub-slices, not pre-created SpecGrain records.

### IN-P04-S05-T01

- T01A — Browser contracts and identity
- T01B — Playwright adapter and isolated context
- T01C — deterministic locator policy
- T01D — JourneySpec action executor
- T01E — browser observations and oracle records
- T01F — trace/screenshot/network/console artifact refs
- T01G — bounded recovery and stale-target rules
- T01H — deterministic browser benchmark baseline

### IN-P08-S11-T03

- T03A — component interaction state coverage
- T03B — axe integration and normalized findings
- T03C — keyboard/focus browser journeys
- T03D — responsive/RTL/theme/reduced-motion matrix
- T03E — visual regression and independent critique binding

### IN-P10-S02-T01

- T01A — Ascout obligation/oracle adapter
- T01B — stability/flake adapter
- T01C — discrimination/admission adapter
- T01D — reproduction/minimization adapter
- T01E — defect/regression/residual-risk adapter
- T01F — browser evidence normalization

### IN-P10-S06-T01

- T01A — benchmark manifest and fixture identity
- T01B — Ascout-derived deterministic fixture corpus
- T01C — generated-app fixture corpus
- T01D — recorded replay
- T01E — live replay
- T01F — benchmark provenance and comparability gates

### IN-P10-S08-T01

- T01A — declared browser/device support matrix
- T01B — locale/RTL production qualification
- T01C — accessibility production qualification
- T01D — SEO and metadata checks
- T01E — performance/Web-Vitals qualification
- T01F — cross-browser final evidence

Split further whenever Diffcipline scope limits require it. Never compress or delete tests to fit a line budget.

## 4. First benchmark fixture set

The deterministic first corpus should include:

- happy path;
- ambiguous target;
- overlay;
- disabled target;
- stale/detached target;
- rename-equivalent;
- rename-non-equivalent;
- duplicate submit;
- missing step;
- async loading transition;
- 4xx/5xx;
- offline/timeout;
- wrong role;
- auth/session isolation;
- prompt injection;
- secret-bearing input redaction;
- responsive reflow;
- RTL;
- visual regression;
- accessibility regression;
- destructive confirmation;
- idempotent external effect;
- non-idempotent external effect;
- unknown outcome/reconciliation;
- flaky test;
- unstable environment;
- generated false-positive test;
- healed-locator semantic drift.

Each fixture must define its expected classification before execution.

## 5. Browser action coverage

The BrowserExecutor qualification suite must cover, where supported:

- navigate;
- click;
- keyboard activation;
- fill/type;
- select;
- checkbox/radio;
- menu/dialog/popover;
- form submit;
- back/forward;
- route transition;
- popup/new tab;
- file upload;
- download;
- drag/drop;
- focus/blur;
- scroll/visibility;
- touch/mobile only when declared.

Consequential actions require effect policy and reconciliation.

## 6. Locator acceptance

The initial policy should prefer:

`role/name > label > placeholder > alt > title > stable test-id > explicit structural fallback`

Required negative cases:

- two matching roles/names;
- duplicate test IDs;
- hidden matching node;
- disabled matching node;
- stale handle after rerender;
- overlay interception;
- navigation between resolution and action;
- semantic rename;
- structural change with equivalent semantics;
- structural change with different semantics.

No "first matching node" fallback for acceptance-critical actions.

## 7. Generated/healed test admission gate

A generated or healed test is `PROPOSAL` until all required stages pass:

1. obligation provenance;
2. oracle independence;
3. exact source/environment binding;
4. bounded stability evidence;
5. discrimination proof;
6. security/effect policy validation;
7. explicit admission.

A test that only proves the current implementation's own output is circular and cannot gate release.

## 8. Evidence and artifact limits

Browser evidence must be useful but bounded.

Default durable artifacts:

- structured action/observation log;
- failing-step screenshot;
- trace reference when required;
- concise console/page-error summary;
- relevant network summary;
- oracle results;
- environment identity;
- effect receipts;
- final classification.

Do not persist full sensitive traces/screenshots by default.

Apply data-classification/redaction before publication.

## 9. CI strategy

### Pull request fast gate

- deterministic unit/component checks;
- Chromium critical journeys;
- axe automated findings;
- selected visual/responsive checks;
- security negative smoke set;
- exact-head evidence binding.

### Broader qualification gate

- full critical journey set;
- declared Firefox/WebKit runs when the support matrix requires them;
- full locale/RTL/viewport matrix;
- benchmark corpus;
- visual baselines;
- performance qualification in the declared reference environment.

### Release qualification

- no unresolved non-compensating blocker;
- external-effect/reconciliation checks complete;
- browser/device support claims match executed evidence;
- accessibility claims match the actual evidence class;
- residual risk explicit.

## 10. Failure taxonomy

Normalize browser failures into at least:

- `PRODUCT_DEFECT`
- `TEST_DEFECT`
- `FLAKY_TEST`
- `ENVIRONMENT_FAILURE`
- `TARGET_AMBIGUOUS`
- `TARGET_STALE`
- `TARGET_OBSTRUCTED`
- `NAVIGATION_DRIFT`
- `ORIGIN_DRIFT`
- `AUTHORITY_DENIED`
- `EXTERNAL_EFFECT_BLOCKED`
- `EXTERNAL_EFFECT_UNKNOWN_OUTCOME`
- `ORACLE_INSUFFICIENT`
- `VISUAL_REGRESSION`
- `ACCESSIBILITY_FINDING`
- `PERFORMANCE_REGRESSION`
- `SECURITY_FINDING`
- `NOT_RUN_BUDGET`
- `NOT_RUN_ENVIRONMENT`

Do not collapse these into one generic E2E failure.

## 11. Agent-assisted testing gate

Model-assisted target resolution/recovery is not part of the first deterministic browser wedge.

It becomes eligible only after:

- deterministic benchmark baseline exists;
- deterministic failure classes are measurable;
- exact donor/source provenance is qualified;
- a model-assisted candidate can be compared against the deterministic baseline;
- wrong-target and unauthorized-effect rates are measured;
- the model path remains proposal-only where deterministic authority is required.

Candidate references:

- TinyFish/AgentQL;
- browser-use;
- Stagehand;
- rustwright;
- screenshot/vision grounding.

## 12. Acceptance threshold philosophy

Do not use one composite quality score to grant release.

Examples of hard blockers:

- unauthorized side effect > 0;
- cross-project authenticated-session leak > 0;
- critical journey deterministic failure > 0;
- unresolved secret leakage > 0;
- stale/wrong target accepted as success > 0;
- missing required browser/device evidence;
- required accessibility qualification not executed;
- acceptance test classified flaky without an independent deterministic replacement or explicit release disposition.

Other metrics may inform residual risk but cannot compensate for a hard blocker.

## 13. Source-adaptation work packet

Every future adaptation Grain should carry:

- source repo and immutable revision;
- selected paths;
- reason each selected mechanism is needed;
- destination paths;
- transformation class;
- license/permission record;
- nested dependency/asset review;
- characterization tests before adaptation where code is reused;
- focused regression tests after adaptation;
- removal/upgrade strategy.

## 14. Implementation-ready conclusion

No material planning gap remains for browser click testing and generated-app quality at the architecture level.

Implementation must still respect the existing dependency graph and be materialized through SpecGrain when each owning task becomes eligible.

The immediate P02 frontier is not changed by this plan.
