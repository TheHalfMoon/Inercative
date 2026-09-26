# P02-S03-T01C SpecGrain shaping evidence — 2026-09-26

**Task:** `IN-P02-S03-T01C` — user-request intent interpretation boundary  
**SpecGrain:** `SG-000030`  
**Canonical shaping base:** `6ec4fbeb8aa4141623c35bf924b860a906ee26d6`  
**Shaping branch:** `p02/s03-t01c-user-request-interpretation-shaping`  
**SpecGrain source:** `TheHalfMoon/SpecGrain@5de7d6499bb0a9e3a191fc0934399cf099d1980a`  
**Authoring run:** GitHub Actions `36250354875`

## Why this Grain exists

`SG-000027 / IN-P02-S03-T01A` and `SG-000028 / IN-P02-S03-T01B` already provide deterministic Change Intent proposal semantics, including ordered graph mutation operations. Both intentionally begin from an already typed `ChangeIntentV1`.

The canonical P02-S03 outcome starts one layer earlier: a user request must become a proposed graph delta while preserving uncertainty, confidence, and provenance and without source mutation.

`SG-000030` is the bounded final S03 slice that closes that semantic gap without pulling P03 model/provider routing into P02.

## Phase boundary

The Grain defines two provider-neutral data contracts and one deterministic bridge:

```text
UserChangeRequestV1
        +
IntentInterpretationV1
        |
        v
validate exact request/base binding
        |
        v
ChangeIntentV1
        |
        v
compileChangeIntent
        |
        v
proposed Product Graph delta
```

P02 owns the typed boundary, validation, deterministic identity, preservation of interpretation metadata, and bridge to the already-qualified Change Intent compiler.

P03 remains the owner of any LLM/model/provider invocation, routing, prompt construction, retrieval, CLM/Jev decision routing, or generation of an interpretation candidate.

## Native SpecGrain authoring

A temporary branch-only GitHub Actions harness installed the exact pinned SpecGrain source and executed the native sequence:

```text
specgrain draft
specgrain shape
specgrain refine
specgrain grain
specgrain check
```

Run `36250354875` completed successfully. The harness removed itself before persisting the shaped state.

Result:

```text
ID = SG-000030
STATE = GRAIN
RISK = medium
DEPENDENCY = SG-000028
UNRESOLVED_DECISIONS = 0
MINIMALITY = reuse-existing
SAFETY = requirements-defined
```

## Safety boundary

The Grain requires:

1. raw user text and interpretation metadata remain untrusted proposal input and cannot grant capability, authorization, trust, or execution authority;
2. each interpretation is deterministically bound to the exact request identity and Product Graph base revision; stale or mismatched interpretations fail closed;
3. existing Change Intent and Product Graph domain validation cannot be bypassed or silently suppressed;
4. uncertainty/confidence/provenance remain visible proposal metadata rather than permission signals;
5. no provider, model, network, Git, source, database, deployment, credential, capability or external-effect behavior is introduced.

## Minimality

The existing `ChangeIntentV1` and `compileChangeIntent` implementation already owns graph-operation semantics and proposal construction. Creating another proposal engine or a P02 model router would duplicate qualified behavior and violate phase ownership.

The bounded implementation surface is therefore:

- `packages/product-graph/src/request-intent.ts`;
- `packages/product-graph/src/request-intent.test.ts`;
- `packages/product-graph/src/index.ts`;
- evidence/frontier documentation only.

## Implementation authority

Shaping does not claim implementation PASS. Implementation may begin only after the shaped Grain is canonically merged.

The implementation candidate must still satisfy the complete acceptance/evidence contract in `.specgrain/specs/SG-000030.json`, including exact-head CI, Diffcipline R2, Alibaba OCR deterministic/delegated review where applicable, Jev where available, and fresh-main post-merge CI before closure.
