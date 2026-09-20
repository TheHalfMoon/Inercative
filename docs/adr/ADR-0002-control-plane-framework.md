# ADR-0002 — Ineractive control-plane framework baseline

**Status:** Accepted candidate pending SG-000009 exact-head qualification  
**Date:** 2026-09-20  
**Task:** IN-P01-S01-T01  
**SpecGrain:** SG-000009

## Context

Ineractive needs a production React framework for its own control plane before public
protocol and workspace-shell implementation begins.

This decision is intentionally narrower than the generated-application compiler target.
Selecting a control-plane framework does not make that framework mandatory for every
future target or imported application.

The qualification criteria are:

- stable React 19 compatibility;
- compatibility with the repository Node 24 qualification environment;
- server-first rendering and explicit server/client boundaries;
- routing and data-loading semantics suitable for a long-lived product control plane;
- provider-neutral self-hosting;
- observability and diagnostic surfaces;
- security-support posture;
- agent/tooling alignment;
- consistency with existing Ineractive architecture without making a hosting vendor an
  ownership dependency.

## Decision

Qualify **Next.js App Router 16.3.3 with React 19.3.0 / React DOM 19.3.0** as the
Ineractive control-plane framework baseline.

Exact source identities used for this qualification:

- Next.js `v16.3.3`: `vercel/next.js@a9a1cb7859f178f830ad3773b303130c21b19586`;
- React `v19.3.0`: `react/react@1d34f91dfde6bba84d08b683aaba164c7194dacb`.

The fixture uses exact package versions and `output: "standalone"`. Qualification
requires both a production build and an HTTP smoke against the self-hosted standalone
server on Node 24.

The selected baseline may advance only through a later explicit qualification change.
A security patch is not blocked merely because this ADR names the version observed on
2026-09-20.

## Candidate comparison

### Next.js App Router 16.3.3

Observed official-source facts:

- 16.x is the Active LTS major under the Next.js support policy;
- 16.3.3 is the August 2026 security release and fixes two Critical-severity issues;
- package peer dependencies accept React 19;
- App Router provides Server Components and server/client boundaries aligned with the
  server-first Ineractive control-plane architecture;
- official source supports `output: "standalone"` for self-hosting and documents
  self-hosted OpenTelemetry;
- the existing Ineractive frontend research/tooling direction already qualifies
  Next.js-specific diagnostics and rule packs, reducing duplicate framework tooling.

Material costs:

- caching, RSC, and server/client semantics are opinionated and require explicit policy;
- Vercel is the primary upstream steward, so Ineractive must continuously prove that
  self-hosting and provider adapters remain real rather than assuming Vercel deployment;
- framework security patches must be treated as active operational requirements.

### React Router framework mode 8.4.0

Exact source identity:

- `remix-run/react-router@7ccdcecdd944e15be0cd0dcb702b86c9af1214a8`.

Observed strengths:

- MIT licensed;
- stable 8.4.0 release published 2026-09-15;
- Node baseline is compatible with Node 24;
- React peer requirement is compatible with React 19.3;
- explicit framework/library modes and Node/Express/serve packages provide strong
  deployment control.

Reason not selected for the first control-plane baseline:

- current upstream release notes still mark important RSC/framework surfaces as unstable;
- adopting it would create a second framework-specific diagnostics/rule ecosystem while
  Ineractive's already-approved frontend architecture and generated-web research are
  Next.js-oriented.

It remains a qualified alternative to re-evaluate if portability or framework
complexity evidence changes.

### TanStack Start

Observed source snapshot:

- `TanStack/router@ac223be01377f09fa8fd70ff52c9ba4b5dbcddfc`;
- observed `@tanstack/react-start` package version: `1.168.56`;
- MIT licensed;
- Node and React ranges are compatible with the Ineractive baseline;
- full-document SSR, streaming, server functions, typed routing, and deployable bundles
  are strong architectural matches.

Reason not selected now:

- the official TanStack Start documentation snapshot still describes the framework as
  Release Candidate. Ineractive should not make its first control-plane baseline depend
  on an RC when stable alternatives satisfy the requirements.

Requalify after the framework reaches final stable status or if later evidence shows a
material architectural advantage.

## Consequences

- IN-P01-S03-T01 may build the actual control-plane shell on this baseline only after the
  intervening protocol tasks complete.
- The control plane defaults to server-first rendering. Client Components are pushed to
  the smallest interaction boundary.
- Provider-neutral ownership remains mandatory; standalone/self-host evidence is part of
  qualification.
- No Vercel account, billing product, or proprietary runtime is required by this decision.
- Generated products remain governed by their own FrontendQualityProfile and later
  compiler qualification gates.
