# Ineractive Failure, Recovery, and Change Safety

**Status:** canonical planning direction  
**Date:** 2026-09-19

## 1. Principle

Ineractive must reason about partial failure.

A distributed build can succeed in Git and fail in Supabase, succeed in Supabase and fail in deployment, time out after an external side effect, or lose connection before final state is observable.

Silence is not success.

## 2. Operation classes

Every side-effecting operation declares:

- idempotency class;
- retry safety;
- rollback possibility;
- consequence class;
- external identity;
- expected evidence;
- ambiguity behavior.

Canonical classes:

- PURE — no external mutation;
- IDEMPOTENT — repeated execution preserves intended result;
- RECONCILABLE — retries require reading external state first;
- ONE_SHOT — retry may duplicate or worsen effects and requires explicit resolution.

## 3. Run state

Long-running runs use durable state transitions:

~~~text
PLANNED
-> ADMITTED
-> RUNNING
-> WAITING_EXTERNAL
-> VERIFYING
-> SUCCEEDED | FAILED | BLOCKED | INCONCLUSIVE
~~~

A disconnect while an external operation is in flight produces an ambiguous state until reconciled.

## 4. Checkpoints

Create a checkpoint after a bounded proven vertical slice, not after every generated token.

A checkpoint binds:

- source identity;
- Product Graph revision;
- backend migration state;
- relevant runtime configuration;
- evidence state;
- unresolved findings;
- external-effect receipts.

Resume always starts by reconciling actual source/runtime/external state against the checkpoint.

## 5. Database change classes

Generated database migrations are classified:

### Additive

Examples:

- new table;
- nullable column;
- new index;
- new policy that does not remove existing access.

Usually lower risk but still verified.

### Transformative

Examples:

- data backfill;
- type conversion;
- relationship restructuring;
- renamed semantic field.

Requires migration/data compatibility evidence.

### Restrictive

Examples:

- tighter RLS;
- permission removal;
- NOT NULL enforcement;
- uniqueness enforcement.

Requires proof that existing valid behavior/data remains supported or a deliberate breaking-change plan exists.

### Destructive

Examples:

- drop table/column;
- irreversible data rewrite;
- destructive reset;
- data truncation.

Requires elevated policy and recovery evidence. Production execution is never implicit.

## 6. Expand/contract default

For production-bound structural changes, prefer expand/contract when practical:

1. add compatible new structure;
2. write/read compatibly;
3. migrate/backfill;
4. verify;
5. switch consumers;
6. remove old structure in a later independently authorized change.

Do not compress a risky multi-stage production migration into one generated SQL patch merely because it is syntactically valid.

## 7. Migration verification

Before remote application, capture:

- source migration identity;
- target project/environment identity;
- current remote migration/drift state;
- destructive/restrictive classification;
- preconditions;
- expected row/object impact where measurable;
- backup/recovery expectation;
- dry-run/preview evidence where supported.

After application:

- migration history;
- schema/policy state;
- advisor/security state;
- generated type compatibility;
- focused data/auth tests;
- critical browser journey smoke.

## 8. Rollback semantics

Rollback is not always reverse SQL.

A recovery plan may be:

- transaction rollback;
- migration reversal;
- forward repair;
- restore from backup;
- traffic rollback while database remains forward-compatible;
- manual reconciliation.

The active Grain must state which recovery model applies for high-risk changes.

## 9. External integrations

Webhook/API/email/SMS/payment-like side effects require an external-effect receipt:

- integration;
- operation;
- idempotency key where available;
- external request identity;
- attempt;
- observed result;
- final-state confidence.

Retries first reconcile when provider state may have changed.

## 10. Deployment recovery

Production deployment records:

- source head;
- artifact/build identity;
- target;
- environment/config identity;
- backend migration dependency;
- health/smoke result.

If deployment fails after database mutation, Ineractive must not blindly roll the database backward. It follows the declared recovery relationship between application and schema.

## 11. Repair-loop safety

Automated repair has finite:

- attempt count;
- wall-clock budget;
- model/tool budget;
- change-size budget.

Repeated failure changes state to BLOCKED or INCONCLUSIVE rather than endlessly regenerating.

## 12. Recovery testing

The benchmark suite should include:

- process crash during build;
- browser/server disconnect;
- sandbox restart;
- failed package install;
- failed migration;
- remote drift discovered before migration;
- network timeout after external request;
- deployment failure after successful backend migration;
- revoked credentials;
- partial file write/checkpoint recovery.

Recovery claims require executed evidence.
