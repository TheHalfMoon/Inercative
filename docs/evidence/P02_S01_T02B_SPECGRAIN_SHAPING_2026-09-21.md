# P02-S01-T02B — Corrected SpecGrain Shaping Evidence

**Task:** IN-P02-S01-T02B
**SpecGrain:** SG-000019
**Date:** 2026-09-21
**Canonical baseline:** ff5bcbc3241d43fbb643d037ccb5967a20213af4
**SpecGrain source:** TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a
**GitHub Actions run:** 35564466836

## Tool execution

The corrected SpecNode was produced by the real pinned SpecGrain CLI from canonical main.

- draft state: DRAFT
- shaped revision: sha256:537d9b66608ebd4e6d38196942cef7792938dab27610725fb31e3d5e1658f68a
- refine state: REFINING
- grain state: GRAIN
- final revision: sha256:537d9b66608ebd4e6d38196942cef7792938dab27610725fb31e3d5e1658f68a
- project check valid: true
- next valid: true
- next eligible for SG-000019: false
- next waiting_on: SG-000018

## Negative evidence retained

Closed PR #35 candidate 34b511ee44366be408c6e90143ff451e1fcdbc78 is superseded.
Assurance run 35564342100 failed deterministically with ERR_PNPM_PACKAGE_MANAGER_NO_IMPORTER because pnpm-lock.yaml lacked importers[packages/product-graph].
The first Grain did not authorize pnpm-lock.yaml, so no out-of-surface repair was made and the candidate was not rerun-to-green.
Closed evidence-only PR #36 preserves the failed assurance path.

## Corrected authority

This fresh SG-000019 explicitly authorizes pnpm-lock.yaml only for the dependency-free workspace importer required by packages/product-graph.
SG-000018 / IN-P02-S01-T02A remains canonically complete through PR #32 and fresh-main CI #177.
Any CLI waiting_on value is preserved as tool truth; no lifecycle state is fabricated.
