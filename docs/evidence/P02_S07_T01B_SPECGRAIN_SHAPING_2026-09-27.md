# P02-S07-T01B SpecGrain shaping — SG-000035

**Task:** `IN-P02-S07-T01B` — profile, quality, seed, and synthetic semantic node contracts  
**SpecGrain:** `SG-000035`  
**Date:** 2026-09-27  
**Canonical shaping base:** `651738db84bcc99aeaf6141b469b476951509007`  
**Shaping branch:** `p02/s07-t01a-closeout-t01b-shaping`  
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a`  
**Authoring run:** GitHub Actions `36303973029`

## Dependency truth

SG-000034 / `IN-P02-S07-T01A` merged as `651738db84bcc99aeaf6141b469b476951509007` and passed fresh-main CI `36303817244` before this shaping run. The dependency declared by SG-000035 is therefore canonically satisfied.

## Native SpecGrain execution

The temporary workflow installed exact SpecGrain source `5de7d6499bb0a9e3a191fc0934399cf099d1980a` and executed:

```text
specgrain draft
specgrain shape
specgrain refine
specgrain grain
specgrain check
```

Run `36303973029` completed **SUCCESS**. The workflow removed itself before persisting final branch state.

Generated Grain: `SG-000035` / state `GRAIN`.

## Bounded scope

This S07 slice owns exactly four metadata node contracts:

- `DataProfile`;
- `DataQualityRule`;
- `SeedDataset`;
- `SyntheticDataset`.

The contract goals are intentionally non-executable:

- DataProfile identifies dataset-version observation/provenance context and inspectable profile/quality characteristic references;
- DataQualityRule expresses deterministic, human-inspectable validity/reconciliation/integrity requirements without executable code;
- SeedDataset records deterministic/reproducible development/test intent, environment, representative role/state/edge-case coverage, provenance, and verification identity;
- SyntheticDataset records schema/product-semantics and privacy-policy constraint identity plus deterministic/reproducible generation intent, environment, provenance, coverage, and verification identity.

The Grain explicitly excludes profiling/statistics calculation, quality-rule execution, generation, seed insertion, data reads, persistence/Supabase mutation, model/provider calls, network/secrets, production-data copying, environment writes, relation/cross-node semantics, VectorCorpus/EvalDataset, ProductCompleteness, S06 repair, and P03 work.

## Safety boundary

A profile or quality-rule node is metadata, not proof that data was inspected or a rule was executed. Seed/synthetic metadata grants no write or model capability. Synthetic/seed workflows must not copy private production values by default, and reproducibility metadata is never permission to access a source or target environment.

Jev was not executed during shaping because the GitHub-hosted runner lacks it and the authorized Desktop Commander devices were offline in this execution window. No Jev PASS is claimed.
