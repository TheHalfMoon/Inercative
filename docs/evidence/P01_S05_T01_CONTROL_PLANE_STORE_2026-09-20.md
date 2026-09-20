# P01-S05-T01 — Control-Plane Supabase Store Candidate Evidence

**Task:** IN-P01-S05-T01  
**SpecGrain:** SG-000014  
**Date:** 2026-09-20  
**Canonical baseline:** `880b78e99a14d1f04eedb2e81482ce6804ab88cd`

## Current platform verification

Implementation was checked against current Supabase documentation/changelog before code:

- new public tables are moving to explicit Data API exposure/grants;
- RLS remains distinct from Data API grants;
- server authorization must use verified user identity, not unverified cookie/session state;
- `TO authenticated` alone is not object authorization;
- service-role/secret keys must not enter browser configuration.

Pinned implementation dependencies:

- `@supabase/supabase-js@2.116.0`
- Supabase CLI used for init/migration creation: `v2.117.0`
- verified Linux amd64 CLI archive SHA-256:
  `69c05f85b9e47ee706d30f1a6ca8a526b4e337bfd12c7ef1ef522d24e7280d24`

## Candidate scope

- dedicated local control-plane Supabase artifacts;
- CLI-created migration for profiles/projects/memberships;
- explicit grants and RLS policies;
- server-only user-scoped repository;
- verified actor identity through Supabase Auth;
- generated-app trust-domain rejection;
- deterministic contract tests.

## Non-claims

- no remote Supabase project was created or linked;
- no production database was modified;
- no service-role key is required;
- no full auth/login UX is claimed;
- no generated-app data-plane compiler is implemented.

## Required final proof

- focused tests;
- exact-head frozen install, format, lint, typecheck, tests on Ubuntu and Windows;
- clean production control-plane build/smoke;
- no unresolved material review finding.
