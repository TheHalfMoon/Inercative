# P01-S01-T01 — SpecGrain Shaping Evidence

Task: IN-P01-S01-T01
SpecGrain: SG-000009
Date: 2026-09-20
Canonical baseline: a83b9ecca9c49372bed031f6de21e6c03523c07b
SpecGrain source: TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a
GitHub Actions run: 35523847378

## Tool execution

- draft state: DRAFT
- shaped revision: sha256:641bc7b86c163f4a02d91d919cce90aa6f255244f81ea9459e0c0a8ff44942de
- refine state: REFINING
- grain state: GRAIN
- final revision: sha256:641bc7b86c163f4a02d91d919cce90aa6f255244f81ea9459e0c0a8ff44942de
- project check valid: true
- next eligible: false
- next waiting_on: SG-000001,SG-000003,SG-000007,SG-000008

The SpecNode was produced by the real pinned SpecGrain CLI; it was not hand-authored.

## Lifecycle boundary

P00 dependencies are canonically delivered in Git/evidence, but the current SpecGrain CLI
does not expose VERIFIED/CONTROLLED transitions for them. Any waiting_on result caused by
that lifecycle gap is recorded rather than bypassed with fabricated states.
