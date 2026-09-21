# P02-S02-T01B — SpecGrain Shaping Record

**Task:** IN-P02-S02-T01B
**SpecGrain:** SG-000021
**Date:** 2026-09-21
**Canonical baseline:** `ef545a49e4da16169547b8434c6526c64309e8ea`
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a` (`specgrain 0.3.0`, run from the pinned local environment)

## 1. Why this Grain exists

`IN-P02-S02-T01` was split by the repository Diffcipline budget, not by preference.

The first SG-000020 draft tried to deliver the whole domain model plus both carried SG-000019
accepted-risk findings. Its candidate `bef3f13637d6e6e4a2e5b50ac117898f2767698d` measured
6 files / `+1057/-12`, and Diffcipline `v1.0.0` returned **FAIL** with reason
`added lines 1057 exceed maximum 600`.

SG-000020 (`IN-P02-S02-T01A`) then delivered the node-side slice and the carried `OCR-004`
canonical-JSON guard, merged as `3b35c7a8c34f1e15d994c10e9ce1b22c4d1465f5` (PR #43) and closed as
`ef545a49e4da16169547b8434c6526c64309e8ea` (PR #44).

**SG-000021 is the remaining slice of the same task handle**: domain edge kinds, endpoint-kind
compatibility, relation-level rules, and the carried `OCR-003` single-pass outgoing-edge index
repair, which targets the edge query path.

## 2. SpecNode authority

The SpecNode was produced by the canonical SpecGrain CLI and is the implementation authority for
this slice. Reproduced tool state at this baseline:

```text
specgrain check -> PASS: project ineractive, 21 specs, 21 roots, 0 readiness-blocked
specgrain prove SG-000021 -> Records 0, Verified false
```

The `prove` result is recorded rather than hidden. `specgrain prove SG-000019` returns the same
shape (`Records 0`, `Verified false`) for a Grain that is already canonically closed, which
confirms the CLI simply exposes no `VERIFIED`/`CONTROLLED` transition. Repository delivery truth
and exact evidence remain canonical, and no lifecycle state is fabricated.

## 3. Bounded scope

In:

- the closed v1 domain edge-kind vocabulary (`may`, `cannot`, `displays`, `triggers`, `starts`,
  `reads`, `writes`, `requires`, `governs`, `affects`) with explicit endpoint-kind compatibility
  and the explicit `any-domain-node` wildcard used only by `affects`;
- deterministic edge validation (unknown kinds, incompatible source/target kinds, self-reference);
- deterministic relation validation (duplicate relations, conflicting role authorization);
- the phase order extended to `core -> node -> edge -> relation` with the existing total sort key;
- the carried `OCR-003` repair: a single-pass `edge.from` index replacing per-node filtering;
- focused edge and relation tests, including query parity for the repaired index.

Out: no new node kinds, no change to the SG-000020 field contracts, no data-governance, dataset,
locale, or external-effect semantics, no Change Intent, graph views, compiler, database, Supabase
migration, or remote side effect, no new package, dependency, or lockfile change, and no change to
Product Graph v1 canonical revision identity for well-formed documents.

## 4. Carried follow-up accounting

| Finding | Origin | Disposition |
|---|---|---|
| `OCR-004` (no cycle/depth guard in canonical JSON) | SG-000019 accepted risk | **Repaired in SG-000020** (`IN-P02-S02-T01A`) |
| `OCR-003` (outgoing-edge index built in O(nodes x edges)) | SG-000019 accepted risk | **Repaired in this Grain** |

Both named follow-ups therefore have an owning Grain, and neither remains forgotten accepted risk.
