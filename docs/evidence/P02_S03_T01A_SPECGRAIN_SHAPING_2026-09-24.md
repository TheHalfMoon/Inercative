# P02-S03-T01A — SpecGrain Shaping Record

**Task:** IN-P02-S03-T01A
**SpecGrain:** SG-000027
**Date:** 2026-09-24
**Canonical base:** `e448c14a39177fa828c190d3515ecb2cdf03c996`
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a` (`specgrain` source revision, exact CLI)

## 1. Why this Grain exists

`IN-P02-S03-T01` is the next dependency-eligible P02 task after the complete `IN-P02-S02-T02` semantic chain. The canonical roadmap requires a user change request to become a proposed graph delta while preserving uncertainty, confidence, and provenance and while performing no source mutation.

The full task is too large for one safe diff. SG-000027 is the smallest executable vertical slice: a structured Change Intent can compile to a deterministic no-op or one-node upsert proposal over an already validated Product Graph revision. It produces a candidate revision and typed validation issues; it does not accept the proposal as canonical truth.

## 2. SpecGrain authority

The SpecNode was created with the pinned source CLI and promoted through the complete lifecycle:

```text
specgrain draft SG-000027 -> DRAFT
specgrain shape SG-000027 -> SHAPED
specgrain refine SG-000027 -> REFINING
specgrain grain SG-000027 -> GRAIN
specgrain check -> PASS: project ineractive, 27 specs, 27 roots, 0 readiness-blocked
```

`specgrain next` still reports SG-000027 as waiting on SG-000026 because the current CLI has no repository-truth transition for the already merged/closed SG-000026 delivery. This is recorded as a tooling limitation, not converted into a false SpecGrain completion state. `specs/CURRENT.md` and merged evidence establish the dependency as satisfied.

## 3. Bounded scope

In scope:

- `ChangeIntentV1` with stable identity, exact base revision, bounded provenance, confidence, and closed `no-op`/`upsert-node` operations;
- `ProposedGraphDeltaV1` with proposal identity, base/intents/delta digests, operations, provenance, confidence, candidate revision, and validation issues;
- deterministic compilation against `ProductGraphRevisionDocumentV1`;
- add and same-kind attribute replacement for one node; duplicate targets, kind changes, malformed input, missing metadata, invalid confidence, and invalid candidate graphs fail closed;
- structural and existing domain validation of the candidate;
- focused tests for determinism, ordering, immutability, errors, and digest separation;
- exports from `@ineractive/product-graph` and exact evidence/frontier records.

Out of scope:

- natural-language/model/provider parsing;
- edge, delete, bulk, or multi-operation graph changes;
- Question Gate, Assumption Ledger, source bindings, graph views, compilers, database, migration, network, credentials, capabilities, or external effects;
- mutation of the base revision, source tree, Git, database, or any external system;
- new packages, dependencies, lockfile changes, or a claim that the full `IN-P02-S03-T01` handle is closed.

## 4. Safety and evidence requirements

The compiler is pure and deterministic. It must not use network access, model inference, wall-clock time, randomness, host locale, credentials, or capability authority. Confidence is bounded evidence, never permission. Provenance is mandatory. A proposal remains a candidate until later review/acceptance; this Grain cannot commit it.

Required evidence is exact base/head/merge-base identity, focused compiler tests, input-immutability and ordering proofs, existing domain-validation results, Diffcipline proof, pinned Alibaba OCR accounting/delegation semantic review, Jev exact-diff judgments, exact-head Ubuntu/Windows CI, and post-merge fresh-main CI.

## 5. Recovery

Revert the SG-000027 source, exports, tests, evidence, and frontier record. The previously qualified Product Graph contracts and SG-000020 through SG-000026 domain semantics remain intact. No canonical or source state is mutated by this Grain.

## 6. Next dependent work

After SG-000027 closes, the next shaped slice must decide and qualify richer operation coverage (edges/removals and multi-operation semantics) before any natural-language intent interpretation or later Question Gate work. P02-S04 and P02-S05 remain blocked by their canonical dependencies.
