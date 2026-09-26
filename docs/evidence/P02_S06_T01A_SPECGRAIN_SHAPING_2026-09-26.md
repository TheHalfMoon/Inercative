# P02-S06-T01A SpecGrain shaping evidence — 2026-09-26

**Task:** `IN-P02-S06-T01A` — semantic reference node contracts  
**SpecGrain:** `SG-000029`  
**Canonical base:** `bc58a8e9b2f261bbf1d98459bf2eb91310ae1ce8`  
**Shaping branch:** `p02/s06-t01a-reference-nodes-shaping`  
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a`  
**Authoring run:** GitHub Actions `36248568133`

## Why this Grain is eligible

The canonical task index makes `IN-P02-S06-T01` depend on `IN-P02-S02-T02`, whose final bounded slice `SG-000026 / IN-P02-S02-T02E` is already canonically delivered. The active `SG-000028` closeout work belongs to P02-S03 and does not create a dependency edge into S06.

This Grain therefore advances an independent dependency-eligible P02 surface without declaring P02-S03 complete and without unlocking P02-S04 early.

## Why the parent task is split

`IN-P02-S06-T01` spans both semantic reference node contracts and the relations that bind those references into the Product Graph. Combining both concerns in one implementation would unnecessarily enlarge the shared domain-contract diff.

`SG-000029` deliberately owns only the node layer:

- `DesignSystemRevisionRef` semantic reference node;
- `SkillRef` semantic reference node;
- `ExplorationBranch` semantic reference node;
- `Release` semantic reference node;
- closed deterministic attribute schemas;
- focused validation tests and public export continuity.

Semantic relations such as `BOUND_TO`, `MAY_USE`, `FORKS`, `PROMOTES`, and `TARGETS` are explicitly outside this Grain and may be shaped as a later S06 slice after this node vocabulary is proven.

## Native SpecGrain authoring

The repository did **not** hand-author `SG-000029.json`.

A temporary branch-only GitHub Actions harness installed the exact SpecGrain source revision above and executed the native CLI sequence:

```text
specgrain draft
specgrain shape
specgrain refine
specgrain grain
specgrain check
```

All five authoring/validation steps completed successfully in run `36248568133`. The temporary workflow removed itself before persisting the SpecGrain state, so it is not part of the proposed canonical diff.

The resulting candidate is:

```text
ID = SG-000029
STATE = GRAIN
RISK = medium
DEPENDENCY = SG-000026
UNRESOLVED_DECISIONS = 0
MINIMALITY = reuse-existing
SAFETY = requirements-defined
```

## Safety boundary

The Grain records two explicit safety requirements:

1. reference nodes are semantic data only and cannot grant capability, execute a Skill, mutate source, deploy a release, call a provider, or perform an external effect;
2. referenced identities/revisions are data, not proof that an external artifact exists or is trusted.

No runtime dependency, provider call, secret, network operation, source mutation, deployment operation, Dataset work, ProductCompleteness work, or Question Gate behavior is authorized by this shaping step.

## Implementation authority

This document and `SG-000029` authorize only the bounded implementation described by the Grain. They do not claim implementation PASS, Diffcipline PASS, OCR PASS, Jev PASS, merge completion, or parent-task completion.

The implementation candidate must still satisfy the exact acceptance/evidence contract in `.specgrain/specs/SG-000029.json` before canonical closure.
