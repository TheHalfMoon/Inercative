# ADR-0003 — Product Graph v1 Persistence Representation

**Status:** Accepted for guarded canonical merge — exact-head qualification required  
**Date:** 2026-09-21  
**Task:** IN-P02-S01-T02A  
**SpecGrain:** SG-000018

## Context

P02-S01 requires an evidence-backed Product Graph persistence decision before stable v1
node/edge/revision contracts are implemented.

Three canonically qualified Grains now provide the decision input:

- `SG-000015 / IN-P02-S01-T01A`: canonical structured-document prototype;
- `SG-000016 / IN-P02-S01-T01B`: normalized-relational prototype;
- `SG-000017 / IN-P02-S01-T01C`: deterministic cross-representation comparison.

The comparison proves semantic revision, round-trip, insertion-order, and bounded query
parity for both representations. It also records deterministic storage-surface
measurements without converting them into unsupported wall-clock latency claims.

Representative fixture:

- 4 nodes / 4 edges;
- structured document: 892 serialized bytes;
- normalized relational: 2,042 serialized bytes / 9 rows.

Scaled fixture:

- 128 nodes / 256 edges;
- structured document: 34,761 serialized bytes;
- normalized relational: 89,047 serialized bytes / 385 rows.

Production database latency/indexing, observed concurrent-edit conflict rates, and later
migration cadence remain unmeasured.

## Decision

Product Graph v1 uses a **canonical structured revision document** as authoritative
persisted semantic state.

The canonical representation has these rules:

1. one immutable Product Graph revision document is the authority for a revision;
2. deterministic canonical ordering and serialization define stable inspection/export
   behavior and feed semantic revision identity;
3. normalized relational rows, search indexes, caches, or other projections may exist
   only as **derived, regenerable state**;
4. a derived projection never becomes a second source of truth and must carry the
   canonical revision identity from which it was produced;
5. future adapters may change storage mechanics without changing Product Graph semantic
   contracts, provided canonical revision identity and deterministic reconstruction remain
   preserved.

The normalized-relational prototype remains qualified evidence and is retained as the
reference design for future derived projections/indexes.

## Selection criteria

### Deterministic diff

Both prototypes serialize deterministically. Structured canonical snapshots keep the
entire semantic revision directly inspectable. Array-local textual diff width is an
accepted V1 cost because semantic changes are governed as graph deltas rather than
arbitrary text merges.

### Mergeability

Normalized rows provide narrower logical storage units. V1 nevertheless keeps canonical
authority at the immutable revision level: concurrent product changes should reconcile as
proposed graph deltas/revisions, not as competing direct row mutations. This prevents
storage row shape from becoming product semantics.

### Migration and versioning

A structured revision carries an explicit schema version and can be transformed as one
semantic unit. This is a smaller authoritative schema surface for V1. Derived relational
projections can be rebuilt after a canonical migration rather than participating in a
dual-write migration protocol.

### Slice and query ergonomics

The normalized prototype demonstrates a natural path to indexed partial reads. The
structured prototype demonstrates deterministic in-memory slicing after hydration. V1
therefore permits regenerable derived indexes/projections when workload evidence requires
them without changing canonical authority.

### Testability

Both prototypes are independently testable and round-trip deterministically. The
structured document keeps canonical fixtures compact and makes whole-revision equality
direct.

### Human inspectability

The structured document exposes the semantic whole directly. Normalized rows require a
projection to reconstruct that view.

### Performance and storage surface

Only deterministic serialized size/row-count evidence is accepted today. On the qualified
fixtures the structured representation is materially smaller. No production latency or
database-index performance claim is made.

## Alternatives

### Normalized relational state as canonical authority

Not selected for V1. It has attractive partial-read and narrower logical mutation
properties, but it expands the authoritative persistence schema before realistic database
behavior has been measured and makes semantic reconstruction depend on row projection.

### Dual-authoritative hybrid

Rejected. Two independently authoritative representations would require dual-write
consistency/reconciliation and create ambiguity about which state defines a Product
Revision.

### Graph database

Rejected for V1. The canonical plan explicitly requires evidence rather than selecting a
graph database because the model is called a graph.

## Consequences

Positive:

- one deterministic and human-inspectable semantic authority;
- stable revision hashing/export/reconstruction;
- no premature coupling to Postgres/Supabase row layout or a graph database;
- derived relational/index projections remain available for query optimization;
- T02B can define storage-neutral stable Product Graph contracts.

Costs:

- some slice/query paths may require complete revision hydration until a derived index is
  justified and implemented;
- row-level transactional mutation is not the canonical write model;
- large-graph performance must be measured later rather than inferred from serialized
  size.

## Revisit triggers

Re-open this decision when real evidence shows any of the following:

- realistic Product Graph workloads miss explicit hydration, memory, or slice/query
  budgets with the structured canonical representation;
- derived projection regeneration/freshness cannot satisfy recovery or query requirements;
- observed graph-delta concurrency/conflict behavior shows immutable-revision persistence
  is the bottleneck;
- migration evidence shows whole-revision transforms are unsafe or operationally
  unacceptable;
- a required transactional partial-update workflow cannot be represented safely as a new
  immutable Product Revision.

A revisit must preserve one authoritative semantic representation at a time or explicitly
define and prove a replacement authority transition.

## Scope boundary

This ADR selects persistence authority only. It does not implement stable v1 node/edge/
revision contracts; that remains `IN-P02-S01-T02B`.

It also does not introduce P02-S02 domain node types, data-governance semantics,
production database schemas, Supabase migrations, or remote side effects.

## Evidence

- `docs/evidence/P02_S01_T01_PRODUCT_GRAPH_PROTOTYPE_COMPARISON_2026-09-21.json`;
- exact-head CI #171 on candidate `0e564b032bdf8beeac33a87818a771bd76ddd5dd`;
- exact-candidate assurance run `35562088818`;
- PR #29 merge commit `ad191d8227ba847f127c2c5f563895c2315f81a3`;
- fresh-main CI #173 / run `35562246818` on that merge commit.
