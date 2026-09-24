# CLM and Internal Source Deep Dive — 2026-09-24

**Status:** planning/research input  
**Ineractive base reviewed:** `fd3fd806b8941a03fc96ddfcc395f2da57622a5a`  
**CLM repository:** `Contrastive-LM/CLM`  
**CLM revision reviewed:** `7956937c58ed5839c06ddc4dc6b6b61c3a3e4094`  
**Public code/weights license at reviewed revision:** Apache-2.0  
**Founder authorization:** the founder explicitly states permission to use/copy/adapt CLM source for Ineractive. This does not remove the repository's existing provenance, NOTICE, dependency, model/data-rights, security and qualification gates.

## 1. Executive decision

CLM should be added to the Ineractive plan as an **optional bounded Decision Plane provider**, not as the main generative model and not as a hard runtime dependency.

Best-fit roles:

- rank candidate tools/actions;
- shortlist retrieval candidates;
- select among bounded implementation plans;
- rank candidate patches/repairs;
- compare design variants before expensive evaluation;
- route between eligible models/providers;
- best-of-N verifier;
- typed binary/choice/score decisions;
- confidence-aware early exit;
- cheap pre-filter before Jev/full evaluator execution.

Non-roles:

- final permission or authorization;
- unbounded product generation;
- trusted security verdict by itself;
- legal/compliance decision authority;
- source-of-truth memory;
- replacement for exact tests/browser evidence;
- replacement for independent assurance.

## 2. What CLM contributes

At the reviewed revision, CLM exposes two useful primitives:

### Typed System-One decisions

The API supports typed:

- Noul / boolean-probability questions;
- Choice questions with probabilities;
- Score questions across ordered criteria.

### Candidate ranking

The rank primitive scores a state/context against a bounded set of candidate actions and returns an ordering/probability distribution.

Architecturally, CLM uses separate state/action encoders plus trainable projection heads and contrastive scoring. Candidate vectors can be cached, which is especially attractive for Ineractive because tool names, model choices, repair strategies, common actions and policy-eligible candidate sets repeat across many changing states.

## 3. Why this is useful in Ineractive

A normal generative model is expensive and slow when the actual task is only:

- "which of these seven tools is most relevant?";
- "which of these four already-eligible routes should run?";
- "which of these candidate patches deserves full browser qualification first?";
- "does this candidate cross a threshold that warrants escalation?";
- "which design variant should the expensive evaluator inspect first?"

In those cases Ineractive should separate:

`eligibility -> ranking -> verification -> authority`

CLM may improve the **ranking** step. It does not own the other three.

## 4. Proposed Ineractive contract

P03-S03 should implement a provider-neutral contract similar to:

```text
DecisionRequest
  request_id
  state_ref / bounded rendered state
  decision_kind = NOUL | CHOICE | SCORE | RANK
  candidate_set[]
  candidate_set_digest
  criteria
  policy_revision
  context_bundle_digest
  max_latency
  max_cost
  confidence_policy
  evidence_requirements

DecisionResult
  provider_id
  provider_revision
  model_or_head_revision
  candidate_set_digest
  ordered_scores / probabilities
  confidence
  latency
  usage
  cache_metadata
  calibration_profile
  fallback_reason?
  evidence_refs[]
```

Required adapters:

- deterministic rules/baseline;
- CLM-class contrastive ranker;
- Jev-class typed decision provider where qualified;
- full generative evaluator fallback;
- null/unavailable adapter for fail-closed behavior.

Callers depend only on the Ineractive contract.

## 5. Required safety invariants

1. **Eligibility precedes ranking.** CLM never sees forbidden candidates as a way to "decide whether" they are allowed.
2. **A score is not a grant.** Capability authority remains with P04 policy/kernel contracts.
3. **Security findings are independently verified.** CLM may prioritize a queue; it cannot convert uncertainty into PASS.
4. **Low confidence is explicit.** Threshold miss escalates or returns unavailable; it does not silently pick top-1.
5. **Exact candidate set is evidence.** A ranking is meaningless if the action set changed.
6. **Model/head revision is evidence.** Hot-reload must create a new decision identity.
7. **Cache correctness is versioned.** Cached projections cannot survive an incompatible head/model generation as if equivalent.
8. **Prompt/untrusted data remains tainted.** Ranking cannot raise trust or erase source provenance.
9. **No hidden cloud fallback.** If a local/selected provider is unavailable, route through explicit policy.
10. **Decision output cannot mutate product state directly.** A separate typed action request is required.

## 6. Runtime posture and zero-COGS fit

CLM's reference path uses a Qwen3-8B pooling encoder and GPU-oriented serving examples. That is useful research evidence but is not a reason to make a GPU a V1 requirement.

Ineractive should therefore support three deployment postures:

- **local capable device** — run a qualified CLM-class provider when hardware evidence passes;
- **user/org endpoint** — connect to a user-owned or organization-owned qualified decision endpoint;
- **no CLM runtime** — deterministic/Jev/generative fallbacks remain functional.

This preserves the zero-founder-funded-runtime-COGS principle inherited from Kernux planning and avoids making one accelerator profile part of the product definition.

## 7. Benchmark and admission plan

Before CLM may influence production routing:

### Dataset / workload families

- model routing;
- tool routing;
- repair-candidate ranking;
- plan ranking;
- retrieval shortlist;
- design-variant shortlist;
- test-priority ranking;
- browser-action shortlist in a bounded simulator only;
- generated-app MCP tool routing.

### Baselines

- deterministic heuristic;
- random candidate ordering;
- Jev-class typed decision provider;
- selected full generative model;
- CLM reference head;
- optional Ineractive-tuned head only after rights-qualified data exists.

### Measures

- top-1 / top-k accuracy;
- calibration / expected calibration error where meaningful;
- abstention quality;
- regression against protected correctness/security cases;
- p50/p95 latency;
- warm/cold cache behavior;
- memory footprint;
- CPU/GPU requirement;
- input-token/embedding usage;
- cost under each deployment posture;
- robustness to stale candidate descriptions;
- robustness to adversarial/untrusted candidate text;
- deterministic evidence completeness.

A faster model that lowers correctness below the owning task's floor does not qualify.

## 8. Fine-tuning posture

Fine-tuning is later and optional.

If Ineractive trains a task-specific CLM head:

- data must be rights-qualified;
- train/eval/test splits are exact and content-addressed;
- project/customer private data is not silently promoted into shared training;
- protected benchmark feedback does not leak into tuning;
- the encoder/head/config/dataset revisions are all pinned;
- training/evaluation receipts follow MESC-style experiment evidence;
- model promotion uses P10 Evaluation Lab evidence.

## 9. Internal GitHub sources worth reusing

The deep dive found several strong internal sources. They should be adapted behind Ineractive contracts rather than copied as whole products.

| Internal source | High-value mechanism | Ineractive use |
|---|---|---|
| TheHalfMoon/kernux | ContextSource/ContextItem/ContextBundle; scoped memory; capability/grant separation; local privacy; egress evidence; provider-neutral runtime | P03 context/memory, P04 capability/security, P11 provider lifecycle |
| TheHalfMoon/Golam | authority/taint/freshness-bearing context; candidate-vs-durable memory; live truth beats stale memory; ranking cannot raise authority | P03-S05/S06 and P12 project intelligence |
| TheHalfMoon/Morize | governed memory writer, provenance/taint, crash reconciliation, user-controlled durable memory | P03/P12 memory implementation reference |
| TheHalfMoon/Ascout | AssuranceTarget/Intent/Plan/Engine/Finding/Coverage/Bundle; exact-target freshness; browser/security/test orchestration | P10 assurance; PR #63 already owns browser-verification hardening |
| TheHalfMoon/MESC | content-addressed experiments, exact model/data/eval identities, verifier evidence, reproducibility and contamination controls | P10 Evaluation Lab and any decision-model tuning |
| TheHalfMoon/Himsat | multi-engine runtime router, diagnostics, no-silent-fallback, voice provenance, isolated heavy workers | later voice/remote builder control and general provider-router lessons |
| TheHalfMoon/Wispral | speech is evidence, not authority; interrupt/steer/approve/recover voice-agent UX | future voice builder control |
| TheHalfMoon/MedScale | extension capability manifests, sandboxed/isolated extensions, re-consent, SBOM/license/revocation patterns | P13 plugin ecosystem |
| TheHalfMoon/Kodac | exact revision/context/review workflow and repository qualification patterns | P10/repository evidence |
| TheHalfMoon/Sentrdel | security invariants and reusable verification-worker patterns | P10 security worker isolation |
| TheHalfMoon/Winds / Pluma | browser/E2E/visual evidence patterns | P10; coordinate with PR #63 |
| SpecGrain | bounded recursive planning and WorkPackets | all implementation phases |
| Diffcipline | exact-diff risk/proof discipline | all implementation phases |

## 10. Context and memory architecture to preserve

From Kernux/Golam/Morize, Ineractive should preserve these properties:

- context is a typed artifact, not ad-hoc prompt concatenation;
- every context item has source revision, provenance, trust/taint, sensitivity and freshness;
- deterministic search is attempted before expensive semantic retrieval;
- indexes/embeddings/graphs are derived and rebuildable;
- summaries carry source lineage and invalidation;
- durable memory is scoped (run/task/project/user/org);
- agent-proposed memory is distinct from accepted durable memory;
- stale memory never outranks live authoritative source truth;
- ranking/similarity cannot grant authority;
- users can inspect, edit, expire/export/delete durable project memory;
- deleted/revoked sources invalidate dependent memory/context.

These are core competitive advantages because most app builders optimize only for generation speed.

## 11. Voice architecture lesson

Ineractive should not add "voice" as a microphone button.

The future voice path should reuse Himsat/Wispral principles:

`capture -> conditioning/VAD -> qualified voice router -> transcription revision -> intent -> confirmation/authority`

Key rules:

- Arabic and Arabic-English code-switch are explicit benchmark lanes;
- no hidden local-to-cloud fallback;
- transcript is evidence, not permission;
- high-consequence actions require current explicit confirmation;
- push-to-talk first; wake word later and opt-in;
- heavy speech workers remain isolated and replaceable.

## 12. Admission checklist for CLM source reuse

Before copied/adapted CLM code lands:

- record exact upstream revision;
- record copied/adapted paths;
- preserve Apache-2.0 notices as required;
- inspect transitive dependencies separately;
- inspect downloaded model/weight rights separately from code;
- forbid unpinned remote-code execution in trusted runtime;
- run dependency/security/SBOM checks;
- bind imported mechanism to an Ineractive-owned interface;
- add deterministic fallback tests;
- add model-unavailable/no-accelerator tests;
- add confidence/abstention tests;
- add stale-cache/head-reload tests;
- add adversarial candidate-text tests;
- qualify through SpecGrain, Diffcipline, Alibaba OCR, Jev and exact-head CI when the owning task is eligible.

