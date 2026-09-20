# P01-S01-T01 — Control-Plane Framework Qualification Evidence

**Task:** IN-P01-S01-T01
**SpecGrain:** SG-000009
**Date:** 2026-09-20
**Qualification run:** 35524783752
**Tested branch head before evidence commit:** 51db01f1cb7c32f75de6b47d5041af415c72fd5a

## Exact runtime and fixture

- Node: v24.20.0
- pnpm: 12.4.2
- Next.js: Next.js v16.3.5
- React: 19.3.0
- React DOM: 19.3.0
- fixture content digest: 6f59c77b25714112287f0b0a1a5c1a18d8abe72b4a09e275eb713d3a11889efe
- fixture lockfile SHA-256: a0c818807929afd9e5fcbb3e8cf02dde6ad995b1f3d46f0fd41ee9f487b3f56d

## Executed evidence

- isolated dependency resolution: PASS
- frozen fixture install: PASS
- production Next.js build: PASS
- generated standalone Node server: PASS
- HTTP smoke against standalone server: PASS
- expected marker INERACTIVE_CONTROL_PLANE_FRAMEWORK_QUALIFIED: OBSERVED

## Scope boundary

The fixture is qualification-only. It creates no production/provider resource and
is not the P01-S03 project/workspace shell.

The fixture source and lockfile tested in this run are committed by the same
one-shot job. Final SG-000009 acceptance still requires exact-head repository CI
on Ubuntu and Windows after this temporary workflow is removed.
