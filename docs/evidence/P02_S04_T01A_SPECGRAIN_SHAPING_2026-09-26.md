# P02-S04-T01A SpecGrain shaping evidence — 2026-09-26

**Task:** `IN-P02-S04-T01A` — deterministic Question Gate core  
**SpecGrain:** `SG-000031`  
**Canonical shaping base:** `1b07ac99374952533ffaf98f38708dfadc4b05b6`  
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a`

## Eligibility

SG-000030 merged as `1b07ac99374952533ffaf98f38708dfadc4b05b6` and fresh-main CI run `36253759531` completed SUCCESS. That closes parent `IN-P02-S03-T01` and unlocks `IN-P02-S04-T01`.

## Bounded outcome

This first S04 slice implements only the deterministic Question Gate decision contract and the first-class inferred Assumption Ledger record. Correction, confirmation, supersession, and dependent-work/evidence invalidation remain outside this Grain and require a later bounded S04 slice.

The shaped policy preserves the repository's zero-question default and four-way deterministic result surface: `derive`, `assume`, `ask`, or `defer`. Question Gate output is planning evidence only and never capability or execution authority.

## Native SpecGrain execution

Initial authoring run `36254247426` failed during `Shape bounded Grain`. The failure was caused by the workflow passing `vertical-slice` to `--minimality-choice`; the pinned SpecGrain enum accepts `reuse-existing`, `stdlib`, `native`, `installed-dependency`, or `new-code`. The failed run is preserved as negative authoring evidence and is not represented as PASS.

A forward repair changed the value to the valid `new-code` enum without weakening scope, acceptance, risk, safety, or evidence requirements.

Retry run `36254433673` completed SUCCESS:

- exact canonical ancestry check — SUCCESS;
- exact pinned SpecGrain installation — SUCCESS;
- `draft -> shape -> refine -> grain -> check` — SUCCESS;
- persisted native `SG-000031` state — SUCCESS;
- temporary shaping workflows removed before the persisted candidate.

The resulting native Grain is `.specgrain/specs/SG-000031.json`.

## Safety boundary

No model/provider/CLM/Jev invocation, source/Git/database/network mutation, capability grant, credential use, billing, publication, deployment, or external effect is authorized by this Grain. Confidence remains evidence, not authority.

## Next action

After this shaping/governance candidate is merged and fresh-main CI succeeds, implement SG-000031 exactly within its declared change surface and qualify the exact implementation candidate through repository checks, Diffcipline R2, Alibaba OCR review/accounting where applicable, Jev where available, exact-head CI, and post-merge fresh-main CI.
