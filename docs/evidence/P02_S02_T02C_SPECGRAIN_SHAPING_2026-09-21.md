# P02-S02-T02C — SpecGrain Shaping Record

**Task:** IN-P02-S02-T02C
**SpecGrain:** SG-000024
**Date:** 2026-09-21
**Canonical baseline:** `8cd309b3780b54299298836c3eb04ffecd8eefac`
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a` (`specgrain 0.3.0`, run from the pinned local environment)

## 1. Why this Grain exists

`IN-P02-S02-T02` is delivered as a bounded dependent Grain chain. SG-000022 delivered the
classification and lifecycle node layer, SG-000023 delivered the data-governance relations and
cross-node rules, and both explicitly deferred privacy semantics to this dependent Grain.

| Slice | Deliverable | State |
|---|---|---|
| IN-P02-S02-T02A (SG-000022) | Classification and lifecycle node semantics | merged and closed |
| IN-P02-S02-T02B (SG-000023) | Data-governance relations and cross-node rules | merged and closed (`59be1a686707346b6d179cbc9783020cb924548d`, closure `8cd309b3780b54299298836c3eb04ffecd8eefac`) |
| IN-P02-S02-T02C (this Grain) | Privacy semantics | shaping |
| IN-P02-S02-T02D | Locale semantics | not shaped |
| IN-P02-S02-T02E | External-effect semantics | not shaped |

## 2. SpecNode authority

The SpecNode was produced by the canonical SpecGrain CLI and is the implementation authority for
this slice. Reproduced tool state at this baseline:

```text
specgrain draft SG-000024 -> DRAFT
specgrain shape SG-000024 -> SHAPED
specgrain refine SG-000024 -> REFINING
specgrain grain SG-000024 -> GRAIN (revision_digest sha256:c124c716cea2680259d8a1d4145a27d8e15d887589b64c3cf98bdf6a0e9a4f67)
specgrain check -> PASS: project ineractive, 24 specs, 24 roots, 0 readiness-blocked
specgrain prove SG-000024 -> Records 0, Verified false
```

The `prove` result is recorded rather than hidden. The current CLI exposes no
`VERIFIED`/`CONTROLLED` transition, so repository delivery truth and exact evidence remain
canonical and no lifecycle state is fabricated.

## 3. Bounded scope

In:

- closed v1 privacy vocabularies on the `datapolicy` node kind for collection source, user
  visibility, consent, redaction, and minimization;
- the optional free-form processing-purpose list field;
- enum registration of the new attributes, so an out-of-vocabulary value is reported as
  `DOMAIN_INVALID_ENUM_VALUE`;
- three governance-phase rules: `DOMAIN_CONSENT_WITHOUT_USER_VISIBILITY`,
  `DOMAIN_MISSING_REDACTION_CONTROL`, and `DOMAIN_PUBLIC_VISIBILITY_OF_CLASSIFIED_DATA`;
- focused deterministic tests for the vocabularies, the fields, every rule and its negative cases,
  ordering, input immutability, and unchanged canonical revision identity.

Out: no new node or edge kinds, no change to the classification or lifecycle vocabularies or to any
relation or endpoint pair, no locale, external-effect, Dataset, design-system, skill,
exploration-branch, or release semantics, no Change Intent, graph views, compiler, database,
migration, or remote side effect, no new package, dependency, or lockfile change, and no claim or
encoding of legal or regulatory compliance.

## 4. Vocabulary provenance

The privacy dimensions come from the canonical `DataPolicy` definition and the security document,
not from an invented taxonomy:

- `docs/canonical/PRODUCT_GRAPH.md` §3 (`DataPolicy`) names retention, export, deletion, residency,
  **consent**, **redaction**, audit, and access-handling requirements. Retention, export, deletion,
  and audit were delivered by SG-000022; consent and redaction are delivered here.
- `docs/canonical/RUNTIME_AND_SECURITY.md` §15 states that logs and evidence should store **the
  minimum useful data, with redaction and retention controls**, which grounds the `minimization` and
  `redaction` dimensions.
- `docs/canonical/SUPABASE_PLATFORM.md` §17.1 requires **user-visible preference/consent state**
  when applicable, which grounds the `visibility` dimension and the first governance rule.
- `docs/canonical/PRODUCT_GRAPH.md` §12 records the defect "public Page writes private Entity
  without permission", which grounds reporting public visibility of data that requires a handling
  policy.

Two values are derived from the task's required semantic surface rather than from a canonical
sentence, and are recorded as such instead of being presented as canonical: the `collection` source
vocabulary names data entering the product (user-provided, system-generated, imported, derived,
which follows the existing Dataset/DataImport vocabulary for "imported"), and the processing purpose
is modelled as a free-form list because a closed vocabulary of business purposes would invent
product meaning.

## 5. Design constraints recorded before implementation

**Privacy rules extend the existing `governance` phase.** Privacy is data governance: the rules
compose policy attributes with classification levels exactly as the SG-000023 rules do. Adding a new
phase per semantic area would grow the phase model without adding clarity, so the phase list stays
`core -> node -> edge -> relation -> governance`.

**No compliance claim, no jurisdiction.** `docs/canonical/GENERATED_PRODUCT_CONTRACT.md` §9 and
`docs/canonical/SUPABASE_PLATFORM.md` §17.1 are recorded as explicit safety requirements; the
vocabularies describe product behaviour only, and the Grain forbids encoding jurisdiction-specific
rules.

**Fail closed.** Out-of-vocabulary privacy values are reported rather than coerced, unknown privacy
attributes still fail as unknown fields, and a privacy rule never turns a rejection into an
acceptance.

## 6. Carried follow-up accounting

| Finding | Origin | State |
|---|---|---|
| `OCR-003` | SG-000019 accepted risk | repaired in SG-000021 |
| `OCR-004` | SG-000019 accepted risk | repaired in SG-000020 |
| `OCR-010`, `OCR-011` | SG-000022 OCR review | dispositioned `FALSE_POSITIVE` |
| `OCR-012` | SG-000023 OCR review | fixed at the reviewed head |
| `OCR-013` | SG-000023 OCR review | dispositioned `FALSE_POSITIVE` |

No accepted-risk finding is open when this Grain starts, and this Grain opens none.
