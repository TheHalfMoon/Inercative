# Ineractive Donor Provenance / Import Record Contract

**Status:** canonical P00 contract  
**Date:** 2026-09-20  
**Task:** IN-P00-S04-T02 / SpecGrain SG-000005

## 1. Purpose

Every future donor-code intake must have a deterministic, machine-readable record before the imported material can be treated as admitted Ineractive source.

The contract records provenance and evidence. It does not itself authorize an import.

## 2. Canonical schema

The machine-readable schema is:

`packages/provenance/schema/import-record.schema.json`

The deterministic TypeScript validator is:

`packages/provenance/src/index.ts`

Both use schema version `1`.

## 3. Required information

A record must capture:

- source repository/artifact locator;
- immutable revision represented by a 40- or 64-hex source digest/SHA;
- exact source paths;
- destination paths;
- use mode: COPY, ADAPT, or DEPEND;
- authority/permission kind and reference;
- license expression and NOTICE requirement/reference;
- dependency-closure state and references;
- modification summary;
- security impact;
- verification evidence;
- review evidence.

The schema rejects unknown fields so a producer cannot silently invent an unreviewed escape hatch.

## 4. Validation vs admission

A structurally valid record can still contain a dependency-closure state of `PARTIAL` or `UNRESOLVED`.

That is intentional: structural validation proves that uncertainty is represented, not that the source is safe to import.

SG-000007 / IN-P00-S04-T03 adds a separate deterministic admission gate:

- every record must first pass structural validation;
- dependency closure must be `COMPLETE`;
- destination paths may not collide across admitted records;
- NOTICE-required material must retain a non-empty notice reference;
- a canonical notice inventory is generated from the admitted set;
- the committed inventory must exactly match the deterministic generated inventory.

An empty committed inventory is valid only when the admitted donor-record set is empty.

No donor product code is imported by SG-000007.

## 5. Rights boundary

Founder permission is recorded as an authority reference but never replaces upstream license, NOTICE, redistribution, model/dataset/asset, trademark, or transitive dependency obligations.

The Apache-2.0 project license applies only to Ineractive-owned material.
