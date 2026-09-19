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

## 5. Local-first development topology

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

## 7. Remote ownership modes

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

## 8. Environments

Canonical environment model:

- local build;
- optional remote preview/staging;
- production.

Do not require paid Supabase preview branches for basic Ineractive functionality.

If the user's Supabase plan and policy allow hosted branches, they are an optional accelerator. Each branch is a distinct Supabase environment and incurs its own usage, so branch creation is cost-bearing and must not be hidden.

## 9. Auth compiler

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

## 10. RLS compiler

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

## 11. Data API exposure

Ineractive must not assume a table becomes available to REST/GraphQL merely because it exists.

Supabase has moved toward explicit Data API exposure/grants for new tables. The compiler therefore models:

1. schema existence;
2. API exposure/grants;
3. RLS authorization;

as separate concerns.

This remains correct even as platform defaults change.

## 12. Storage compiler

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

## 13. Realtime

Realtime is generated only when product behavior needs it.

Ineractive must not modify Supabase's locked realtime schema.

Generated realtime authorization/config must use supported public contracts and be integration-tested with real subscriptions.

## 14. Functions, jobs, and privileged logic

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

## 15. Secrets

Secret values are never copied into model context unless a provider contract explicitly requires a value and policy allows it; ordinary generation should use secret references.

The app code receives only the credential class appropriate for its trust boundary.

Never put service-role/secret keys in browser bundles or NEXT_PUBLIC variables.

## 16. Migration safety

Every remote database change has:

- target environment;
- exact project identity;
- migration set;
- dry-run/plan where supported;
- destructive-change classification;
- backup/recovery expectation;
- policy admission;
- post-deploy verification.

Production destructive operations require elevated approval.

Remote reset/wipe commands are forbidden against production.

## 17. Drift

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

## 18. Backend verification pack

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

## 19. Platform-change discipline

Supabase changes rapidly. Implementation work must verify current docs/changelog.

Known planning-sensitive 2026 changes include:

- explicit Data API exposure becoming increasingly important;
- realtime schema modification restrictions;
- self-hosted gateway changes;
- Management API log endpoint migration;
- evolving branching behavior.

Do not encode transient platform assumptions as permanent Ineractive semantics.

## 20. User ownership/export

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
