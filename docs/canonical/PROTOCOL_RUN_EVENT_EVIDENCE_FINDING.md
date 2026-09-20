# Protocol Run, Event, Evidence, and Finding Records

**Status:** P01 candidate contract  
**Task:** IN-P01-S02-T02  
**SpecGrain:** SG-000011

## 1. Purpose

SG-000011 adds the first provider-neutral execution/observation records on top of the
logical identity and immutable revision primitives from SG-000010.

The contract separates four concepts:

- **Run** — one bounded execution identity and execution state;
- **Event** — one append-oriented observation about a run, ordered by an explicit sequence;
- **Evidence** — one exact-target observation or explicit non-observation state;
- **Finding** — one evidence-linked observation requiring disposition.

None of these records is an acceptance oracle.

## 2. Exact-state binding

Run, Evidence, and Finding targets use the existing `RevisionBinding` primitive:

```text
logical identity + immutable exact revision
```

Events may carry the same exact target when the event concerns source/artifact state.

No record introduces branch/tag aliases, provider IDs, database IDs, or implicit mutable
target identity.

## 3. Run semantics

Run states are:

- `PLANNED`;
- `RUNNING`;
- `COMPLETED`;
- `FAILED`;
- `CANCELLED`;
- `BLOCKED`.

`COMPLETED` means execution completed. It does **not** mean the candidate passed
verification or is accepted for merge/release.

A run may reference a parent run but may not parent itself.

## 4. Event semantics

Events bind:

- event identity;
- run identity;
- non-negative deterministic sequence;
- canonical lowercase event kind;
- producer/source identity;
- optional exact target;
- zero or more unique external/artifact references.

The protocol does not provide a clock or timestamp source in this Grain. Ordering is
explicit through the run-local sequence field.

## 5. Evidence semantics

Observation states are intentionally not PASS/FAIL:

- `OBSERVED`;
- `BLOCKED`;
- `NOT_RUN`;
- `INCONCLUSIVE`.

`OBSERVED` requires at least one artifact/reference and no failure/blocker reason.
Every other state requires a non-empty reason.

This prevents absence of evidence from being serialized as successful proof.

Evidence freshness is explicit:

- `CURRENT`;
- `STALE`;
- `SUPERSEDED`.

`SUPERSEDED` requires the identity of the replacing Evidence record. Historical records
remain immutable; freshness describes their current interpretation rather than rewriting
the old observation.

## 6. Finding semantics

Findings carry independent dimensions:

- category;
- severity;
- confidence;
- optional location reference;
- Evidence identities;
- requirement/policy references;
- status;
- disposition;
- freshness.

Statuses:

- `OPEN`;
- `BLOCKING`;
- `RESOLVED`.

Dispositions:

- `UNRESOLVED`;
- `FIXED`;
- `ACCEPTED_RISK`;
- `FALSE_POSITIVE`;
- `DEFERRED_BLOCKING`.

The validator enforces:

- `OPEN` -> `UNRESOLVED`;
- `BLOCKING` -> `UNRESOLVED` or `DEFERRED_BLOCKING`;
- `RESOLVED` -> `FIXED`, `ACCEPTED_RISK`, or `FALSE_POSITIVE`.

Severity and confidence never silently determine blocking status.

## 7. Freshness and supersession

Evidence and Finding records use the same explicit freshness model.

- `CURRENT` and `STALE` cannot name a superseding record.
- `SUPERSEDED` must name a different same-kind record.

A stale record is preserved as history and cannot be silently interpreted as current.

## 8. Provider-neutral boundary

The public records do not embed Alibaba OCR, browser, test-runner, model-provider, or
deployment-specific payloads. Provider-specific adapters normalize into these records
later.

The P00 OCR evidence validator remains private and is not exported as a public
provider-neutral contract.

## 9. Scope intentionally deferred

SG-000011 does not define:

- ModelTask / DecisionTask;
- CapabilityRequest / CapabilityGrant;
- persistence or database schema;
- authorization/ownership;
- timestamp/clock semantics;
- runtime executor behavior;
- acceptance/PASS claims.

Those remain dependency-ordered future work.

## 10. Machine-readable schema

Canonical schema:

`packages/protocol/schema/run-event-evidence-finding.schema.json`

The schema and TypeScript validators share the same acceptance-critical enums and
semantic constraints. Focused tests pin those invariants without adding a runtime
schema-validation dependency.
