# P02-S02-T02B — SpecGrain Shaping Record

**Task:** IN-P02-S02-T02B
**SpecGrain:** SG-000023
**Date:** 2026-09-21
**Canonical baseline:** `3394799b125c76a0705db1c21635840216f46c26`
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a` (`specgrain 0.3.0`, run from the pinned local environment)

## 1. Why this Grain exists

`IN-P02-S02-T02` is delivered as a bounded dependent Grain chain. SG-000022
(`IN-P02-S02-T02A`) delivered the classification and lifecycle **node** layer and explicitly deferred
the classification and governance **relations** and the cross-node rules to this dependent Grain.

| Slice | Deliverable | State |
|---|---|---|
| IN-P02-S02-T02A (SG-000022) | Classification and lifecycle node semantics | merged and closed (`abb95d11c79c88d106a8cd58b6672891807f2d42`, closure `3394799b125c76a0705db1c21635840216f46c26`) |
| IN-P02-S02-T02B (this Grain) | Data-governance relations and cross-node rules | shaping |
| IN-P02-S02-T02C | Privacy semantics | not shaped |
| IN-P02-S02-T02D | Locale semantics | not shaped |
| IN-P02-S02-T02E | External-effect semantics | not shaped |

The node layer alone cannot express governance: `Entity -> CLASSIFIED_AS -> DataClass` and
`DataPolicy -> GOVERNS -> Entity` are the canonical relations in `docs/canonical/PRODUCT_GRAPH.md`
§4, and `PRODUCT_GRAPH.md` §12 lists "sensitive/secret data has no handling policy" and
"external effect has no consequence/reconciliation policy" as consistency defects that deterministic
validation must catch. The sensitivity side of that defect is in scope here; the external-effect
side belongs to T02E.

## 2. SpecNode authority

The SpecNode was produced by the canonical SpecGrain CLI and is the implementation authority for
this slice. Reproduced tool state at this baseline:

```text
specgrain draft SG-000023 -> DRAFT
specgrain shape SG-000023 -> SHAPED
specgrain refine SG-000023 -> REFINING
specgrain grain SG-000023 -> GRAIN (revision_digest sha256:b81eaf8b93bf6e1efe4173f379e8b681154975620b084247b9d4e918cd72c3ed)
specgrain check -> PASS: project ineractive, 23 specs, 23 roots, 0 readiness-blocked
specgrain prove SG-000023 -> Records 0, Verified false
```

The `prove` result is recorded rather than hidden. The current CLI exposes no
`VERIFIED`/`CONTROLLED` transition, so repository delivery truth and exact evidence remain
canonical and no lifecycle state is fabricated.

## 3. Bounded scope

In:

- the endpoint-pair table as the single endpoint authority for a relation kind, with the declared
  `from` and `to` sets derived from it;
- the `classified_as` relation (`entity -> dataclass`);
- `governs` extended to the source-specific pairs `permission -> action` and `datapolicy -> entity`;
- `requires` extended to `requirement -> datapolicy`;
- the `governance` phase after the `relation` phase and its three stable error codes:
  `DOMAIN_CONFLICTING_CLASSIFICATION`, `DOMAIN_SENSITIVE_DATA_WITHOUT_POLICY`, and
  `DOMAIN_CLASS_POLICY_CONFLICT`;
- focused deterministic tests for the pair table, the relations, every rule and its negative cases,
  cross-phase ordering, input immutability, and unchanged canonical revision identity.

Out: no new node kinds, no change to the SG-000022 vocabularies or field contracts, no privacy,
locale, external-effect, Dataset, design-system, skill, exploration-branch, or release semantics,
no Change Intent, graph views, compiler, database, migration, or remote side effect, no new package,
dependency, or lockfile change, and no relaxation of any existing rejection behavior.

## 4. Design constraints recorded before implementation

**Endpoint pairs instead of widened endpoint sets.** The cheap way to let `datapolicy` govern
entities is to widen `governs` to `from: [permission, datapolicy]` and
`to: [action, entity]`. That would accept `permission -> entity` and `datapolicy -> action`, which
the previous Grains reject, so it is a silent weakening of an existing check. The endpoint-pair
table keeps one relation name and one source of truth while preserving every rejection, and the
second safety requirement makes that explicit.

**A distinct governance phase.** Cross-node rules are not relation-level rules: they need node
semantics (classification level) composed with relations (classification and governance edges).
They are reported in a new `governance` phase appended after `relation`, so the phase order stays
`core -> node -> edge -> relation -> governance` and the existing total sort key still applies
unchanged.

**Which levels require a handling policy.** The rule is derived from `PRODUCT_GRAPH.md` §12
("sensitive/secret data has no handling policy") applied over the SG-000022 vocabulary: `personal`,
`sensitive`, `secret`, and `regulated` require a governing policy; `public` and `internal` do not.

**No compliance claim.** As with SG-000022, a classification or a governance relation is product
semantics only. `docs/canonical/GENERATED_PRODUCT_CONTRACT.md` §9 and
`docs/canonical/SUPABASE_PLATFORM.md` §17.1 are recorded as explicit safety requirements, and no
validator may emit a compliance claim.

## 5. Carried follow-up accounting

| Finding | Origin | State |
|---|---|---|
| `OCR-003` | SG-000019 accepted risk | repaired in SG-000021 |
| `OCR-004` | SG-000019 accepted risk | repaired in SG-000020 |
| `OCR-010`, `OCR-011` | SG-000022 OCR review | dispositioned `FALSE_POSITIVE`, no accepted-risk debt |

No carried accepted-risk finding is open when this Grain starts, and this Grain opens none.
