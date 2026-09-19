# Ineractive P00 Bootstrap Handoff

**Status:** implementation handoff after canonical planning merge  
**Phase:** P00 — Repository and Delivery Foundation

## 1. Objective

Create the minimum trustworthy repository substrate required for later product implementation.

P00 deliberately builds almost no product behavior.

At exit, the repository must be able to:

- describe work as SpecGrain state;
- prove changes with Diffcipline;
- obtain Alibaba OCR semantic review evidence;
- validate source/donor provenance;
- run deterministic CI baseline checks;
- accept a bounded P01 Grain without inventing evidence.

## 2. Standing execution rules

Before every P00 Grain:

1. re-fetch live `main`, open PRs, and current canonical docs;
2. verify no newer authority changed the frontier;
3. shape/refine only the dependency-eligible task;
4. bind exact baseline/head;
5. use normal branch/PR integration;
6. no force-push/rebase/shared-history rewrite;
7. do not import product donor code before license/provenance controls exist;
8. preserve NOT RUN as NOT RUN.

## 3. P00-S01 — Repository bootstrap

### T01 — Toolchain qualification

Decide and pin the smallest toolchain that can support the current architecture.

Minimum questions resolved by evidence:

- workspace/package manager;
- Node/TypeScript versions;
- React/control-plane bootstrap constraints without prematurely selecting P01 framework if not needed;
- test runner;
- lint/format/static tooling;
- supported local platform baseline;
- command naming.

Acceptance:

- versions are explicit;
- fresh install is deterministic;
- no product runtime dependency is introduced merely for fashion;
- clean install/check procedure is documented.

### T02 — Minimal skeleton

Create only currently earned directories/packages.

Acceptance:

- no circular workspace dependencies;
- no provider-specific types in core protocol placeholder;
- no generated-app runtime implementation yet;
- baseline commands execute.

### T03 — CI baseline

Acceptance:

- CI runs exact repository commands;
- lockfile install is deterministic;
- failure is visible;
- no green-by-omission;
- status is bound to exact head.

## 4. P00-S02 — SpecGrain initialization

Use the live/current supported SpecGrain CLI and repository conventions.

Do not hand-invent hidden SpecGrain state if the tool owns that representation.

Seed:

- program/root;
- P00-P15 coarse specs;
- dependency direction;
- P00 current frontier.

Shape only the first dependency-eligible unit deeply.

Acceptance:

- readiness state is machine-readable through SpecGrain;
- a WorkPacket can be exported/bound;
- canonical roadmap links to SpecGrain state without duplicating mutable authority.

## 5. P00-S03 — Diffcipline

Initialize risk/proof policy.

Required proof classes for P00:

- exact diff;
- expected/forbidden scope;
- dependency/lockfile state;
- executed verification;
- policy provenance.

Prove a harmless bounded repository change end to end.

Acceptance:

- PASS/REVIEW/FAIL semantics are observable;
- NOT RUN cannot become PASS;
- proof binds exact candidate;
- changing candidate head invalidates stale proof.

## 6. P00-S04 — License and provenance

### License

Select and commit the license for Ineractive-owned source.

Acceptance:

- repository LICENSE exists;
- package metadata matches;
- policy explicitly states that Ineractive license does not erase third-party obligations.

### Import/provenance schema

Required fields:

- source repository;
- immutable revision;
- source paths;
- destination;
- use mode;
- authority/permission reference;
- license/notice;
- dependency closure;
- modification summary;
- security impact;
- verification;
- review evidence.

Acceptance:

- invalid/incomplete import record fails validation;
- notice inventory can be generated/checked;
- no product donor source has been imported before this gate.

## 7. P00-S05 — Alibaba Open Code Review

Establish OCR as the designated AI review engine.

Minimum integration target:

- exact base/head;
- deterministic file inventory;
- reviewable/excluded accounting;
- applicable rule resolution;
- semantic review;
- structured or machine-readable finding capture where supported;
- separate semantic review for material unsupported files.

Acceptance:

- every material changed file is reviewed or accounted for;
- OCR finding does not automatically grant PASS;
- evidence records OCR version/config/base/head;
- changed head requires re-review or explicit reconciliation.

Do not treat CodeRabbit or another bot status as substitute qualification evidence.

## 8. P00 exit gate

P00 exits only when:

- toolchain baseline is pinned and reproducible;
- CI baseline executes;
- SpecGrain is initialized and the next Grain can be exported;
- Diffcipline exact-diff proof is operational;
- license and third-party policy exist;
- provenance/import validation exists;
- Alibaba OCR workflow has actually executed against an exact candidate or the canonical plan explicitly records a truthful external blocker preventing execution;
- no unresolved material review finding remains;
- exact-head evidence is fresh.

## 9. P01 handoff output

P00 should finish by creating/refreshing:

- `specs/CURRENT.md`;
- canonical SpecGrain current state;
- evidence for P00 exit;
- first P01 WorkPacket/Grain only if ready.

Do not start P01 implementation inside the P00 exit change.
