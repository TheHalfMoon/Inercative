# ADR-0002 — Control-Plane Framework Baseline

**Status:** Candidate — requires SG-000009 execution evidence  
**Date:** 2026-09-20  
**Decision owner:** IN-P01-S01-T01 / SG-000009

## Context

Ineractive needs a production React framework baseline for its own control plane before protocol and workspace implementation proceeds.

The control plane must remain self-hostable, provider-neutral at deployment boundaries, observable, compatible with the repository Node 24 baseline, and capable of enforcing explicit server/client boundaries.

The generated-application compiler target is a separate architectural concern.

## Decision

Qualify:

- `next@16.3.5`;
- `react@19.3.0`;
- `react-dom@19.3.0`;
- Node 24.x;
- pnpm 12.4.2.

Use **Next.js App Router** as the candidate control-plane framework baseline if the bounded fixture passes production build and Node self-host smoke evidence.

## Why

All three evaluated frameworks can satisfy core React/Node/self-host requirements.

Next.js is selected for qualification because:

1. its stable package supports Node 24 and React 19;
2. official Node.js/Docker self-hosting supports the full framework feature set;
3. its instrumentation convention and OpenTelemetry support provide a mature observability path;
4. App Router provides an explicit server/client component boundary suitable for the control-plane architecture;
5. it minimizes architectural divergence from the already-canonical generated-app V1 target and planned Next.js diagnostics;
6. qualification does not require a Vercel-only deployment assumption.

## Rejected alternatives for this baseline

### React Router Framework Mode 8.4.0

Not rejected as technically incapable.

It satisfies Node/React requirements and has strong deployment/instrumentation capabilities. It is not selected because P01 currently has no requirement that justifies maintaining a second full-stack framework model alongside the canonical Next.js generated-app path.

Revisit if future control-plane requirements materially favor its runtime/data model or a framework split becomes evidence-backed.

### TanStack Start 1.168.56

Not rejected as technically incapable.

It satisfies Node/React requirements and has strong compositional primitives. It is not selected because the current Node hosting path introduces additional Vite/Nitro or equivalent operational surfaces, while direct OpenTelemetry integration is still documented as experimental/manual.

Revisit as its operational and observability surface matures or if later typed-data requirements provide a measurable advantage.

## Consequences

Positive:

- one primary full-stack React framework model across early Ineractive engineering;
- first-class Node self-host path;
- direct compatibility with planned Next.js-specific diagnostics;
- reduced framework-specific operational duplication.

Costs:

- Next.js caching/version-skew/self-host behavior must be treated explicitly rather than assumed;
- framework conventions are deeper than a thin router;
- generated-app and control-plane framework upgrades still require independent qualification.

## Guardrails

- no Vercel-only API is required for the baseline;
- no provider deployment is performed by this Grain;
- no real Ineractive workspace shell is created;
- the fixture is disposable qualification code only;
- failure of build/self-host smoke invalidates this candidate decision and reopens selection.

## Acceptance

This ADR becomes **Accepted** only when the exact pinned fixture:

- installs reproducibly;
- produces a production build on Node 24;
- starts as a self-hosted Node process;
- returns the deterministic marker `INERACTIVE_CONTROL_PLANE_FRAMEWORK_OK` over HTTP;
- and the final repository candidate passes exact-head Ubuntu + Windows CI.
