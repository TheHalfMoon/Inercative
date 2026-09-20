# Control-Plane Framework Qualification — Official-Source Snapshot

**Date:** 2026-09-20  
**Task:** IN-P01-S01-T01  
**SpecGrain:** SG-000009  
**Purpose:** dated official-source comparison for the Ineractive control plane only.

## Decision criteria

The control-plane framework must be evaluated against:

- React 19 support;
- Node 24 compatibility;
- server/client boundary model;
- routing and data model;
- self-host portability without provider lock-in;
- observability/tooling;
- security/release maintenance surface;
- repository and architecture alignment.

This comparison does not change the generated-application compiler target by itself.

## Candidate A — Next.js App Router

Observed stable release:

- repository: `vercel/next.js`;
- release: `v16.3.5`;
- published: 2026-09-11;
- tag commit: `ca2c75eb7f8d9dd012a8bb83c06132149fe221f9`;
- package: `next@16.3.5`;
- license: MIT;
- Node engine: `>=20.9.0`;
- React peer support: `^18.2.0 || ... || ^19.0.0`;
- official deployment guidance: Node.js server and Docker support all framework features;
- official self-host guidance documents reverse-proxy, caching, multi-instance, and deployment concerns;
- official instrumentation convention supports production monitoring/logging and OpenTelemetry patterns.

Material tradeoffs:

- strong App Router / server-component model gives a clear server/client boundary;
- self-hosting is first-class, but cache coordination/version skew require explicit operational discipline;
- more framework-owned behavior than a thinner router stack;
- repository alignment is high because canonical Ineractive planning already targets Next.js for generated-app V1 and qualifies Next.js-specific diagnostics later.

Official references:

- https://github.com/vercel/next.js/releases/tag/v16.3.5
- https://github.com/vercel/next.js/blob/v16.3.5/packages/next/package.json
- https://nextjs.org/docs/app/getting-started/deploying
- https://nextjs.org/docs/app/guides/self-hosting
- https://nextjs.org/docs/app/guides/instrumentation

## Candidate B — React Router Framework Mode

Observed stable release:

- repository: `remix-run/react-router`;
- release: `v8.4.0`;
- package tag: `react-router@8.4.0`;
- published: 2026-09-15;
- tag commit: `7ccdcecdd944e15be0cd0dcb702b86c9af1214a8`;
- package: `react-router@8.4.0`;
- license: MIT;
- Node engine: `>=22.22.0`;
- React peer support: `>=19.2.7`;
- official deployment guidance includes full-stack Node/Docker and custom-server templates;
- official instrumentation API supports server/client logging, tracing, error reporting, and OpenTelemetry integration.

Material tradeoffs:

- standards-oriented routing/data surface and flexible deployment are attractive;
- Node 24 and current React 19 satisfy the package engines/peers;
- selecting it for the control plane would intentionally introduce a second full-stack framework alongside the already-planned Next.js generated-app target;
- that split is possible, but it increases framework-specific build/debug/SSR expertise the project must maintain without a demonstrated compensating requirement at P01 entry.

Official references:

- https://github.com/remix-run/react-router/releases/tag/react-router%408.4.0
- https://github.com/remix-run/react-router/blob/react-router%408.4.0/packages/react-router/package.json
- https://reactrouter.com/start/framework/deploying
- https://reactrouter.com/how-to/instrumentation

## Candidate C — TanStack Start

Observed stable repository release:

- repository: `TanStack/router`;
- release tag: `release-2026-09-16-2153`;
- published: 2026-09-16;
- annotated tag target commit: `84bde660a12d82e8c74859b3240157af7566f843`;
- package: `@tanstack/react-start@1.168.56`;
- license: MIT;
- Node engine: `>=22.12.0`;
- React peer support: `>=18.0.0 || >=19.0.0`;
- build peer surface includes Vite 7+ or Rsbuild;
- official Node/Docker guidance uses the current Start deployment shape, including Nitro for Vite-based Node output;
- official observability guidance provides patterns, while direct OpenTelemetry integration is currently documented as experimental/manual.

Material tradeoffs:

- compositional router/data primitives fit Ineractive's typed-state philosophy;
- Node 24 and React 19 are compatible with current package requirements;
- current production hosting introduces additional Vite/Nitro or equivalent build/runtime surfaces;
- choosing it now would add another operational stack while the existing architecture already carries Next.js-specific generated-app and tooling decisions.

Official references:

- https://github.com/TanStack/router/releases/tag/release-2026-09-16-2153
- https://github.com/TanStack/router/blob/release-2026-09-16-2153/packages/react-start/package.json
- https://tanstack.com/start/latest/docs/framework/react/guide/hosting
- https://tanstack.com/start/latest/docs/framework/react/guide/observability

## React baseline

Observed current stable React release:

- `react@19.3.0`;
- released 2026-09-09.

The selected qualification fixture pins `react@19.3.0` and `react-dom@19.3.0`. The selected Next.js package declares React 19 compatibility.

Reference:

- https://github.com/facebook/react/releases/tag/v19.3.0

## Qualification decision

Proceed with a bounded **Next.js 16.3.5 + React 19.3.0** control-plane qualification fixture.

This is a qualification decision, not blanket framework approval for every generated application and not authorization to build the P01-S03 project/workspace shell.

The decision remains contingent on the fixture producing a clean production build and a real Node 24 self-host HTTP response with the expected marker.
