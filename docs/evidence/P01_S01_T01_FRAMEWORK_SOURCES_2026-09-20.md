# P01-S01-T01 — Framework Qualification Source Record

**Date:** 2026-09-20  
**Task:** IN-P01-S01-T01  
**SpecGrain:** SG-000009

## Official-source snapshot

### Next.js

- repository: `vercel/next.js`
- selected release: `v16.3.3`
- immutable tag commit: `a9a1cb7859f178f830ad3773b303130c21b19586`
- license: MIT
- release date: 2026-08-25
- support state observed: Next.js 16.x Active LTS
- security state observed: 16.3.3 is the August 2026 security release for two Critical
  issues
- React peer range includes React 19
- self-host evidence surfaces: standalone build output and Node production server
- observability surface: official self-host OpenTelemetry guidance

### React

- repository: `react/react`
- selected release: `v19.3.0`
- immutable tag commit: `1d34f91dfde6bba84d08b683aaba164c7194dacb`
- release date: 2026-09-09
- license: MIT
- stable release includes stable View Transition and Fragment Ref APIs

### React Router

- repository: `remix-run/react-router`
- observed release: `react-router@8.4.0`
- immutable tag commit: `7ccdcecdd944e15be0cd0dcb702b86c9af1214a8`
- release date: 2026-09-15
- license: MIT
- Node engine: `>=22.22.0`
- React/ReactDOM peer baseline: `>=19.2.7`
- upstream changelog still identifies selected RSC/framework capabilities as unstable

### TanStack Start

- repository: `TanStack/router`
- source snapshot: `ac223be01377f09fa8fd70ff52c9ba4b5dbcddfc`
- observed package version: `@tanstack/react-start@1.168.56`
- license: MIT
- Node engine: `>=22.12.0`
- React peer range includes React 19
- upstream documentation snapshot describes TanStack Start as Release Candidate

## Decision record

ADR-0002 selects Next.js App Router 16.3.3 + React 19.3.0 for the Ineractive control
plane, subject to the SG-000009 build/self-host smoke and exact-head repository CI.

This source record is a dated qualification snapshot, not a promise that these versions
remain current indefinitely.
