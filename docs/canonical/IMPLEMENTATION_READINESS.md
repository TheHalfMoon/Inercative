# Ineractive Implementation Readiness Audit

**Date:** 2026-09-19  
**Scope:** planning readiness, not product/runtime qualification  
**Branch:** `plan/canonical-foundation`

## 1. Decision

The plan is ready to hand to implementation **at the P00 frontier** after this planning PR is accepted.

"Ready" means:

- the product destination is defined;
- architectural seams are explicit;
- risk boundaries are explicit;
- dependency order is explicit;
- later uncertainty is intentionally deferred;
- the first implementation frontier has acceptance/evidence guidance;
- no implementation claim is being fabricated.

It does **not** mean P01-P15 are already Grains or that the product is built.

## 2. What is frozen enough to build

Frozen planning direction:

- product category: AI Product Compiler;
- canonical product name: Ineractive;
- Product Graph as semantic center;
- provider-neutral generative/decision adapters;
- deterministic policy for authority;
- minimal-question Question Gate + Assumption Ledger;
- Supabase as first V1 backend compiler target;
- isolated generated-product data planes;
- capability-gated runtime;
- real code and user ownership;
- visual editing over source rather than a second proprietary representation;
- SpecGrain for readiness;
- Alibaba OCR for semantic review;
- Diffcipline for proof;
- exact-head acceptance;
- P00-P15 dependency direction.

## 3. Intentionally deferred implementation decisions

These are **not planning gaps** because their resolution depends on P00/P01 evidence:

- exact control-plane React framework;
- exact Product Graph persistence representation;
- first remote sandbox provider/implementation;
- exact visual AST/source-mapping mechanism;
- exact hosted deployment adapter;
- exact Ineractive-owned code license;
- exact generated component primitive/library set;
- exact model providers and routing thresholds.

Each has a defined qualification point before dependent work begins.

## 4. Critical gaps closed by this hardening pass

### Producer/verifier independence

Generated code and generated tests can share the same blind spot.

Policy: acceptance-critical verification must include independent or deterministic oracles derived from requirements/Product Graph/runtime observations, not only tests written by the same generation path.

### Migration safety

Remote schema changes are classified additive/transformative/restrictive/destructive with expand/contract and recovery semantics.

### Portability

Generated products must run outside Ineractive from documented source/backend/deployment artifacts.

### Partial failure

Long-running/external operations now have explicit idempotency, reconciliation, checkpoint, ambiguity, and recovery semantics.

## 5. Risk review

### Product Graph over-modeling

Risk: semantic representation becomes slower/more complex than direct code editing.

Mitigation:
- graph slices;
- tiny edits may explicitly declare no graph impact;
- P02 prototypes competing representations;
- no graph database requirement.

### Harness over-engineering

Risk: orchestration complexity delays useful product output.

Mitigation:
- P05/P07 golden vertical slice;
- deep module interfaces;
- no speculative adapter seams;
- benchmark time-to-first-proven-slice.

### Supabase lock-in

Risk: first-class compiler target becomes permanent architecture coupling.

Mitigation:
- Product Graph expresses backend semantics;
- Supabase compiler is an adapter/deep module;
- generated output remains native Supabase artifacts;
- second backend target is deliberately deferred until first target is strong.

### Model/provider lock-in

Mitigation:
- provider-neutral task contracts;
- internal provider identity retained only as operational evidence;
- routing capability registry;
- second real provider qualification in P13.

### Visual-editor/source divergence

Mitigation:
- source remains canonical;
- selection maps to source/component/token identity;
- edits produce normal diffs;
- portability test excludes Ineractive runtime dependence.

### AI verification collusion

Mitigation:
- producer/verifier separation;
- deterministic policies/checks;
- browser/backend observations;
- OCR review;
- Diffcipline proof;
- benchmark fixtures with known faults.

## 6. Implementation entry condition

P00 may begin only after:

- planning PR is canonically accepted/merged;
- live main is reverified;
- no newer founder decision supersedes this plan.

P01 may not begin until P00 exit evidence satisfies the merged P00 plan.

## 7. Planning readiness verdict

**PLANNING_READY_FOR_P00 = YES**

**PRODUCT_IMPLEMENTED = NO**

**P01_PLUS_EXECUTION_AUTHORITY = NO**

This is the intended truthful frontier.
