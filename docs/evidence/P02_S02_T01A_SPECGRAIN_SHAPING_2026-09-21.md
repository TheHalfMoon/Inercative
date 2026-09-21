# P02-S02-T01A — SpecGrain Shaping and Grain-Split Record

**Task:** IN-P02-S02-T01A
**SpecGrain:** SG-000020
**Date:** 2026-09-21
**Canonical baseline:** `769c76daf8b5c4e7ca0e37bb0ed2adc2a1a138d1`
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a` (`specgrain 0.3.0`, run from the pinned local environment)

## 1. Why this Grain exists

`IN-P02-S01-T02` is satisfied by SG-000018 + SG-000019, so the dependency frontier is
`IN-P02-S02-T01` (domain nodes/edges and deterministic validators). SG-000019 closed with two
accepted-risk findings, `OCR-003` and `OCR-004`, which its review record explicitly deferred to
the P02-S02 grain. This Grain is the first bounded slice of that frontier.

## 2. Real CLI execution (unmodified tool output)

The SpecNode was produced by the canonical SpecGrain CLI from canonical `main`:

```text
specgrain draft  --title ... --outcome ... --rationale ... --json
specgrain shape  SG-000020 --scope-in ... --scope-out ... --acceptance ... --dependency SG-000019 ...
specgrain refine SG-000020 --json
specgrain grain  SG-000020 --json
specgrain check
```

| Step | Result |
|---|---|
| draft | `SG-000020`, state `DRAFT`, revision `sha256:538bdac0f1a7c25539be09461ccc5b70d7ff35a85923670fed0a4767ab84d827` |
| shape | state `SHAPED`, revision `sha256:660910be75604b95f574dec04c4ab75f06d6032ce6acdf3a38f46fc581a234c5` |
| refine | state `REFINING`, same revision |
| grain | state `GRAIN`, same revision |
| check | `PASS` — project `ineractive`, 20 specs, 20 roots, 0 readiness-blocked |

The CLI exposes no `VERIFIED`/`CONTROLLED` transition, so no later lifecycle state is fabricated.

## 3. Negative evidence preserved: the rejected first draft

The first SG-000020 draft covered the whole domain model (node kinds, edge kinds, relation rules)
and both carried repairs as one unit. Its implementation candidate
`bef3f13637d6e6e4a2e5b50ac117898f2767698d` measured 6 files, `+1057/-12`.

Diffcipline `v1.0.0` (verified SHA-256
`5fee721d3837ab86f2c36003d02ca67ebac793ff8dadcdb3b7eea074690e57a8`) returned **FAIL** for that
candidate with reason `added lines 1057 exceed maximum 600`.

No gate was weakened, no metric was gamed, and no rerun-to-green was performed. The rejected
candidate is superseded by the split below.

## 4. Corrected authority: split into bounded dependent slices

| Slice | Task handle | Content | State |
|---|---|---|---|
| SG-000020 | IN-P02-S02-T01A | Domain **node** kinds, required/optional fields, deterministic node validators, and the carried `OCR-004` canonical-JSON depth/cycle guard | this Grain |
| dependent Grain | IN-P02-S02-T01B | Domain **edge** kinds, endpoint-kind compatibility, relation rules, and the carried `OCR-003` single-pass outgoing-edge index repair | not yet shaped |

`OCR-004` belongs to this slice because it guards the canonical JSON input path that domain
validation reads; `OCR-003` belongs to the edge/query slice.

## 5. Jev typed judgments (supporting evidence only)

Run against the shaped SpecNode plus the existing v1 contracts and the SG-000019 findings record:

| Question | Result |
|---|---|
| Readiness classification for implementation | `READY_TO_IMPLEMENT`, confidence `0.86`, `0.88` probability |
| Material ambiguity in node semantics or acceptance | `noul 0.35` → no |
| Architecture conflict with v1 contracts or the canonical plan | `noul 0.11` → no |
| Missing deterministic validation contract | `noul 0.15` → no |
| The narrowed grain fits the 600-added-line Diffcipline bound | `noul 0.69` → yes, low-confidence |

The last judgment is recorded as a true signal rather than a formality: the bound is real and the
implementation must be measured, not assumed. Jev is assurance evidence only and grants nothing.
