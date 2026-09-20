# P01-S01-T01 — Framework Qualification Source Record

**Date:** 2026-09-20  
**Task:** IN-P01-S01-T01  
**SpecGrain:** SG-000009

## Official-source snapshot

### Next.js

- repository: `vercel/next.js`;
- current stable release observed: `v16.3.5`;
- published: 2026-09-11;
- tag commit: `ca2c75eb7f8d9dd012a8bb83c06132149fe221f9`;
- package: `next@16.3.5`;
- license: MIT;
- Node engine: `>=20.9.0`;
- React peer support includes `^19.0.0`;
- official Node.js/Docker deployment supports all framework features;
- official self-host guidance covers reverse proxy, caching, multi-instance, and deployment concerns;
- official instrumentation guidance supports monitoring/logging and OpenTelemetry patterns.

References:

- https://github.com/vercel/next.js/releases/tag/v16.3.5
- https://github.com/vercel/next.js/blob/v16.3.5/packages/next/package.json
- https://nextjs.org/docs/app/getting-started/deploying
- https://nextjs.org/docs/app/guides/self-hosting
- https://nextjs.org/docs/app/guides/instrumentation

### React

- current stable release observed: `v19.3.0`;
- published: 2026-09-09;
- selected packages: `react@19.3.0`, `react-dom@19.3.0`;
- license: MIT.

Reference:

- https://github.com/facebook/react/releases/tag/v19.3.0

### React Router Framework Mode

- repository: `remix-run/react-router`;
- current stable release observed: `react-router@8.4.0`;
- published: 2026-09-15;
- tag commit: `7ccdcecdd944e15be0cd0dcb702b86c9af1214a8`;
- license: MIT;
- Node engine: `>=22.22.0`;
- React/ReactDOM peer baseline: `>=19.2.7`;
- official deployment includes full-stack Node/Docker and custom-server templates;
- official instrumentation supports logging, tracing, error reporting, and OpenTelemetry integration.

References:

- https://github.com/remix-run/react-router/releases/tag/react-router%408.4.0
- https://github.com/remix-run/react-router/blob/react-router%408.4.0/packages/react-router/package.json
- https://reactrouter.com/start/framework/deploying
- https://reactrouter.com/how-to/instrumentation

### TanStack Start

- repository: `TanStack/router`;
- current repository release observed: `release-2026-09-16-2153`;
- published: 2026-09-16;
- annotated tag target commit: `84bde660a12d82e8c74859b3240157af7566f843`;
- package: `@tanstack/react-start@1.168.56`;
- license: MIT;
- Node engine: `>=22.12.0`;
- React peer range includes React 19;
- Vite peer baseline is 7+;
- official Node hosting uses the current Start deployment shape, including Nitro for Vite-based output;
- official OpenTelemetry integration is currently documented as experimental/manual.

References:

- https://github.com/TanStack/router/releases/tag/release-2026-09-16-2153
- https://github.com/TanStack/router/blob/release-2026-09-16-2153/packages/react-start/package.json
- https://tanstack.com/start/latest/docs/framework/react/guide/hosting
- https://tanstack.com/start/latest/docs/framework/react/guide/observability

## Selection

ADR-0002 selects **Next.js App Router 16.3.5 + React 19.3.0** for bounded control-plane
qualification.

This is a dated evidence snapshot. Later framework/security upgrades require a separate
qualification decision; this record does not assert that these versions remain current forever.
