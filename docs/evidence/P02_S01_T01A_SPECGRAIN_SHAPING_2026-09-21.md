# P02-S01-T01A — SpecGrain Shaping Evidence

**Task:** IN-P02-S01-T01A
**SpecGrain:** SG-000015
**Date:** 2026-09-21
**Canonical baseline:** ec1a8209c8f6164b41b55e77e5d41db5856b14e9
**SpecGrain source:** TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a
**GitHub Actions run:** 35557722484

## Tool execution

~~~text
SpecGrain draft: CREATED
Spec: SG-000015
State: DRAFT
File: .specgrain/specs/SG-000015.json
Revision: sha256:4413923e7f25555f10ad2be4671b533966da2393fb9799f313d4485f25acd47c
SpecGrain shape: UPDATED
Spec: SG-000015
Source state: DRAFT
State: SHAPED
File: .specgrain/specs/SG-000015.json
Revision: sha256:bddcf62d581a4d7a635eb2864ce49e5b44fcb1c714ab9c4daca42c3ead91947f
SpecGrain refine: UPDATED
Spec: SG-000015
Source state: SHAPED
State: REFINING
File: .specgrain/specs/SG-000015.json
Revision: sha256:bddcf62d581a4d7a635eb2864ce49e5b44fcb1c714ab9c4daca42c3ead91947f
SpecGrain grain: UPDATED
Spec: SG-000015
Source state: REFINING
State: GRAIN
File: .specgrain/specs/SG-000015.json
Revision: sha256:bddcf62d581a4d7a635eb2864ce49e5b44fcb1c714ab9c4daca42c3ead91947f
SpecGrain check: PASS
Project: ineractive
Policy: default (readiness=report)
Specs: 15
Roots: 15
REFINING leaves: 0
Grain-ready: 0
Readiness-blocked: 0
SpecGrain next: PASS
Project: ineractive
Eligible: 4
- SG-000001
- SG-000002
- SG-000004
- SG-000006
- SG-000003 waiting: SG-000002; blockers: none
- SG-000005 waiting: SG-000004; blockers: none
- SG-000007 waiting: SG-000005; blockers: none
- SG-000008 waiting: SG-000006; blockers: none
- SG-000009 waiting: SG-000001, SG-000003, SG-000007, SG-000008; blockers: none
- SG-000010 waiting: SG-000009; blockers: none
- SG-000011 waiting: SG-000010; blockers: none
- SG-000012 waiting: SG-000011; blockers: none
- SG-000013 waiting: SG-000012; blockers: none
- SG-000014 waiting: SG-000009, SG-000011, SG-000012; blockers: none
- SG-000015 waiting: SG-000013, SG-000014; blockers: none
Projected waves: 9
Wave 1: SG-000001, SG-000002, SG-000004, SG-000006
Wave 2: SG-000003, SG-000005, SG-000008
Wave 3: SG-000007
Wave 4: SG-000009
Wave 5: SG-000010
Wave 6: SG-000011
Wave 7: SG-000012
Wave 8: SG-000013, SG-000014
Wave 9: SG-000015
~~~

The SpecNode was produced by the pinned SpecGrain CLI. No lifecycle or verification state beyond the observed CLI output is claimed.

## Decomposition correction

This Grain supersedes the oversized unmerged SG-000015 candidate preserved in closed PR #22. The correction narrows T01 to one independently verifiable structured-document prototype so repository Diffcipline limits remain authoritative.


## Qualification history

- shaping run `35557658224` failed before checkout because the temporary workflow referenced an invalid setup action SHA; no qualification claim is attached to that run;
- corrected pinned-source shaping run `35557722484` completed successfully and produced the Grain recorded above;
- repository CI run `35557807568` on implementation head `819086d609acdb2ba8ec0fec6d9d4c9feb794634` failed at Prettier for the two new prototype files; later gates did not execute;
- one-shot formatter run `35557873822` used repository-pinned pnpm/Node tooling, formatted exactly those two files, verified them with Prettier, removed its workflow, and produced bot-authored head `824cd9ded69ac048fdd7a9d8c2e6c8b74c24616d`;
- CI #147 on that bot-authored head was `action_required` with no acceptance jobs and is not treated as evidence;
- fresh exact-head Ubuntu/Windows CI remains required on the connector-authored reconciliation head.
