# P02-S02-T02A — SpecGrain Shaping Record

**Task:** IN-P02-S02-T02A
**SpecGrain:** SG-000022
**Date:** 2026-09-21
**Canonical baseline:** `c21e76d7d73451d53ddecbeffad25872f0c50752`
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a` (`specgrain 0.3.0`, run from the pinned local environment)

## 1. Why this Grain exists

`IN-P02-S02-T01` was deliberately delivered as two bounded dependent Grains after a single
oversized candidate was rejected by the Diffcipline line bound. `IN-P02-S02-T02` carries the same
hazard and gets the same treatment.

The task handle covers five semantic surfaces (data classification, data lifecycle, privacy,
locale, and external effects) plus their deterministic validators. Delivering all five in one
candidate would repeat the rejected `+1057/-12` failure mode, so the handle is decomposed into
dependent slices, each of which must pass Diffcipline against the exact candidate:

| Slice | Deliverable | Status |
|---|---|---|
| IN-P02-S02-T02A (this Grain) | Data-classification and lifecycle **node** semantics: closed vocabularies, `dataclass` and `datapolicy` kinds, enum-field validation, policy-local lifecycle contradiction | shaping |
| IN-P02-S02-T02B | Data-governance **relations** and cross-node rules: `classified_as`, source-specific `governs` endpoints, `requires -> datapolicy`, ungoverned-sensitive-data and conflicting-classification rules | not yet shaped |
| IN-P02-S02-T02C | Privacy semantics (collection, purpose, visibility, consent, redaction, minimization) | not yet shaped |
| IN-P02-S02-T02D | Locale / internationalization semantics | not yet shaped |
| IN-P02-S02-T02E | External-effect and integration consequence semantics | not yet shaped |

Only T02A has implementation authority at this baseline. A later slice is shaped only after the
preceding slice is merged and closed, so no slice inherits an unproven contract.

## 2. SpecNode authority

The SpecNode was produced by the canonical SpecGrain CLI and is the implementation authority for
this slice. Reproduced tool state at this baseline:

```text
specgrain draft SG-000022 -> DRAFT
specgrain shape SG-000022 -> SHAPED   (revision_digest sha256:2cf3b3439e066e59d425d011ddd262b1eff11116e1aa2eafbc8a13f4de9c73f0)
specgrain refine SG-000022 -> REFINING
specgrain grain SG-000022 -> GRAIN
specgrain check -> PASS: project ineractive, 22 specs, 22 roots, 0 readiness-blocked
specgrain prove SG-000022 -> Records 0, Verified false
```

The `prove` result is recorded rather than hidden. The current CLI exposes no
`VERIFIED`/`CONTROLLED` transition, so repository delivery truth and exact evidence remain
canonical and no lifecycle state is fabricated.

## 3. Bounded scope

In:

- the closed v1 data-classification level vocabulary;
- the closed v1 lifecycle vocabularies for retention, deletion, export, audit, and residency;
- the `dataclass` and `datapolicy` domain node kinds with declared required and optional fields;
- a data-driven enum-field table and the stable node-phase error code `DOMAIN_INVALID_ENUM_VALUE`;
- the stable node-phase error code `DOMAIN_LIFECYCLE_CONTRADICTION` for a policy that declares
  bounded retention without an explicit deletion path;
- focused deterministic tests for the new vocabularies, kinds, validation, ordering, input
  immutability, and unchanged canonical revision identity.

Out: no data-governance relations or cross-node rules, no privacy, locale, or external-effect
semantics, no Dataset, design-system, skill, exploration-branch, or release semantics, no Change
Intent, graph views, compiler, database, Supabase migration, or remote side effect, no new package,
dependency, or lockfile change, and no change to Product Graph v1 canonical revision identity for
well-formed documents.

## 4. Vocabulary provenance and reconciliation

The classification vocabulary is derived from canonical project decisions rather than invented:

- `docs/canonical/PRODUCT_GRAPH.md` §3 (`DataClass`) is the Product Graph authority and names
  `public`, `internal`, `personal`, `sensitive`, `secret`, and `regulated`. Those six values are
  adopted as the closed v1 domain vocabulary.
- `docs/canonical/RUNTIME_AND_SECURITY.md` §15 lists a parallel privacy vocabulary (`public`,
  `project-confidential`, `personal/user data`, `secrets/credentials`, `regulated/sensitive`) for
  project and provider-routing data. That list maps onto the Product Graph vocabulary
  (`project-confidential -> internal`, `personal/user data -> personal`, `secrets/credentials ->
  secret`, `regulated/sensitive -> regulated` and `sensitive`) rather than creating a second
  competing taxonomy.

The lifecycle dimension is derived from the `DataPolicy` definition in
`docs/canonical/PRODUCT_GRAPH.md` §3 ("retention, export, deletion, residency, consent, redaction,
audit, and access-handling requirements") and the P02-S02 roadmap line in
`docs/canonical/ROADMAP.md` ("data classification, retention, export, deletion, audit, consent, and
residency constraints"). This Grain implements the retention, deletion, export, audit, and
residency dimensions; consent and redaction are privacy surfaces and are scheduled to T02C.

Per `docs/canonical/GENERATED_PRODUCT_CONTRACT.md` §9 and
`docs/canonical/SUPABASE_PLATFORM.md` §17.1, declaring a classification or a lifecycle policy is a
product-semantics statement and is never a legal or regulatory compliance claim. The Grain records
that constraint as an explicit safety requirement and no validator may emit a compliance claim.

## 5. Determinism and fail-closed position

The layer composes on top of `validateProductGraphState` and the SG-000020 node layer, and it never
weakens either. Out-of-vocabulary values, unknown kinds, and unknown fields all fail closed with
stable error codes instead of being coerced or silently dropped, preserving the SG-000019
identity-safety principle that unknown semantic input must not silently disappear.

## 6. Carried follow-up accounting

| Finding | Origin | Disposition |
|---|---|---|
| `OCR-003` (outgoing-edge index) | SG-000019 accepted risk | Repaired in SG-000021 |
| `OCR-004` (canonical-JSON cycle/depth guard) | SG-000019 accepted risk | Repaired in SG-000020 |

No new carried accepted-risk finding is opened by this Grain. No SG-000019 accepted-risk follow-up
remains open.
