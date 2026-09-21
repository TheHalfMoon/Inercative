# P02-S02-T02E — SpecGrain Shaping Record

**Task:** IN-P02-S02-T02E
**SpecGrain:** SG-000026
**Date:** 2026-09-21
**Canonical baseline:** `1b68b17fcf95c6910725da0224782c27753b3540`
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a` (`specgrain 0.3.0`, run from the pinned local environment)

## 1. Why this Grain exists

`IN-P02-S02-T02` is delivered as a bounded dependent Grain chain. SG-000022 delivered classification
and lifecycle node semantics, SG-000023 the governance relations, SG-000024 privacy semantics, and
SG-000025 locale semantics. External-effect and integration consequence semantics are the last
required surface of the handle.

| Slice | Deliverable | State |
|---|---|---|
| IN-P02-S02-T02A (SG-000022) | Classification and lifecycle node semantics | merged and closed |
| IN-P02-S02-T02B (SG-000023) | Data-governance relations and cross-node rules | merged and closed |
| IN-P02-S02-T02C (SG-000024) | Privacy semantics | merged and closed |
| IN-P02-S02-T02D (SG-000025) | Locale and internationalization semantics | merged and closed (`a8055154aac9fa5e4b24326aefdee32c73170709`, closure `1b68b17fcf95c6910725da0224782c27753b3540`) |
| IN-P02-S02-T02E (this Grain) | External-effect and integration consequence semantics | shaping |

The canonical sources are explicit that this is required, not decorative:

- `docs/canonical/PRODUCT_GRAPH.md` §3 defines `ExternalEffect` as "a potentially consequential
  side effect such as webhook delivery, email/SMS send, payment mutation, remote deployment, or
  irreversible API action" that "carries reconciliation/evidence requirements";
- `PRODUCT_GRAPH.md` §12 records "destructive Action lacks consequence classification" and
  "external effect has no consequence/reconciliation policy" as consistency defects deterministic
  validation must catch;
- `docs/canonical/RUNTIME_AND_SECURITY.md` §14 requires every action to declare a side-effect class;
- `docs/canonical/PRODUCT_CAPABILITY_MATRIX.md` lists external-effect semantics as V1 CORE with
  "consequence/idempotency/reconciliation".

## 2. SpecNode authority

The SpecNode was produced by the canonical SpecGrain CLI and is the implementation authority for
this slice. Reproduced tool state at this baseline:

```text
specgrain draft SG-000026 -> DRAFT
specgrain shape SG-000026 -> SHAPED
specgrain refine SG-000026 -> REFINING
specgrain grain SG-000026 -> GRAIN (revision_digest sha256:bd5f53fb3152e6066bfad91fbbee0358c0b67cad1566830e67fdea2332496732)
specgrain check -> PASS: project ineractive, 26 specs, 26 roots, 0 readiness-blocked
specgrain prove SG-000026 -> Records 0, Verified false
```

The `prove` result is recorded rather than hidden. The current CLI exposes no
`VERIFIED`/`CONTROLLED` transition, so repository delivery truth and exact evidence remain
canonical and no lifecycle state is fabricated.

## 3. Bounded scope

In:

- the `externaleffect` node kind with required `effect` and `consequence` attributes and optional
  `target`, `idempotent`, `reconciliation`, and `confirmation` attributes;
- the closed v1 vocabularies for effect kind, consequence class, reconciliation policy, and
  confirmation requirement, plus the declared remote-effect subset that requires an explicit
  target;
- the `causes` relation from `workflow` or `action` to `externaleffect`, expressed through the
  endpoint-pair authority delivered by SG-000023 so no other source or target combination becomes
  acceptable;
- four deterministic rules: `DOMAIN_MISSING_EFFECT_TARGET`,
  `DOMAIN_MISSING_RECONCILIATION_POLICY`, `DOMAIN_IRREVERSIBLE_EFFECT_WITHOUT_CONFIRMATION`, and the
  governance-phase rule `DOMAIN_CLASSIFIED_DATA_EXTERNAL_EFFECT`;
- focused deterministic tests for every value, every rule and its negative cases, the new relation
  and its rejected endpoints, ordering, input immutability, and unchanged canonical revision
  identity.

Out: no integration or capability node kind, no secret-reference semantics, no spend or budget
semantics, no network access, no credential handling, no provider call, and no runtime side effect
of any kind. Validation describes and validates semantics only.

## 4. Design constraints recorded before implementation

**The validator never acts.** An external-effect validator is the highest-risk place for accidental
side effects. The SpecNode records as an explicit safety requirement that validation must never
perform, attempt, or simulate an external effect, never open a network connection, and must not
depend on wall-clock time, randomness, the host locale, or a model inference.

**Classification reaches effects through the existing graph.** The
`DOMAIN_CLASSIFIED_DATA_EXTERNAL_EFFECT` rule composes three layers that are already merged: the
policy-required classification levels from SG-000022 and SG-000023, the `writes` relation from
SG-000021, and the new `causes` relation. It reports when a workflow that writes data at a
policy-required level causes an external effect that does not require confirmation, which is the
recorded consistency defect "sensitive/secret data has no handling policy" applied at the point
where data crosses the product boundary.

**Secrets stay out.** `RUNTIME_AND_SECURITY.md` §14 and the harness rules keep credentials out of
ordinary model context. No secret value is modelled here, and the SpecNode records that no secret
value may appear in a Product Graph document or validator message. Secret *references* belong with
the integration node kind, which is deliberately deferred rather than half-modelled.

**Vocabulary provenance.** The effect-kind vocabulary follows the canonical `ExternalEffect`
description (webhook delivery, email/SMS send, payment mutation, remote deployment, irreversible
API action) and the task's required surface (network request, database mutation, message send, file
write, payment, external API call, authentication, notification, deployment, destructive action).
The consequence, reconciliation, and confirmation vocabularies follow the recorded consistency
defect and the capability-matrix "consequence/idempotency/reconciliation" grouping.

## 5. Carried follow-up accounting

| Finding | Origin | State |
|---|---|---|
| `OCR-003`, `OCR-004` | SG-000019 accepted risk | repaired in SG-000021 and SG-000020 |
| `OCR-010`, `OCR-011` | SG-000022 OCR review | dispositioned `FALSE_POSITIVE` |
| `OCR-012` | SG-000023 OCR review | fixed at the reviewed head |
| `OCR-013` | SG-000023 OCR review | dispositioned `FALSE_POSITIVE` |
| `OCR-014`, `OCR-015` | SG-000024 OCR review | dispositioned `FALSE_POSITIVE` |
| `OCR-016`, `OCR-017` | SG-000025 OCR review | dispositioned `FALSE_POSITIVE` |

No accepted-risk finding is open when this Grain starts, and this Grain opens none.
