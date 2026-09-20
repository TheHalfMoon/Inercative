# P01-S02-T02 — Run/Event/Evidence/Finding Candidate Evidence

**Task:** IN-P01-S02-T02  
**SpecGrain:** SG-000011  
**Date:** 2026-09-20  
**Canonical baseline:** `1a43dd45ba5dff43e6beee2b111b0dedcd210f9b`

## Authority

SG-000011 was produced by the real pinned SpecGrain CLI in GitHub Actions run
`35528689915`.

Final SpecGrain revision:

`sha256:b8b5182805a7dfe7fd63e49dbf85f1a79a025810309fe8764b969d142110db51`

`specgrain check` was valid. No READY/VERIFIED/CONTROLLED/WorkPacket state is fabricated.

## Canonical dependency truth

SG-000010 / IN-P01-S02-T01 is canonically complete through PR #17.

- final PR #17 head: `544b4c090978124dcee89d329c69611277537c57`;
- exact-head CI #116 / run `35527501710`: success;
- merge commit: `1a43dd45ba5dff43e6beee2b111b0dedcd210f9b`;
- fresh-main CI #117 / run `35527637178`: success.

## Candidate contract

The candidate adds dependency-free public:

- Run records;
- Event records;
- Evidence records;
- Finding records;
- deterministic validators;
- machine-readable JSON Schema;
- focused negative fixtures.

The records reuse SG-000010 logical identity and exact revision primitives.

## Safety properties

- evidence has no PASS observation state;
- NOT_RUN/BLOCKED/INCONCLUSIVE evidence requires a reason;
- observed evidence requires an artifact/reference;
- freshness is CURRENT/STALE/SUPERSEDED and supersession is explicit;
- finding severity/confidence do not imply blocking;
- status/disposition contradictions fail validation;
- no provider-specific review payload becomes public protocol;
- no persistence, timestamp source, capability grant, or runtime executor is added.

## Required proof before merge

- focused protocol tests;
- JSON Schema/runtime parity checks;
- manifest proof of zero runtime dependencies;
- exact-head Ubuntu and Windows frozen install, format, lint, typecheck, and tests.

No CI result is claimed before it executes on the final candidate head.
