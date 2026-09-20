# P00-S02-T01 — SpecGrain Initialization Evidence

**Task:** IN-P00-S02-T01 (SpecGrain SG-000001)  
**Date:** 2026-09-20  
**Branch:** `p00/s02-specgrain-init`

## Tooling

- SpecGrain CLI installed from the founder-owned repository
  `TheHalfMoon/SpecGrain` at current `main` (publishes pre-Grain lifecycle and
  WorkPacket export; `v0.3.0` is a historical release behind `main`).
- Install: `python -m pip install "git+https://github.com/TheHalfMoon/SpecGrain.git@main" --no-deps`
- Python 3.11.15 (SpecGrain requires 3.11+; zero runtime dependencies).

## Commands executed (real output, not fabricated)

### init

```text
specgrain init . --project-id ineractive
SpecGrain init: PASS
Project: ineractive
Store: .specgrain
```

Created `.specgrain/project.json`, `.specgrain/policies/default.json`, `.specgrain/specs/`.

### seeding

Six frontier Grains authored via `draft -> shape -> refine -> grain`:

| SpecGrain ID | Task | State | Dependencies |
|---|---|---|---|
| SG-000001 | IN-P00-S02-T01 | GRAIN | — |
| SG-000002 | IN-P00-S03-T01 | GRAIN | — |
| SG-000003 | IN-P00-S03-T02 | GRAIN | SG-000002 |
| SG-000004 | IN-P00-S04-T01 | GRAIN | — |
| SG-000005 | IN-P00-S04-T02 | GRAIN | SG-000004 |
| SG-000006 | IN-P00-S05-T01 | GRAIN | — |

### check

```text
specgrain check . --json
{"grain_ready_count":0,"issues":[],"policy":"default","project_id":"ineractive",
 "readiness_blocked":[],"readiness_mode":"report","refining_leaf_count":0,
 "root_count":6,"spec_count":6,"valid":true}
```

### next (dependency eligibility)

```text
specgrain next . --json
{"eligible":["SG-000001","SG-000002","SG-000004","SG-000006"],
 "waves":[["SG-000001","SG-000002","SG-000004","SG-000006"],["SG-000003","SG-000005"]],
 "issues":[],"valid":true}
```

`SG-000003` waits on `SG-000002`; `SG-000005` waits on `SG-000004`. This matches the
canonical roadmap dependency order.

### packet (WorkPacket export proof)

```text
specgrain packet SG-000001 --context-sources <ctx.json> --json
{... "packet_digest":"sha256:873681c8105ffdfaeaaf98abcc473632193534620bfdec37ee3444ae94f2b103",
    "packet_version":1, "spec_id":"SG-000001",
    "spec_revision":"sha256:09fd09d248ece827ca23af4e832ba28906246a682e28f55f94ee9448f63e3b10"}
```

The WorkPacket is bound to the exact `spec_revision` and carries a deterministic
`packet_digest`, satisfying "a WorkPacket can be exported/bound."

## Scope decision (rolling wave, no fabricated state)

Only the live (not-yet-complete) P00 frontier is modeled as SpecGrain specs. Completed
P00-S01 tasks predate SpecGrain initialization and are **not** represented as SpecGrain
nodes; their authority is merged Git/CI evidence (recorded in `specs/CURRENT.md`). No
SpecGrain spec was placed in a satisfied state for work the tool did not track.

Later tasks (IN-P00-S04-T03, IN-P00-S05-T02, and P01+) remain at roadmap-handle
resolution and will be shaped into Grains when dependency-eligible.

## Baseline gates on this change

- `prettier --check .` — PASS (`.specgrain/` is in `.prettierignore`).
- `eslint .` — PASS.
- `tsc --noEmit` (root, `packages/protocol`, `packages/program-tasks`) — PASS.
- `vitest run` — PASS (17/17 across 2 files).

## NOT RUN (truthfully)

- Alibaba Open Code Review: NOT RUN (SG-000006 / IN-P00-S05-T02).
- Diffcipline exact-diff proof: NOT RUN (SG-000002 / SG-000003).
- `specgrain scan`: NOT RUN (brownfield map not required for this Grain).
