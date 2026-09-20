# ADR-0002 — Ineractive Control-Plane Framework Baseline

**Status:** Qualified candidate — exact-head repository CI pending  
**Date:** 2026-09-20  
**Task:** IN-P01-S01-T01  
**SpecGrain:** SG-000009

## Context

Ineractive needs a production React framework for its own control plane before public
protocol and workspace-shell implementation begins.

This decision is narrower than the generated-application compiler target. Selecting a
control-plane framework does not force every generated/imported application to use it.

Decision criteria:

- React 19 support;
- Node 24 compatibility;
- explicit server/client boundary model;
- routing/data model suitable for a long-lived control plane;
- provider-neutral self-hosting;
- observability/tooling;
- security/release maintenance surface;
- repository/architecture alignment.

## Decision

Qualify **Next.js App Router 16.3.5 with React 19.3.0 / React DOM 19.3.0**.

Exact selected source/package identities:

- Next.js release: `v16.3.5`;
- Next.js tag commit: `ca2c75eb7f8d9dd012a8bb83c06132149fe221f9`;
- React release: `v19.3.0`;
- package versions: `next@16.3.5`, `react@19.3.0`, `react-dom@19.3.0`;
- package manager: `pnpm@12.4.2`;
- runtime qualification: Node 24.x.

The fixture uses `output: "standalone"` and must prove both a production build and a
real HTTP request against the generated standalone Node server.

## Why

All three evaluated candidates satisfy the basic Node/React/self-host requirement.

Next.js is selected for qualification because:

1. its current stable package supports Node 24 and React 19;
2. official Node.js/Docker deployment supports the full framework feature set;
3. official instrumentation guidance provides a mature monitoring/logging/OpenTelemetry path;
4. App Router provides the server/client component boundary already assumed by current
   Ineractive frontend architecture;
5. canonical Ineractive planning already targets Next.js for generated-app V1 and later
   qualifies Next.js-specific diagnostics, reducing duplicate framework-specific tooling;
6. self-hosting does not require a Vercel account or proprietary runtime.

## Alternatives

### React Router Framework Mode 8.4.0

Observed identity:

- release: `react-router@8.4.0`;
- tag commit: `7ccdcecdd944e15be0cd0dcb702b86c9af1214a8`;
- license: MIT;
- Node engine: `>=22.22.0`;
- React/ReactDOM peer baseline: `>=19.2.7`.

It is not rejected as technically incapable. Its Node/Docker deployment and
instrumentation model are strong. It is not selected because P01 currently has no
evidence-backed need to maintain a second full-stack framework model alongside the
already-canonical Next.js generated-app/tooling direction.

### TanStack Start 1.168.56

Observed identity:

- release tag: `release-2026-09-16-2153`;
- annotated tag target commit: `84bde660a12d82e8c74859b3240157af7566f843`;
- package: `@tanstack/react-start@1.168.56`;
- license: MIT;
- Node engine: `>=22.12.0`;
- React peer range includes React 19.

Its typed/compositional model is a strong architectural fit. It is not selected because
the current Node hosting path adds Vite/Nitro or equivalent operational surfaces, while
direct OpenTelemetry support is still documented as experimental/manual. That extra
surface is not justified by a P01 requirement today.

## Consequences

Positive:

- one primary full-stack React framework model across early Ineractive engineering;
- first-class Node self-host path;
- direct alignment with planned Next.js diagnostics;
- less framework-specific operational duplication.

Costs:

- caching, version-skew, and server/client semantics must be governed explicitly;
- framework conventions are deeper than a thin router;
- control-plane and generated-app upgrades remain independently qualified.

## Guardrails

- no Vercel-only API is required;
- no provider deployment occurs in SG-000009;
- no real Ineractive workspace shell is created;
- the fixture is disposable qualification code;
- failed build/self-host evidence reopens the decision.

## Acceptance

Qualification run `35524783752` has proven the first four conditions below. This ADR becomes **Accepted** only when the final repository candidate also passes exact-head Ubuntu + Windows CI.

The exact pinned fixture:

- installs from a committed exact lockfile;
- produces a production build on Node 24;
- starts the generated standalone Node server;
- returns `INERACTIVE_CONTROL_PLANE_FRAMEWORK_QUALIFIED` over HTTP;
- and the final repository candidate passes exact-head Ubuntu + Windows CI.
