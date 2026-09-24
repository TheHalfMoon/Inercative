# CLM and Internal Source Deep Dive — 2026-09-24

**Status:** dated research input; no import or implementation authority
**Ineractive base:** `fd3fd806b8941a03fc96ddfcc395f2da57622a5a`
**CLM repository:** `Contrastive-LM/CLM`
**CLM revision:** `7956937c58ed5839c06ddc4dc6b6b61c3a3e4094`
**Observed code/weights license:** Apache-2.0

## 1. Decision

CLM is an optional bounded Decision Plane provider, not the central generative model or a hard runtime dependency. It is useful for candidate ranking, typed NOUL/CHOICE/SCORE decisions, best-of-N verification, action-vector caching, and fine-tunable projection heads. It never owns permission, security PASS, product truth, open-ended generation, or independent assurance.

The base architecture must remain functional without a local GPU, CLM, or paid inference. Deterministic, Jev-class, and generative fallbacks remain explicit and observable.

## 2. Ineractive-owned boundary

P03 should own a provider-neutral contract approximately shaped as:

```text
DecisionRequest
  request_id, state_ref/bounded state, decision_kind, candidate_set_digest
  criteria, policy_revision, context_digest, latency/cost bounds
  confidence_policy, evidence_requirements

DecisionResult
  provider/model/head revisions, candidate_set_digest, typed scores
  confidence, abstention/escalation, evidence references, latency/cost
  fallback lineage
```

Hard eligibility and capability filtering occur before the request. A result may rank the next verification candidate but cannot create a capability Grant, bypass policy, approve publication, or convert an unknown external outcome into success.

## 3. Upstream mechanism and risks

At the reviewed revision CLM uses separate state/action encoders, trainable projection heads, contrastive scoring, and cacheable action vectors. Its serving example uses a Qwen3-8B-class pooling encoder and accelerator-oriented components. That may be useful for organization-owned or user-owned endpoints but is not a zero-cost or laptop-default requirement.

Admission must separately inspect:

- exact source paths and transitive dependencies;
- code and model/container licenses, NOTICE, weights, datasets, and attribution;
- pinned artifact hashes and unpinned remote-code risk;
- deterministic model loading, cache/head invalidation, and stale-state behavior;
- model-unavailable/no-accelerator fallback and bounded cost;
- adversarial candidate text, prompt injection, ranking manipulation, abstention, and confidence calibration;
- sandbox/runtime isolation and Ineractive-owned evaluation.

Founder permission permits consideration but does not replace these obligations.

## 4. Internal mechanisms to preserve

| Source | Mechanism | Destination posture |
|---|---|---|
| Kernux | typed capability grants; provenance-bearing context; local privacy; egress/provider lifecycle | adapt behind P03/P04-owned contracts |
| Golam | authority/taint/freshness; candidate versus durable memory; live truth over stale memory | adapt behind governed context and memory |
| Morize | user-controlled durable memory and governed writes | adapt behind project/user visibility and revocation |
| Ascout | exact-target assurance, browser evidence, independent oracle and residual risk | coordinate with P10 and PR #63 |
| MESC | content-addressed experiment/model/data/eval identity and reproducibility | adapt behind Evaluation Lab |
| Himsat / Wispral | replaceable voice routing, diagnostics, no silent fallback, speech as evidence | later voice/general router lessons |
| MedScale | capability-scoped extensions, re-consent, SBOM/license/revocation | later P13 plugin isolation |
| SpecGrain / Diffcipline | bounded work and exact-diff proof | preserve as delivery governance |

Donor architectures remain replaceable. Ineractive owns Product Graph, WorkPacket, harness events, DecisionTask, CapabilityRequest/Grant, runtime, backend/design, evidence, and assurance contracts.

## 5. Context, memory, and voice constraints

Every context item records source revision, provenance, trust/taint, sensitivity, freshness, derivation, and revocation. Deterministic search precedes semantic retrieval. Indexes, embeddings, graphs, and summaries are derived/rebuildable. Agent-proposed memory is distinct from accepted durable memory. Users can inspect, edit, expire, export, and delete it. Similarity or rank never raises authority.

Voice later uses capture and transcript lineage, conditioning/VAD, replaceable speech providers, revision history, intent extraction, current confirmation, and explicit effect policy. Arabic and Arabic-English code-switch are first-class benchmark dimensions. A missing cloud provider fails visibly; it does not silently switch to a paid or remote provider.

## 6. Admission checklist

Before CLM code, weights, or a serving path is accepted, record exact revision and paths; copied/adapted mechanism; destination; dependency/model/data rights; NOTICE; hashes; runtime isolation; security review; deterministic fallback; no-accelerator behavior; confidence/abstention; cache/head invalidation; adversarial candidate-text fixtures; and independent Ineractive evaluation.

The owning P03 Grain must bind the exact provider/head/candidate, record latency/cost and calibration, and prove that deterministic/Jev/generative alternatives and fail-closed unavailability remain usable. Published upstream benchmarks are research inputs, not Ineractive qualification evidence.
