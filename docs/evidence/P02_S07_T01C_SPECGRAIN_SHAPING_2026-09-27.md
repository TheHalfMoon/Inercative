# P02-S07-T01C SpecGrain shaping — SG-000036

**Task:** `IN-P02-S07-T01C` — DataSource and Field relation endpoint contracts  
**SpecGrain:** `SG-000036`  
**Date:** 2026-09-27  
**Canonical shaping base:** `76cc78d90189195d70594b628083a5495c05252b`  
**Shaping branch:** `p02/s07-t01c-endpoint-shaping`  
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a`

## Why this prerequisite exists

Canonical Product Graph dataset relations require typed `DataSource` and `Field` endpoints. Those node kinds are not yet present in the qualified domain-v1 vocabulary. Adding dataset relations before those endpoints would require string-reference authority, a wildcard endpoint, or another overly broad substitute, none of which is authorized.

SG-000036 therefore introduces only the endpoint metadata contracts required before a later relation/cross-node Grain can safely add `BINDS_TO`, `MAPS_TO`, and the other canonical S07 relations.

## Native SpecGrain execution

Initial shaping run `36333647889` produced SG-000036 successfully at draft time but failed during `shape` because the temporary workflow supplied unsupported minimality enum value `prerequisite`.

The failure is retained as negative evidence. The exact pinned SpecGrain version accepts `reuse-existing`, `stdlib`, `native`, or `installed-dependency`. Because this Grain extends the existing deterministic Product Graph domain validator, the workflow was fixed forward to `reuse-existing`; risk, scope, and acceptance were not weakened.

Corrected run `36333743748` completed `SUCCESS` through:

```text
specgrain draft
specgrain shape
specgrain refine
specgrain grain
specgrain check
```

The workflow self-deleted before the final shaped commit. Generated state: `SG-000036 / GRAIN`.

## Bounded scope

SG-000036 owns exactly two new metadata-only endpoint node contracts:

- `DataSource` — source identity/type, provenance, and bounded optional environment/status/verification metadata;
- `Field` — human-inspectable field name/type, provenance, and bounded optional description/status/verification metadata.

It explicitly excludes new edges, endpoint pairs, cross-node rules, source reads, database/API connections, network or secret access, persistence/Supabase mutation, provider/model calls, import/profile/mapping/quality execution, generation, and environment writes.

It also excludes the separate P02-S06 endpoint repair (`Component`, `Feature`, `ProductRevision`, `DeploymentTarget`), ProductCompleteness, VectorCorpus/EvalDataset, and P03 work.

## Safety boundary

A `DataSource` node is metadata and is never proof that a source exists, is reachable, is authenticated, was read, or is synchronized.

A `Field` node is metadata and never grants entity ownership, storage, classification, mapping, or runtime authority.

## Jev gate

The generated Grain requires Jev semantic review when credentialed for the future code-changing implementation candidate. Current GitHub Actions infrastructure has a verified Jev binary installation path but no configured `JEV_API_KEY` / `TYPESAFE_API_KEY`; therefore no future implementation merge may claim `JEV_PASS` until an actual credentialed exact-diff Jev review succeeds.
