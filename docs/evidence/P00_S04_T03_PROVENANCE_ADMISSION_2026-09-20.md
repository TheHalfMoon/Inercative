# P00-S04-T03 — Provenance Admission and Notice Inventory Evidence

**Task:** IN-P00-S04-T03  
**SpecGrain:** SG-000007  
**Date:** 2026-09-20  
**Baseline:** `92e1aeec05b671bf0006a2e925c0362eb352a83b`

## Candidate outcome

The candidate adds a deterministic admission layer over the existing donor import-record contract.

Admission fails closed when:

- a record is structurally invalid;
- dependency closure is not `COMPLETE`;
- two admitted records claim the same destination path.

For an admitted record set, the candidate produces a stable notice inventory containing every admitted third-party material, including sources that do not require a NOTICE file. The committed empty inventory is therefore valid only while the admitted donor-record set is empty.

## Current repository state

- admitted donor records: 0;
- notice inventory entries: 0;
- donor product code imported by this Grain: none.

## Required exact-head proof

- focused Vitest admission/notice tests;
- frozen install;
- format;
- lint;
- typecheck;
- full test suite on Ubuntu and Windows;
- exact changed-file accounting;
- review evidence governed separately by P00-S05.

No CI or review result is claimed until executed on the final candidate head.
