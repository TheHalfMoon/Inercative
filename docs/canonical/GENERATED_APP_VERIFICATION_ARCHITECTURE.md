# Ineractive Generated-App Verification Architecture

**Status:** canonical planning addendum; implementation-ready design, no implementation authority by itself  
**Date:** 2026-09-23  
**Applies to:** generated web applications, Ineractive-owned frontend surfaces, and later qualified browser-driven verification

## 1. Quality objective

Ineractive must prove that generated applications behave correctly when exercised through real user interactions, including clicks, keyboard input, forms, navigation, dialogs, menus, tables, search, filters, authentication-sensitive flows, and bounded external effects.

A passing build or unit-test suite is insufficient.

A browser test that reaches green is also insufficient unless:

1. the journey is derived from an independent requirement or invariant;
2. the target and environment are bound to exact identity;
3. the oracle is independently grounded;
4. retries/recovery are truthfully classified;
5. material side effects are controlled and reconciled;
6. evidence is attached to the exact source/browser/environment candidate.

## 2. Non-compensating assurance model

No aggregate score may hide a material failure.

```text
Product Graph / requirement / risk
            |
            v
     Test Obligation
            |
            v
      JourneySpec
            |
            v
   BrowserExecutor
            |
            +--> DOM / accessibility facts
            +--> actionability / locator facts
            +--> network / console / page errors
            +--> screenshots / visual evidence
            +--> state / storage observations
            +--> external-effect receipts
            |
            v
      OracleRecord
            |
            v
 Stability + discrimination + reproduction
            |
            v
 FrontendEvidenceBundle / QualityDecision
```

Deterministic facts, visual evidence, accessibility evidence, performance evidence, security evidence, and model judgments remain separate typed evidence classes.

## 3. Core contracts

### 3.1 TestObligation

Every acceptance-critical browser journey must point to one or more independent obligations.

Minimum fields:

- obligation ID;
- source revision;
- requirement/invariant/risk provenance;
- criticality;
- required evidence classes;
- allowed oracle classes;
- side-effect allowance;
- required browser/device matrix if applicable.

### 3.2 JourneySpec

A serializable intent-level browser test above Playwright syntax.

Minimum fields:

- journey ID/revision;
- obligation references;
- preconditions;
- actor/role;
- starting route/state;
- ordered actions;
- expected observations;
- oracle policy;
- allowed recovery policy;
- effect budget;
- environment/browser requirements;
- sensitive-data classification;
- cleanup/reconciliation policy.

Natural-language prompts may help author JourneySpec, but natural language is never the acceptance oracle.

### 3.3 BrowserExecutor

Internal contract with Playwright as the first qualified implementation.

Responsibilities:

- create isolated browser contexts;
- navigate;
- resolve qualified targets;
- click/type/select/press/drag/upload where authorized;
- capture typed observations;
- capture traces/screenshots/logs;
- enforce time and effect budgets;
- expose exact browser/runtime identity.

Playwright types must not leak into canonical Ineractive evidence contracts.

### 3.4 BrowserSessionIdentity

Bind at minimum:

- project/workspace;
- candidate source revision;
- generated-app build/artifact revision;
- browser engine/version;
- viewport/device profile;
- locale/timezone/color-scheme/reduced-motion profile;
- authenticated-state policy;
- network policy;
- test-data fixture revision.

A browser PASS from another source/build/session identity cannot qualify the current candidate.

### 3.5 LocatorPolicy

Preferred locator order should follow user-facing semantics:

1. role + accessible name;
2. label;
3. placeholder;
4. alt text;
5. title;
6. explicit stable test ID;
7. explicitly authorized structural fallback.

Raw positional CSS/XPath selectors are last-resort implementation details, not preferred test semantics.

Every recovered locator records:

- previous target;
- new target;
- recovery reason;
- evidence used;
- semantic-equivalence status.

A healed locator does not self-certify PASS.

### 3.6 ActionObservation

Every browser action records:

- action type;
- target identity;
- mechanism;
- pre-action observation revision;
- actionability result;
- start/end timestamps;
- navigation/origin before and after;
- network/state deltas where relevant;
- result classification;
- evidence references.

### 3.7 OracleRecord

Oracle classes must distinguish at least:

- deterministic invariant;
- DOM/accessibility-state assertion;
- network/protocol assertion;
- persisted-state assertion;
- external-contract assertion;
- visual comparison;
- independent human/evaluator observation;
- calibrated model judgment.

Visual/model oracles cannot silently satisfy a deterministic-only obligation.

### 3.8 ExternalEffectReceipt

Consequential flows must integrate the existing Product Graph external-effect semantics.

Record:

- effect kind;
- target;
- consequence class;
- idempotency;
- confirmation policy;
- reconciliation policy;
- request identity;
- observed result;
- unknown-outcome state;
- cleanup/reversal evidence where applicable.

A click that may charge, send, delete, publish, deploy, or mutate a remote system cannot be treated like an ordinary local UI click.

## 4. Click and interaction correctness matrix

The browser-quality program must cover more than "button clicked".

### 4.1 Target correctness

Test:

- unique accessible target;
- duplicate labels;
- ambiguous test IDs;
- hidden/disabled target;
- detached/stale target;
- target moved after render;
- overlay obstruction;
- animation/transitional states;
- iframe/shadow-root boundaries where supported;
- responsive relocation;
- RTL layout.

### 4.2 Action correctness

Test:

- single click;
- double-click/duplicate submit resistance;
- keyboard activation;
- pointer versus keyboard parity;
- focus movement;
- menu/dialog open/close;
- destructive confirmation;
- drag/drop only where required;
- file upload/download where required;
- clipboard only under explicit capability;
- touch/mobile interaction for declared support.

### 4.3 Outcome correctness

Verify the business outcome, not merely DOM acknowledgement.

Examples:

- persisted record created exactly once;
- route/state changed correctly;
- mutation rejected under wrong role;
- error message and recovery path are correct;
- external effect receives the expected reconciliation record;
- duplicate click does not duplicate a non-idempotent operation.

## 5. Required test layers

### L0 — deterministic static and contract checks

- schemas;
- Product Graph validators;
- route/action contracts;
- provenance;
- dependency/supply-chain rules.

### L1 — unit tests

Pure logic and validators.

### L2 — component tests

Vitest/Storybook interaction tests where justified.

### L3 — accessibility checks

- axe/@axe-core-playwright automated findings;
- semantic roles/names;
- keyboard/focus journeys;
- 200%/reflow and rendered focus checks where release scope requires them;
- screen-reader/assistive-technology external qualification when a conformance claim requires it.

Automated axe success is never a complete WCAG claim.

### L4 — deterministic browser journeys

Playwright-first real user flows with requirement-derived oracles.

### L5 — visual/responsive evidence

- screenshot baselines bound to exact environment;
- responsive viewport matrix;
- overflow/clipping;
- dark/light themes;
- RTL/LTR;
- reduced motion;
- high-DPI/font-loading controls where relevant.

Visual thresholds must not hide text/content/state defects.

### L6 — network and failure-state tests

- offline;
- timeout;
- 4xx/5xx;
- partial response;
- duplicated callback;
- stale response;
- navigation race;
- retry-safe versus retry-unsafe behavior.

### L7 — security/privacy browser tests

- prompt injection from page/tool content;
- origin drift;
- cross-project authenticated-state leakage;
- secret exposure in DOM/log/screenshot/trace;
- unauthorized role journey;
- CSRF/session boundaries where applicable;
- malicious URL/navigation;
- download/upload path controls;
- external-effect denial.

### L8 — performance and production-web quality

- route budgets;
- interaction latency;
- runtime/render diagnostics;
- bundle/runtime cost;
- Core Web Vitals where appropriate;
- performance evidence separate from correctness.

### L9 — generated-test admission

AI-generated/healed tests must pass:

- oracle-independence check;
- bounded rerun stability classification;
- discrimination proof;
- source/environment binding;
- explicit admission.

Passing once is not admission.

### L10 — benchmark/replay

Evaluation Lab should include recorded and live replay with exact fixture identity.

## 6. Flake and recovery policy

Never rerun until green.

Classify:

- deterministic pass;
- deterministic fail;
- flaky/contradictory;
- environment failure;
- insufficient evidence;
- recovered-but-not-equivalent;
- not run.

Recovery is bounded and typed.

Allowed recovery examples:

- wait for Playwright-native actionability;
- re-resolve a target using approved locator policy;
- reload only when the JourneySpec allows it;
- restore an explicitly defined fixture.

Disallowed recovery examples:

- arbitrary timeout inflation;
- repeated clicks until state changes;
- switching to a different semantic target without evidence;
- hiding an assertion;
- accepting a screenshot because it "looks close enough" to a model.

## 7. Failure science

For a material browser failure:

1. reproduce under the same bound identity;
2. distinguish test defect from product defect from environment failure;
3. minimize the journey where feasible;
4. capture first divergence;
5. record a regression obligation;
6. verify repair against both the reproducer and neighboring invariants.

Root cause remains hypothesis until supported by comparative evidence.

## 8. Browser evidence bundle

Every acceptance-critical run should be able to produce a bounded bundle containing:

- source/build SHA;
- Product Graph revision;
- JourneySpec revision;
- browser/runtime identity;
- fixture identity;
- action observations;
- oracle records;
- console/page errors;
- network summaries;
- trace reference;
- screenshots only where useful;
- accessibility findings;
- visual findings;
- effect receipts;
- stability classification;
- recovery events;
- final verdict;
- residual risks;
- artifact digests.

Secrets and sensitive data must be redacted before durable artifact publication.

## 9. Browser security boundaries

Default rules:

- one isolated browser context per project/run unless explicit reuse is authorized;
- no ambient reuse of a developer's personal authenticated browser;
- credentials remain outside model prompts;
- page/tool content is untrusted input;
- navigation/origin changes invalidate stale target assumptions;
- external effects require fresh authority at effect time;
- downloads/uploads are capability gated;
- network egress follows the existing network policy;
- browser artifacts follow data classification/redaction policy.

## 10. Cross-browser/device policy

Do not promise "all browsers" without evidence.

Maintain a declared support matrix.

Minimum strategy:

- Chromium for the fast deterministic inner loop;
- Firefox/WebKit before claiming support when required by product policy;
- explicit viewport/device profiles;
- locale/RTL profiles;
- declared mobile/touch qualification when supported.

A browser-specific pass is not cross-browser evidence.

## 11. Visual quality policy

Visual regression should detect:

- layout drift;
- clipping;
- overlap;
- missing assets/fonts;
- broken responsive transitions;
- theme/contrast regressions;
- unexpected component-state drift.

It must not become the sole correctness oracle.

For highly dynamic regions, prefer semantic assertions plus masked/bounded visual regions rather than raising global tolerance.

## 12. Accessibility policy

Use:

- semantic primitives;
- Storybook/Vitest interaction states where configured;
- axe automated findings;
- keyboard/focus browser journeys;
- responsive/reflow evidence;
- manual/assistive-technology qualification for claims that require it.

Accessibility findings are first-class release evidence, not a decorative score.

## 13. Agentic/browser-AI policy

Deterministic Playwright execution is the first qualified route.

Potential later assistance:

- AgentQL/TinyFish semantic targeting;
- browser-use;
- Stagehand;
- screenshot/vision grounding.

These may propose targets/recovery/actions only after separate qualification.

They cannot:

- grant action authority;
- define the acceptance oracle;
- silently auto-heal PASS;
- override a deterministic failure;
- perform an external effect outside the JourneySpec/capability envelope.

## 14. Benchmark corpus

The first Ineractive browser benchmark should adapt the useful Ascout fixture families and add generated-app-specific cases.

Required families:

1. stable happy path;
2. ambiguous target;
3. overlay obstruction;
4. hidden/disabled target;
5. stale/detached target;
6. renamed but semantically equivalent target;
7. renamed and semantically different target;
8. duplicate submit;
9. missing step;
10. slow async transition;
11. network error;
12. auth-role denial;
13. cross-project session isolation;
14. prompt-injection content;
15. locale/RTL;
16. responsive reflow;
17. visual drift;
18. accessibility regression;
19. external-effect confirmation/reconciliation;
20. unknown external-effect outcome;
21. generated-test false-positive case;
22. flaky/environment-instability case.

Each fixture needs a known oracle and expected classification.

## 15. Quality gates

A candidate generated application cannot receive a release-quality PASS while any required non-compensating condition is false.

Blockers include, where applicable:

- critical journey deterministic failure;
- unresolved wrong-target/stale-target behavior;
- unauthorized external effect;
- cross-project session leakage;
- unresolved high-severity accessibility issue;
- required browser matrix not executed;
- unclassified flaky acceptance test;
- missing oracle provenance;
- evidence bound to the wrong source/build;
- generated test not admitted;
- secrets in durable browser artifacts;
- required cleanup/reconciliation incomplete.

## 16. Mapping to existing Ineractive tasks

No second subsystem is required.

### IN-P04-S05-T01 — Playwright-class browser runtime and evidence

Recommended SpecGrain split when this task becomes active:

- A: BrowserExecutor contract + identities.
- B: pinned Playwright adapter + isolated context.
- C: deterministic locator policy.
- D: JourneySpec execution and action observations.
- E: typed BrowserEvidence/OracleRecord bundle.
- F: trace/screenshot/console/network artifact references.
- G: bounded recovery + stale-target semantics.
- H: deterministic browser benchmark foundation.

### IN-P08-S11-T03 — component/browser design-quality loop

Recommended split:

- component-state coverage;
- Storybook/Vitest interaction evidence;
- axe integration;
- keyboard/focus journeys;
- responsive matrix;
- visual-regression policy;
- independent design critique binding.

### IN-P10-S02-T01 — Ascout evidence adapters

Adapt, do not clone:

- obligation/oracle mapping;
- stability;
- discrimination;
- reproduction/minimization;
- defect/regression records;
- residual-risk output;
- browser evidence normalization.

### IN-P10-S06-T01/T02 — Evaluation Lab

Implement:

- fixture corpus;
- live/recorded replay;
- browser/environment pinning;
- benchmark result identity;
- correctness/security/design/performance/cost/latency dimensions;
- no aggregate score-over-blocker.

### IN-P10-S08-T01 — production-web quality pack

Own:

- declared browser/device matrix;
- locale/RTL;
- accessibility;
- SEO;
- route/runtime performance;
- cross-browser production qualification.

### IN-P10-S10-T03 — FrontendEvidenceBundle

Bind all frontend/browser evidence to exact source, generated artifact, design-system revision, and quality-profile revision.

## 17. Verification Worker boundary

When execution infrastructure is implemented, prefer one reusable bounded Verification Worker contract supporting:

- browser;
- HTTP;
- process;
- container;
- later security verification.

Required controls:

- filesystem scope;
- network scope;
- secret scope;
- process lifecycle;
- timeout;
- artifact limits;
- cancellation;
- cleanup;
- environment identity;
- immutable run/evidence identity.

Do not create a privileged Playwright daemon with broader authority than required.

## 18. Implementation order

The dependency-safe order remains the existing roadmap order.

This addendum does not pull P04/P08/P10 work into the current P02 frontier.

When their dependencies become satisfied:

1. shape bounded SpecGrains under the existing task handle;
2. import/adapt source only after exact provenance review;
3. implement the deterministic core first;
4. qualify benchmark behavior;
5. add agent-assisted recovery only after deterministic baseline metrics exist;
6. integrate assurance/admission semantics;
7. add cross-browser/accessibility/visual/performance release packs;
8. close with exact-source FrontendEvidenceBundle.

## 19. Definition of ready for each browser-quality Grain

A Grain is ready only when it identifies:

- exact obligation;
- in/out scope;
- source paths to adapt;
- provenance disposition;
- allowed dependencies;
- security boundary;
- evidence schema;
- test matrix;
- negative fixtures;
- Diffcipline risk class/bound;
- exact-head CI requirements;
- rollback/removal strategy where a dependency is added.

## 20. Definition of done

The browser-quality program is not done until:

- core user journeys can be represented independently of Playwright syntax;
- real clicks/keyboard/forms/navigation run in isolated qualified browsers;
- wrong/stale/ambiguous target behavior is tested;
- duplicate/consequential click semantics are safe;
- failures are reproducible and classifiable;
- generated/healed tests cannot self-admit;
- visual/accessibility/security/performance evidence is typed and source-bound;
- browser/session leakage is negatively tested;
- exact support matrices are truthful;
- benchmark fixtures are versioned and reproducible;
- evidence integrates into Ineractive assurance/release decisions without creating a second authority plane.

## 21. Planning conclusion

With this architecture, Ineractive can test generated applications as complete user experiences while preserving stronger evidence discipline than a normal E2E suite.

The architecture is ready to be materialized into bounded SpecGrains at the existing roadmap frontiers. It intentionally does not grant early implementation authority or bypass the current dependency graph.
