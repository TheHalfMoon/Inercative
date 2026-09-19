# Ineractive Planning and Delivery Governance

**Status:** canonical planning direction  
**Date:** 2026-09-19

## 1. Purpose

Ineractive uses three complementary systems:

~~~text
Product intent
  -> SpecGrain: bound and order work
  -> implementation harness: execute in isolated runtime
  -> Alibaba OCR: semantic exact-diff review
  -> Diffcipline: prove configured evidence executed on exact change
  -> canonical integration
~~~

They do different jobs and must not be collapsed.

## 2. SpecGrain

SpecGrain is the canonical decomposition/readiness system once initialized in the repository.

Lifecycle:

~~~text
DRAFT -> SHAPED -> REFINING -> GRAIN
~~~

A Grain requires bounded:

- outcome;
- scope in;
- scope out;
- acceptance;
- dependencies;
- risk;
- recovery;
- context budget;
- intended change surface;
- evidence requirements;
- minimality;
- safety state.

If work is too large to understand or verify independently, refine it further. Do not solve an oversized unit by increasing model context.

## 3. Rolling-wave planning

### Later

Keep later work at phase/slice resolution.

### Next

Shape enough to expose dependencies, risks, interface decisions, and acceptance.

### Now

Only the first dependency-eligible Grain receives implementation authority.

This roadmap is implementation-ready in dependency direction without pretending that P12 internals are fully knowable before P01 evidence exists.

## 4. Matt Pocock skills — light adaptation

Use the useful engineering disciplines without importing an interrogation-heavy workflow.

### Adopt

- to-spec: synthesize already-known intent rather than asking again;
- to-tickets: tracer-bullet vertical slices with blocking edges;
- domain-modeling: maintain a concise shared vocabulary;
- codebase-design: deep modules and clean seams;
- TDD where behavior can be specified before implementation;
- diagnosing-bugs for reproduced failures;
- sparse ADRs for hard-to-reverse, surprising tradeoffs;
- wayfinding only for genuinely unresolved large decisions.

### Modify

Replace open-ended grilling with the Ineractive Question Gate:

- zero questions by default;
- one compact batch of up to three high-impact questions before first preview;
- later questions only on genuine blockers;
- reversible choices become assumptions, not questions.

## 5. Domain language

Maintain a concise CONTEXT.md once implementation starts.

Core terms:

- Product Graph — semantic representation of the product.
- Product Revision — immutable semantic product state.
- Assumption — inferred product choice not yet confirmed.
- Change Intent — user-requested product change.
- BackendPlan — desired Supabase-relevant product state.
- WorkUnit — bounded executable change unit.
- WorkPacket — immutable execution context for a Grain.
- Run — one execution occurrence.
- DecisionTask — bounded typed judgment.
- ModelTask — generative/vision/reasoning request.
- CapabilityRequest — proposal to perform a privileged action.
- Grant — bounded authorization.
- Observation — runtime/browser/test fact.
- Finding — issue candidate tied to exact evidence.
- Evidence — machine/human observation tied to exact identity.
- Claim — statement such as BUILD_VALID or RELEASE_READY requiring evidence.

Do not introduce synonyms casually.

## 6. Deep-module discipline

Prefer modules whose interface hides substantial complexity.

Primary planned seams:

- ProductCompiler;
- WorkCompiler;
- Harness;
- DecisionFabric;
- ModelRouter;
- CapabilityKernel;
- Runtime;
- SupabaseCompiler;
- DesignEngine;
- AssuranceKernel.

Do not create an adapter seam merely because another provider might exist someday. A seam must either be required for testing/trust separation or have more than one real implementation.

Provider adapters are real seams because providers vary. Product-level abstractions must stay smaller than provider APIs.

## 7. ADR policy

Create an ADR only when all are true:

1. expensive to reverse;
2. future maintainers would reasonably ask why;
3. there was a real tradeoff.

Likely ADR candidates:

- Ineractive control-plane framework;
- V1 generated-app target;
- sandbox provider/architecture;
- Product Graph persistence format;
- local/remote Supabase authority model;
- capability kernel boundary;
- visual-editor source mapping strategy;
- managed-project ownership/billing boundary.

Do not create ADRs for routine library choices.

## 8. Implementation flow

For each Grain:

1. reverify exact main and dependency state;
2. export/bind WorkPacket;
3. create isolated branch/worktree;
4. implement smallest vertical slice;
5. run focused feedback loop;
6. run Grain-required verification;
7. run Alibaba OCR on exact diff with business/spec context;
8. fix or disposition findings;
9. rerun affected checks;
10. run Diffcipline on exact candidate;
11. confirm exact head unchanged;
12. open/update PR with evidence;
13. merge only when required gates qualify.

No force-push or shared-history rewrite.

## 9. Risk profiles

### R0

Docs/non-behavioral metadata.

### R1

Isolated deterministic UI/helper behavior with no persistence/trust boundary.

### R2

Database schema, migrations, runtime, external APIs, auth-adjacent behavior, provider adapter, new dependency, browser execution.

### R3

Authorization, cross-tenant isolation, secrets, production mutation, sandbox security, billing/external side effects, release/update integrity.

Risk profile determines mandatory evidence. It never lowers requirements.

## 10. Source import flow

Code reuse is deliberate:

1. identify a missing/weak Ineractive capability;
2. inspect candidate donor(s);
3. choose the smallest useful mechanism;
4. define the Ineractive-owned interface;
5. pin donor revision/path;
6. import in a mechanically separable change when practical;
7. adapt behind the interface;
8. preserve applicable provenance/notices;
9. verify behavior independently;
10. compare against native implementation when the donor adds substantial complexity.

Permission is not a reason to bulk-copy.

## 11. Product experiments

Use experiments when the decision is not known.

Examples:

- best Product Graph representation;
- whether a visual AST transformation approach preserves source quality;
- router thresholds;
- context compaction;
- screenshot-based design evaluation;
- sandbox backend;
- generated-test usefulness;
- which donor implementation is strongest.

Experiments produce evidence and decisions. They do not silently become production code.

## 12. First implementation frontier

After this planning package is merged, the implementation frontier is P00 only.

The first work should establish repository truth and tooling, not the app UI.

Expected order:

1. repository/toolchain bootstrap;
2. SpecGrain initialization from canonical roadmap;
3. Diffcipline policy/bootstrap;
4. CI baseline;
5. provenance/import record schema;
6. minimal monorepo/module skeleton;
7. first Product Graph contract tests.

Do not jump directly to the chat/preview UI.
