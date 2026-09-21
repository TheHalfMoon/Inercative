# P02-S01-T02A — SpecGrain Shaping Evidence

**Task:** IN-P02-S01-T02A
**SpecGrain:** SG-000018
**Date:** 2026-09-21
**Canonical baseline:** ad191d8227ba847f127c2c5f563895c2315f81a3
**SpecGrain source:** TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a
**GitHub Actions run:** 35562462041

## Tool execution

The SpecNode was produced by the real pinned SpecGrain CLI; it was not hand-authored.

- draft state: DRAFT
- shaped revision: sha256:fceb2e00f7c7ead9d182d9ec1c7039c0901075d21955fc72fbc893051c3af0df
- refine state: REFINING
- grain state: GRAIN
- final revision: sha256:fceb2e00f7c7ead9d182d9ec1c7039c0901075d21955fc72fbc893051c3af0df
- project check valid: true
- next valid: true
- next eligible for SG-000018: false
- next waiting_on: SG-000017

## Canonical dependency truth

SG-000017 / IN-P02-S01-T01C is canonically complete through PR #29.
Exact-head CI #171 passed on Ubuntu and Windows; fresh-main CI #173 passed on merge commit ad191d8227ba847f127c2c5f563895c2315f81a3.
The CLI waiting_on value reflects the known missing VERIFIED/CONTROLLED transition surface; no lifecycle state is fabricated.

## Decomposition boundary

This Grain selects the v1 persistence representation only.
Stable Product Graph v1 node/edge/revision contracts remain a separate IN-P02-S01-T02B Grain after this decision closes canonically.
P02-S02 domain semantics and validators remain out of scope.
