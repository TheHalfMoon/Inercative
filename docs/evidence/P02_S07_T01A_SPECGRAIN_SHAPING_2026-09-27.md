# P02-S07-T01A SpecGrain shaping — SG-000034

**Task:** `IN-P02-S07-T01A` — core Dataset semantic node contracts  
**SpecGrain:** `SG-000034`  
**Date:** 2026-09-27  
**Canonical shaping base:** `bb66129903fba267d558eede00b94debac7d63e4`  
**Shaping branch:** `p02/s05-closeout-s07-t01a-shaping`  
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a`  
**Authoring run:** GitHub Actions `36302691548`

## Dependency truth

`IN-P02-S07-T01` depends on `IN-P02-S02-T02`, which is already closed canonically by SG-000022 through SG-000026. The task is therefore dependency-eligible independently of the still-partial P02-S06 semantic-reference relation work.

SG-000033 / P02-S05 also merged and passed fresh-main CI before this shaping run; its closure is recorded separately in `P02_S05_T01A_CLOSURE_2026-09-27.md`.

## Native SpecGrain execution

The temporary workflow installed exact SpecGrain source `5de7d6499bb0a9e3a191fc0934399cf099d1980a` and executed:

```text
specgrain draft
specgrain shape
specgrain refine
specgrain grain
specgrain check
```

Run `36302691548` completed **SUCCESS**. The workflow removed itself before persisting the final shaped branch state.

Generated Grain: `SG-000034` / state `GRAIN`.

## Bounded scope

This first S07 slice owns only the four core semantic node contracts:

- `Dataset`;
- `DatasetVersion`;
- `DataImport`;
- `DataMapping`.

The contracts must make provenance, privacy/environment context, transformation lineage, verification intent, and source/import/mapping identity explicit while remaining semantic metadata only.

The Grain explicitly excludes:

- reading CSV/XLSX/JSON/database/API content;
- executing imports or transformations;
- schema/type inference;
- Supabase or persistence mutation;
- model/provider calls;
- secrets/network access;
- production-data movement;
- `DataProfile`, `DataQualityRule`, `SeedDataset`, `SyntheticDataset`;
- dataset relation/cross-node semantics;
- ProductCompleteness work;
- P02-S06 relation repair.

## Safety boundary

A Dataset or source/provenance reference is never authority to access that data and is never proof that data exists, was inspected, was verified, or is safe. Sensitive/production data cannot be copied to another environment merely because a semantic node exists.

Jev was not executed during shaping because the authorized Desktop Commander devices were offline; no Jev PASS is claimed.
