# P02-S02-T02D — SpecGrain Shaping Record

**Task:** IN-P02-S02-T02D
**SpecGrain:** SG-000025
**Date:** 2026-09-21
**Canonical baseline:** `41b8d1ba2fad77734bb69158bc4be8b1574d06ab`
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a` (`specgrain 0.3.0`, run from the pinned local environment)

## 1. Why this Grain exists

`IN-P02-S02-T02` is delivered as a bounded dependent Grain chain. SG-000022 delivered classification
and lifecycle node semantics, SG-000023 the data-governance relations and cross-node rules, and
SG-000024 privacy semantics. Locale and internationalization semantics were deferred to this
dependent Grain.

| Slice | Deliverable | State |
|---|---|---|
| IN-P02-S02-T02A (SG-000022) | Classification and lifecycle node semantics | merged and closed |
| IN-P02-S02-T02B (SG-000023) | Data-governance relations and cross-node rules | merged and closed |
| IN-P02-S02-T02C (SG-000024) | Privacy semantics | merged and closed (`54f5eb7b0fc435b18a6cc5f91d8e4c635e458ee4`, closure `41b8d1ba2fad77734bb69158bc4be8b1574d06ab`) |
| IN-P02-S02-T02D (this Grain) | Locale and internationalization semantics | shaping |
| IN-P02-S02-T02E | External-effect semantics | not shaped |

The canonical frontend toolchain is explicit that this semantics belongs in the Product Graph:
`docs/canonical/FRONTEND_DESIGN_TOOLCHAIN.md` §19 states that "Locale and RTL semantics stay in
Product Graph and FrontendQualityProfile", that a framework-specific package such as `next-intl`
may only be qualified as an adapter, and that Arabic/RTL is a release benchmark rather than a late
CSS mirror pass. This Grain models the semantic layer only; no adapter is introduced.

## 2. SpecNode authority

The SpecNode was produced by the canonical SpecGrain CLI and is the implementation authority for
this slice. Reproduced tool state at this baseline:

```text
specgrain draft SG-000025 -> DRAFT
specgrain shape SG-000025 -> SHAPED
specgrain refine SG-000025 -> REFINING
specgrain grain SG-000025 -> GRAIN (revision_digest sha256:dcc10afca19c5a97be870414374f4cef204d4a168f5284a989a16f8263190043)
specgrain check -> PASS: project ineractive, 25 specs, 25 roots, 0 readiness-blocked
specgrain prove SG-000025 -> Records 0, Verified false
```

The `prove` result is recorded rather than hidden. The current CLI exposes no
`VERIFIED`/`CONTROLLED` transition, so repository delivery truth and exact evidence remain
canonical and no lifecycle state is fabricated.

## 3. Bounded scope

In:

- the `localeconfig` domain node kind with required `defaultLocale` and `supportedLocales` and
  optional `fallbackLocale`, `rtlLocales`, `formattingLocale`, and `userSelectable`;
- the documented accepted locale-tag subset and its deterministic validator;
- the stable node-phase error codes `DOMAIN_INVALID_LOCALE_TAG` and
  `DOMAIN_UNSUPPORTED_LOCALE_REFERENCE`;
- focused deterministic tests for accepted and rejected tags, every unsupported-reference case and
  its negative cases, ordering, input immutability, and unchanged canonical revision identity.

Out: translated-content and non-translatable-identifier semantics, route localization, page,
component, or content field changes, external-effect, Dataset, design-system, skill,
exploration-branch, or release semantics, any change to the classification, lifecycle, or privacy
vocabularies, any framework adapter, compiler, database, migration, or remote side effect, and any
new package, dependency, or lockfile change.

## 4. Vocabulary provenance and the recorded subset

The modelled dimensions come from canonical product decisions, not from invention:

- `docs/canonical/UX_AND_DESIGN.md` §15 requires the compiler to understand locale routing, RTL,
  translated content, **locale-aware numbers/dates/currency**, content expansion, and bidirectional
  design behaviour. Locale-aware numbers/dates/currency is what the `formattingLocale` attribute
  carries; RTL is what `rtlLocales` carries; the remaining UX items are explicitly out of this
  Grain.
- `docs/canonical/PRODUCT_GRAPH.md` §3 gives the `Product` node a `locale` attribute, so locale is
  already a first-class product concept rather than a framework concern.
- `docs/canonical/ROADMAP.md` P02-S02 requires "locale/timezone semantics" in this phase.

The accepted locale-tag subset is an **Ineractive validation subset**, not a claim of full BCP-47
conformance, and the SpecNode records that as an explicit safety requirement. It accepts a
two-or-three-letter lowercase language subtag, an optional four-letter script subtag, and an
optional two-letter uppercase or three-digit region subtag. Time-zone semantics are **not** modelled
in this Grain, because `ROADMAP.md` groups them with "locale/timezone semantics" while the task's
required surface names locale and internationalization only; time-zone configuration belongs with
the scheduling/runtime semantics and is left unmodelled rather than half-modelled here.

## 5. Design constraints recorded before implementation

**Node-local, not a new phase.** Both locale rules are properties of one node's own attributes, so
they belong in the existing `node` phase; the phase list stays
`core -> node -> edge -> relation -> governance`.

**No host-locale dependence.** The validator must not consult the host process locale, wall-clock
time, randomness, the network, or a model. This is recorded as a safety requirement because a
locale validator is exactly the kind of code that silently becomes environment-dependent.

**Fail closed.** An out-of-subset tag and an unsupported reference are reported, never coerced; the
optional locale attributes remain optional, so absence is not an error.

## 6. Carried follow-up accounting

| Finding | Origin | State |
|---|---|---|
| `OCR-003` | SG-000019 accepted risk | repaired in SG-000021 |
| `OCR-004` | SG-000019 accepted risk | repaired in SG-000020 |
| `OCR-010`, `OCR-011` | SG-000022 OCR review | dispositioned `FALSE_POSITIVE` |
| `OCR-012` | SG-000023 OCR review | fixed at the reviewed head |
| `OCR-013` | SG-000023 OCR review | dispositioned `FALSE_POSITIVE` |
| `OCR-014`, `OCR-015` | SG-000024 OCR review | dispositioned `FALSE_POSITIVE` |

No accepted-risk finding is open when this Grain starts, and this Grain opens none.
