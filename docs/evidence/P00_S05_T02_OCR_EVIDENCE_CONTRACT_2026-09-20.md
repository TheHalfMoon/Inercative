# P00-S05-T02 — OCR Evidence Contract Candidate

**Task:** IN-P00-S05-T02  
**SpecGrain:** SG-000008  
**Date:** 2026-09-20  
**Baseline:** `917d730c2cdb841b198e896ff9af0c74e48d393c`

## Candidate outcome

The candidate defines a strict, machine-readable Alibaba OCR evidence contract without
granting OCR acceptance authority or pretending the semantic layer ran.

The contract requires:

- exact base/head/merge-base identity;
- OCR release, verified binary digest, and config identity;
- complete changed-file accounting;
- every changed file exactly once in reviewable or excluded classification;
- explicit exclusion reasons;
- separate-review evidence for material excluded files;
- deterministic rule-resolution evidence for each reviewable file;
- semantic RUN / BLOCKED / NOT_RUN state;
- structured semantic output identity and findings only when RUN;
- explicit blocker evidence and zero findings when BLOCKED/NOT_RUN;
- material finding disposition;
- stale-head invalidation unless deterministic unchanged-diff reconciliation exists.

## Public API boundary

The implementation lives under `packages/protocol/**` because SG-000008 explicitly
authorizes that surface, but `packages/protocol/src/index.ts` remains unchanged with an
empty public export surface. P01 retains ownership of public protocol contracts.

## Standing blocker

Alibaba OCR semantic LLM review remains **NOT RUN** because no scoped endpoint/token is
provisioned. This candidate records that state; it does not convert it into PASS.

## Required proof before merge

- focused validator tests;
- deterministic OCR preview/rule-resolution accounting on the exact candidate;
- exact-head Ubuntu and Windows frozen install, format, lint, typecheck, and tests;
- no unresolved material review finding;
- no credential or secret committed.


## CI repair history

- candidate `911027b23b01501ff2faf6ab34f9e577d7415214`: frozen install passed; Ubuntu failed only at `format:check` for the three new OCR evidence contract files;
- one-shot formatter run `35522144380` used repository-pinned Prettier 3.9.8, verified the exact three files, committed a format-only repair, and removed its temporary workflow from the branch;
- the formatter-generated head is not accepted by itself; acceptance requires fresh exact-head Ubuntu and Windows CI after this connector-authored evidence update.
