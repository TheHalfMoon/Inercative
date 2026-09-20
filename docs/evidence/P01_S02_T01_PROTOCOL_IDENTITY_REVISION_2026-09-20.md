# P01-S02-T01 — Protocol Identity / Revision Candidate Evidence

**Task:** IN-P01-S02-T01  
**SpecGrain:** SG-000010  
**Date:** 2026-09-20  
**Baseline:** `47610ad8ebde3e7b4b80f24c5db02225a6881ae5`

## Candidate contract

The public `@ineractive/protocol` API gains only:

- canonical opaque logical identity formatting/parsing;
- immutable full Git revision formatting/parsing;
- immutable SHA-256 revision formatting/parsing;
- typed logical-identity + exact-revision binding.

No later P01 protocol domain is introduced.

## Safety properties

- identity does not encode authorization, ownership, secrets, timestamps, or mutable state;
- mutable Git labels and short hashes are rejected as revisions;
- canonical forms are lowercase and round-trip without normalization ambiguity;
- logical identity remains distinct from immutable revision;
- the package keeps zero runtime dependencies.

## Required exact-head proof

- focused Vitest identity/revision positive and negative fixtures;
- package manifest zero-runtime-dependency assertion;
- format/lint/typecheck/full tests;
- exact-head Ubuntu and Windows CI.

No PASS is claimed until the final candidate head executes those gates.
