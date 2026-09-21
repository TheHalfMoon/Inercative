# P02-S01-T02B — SpecGrain Shaping Evidence

**Task:** IN-P02-S01-T02B
**SpecGrain:** SG-000019
**Date:** 2026-09-21
**Canonical baseline:** ff5bcbc3241d43fbb643d037ccb5967a20213af4
**SpecGrain source:** TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a
**GitHub Actions run:** 35564004611

## Tool execution

The SpecNode was produced by the real pinned SpecGrain CLI; it was not hand-authored.

- draft state: DRAFT
- shaped revision: sha256:7e9a89d682a018a016d34239aff62e60d68cb11772cf9f73f962805ac7251692
- refine state: REFINING
- grain state: GRAIN
- final revision: sha256:7e9a89d682a018a016d34239aff62e60d68cb11772cf9f73f962805ac7251692
- project check valid: true
- next valid: true
- next eligible for SG-000019: false
- next waiting_on: SG-000018

## Canonical dependency truth

SG-000018 / IN-P02-S01-T02A is canonically complete through PR #32.
Its exact candidate 0cc36e2063b5aa192c393ccf75ecab3c8a9482e0 passed exact-head CI #175 and exact-candidate assurance run 35562780116.
Fresh-main CI #177 passed on merge commit ff5bcbc3241d43fbb643d037ccb5967a20213af4 on Ubuntu and Windows.
Any CLI waiting_on value is preserved as tool truth; no lifecycle state is fabricated.

## Decomposition boundary

This Grain implements stable storage-neutral Product Graph v1 node/edge/revision contracts only.
P02-S02 domain semantics and deterministic domain validators remain a separate successor Grain.
The Product Graph prototype lab remains non-production evidence and is not a dependency of the stable package.
