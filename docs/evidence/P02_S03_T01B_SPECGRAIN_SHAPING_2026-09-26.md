# P02-S03-T01B — SpecGrain Shaping Record

**Task:** IN-P02-S03-T01B  
**Parent handle:** IN-P02-S03-T01  
**SpecGrain:** SG-000028  
**Date:** 2026-09-26  
**Canonical base:** `9c7626356bc7cebde8c89cb49aaed7fa142f09e8`

## 1. Why this Grain exists

SG-000027 closed the first Change Intent vertical: deterministic no-op and one-node upsert proposals. The canonical frontier still leaves the parent `IN-P02-S03-T01` handle open for richer graph-operation proposal semantics before natural-language intent interpretation or Question Gate work.

SG-000028 is the next bounded slice. It extends the existing pure compiler to edge upsert, edge removal, node removal, and an explicit ordered multi-operation sequence while preserving exact provenance, confidence, base identity, deterministic digests, and no canonical/source mutation.

## 2. Exact authority

This Grain is shaped against canonical `main` at `9c7626356bc7cebde8c89cb49aaed7fa142f09e8`, whose merge closes SG-000027 evidence. Repository truth therefore satisfies SG-000028's SG-000027 dependency even though the currently pinned SpecGrain CLI cannot encode repository-delivered VERIFIED/CONTROLLED state for prior Grains.

No implementation PASS is claimed by this shaping record.

## 3. Bounded scope

In scope:

- `upsert-edge`, `remove-edge`, and `remove-node` operation contracts;
- non-empty bounded ordered multi-operation intents;
- stable-id protections for existing node/edge updates;
- missing-target and conflicting-target rejection;
- fail-closed node removal when incident edges still exist at that operation step;
- structural and Product Graph domain validation after each operation and on the final candidate;
- deterministic full-sequence intent/delta/proposal identity;
- compatibility with SG-000027 no-op and upsert-node behavior;
- focused tests and exact evidence.

Out of scope:

- natural-language/model/provider interpretation;
- Question Gate, Assumption Ledger, concurrent-intent merge/reconciliation, or automatic conflict resolution;
- implicit cascade deletion or operation reordering;
- source/database/Git/external-effect execution;
- new packages, dependencies, lockfile changes, or provider-paid inference.

## 4. Safety invariants

1. The compiler remains pure and deterministic.
2. Operation order is explicit and is never silently reordered.
3. Removal is fail-closed: unknown targets fail, and node removal requires incident edges to have already been removed in the same ordered sequence.
4. Every intermediate graph must remain structurally valid and domain-valid.
5. Confidence is evidence, never capability authority.
6. A proposal is not canonical truth and this Grain cannot accept, persist, deploy, or execute it.

## 5. Required evidence

Before closure, record:

- exact base/head/merge-base and complete changed-file accounting;
- focused tests for edge upsert/update, edge removal, node removal, valid ordered multi-op, invalid ordering, target conflicts, domain invalidity, determinism, and input immutability;
- full format/lint/typecheck/test results on the exact candidate;
- Diffcipline result;
- Alibaba Open Code Review deterministic accounting/delegation review where available;
- Jev exact-diff review where available;
- exact-head GitHub CI on Ubuntu and Windows;
- post-merge fresh-main CI and frontier reconciliation.

## 6. Recovery

Revert SG-000028 implementation/test/evidence changes. SG-000027's qualified no-op and upsert-node compiler and all prior Product Graph contracts remain intact.

## 7. Next dependency frontier

Once SG-000028 is merged, qualified, and canonically closed, re-evaluate whether `IN-P02-S03-T01` is complete or requires one final bounded intent-level slice. Only after the parent handle is complete may `IN-P02-S04-T01` advance. Dependency-eligible P02-S06/P02-S07/P02-S08 work may be shaped independently only if doing so does not bypass the canonical parent-handle sequencing.
