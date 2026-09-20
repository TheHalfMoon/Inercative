# Control-Plane Supabase Store

**Status:** P01 bounded implementation  
**Task:** IN-P01-S05-T01 / SG-000014

## Trust boundary

This Supabase project stores Ineractive control-plane identity/project metadata only.

It does not store generated customer application data and does not reuse generated-app
Supabase URL/key/service-role authority.

Server configuration uses only:

- `INERACTIVE_CONTROL_PLANE_SUPABASE_URL`
- `INERACTIVE_CONTROL_PLANE_SUPABASE_PUBLISHABLE_KEY`

The repository factory verifies the supplied user access token with Supabase Auth before
constructing the user-scoped store. Service-role/secret keys are forbidden by this
boundary and are never required for ordinary user/project reads/writes.

## Current schema

- `ineractive_profiles`
- `ineractive_projects`
- `ineractive_project_memberships`

All three tables have RLS enabled.

Project visibility is owner-or-member. Project mutation is owner-only. Membership
mutation is owner-only; a member can observe their own membership. Composite foreign-key
state binds membership rows to the actual project owner without a recursive RLS helper.

## Data API exposure

The local Supabase config explicitly sets `auto_expose_new_tables = false`.
Migration grants are explicit. Existence, Data API grant/exposure, and RLS authorization
remain separate concerns.

## Scope intentionally deferred

This Grain does not add:

- remote project provisioning/linking;
- billing/plan behavior;
- service-role administration;
- full login/session UX;
- generated-app Supabase compiler behavior;
- remote production migration.

The committed migration is intended for local reconstruction/qualification first.
