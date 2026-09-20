# P00-S04-T02 — Donor Provenance Import Record Evidence

**Task:** IN-P00-S04-T02  
**SpecGrain:** SG-000005  
**Date:** 2026-09-20  
**Baseline:** `54709f3e4cfd4e85ffce697846b1d8f487d0ae26`

## Implementation

Added dependency-free package `@ineractive/provenance` with:

- JSON Schema draft 2020-12 machine-readable import-record schema;
- typed TypeScript record contract;
- deterministic validator over `unknown`;
- explicit unknown-field rejection;
- strict required-field validation;
- negative fixtures for missing fields, short/unpinned revisions, empty paths, duplicate paths, missing required notice reference, unsupported use mode, and empty evidence.

## Acceptance mapping

The schema captures:

- source repository;
- immutable revision;
- source paths;
- destination;
- use mode;
- authority/permission reference;
- license/notice state;
- dependency closure;
- modification summary;
- security impact;
- verification evidence;
- review evidence.

Invalid or incomplete records fail deterministic validation.

## Scope boundary

No donor code is imported.

Notice inventory generation/admission policy remains IN-P00-S04-T03.

## Required verification

Exact-head repository CI must pass formatting, lint, typecheck, and Vitest including the provenance negative controls before merge.
