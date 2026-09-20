# P02-S01-T01 — Product Graph Persistence Prototype Candidate

**Task:** IN-P02-S01-T01  
**SpecGrain:** SG-000015  
**Date:** 2026-09-20  
**Canonical baseline:** `ec1a8209c8f6164b41b55e77e5d41db5856b14e9`

## Purpose

Earn the Product Graph persistence decision through executable evidence instead of
choosing a database/format from naming or preference.

## Alternatives

### A. Structured document + derived indexes

- one canonical semantic document per revision;
- deterministic node/edge ordering and recursively normalized attribute keys;
- semantic SHA-256 revision over the canonical graph;
- derived in-memory node/outgoing-edge indexes;
- direct human inspection/export.

### B. Normalized relational rows

- explicit graph-revision row;
- explicit node rows;
- explicit edge rows with source/target identity;
- canonical JSON attributes per row;
- derived indexed query session;
- no graph-database dependency or hidden traversal semantics.

## Shared prototype surface

Both alternatives implement the same private prototype operations:

- persist;
- restore;
- serialize;
- node lookup;
- outgoing-edge lookup;
- one-hop semantic slice.

They run against the same representative Product Graph fixture and the same larger
synthetic fixture.

## Evidence

The committed deterministic comparison report is:

`docs/evidence/P02_S01_T01_PRODUCT_GRAPH_PROTOTYPE_COMPARISON_2026-09-20.json`

It records:

- semantic revision parity;
- round-trip parity;
- insertion-order stability;
- query parity;
- serialized storage size for representative and 1,000-node/2,000-edge fixtures;
- row count for the normalized alternative;
- all canonical selection criteria from `PRODUCT_GRAPH.md`;
- unresolved tradeoffs.

## Boundary

This Grain does **not** choose the P02 v1 representation.

`IN-P02-S01-T02` owns the evidence-backed selection and stable typed Product Graph v1
contracts.

The lab is intentionally not a workspace package and publishes no runtime/public API.
No lockfile, production database, graph database, or remote storage is introduced.

## Required final proof

- private lab TypeScript diagnostics = zero;
- focused Vitest prototype suite passes;
- committed comparison report matches executable report generation;
- exact-head Ubuntu and Windows repository CI passes.


## Qualification history

The focused qualification history is preserved rather than collapsed into the final green run:

- run `35533877070`, head `7e624364475c8574feecef32a7134e96c425eb20`: report generation, formatting, and TypeScript passed; ESLint failed with three findings (unsafe recursive JSON argument, one unused import, one unbound TypeScript method);
- run `35534040515`, head `4cef10c05ee6b33536d02ecacb529f8dbd960b82`: two findings were repaired; ESLint still identified the recursive array branch as an unsafe `any` path;
- run `35534088839`, head `46fc7637ac69343a50a349a749fe05ec6610ddf0`: object canonicalization was hardened; the array-narrowing path remained the sole ESLint finding;
- run `35534156493`, implementation head `6c581fdf32297bc918619d261677af826555069a`: frozen install, deterministic report generation, Prettier, private-lab TypeScript, ESLint, focused tests, and diff check all passed;
- focused tests: **2 files / 10 tests passed**;
- the successful one-shot then committed generated/formatted outputs and removed its temporary workflow, producing head `754d424d8539159d58c50e0920a94ec0daeec1ae`.

This evidence-only reconciliation commit does not change Product Graph prototype code or the generated comparison report. Fresh exact-head repository CI remains required before merge.
