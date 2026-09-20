# P01-S02-T01 — Protocol Identity / Revision Candidate Evidence

**Task:** IN-P01-S02-T01  
**SpecGrain:** SG-000010  
**Date:** 2026-09-20  
**Baseline:** `b1c2c0c498c19c87a325b948da88d04de0f5152f`

## Candidate contract

The candidate promotes `@ineractive/protocol` from its P00 placeholder into the smallest
earned public protocol surface:

- explicit provider-neutral protocol ID namespaces;
- canonical opaque ID parsing/construction/serialization;
- exact immutable Git SHA revision references;
- exact immutable SHA-256 revision references;
- identity-plus-revision exact-state binding;
- machine-readable JSON Schema;
- public-export accounting.

## Safety boundary

- IDs do not grant authority or capability;
- branch names/floating tags/short SHAs are not revisions;
- Run/Event/Evidence/Finding object schemas remain out of scope;
- ModelTask/DecisionTask/CapabilityRequest/Grant remain out of scope;
- no runtime dependency is added;
- no persistence migration or external side effect occurs.

## Required proof

- positive and negative focused tests;
- public-export accounting test;
- no runtime dependencies;
- exact-head Ubuntu and Windows frozen install, format, lint, typecheck, and tests.

No PASS is claimed until the final candidate head executes those gates.
