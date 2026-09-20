# Ineractive Supabase Platform

**Status:** canonical planning direction  
**Date:** 2026-09-19

## 1. Objective

Supabase is a first-class V1 compiler target, not a thin integration.

A user should be able to describe product behavior and have Ineractive build, inspect, test, and manage the backend needed for that behavior without manually switching to Supabase Studio for ordinary work.

Ineractive must preserve normal Supabase artifacts and ownership:

- supabase/config.toml;
- migrations;
- seed fixtures;
- Edge Functions;
- generated types;
- auth/storage configuration;
- policies;
- project/branch identity.

## 2. Control plane vs generated-product data plane

Ineractive has two distinct Supabase roles and they must never collapse into one trust domain.

### Ineractive control plane

Stores Ineractive product accounts and operational metadata such as:

- users and sessions;
- organizations/teams;
- Ineractive projects;
- project membership;
- run/task metadata;
- non-secret integration references;
- billing/plan metadata when introduced;
- collaboration/activity metadata.

It does **not** become the canonical database for generated customer application data.

### 2.1 P01 minimum control-plane store

The first persisted control-plane slice is intentionally narrow:

- authenticated user profile identity;
- Ineractive projects;
- project memberships;
- user-scoped server repository access.

It uses a dedicated control-plane Supabase URL/publishable-key configuration and verifies
the user access token with Supabase Auth before repository construction. It does not accept
generated-app Supabase configuration or service-role/secret credentials.

The local control-plane Supabase config keeps automatic new-table Data API exposure
disabled. Grants and RLS policies are explicit and owner/membership predicates provide
object authorization; authenticated role alone is insufficient.

Remote project provisioning and production migration remain later platform-lifecycle work.

### Generated-product data plane

Each generated application has its own backend identity and lifecycle:

- local isolated Supabase during build;
- optional user-owned or Ineractive-managed remote Supabase;
- independent credentials;
- independent migrations;
- independent RLS/auth/storage configuration;
- independent export/transfer/delete lifecycle.

A generated application's service-role/secret authority is never shared with the Ineractive control-plane browser session.

## 3. Backend product surface

The Ineractive Data surface should eventually expose:

~~~text
Data
├── Tables & Views
├── Relationships
├── Policies / RLS
├── Auth
├── Users
├── Organizations / Roles
├── Storage
├── Realtime
├── Functions
├── Cron / Queues
├── Vectors / Search
├── Secrets
├── Migrations
├── Seed / Fixtures
├── Logs / Health
├── Environments
└── Backups / Restore awareness
~~~

The user can use the visual surface, chat, SQL/code, or Supabase directly. All roads must reconcile with canonical migration/config state.

## 4. Local-first development topology

Generated apps should develop against an isolated local Supabase stack by default.

~~~text
Build Sandbox
  |
  +-- app runtime
  +-- local Supabase CLI stack
  |     Postgres
  |     Auth
  |     Storage
  |     Realtime
  |     Functions
  |     Studio
  |
  +-- browser test runtime
~~~

Benefits:

- no remote project required for first preview;
- no cloud cost for ordinary iteration;
- reproducible schema/auth/storage behavior;
- safe destructive reset;
- deterministic synthetic seed data;
- faster repair loops;
- production credentials stay outside the build sandbox.

## 5. Desired-state compiler

The Product Graph compiles backend semantics into a typed BackendPlan:

- entities/fields/types;
- relationships;
- indexes;
- uniqueness/check constraints;
- roles and membership model;
- authorization rules;
- public/private data exposure;
- auth methods;
- storage buckets/object rules;
- events/realtime subscriptions;
- server functions;
- scheduled/background behavior;
- generated types;
- safe query/list/search/filter/sort/pagination contracts;
- index/query-plan candidates where semantics and observed workload justify them;
- seed fixtures;
- verification cases.

The compiler then produces normal Supabase artifacts.

## 6. Schema flow

~~~text
Product Graph
    |
    v
BackendPlan
    |
    v
candidate local schema/config
    |
    v
apply to isolated local project
    |
    v
advisors + RLS/security verification
    |
    v
generate/review migration
    |
    v
reset from migrations
    |
    v
accept migration into source
~~~

Never apply model-generated SQL directly to production.

## 7. Connection and resource lifecycle

Supabase authorization and project binding are durable typed state.

Connection states include:

~~~text
UNCONFIGURED
AUTH_REQUIRED
CONNECTING
CONNECTED
DEGRADED
EXPIRED
REVOKED
DENIED
UNVERIFIABLE
DISCONNECTED
~~~

Project binding states include:

~~~text
UNBOUND
DISCOVERED
PROVISIONING
HEALTHY
PAUSED
DEGRADED
DRIFTED
ACCESS_REVOKED
DELETION_REQUESTED
DELETED
UNVERIFIABLE
~~~

Loss of Ineractive management authority does not imply the user's Supabase project or running application is gone.

Connection/binding state follows [Platform Lifecycle, Ownership, and Provisioning](PLATFORM_LIFECYCLE_AND_OWNERSHIP.md).

## 8. Remote ownership modes

### Bring Your Own Supabase

Preferred ownership model for technical users and durable portability.

Use Supabase OAuth2/Management API with explicitly approved scopes. Do not ask users to paste broad personal access tokens when an OAuth flow is available.

Ineractive can:

- discover authorized organizations/projects;
- create a project when permitted;
- connect an existing project;
- provision allowed configuration;
- link local migration state;
- deploy after preview/dry-run and policy admission.

### Ineractive-managed

A managed commercial mode may provision projects/infrastructure on behalf of users.

Requirements:

- strict tenant/project isolation;
- explicit billing ownership;
- encrypted secret storage;
- no shared service-role credentials across tenants;
- per-project audit;
- export/transfer path;
- documented deletion/retention;
- operational rate/quotas.

Managed mode must not make export/self-host impossible.

## 9. Environments

Canonical environment model:

- local build;
- optional remote preview/staging;
- production.

Every environment binds source revision, backend resource/project/branch, config revision, secret-reference set, data class/policy, region, release identity, and observed health.

Environment allocation follows capability and budget:

1. local Supabase is always the baseline;
2. hosted preview branch may be used when qualified, available, and authorized;
3. a dedicated staging project is an explicit alternative;
4. local-only backend preview remains a valid fallback when remote preview cannot be provisioned.

Do not require paid Supabase preview branches for basic Ineractive functionality.

If the user's Supabase plan and policy allow hosted branches, they are an optional accelerator. Branch creation is cost-bearing and must not be hidden.

Production data and storage objects are not automatically copied into preview/staging environments.

## 10. Auth compiler

The product spec can express:

- public/anonymous;
- email/password;
- magic link / OTP;
- OAuth/OIDC;
- passkeys where qualified;
- invite-only;
- organization membership;
- role/permission model.

Authorization data must not rely on user-editable metadata.

Use application-controlled authorization state such as app metadata and/or database membership tables with RLS policies.

Session-sensitive actions need explicit security semantics; deleting a user alone is not assumed to revoke every existing access token immediately.

## 11. RLS compiler

Every exposed table is treated as denied until policies are defined.

The policy compiler must derive cases for:

- anon;
- authenticated owner;
- organization member;
- privileged role;
- non-member;
- cross-tenant user;
- anonymous authenticated-session edge cases where applicable.

Rules:

- TO authenticated alone is never considered object-level authorization;
- ownership/membership predicates are explicit;
- UPDATE policies include both visibility and write constraints;
- views use security-invoker behavior where appropriate;
- security-definer functions are exceptional, isolated, reviewed, and explicitly callable only by intended roles;
- RLS tests execute against real local Supabase roles/tokens.

## 12. Data API exposure

Ineractive must not assume a table becomes available to REST/GraphQL merely because it exists.

Supabase has moved toward explicit Data API exposure/grants for new tables. The compiler therefore models:

1. schema existence;
2. API exposure/grants;
3. RLS authorization;

as separate concerns.

This remains correct even as platform defaults change.

## 13. Storage compiler

A storage declaration includes:

- bucket;
- public/private;
- allowed MIME/types;
- size limits;
- object key strategy;
- ownership/organization relation;
- insert/select/update/delete policies;
- signed URL behavior;
- retention expectations.

Upsert verification must cover the required INSERT + SELECT + UPDATE policy combination rather than checking upload-only behavior.

## 14. Realtime

Realtime is generated only when product behavior needs it.

Ineractive must not modify Supabase's locked realtime schema.

Generated realtime authorization/config must use supported public contracts and be integration-tested with real subscriptions.

## 15. Functions, jobs, and privileged logic

Use server/Edge Functions when behavior needs:

- trusted secret use;
- privileged orchestration;
- webhook verification;
- external API calls;
- server-only validation;
- scheduled/background work.

Function generation requires:

- explicit input/output schema;
- auth policy;
- secret references;
- idempotency/retry behavior;
- timeout;
- logging/redaction;
- local/integration test;
- caller policy.

## 16. Secrets

Secret values are never copied into model context unless a provider contract explicitly requires a value and policy allows it; ordinary generation should use secret references.

The app code receives only the credential class appropriate for its trust boundary.

Never put service-role/secret keys in browser bundles or NEXT_PUBLIC variables.

Secret references are environment-scoped and versioned. Rotation/revocation/expiry must be observable, and any deployment/function requiring a changed secret is reverified. Production secrets are not copied into preview by default.

## 17. Dataset and import lifecycle

Business-data import follows:

~~~text
inspect read-only
→ profile
→ classify
→ preview mapping
→ stage
→ validate
→ apply
→ reconcile counts/relationships
→ finalize DatasetVersion binding
~~~

For large imports, execution may be chunked/streamed with durable batch identity. Partial failure resumes or reconciles by batch rather than silently duplicating rows.

Production data is never automatically reused for seed/test data. Synthetic data is preferred; masked/sanitized subsets require explicit policy and lineage.

### 17.1 Policy-driven consent and data rights

When Product Graph DataPolicy declares consent, privacy preferences, retention, export, deletion, audit, or redaction requirements, the compiler must translate those requirements into explicit UI/backend/integration behavior rather than leaving them as documentation-only metadata.

The compiled plan records:

- policy scope and affected entities/fields;
- user-visible preference/consent state when applicable;
- server-side enforcement point;
- analytics/integration/job propagation requirements;
- export/delete/audit workflow;
- unsupported legal/provider requirements as explicit blockers.

Ineractive may implement declared product semantics; it must not claim legal or regulatory compliance merely because a workflow exists.

## 18. Migration safety

Every remote database change has:

- target environment;
- exact project identity;
- migration set;
- dry-run/plan where supported;
- additive / transformative / restrictive / destructive classification;
- current drift/migration preconditions;
- discovered provider backup/PITR/restore capability and plan/region limitation;
- backup/recovery expectation;
- policy admission;
- post-deploy verification.

Prefer expand/contract for production-bound breaking schema changes when practical.

Rollback is not assumed to mean reverse SQL. The plan must state whether recovery is transaction rollback, reverse migration, forward repair, backup restore, or application rollback against a forward-compatible schema.

Production destructive operations require elevated approval.

Remote reset/wipe commands are forbidden against production.

The detailed partial-failure and migration contract is [Failure, Recovery, and Change Safety](FAILURE_RECOVERY_AND_CHANGE_SAFETY.md).

## 19. Drift

Ineractive compares:

- repository migrations/config;
- local reconstructed state;
- linked remote observed state.

Drift states:

- clean;
- repository ahead;
- remote ahead;
- divergent;
- unverifiable.

Do not silently overwrite remote changes.

## 20. Backend verification pack

For every generated app with Supabase:

- migrations recreate from empty local stack;
- generated types match schema;
- expected grants/API exposure exist;
- RLS enabled on exposed tables;
- positive/negative cross-tenant policy tests;
- auth happy/error paths;
- storage access tests if used;
- function tests if used;
- realtime tests if used;
- advisors/security checks;
- browser E2E against actual local backend.

## 21. Platform-change discipline

Supabase changes rapidly. Implementation work must verify current docs/changelog.

Known planning-sensitive 2026 changes include:

- explicit Data API exposure becoming increasingly important;
- realtime schema modification restrictions;
- self-hosted gateway changes;
- Management API log endpoint migration;
- evolving branching behavior.

Do not encode transient platform assumptions as permanent Ineractive semantics.

## 22. User ownership/export

At any point, the user should be able to leave with:

~~~text
source repository
supabase/ migrations + config
functions
types
seed/test fixtures
deployment config
documented required secrets
~~~

A managed Ineractive project must have a transfer/export story before it is considered mature.
