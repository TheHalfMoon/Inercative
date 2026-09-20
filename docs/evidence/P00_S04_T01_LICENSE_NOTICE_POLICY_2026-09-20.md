# P00-S04-T01 — License and Third-Party Notice Policy Evidence

**Task:** IN-P00-S04-T01  
**SpecGrain:** SG-000004  
**Date:** 2026-09-20  
**Baseline:** `6ca2cf1155ff3eb735ea97192738083674434682`

## Founder decision

Ineractive-owned source is licensed under **Apache License 2.0**.

## Acceptance mapping

- root `LICENSE`: Apache License 2.0 text;
- root/package manifests: `license = Apache-2.0`;
- root `NOTICE`: project notice and third-party notice boundary;
- `docs/canonical/THIRD_PARTY_NOTICE_POLICY.md`: canonical policy stating that the Ineractive license does not erase third-party obligations;
- `docs/canonical/FOUNDER_DECISIONS.md`: FD-011 records the founder license direction.

## Scope boundary

This change imports no donor product code and does not declare any third-party source admitted.

The next provenance/import tasks remain responsible for machine-readable source records, deterministic validation, and notice inventory enforcement.

## Required verification

The candidate must pass the repository baseline gates on its exact head before merge.

Alibaba OCR semantic review remains subject to the separately recorded scoped-endpoint blocker and is not fabricated here.
