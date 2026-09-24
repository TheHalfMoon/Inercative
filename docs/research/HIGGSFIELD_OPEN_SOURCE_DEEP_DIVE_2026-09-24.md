# Higgsfield Open-Source Source Deep Dive — 2026-09-24

**Status:** planning/research input for Ineractive  
**Founder authorization:** the founder explicitly states permission to copy, adapt, modify, and use Higgsfield source code for Ineractive.  
**Important boundary:** public Higgsfield code/workflow repositories are not the same thing as the hosted Higgsfield platform/models. Provider APIs/models remain external provider capabilities unless separately available under compatible source/model rights.

## 1. Exact official repositories reviewed

| Repository | Reviewed revision | Public license evidence | High-value Ineractive use |
|---|---|---|---|
| `higgsfield-ai/skills` | `d071406147a37b835bed09543d85ab3e9bd85c7d` | MIT | agent Skills, creative workflows, brandkit, product photoshoot, website/game generation orchestration, approval-aware media workflows |
| `higgsfield-ai/cli` | `dc7e2d2eac0b1fdad255de24d87552d1ba479037` | MIT | provider-neutral job lifecycle ideas, model/workflow discovery, async polling, media generation workflow UX, CLI/agent integration patterns |
| `higgsfield-ai/higgsfield-client` | `aefd1ca677929762b9f69a7a7ea530a4a695d6a8` | Apache-2.0 | Python API client patterns, queued/in-progress/completed/failed/NSFW/cancelled job state, sync/async execution and callbacks |
| `higgsfield-ai/higgsfield-js` | `e3f274249962417e21f6566d4eecec6d8491d11c` | package metadata declares MIT | TypeScript server-side SDK patterns, credential isolation, polling/status lifecycle, webhook patterns |
| `higgsfield-ai/cursor-plugin` | `c9215059e409dc81c69ff0fe77ea2740c5fc6249` | MIT | plugin packaging, MCP installation/distribution and agent-surface integration |
| `higgsfield-ai/higgsfield` | `d12a36e66024a93d33ec61826a77d5a346c16869` | Apache-2.0 | distributed experiment orchestration, GPU workload scheduling, GitHub-driven experiment execution; research/reference only for Ineractive unless a later training program needs it |

Exact revisions must be re-fetched at implementation shaping time.

## 2. Strongest product mechanisms to reuse

### 2.1 Skills as productized workflows

The official Skills repository is particularly valuable because it turns multi-step creative work into reusable, agent-loadable workflows rather than one-off prompts.

Relevant examples include:

- general image/video/3D/audio generation;
- product photoshoot workflows;
- BrandKit generation;
- marketplace cards;
- full-stack website generation;
- video explainers;
- YouTube thumbnails;
- browser game generation;
- character/identity training workflow;
- marketing/virality analysis workflows.

Ineractive should adapt the **workflow contract and skill packaging ideas**, not hard-code Higgsfield as the only provider.

Target mapping:

- P03-S07 — System / Project Skills;
- P08-S12 — creative-media generation and bounded asset refinement;
- P13-S07 — Product Kits;
- P13-S08 — creative-media provider ecosystem.

### 2.2 Creative-media job state machine

The official clients expose useful asynchronous states such as:

```text
queued
in_progress
completed
failed
nsfw
cancelled
```

Ineractive should normalize those into its own provider-neutral media job contract with:

- request identity;
- provider/model/workflow identity;
- source/reference assets;
- prompt/config revision;
- queue/progress state;
- moderation disposition;
- cancellation semantics;
- result asset references;
- usage/cost metadata;
- evidence/provenance;
- retry/reconciliation state.

Provider-specific states must not leak into Product Graph callers.

### 2.3 Server-side credential boundary

The TypeScript SDK explicitly treats credentials as server-side secrets.

Ineractive should preserve this boundary:

- never place provider secrets in generated browser bundles;
- secrets remain SecretRef/SecretBinding handles;
- provider adapters execute behind trusted server/runtime boundaries;
- generated products own their provider credentials independently from Ineractive control-plane credentials.

### 2.4 Provider/workflow discovery

CLI/Skills patterns support model/workflow discovery and parameterized execution.

Adapt this into:

`MediaCapabilityRegistry -> MediaProviderAdapter -> MediaGenerationRequest -> MediaJob -> CreativeAsset`

The registry must describe modality, operation, input requirements, output types, latency/cost class, policy/moderation behavior, provider health, and availability.

### 2.5 Brand and campaign workflows

Higgsfield's BrandKit/product-photo/marketing workflows are strong references for turning design truth into reusable asset systems.

Ineractive should integrate the concept with its existing:

- Product Graph;
- DesignSystemRevision;
- VisualPromptProtocol;
- Brand artifacts;
- CreativeAsset provenance;
- independent Design Evaluator.

Brand workflows must consume Ineractive-owned design truth and write results back as provenance-bound candidate assets.

### 2.6 Website/game generation skills

The website and browser-game workflows are useful references for compound Skills that combine generation, source editing, verification and deployment.

They should inform P13 Product Kits and Skill composition, but should not create a second web compiler beside P05-P07.

## 3. What should be copied/adapted selectively

Preferred posture:

### COPY_SELECTIVE / ADAPT

- Skill folder structure and metadata patterns;
- reusable multi-step workflow decomposition;
- CLI command/result conventions where they improve ergonomics;
- provider/model/workflow registry concepts;
- polling and job-lifecycle handling;
- server-side secret-handling patterns;
- webhook/result reconciliation patterns;
- brandkit/product-photo/video-explainer workflow structure;
- plugin/MCP distribution patterns.

### REFERENCE / BENCHMARK

- hosted provider catalog;
- model-specific quality claims;
- virality scoring behavior;
- GPU distributed-training framework unless a later Ineractive research/model program requires it.

## 4. Do not copy as architecture authority

Do not make Higgsfield the canonical:

- media provider;
- model router;
- design system;
- Product Graph;
- security authority;
- permission system;
- deployment provider;
- generated-app AI provider;
- memory system.

Ineractive-owned contracts remain authoritative.

## 5. Hosted-provider boundary

Even where client/skill code is open source, calls to Higgsfield-hosted models/APIs remain external provider operations.

Therefore:

- no hidden Higgsfield dependency;
- no founder-funded mandatory usage;
- no API credential baked into Ineractive;
- no claim that hosted models are open source unless separately verified;
- no assumption that user permission to copy code grants rights to third-party model weights, training data or generated-media terms;
- all hosted use remains replaceable through MediaProviderAdapter.

## 6. Zero-cost rule

Open-source Higgsfield code can be copied/adapted without making Higgsfield API spending mandatory.

For Ineractive base operation:

- provider use is optional;
- BYOK/user-owned accounts are allowed;
- local/free providers remain eligible;
- the product remains functional when Higgsfield is unavailable;
- media generation may return an explicit unavailable/provider-required state rather than silently spending money.

## 7. Security requirements

Before copied code lands:

- pin exact source revision and copied paths;
- preserve license/NOTICE obligations;
- inspect dependencies independently;
- remove any provider-specific secret assumptions that conflict with Ineractive SecretRef;
- prohibit browser-side secret exposure;
- validate webhook destinations and signatures;
- bound polling/retry loops;
- classify media upload/download egress;
- record moderation/provider failure without treating it as system security authority;
- scan copied code through normal Ineractive review/security gates.

## 8. Recommended roadmap mapping

No new top-level phase is required.

Use existing owners:

- **P03-S07** — adapt Higgsfield-style Skills packaging/composition where useful.
- **P08-S12** — adapt creative-media workflow composition, asset provenance and branded-media workflows.
- **P10-S06** — benchmark media workflow quality/cost/latency/reliability.
- **P13-S04** — learn from plugin packaging/distribution patterns.
- **P13-S07** — adapt BrandKit/product-photo/video-explainer/game-style compound workflows into Product Kit patterns.
- **P13-S08** — qualify Higgsfield as one optional MediaProviderAdapter and reuse suitable open-source adapter/workflow code.
- **P15** — only later consider large-scale training/orchestration lessons from the legacy `higgsfield` framework if Ineractive operates its own model-training program.

## 9. Adoption conclusion

Higgsfield is now a high-value **code donor + workflow donor + provider benchmark** for Ineractive.

The largest immediate value is not copying a UI. It is combining:

```text
Higgsfield-style Skills/workflows
+ Ineractive Product Graph
+ Ineractive DesignSystemRevision
+ provider-neutral MediaProviderAdapter
+ CLM/Jev bounded routing
+ provenance-bound CreativeAsset
+ independent evaluation
+ user-owned credentials
```

That gives Ineractive a stronger creative-media subsystem without locking the product to one vendor.
