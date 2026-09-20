# Creative Media and Decision Routing Research Delta

**Date:** 2026-09-20  
**Status:** candidate planning input for PR #6; no implementation authority  
**Scope:** creative-media generation, bounded asset refinement, media-provider routing, and decision-model qualification.

## 1. Why this delta exists

The current Ineractive plan already covers provider-neutral generative adapters, visual editing, asset provenance, design evaluation, and model routing. The newly supplied sources expose one remaining architectural gap: the plan did not yet name one end-to-end contract for generated creative assets.

The required separation is:

```text
Product/Design intent
-> VisualPromptProtocol
-> MediaGenerationRequest
-> bounded decision routing
-> qualified MediaProviderAdapter
-> generated CreativeAsset candidates
-> provenance + rights metadata
-> independent visual/product evaluation
-> bounded raster/compositing refinement
-> accepted asset bound into Product Graph / DesignSystemRevision
```

The decision model does not generate the asset. The media provider does not decide policy. The evaluator does not grant capability authority. Deterministic policy remains authoritative for budgets, permissions, provenance requirements, and side effects.

## 2. Source: freestylefly/awesome-gpt-image-2

- Repository: https://github.com/freestylefly/awesome-gpt-image-2
- Observed immutable revision: `0dc09c46c8a30b1fdd89c18cc78a894dac2104e3`
- Repository license: MIT.
- Planning posture: **ADAPT / COPY_SELECTIVE / BENCHMARK**.

Useful mechanisms:

- Prompt-as-Code rather than prose-only prompting.
- Structured visual prompt schemas and reusable industrial templates.
- A large categorized visual case library for design/evaluation research.
- Agent Skill packaging for reusable style knowledge.
- Shared machine-readable style-library data feeding both product UI and agent workflows.
- Generation settings, comparison UX, case browsing, and reproducible prompt records.

Important provenance constraint:

The repository's own disclaimer states that some gallery prompts/images originate from third-party community sources and may have separate rights. Founder permission to use the repository does not remove the need to record the exact upstream item and rights basis for any copied third-party asset/content. Ineractive should preferentially adapt the schema/tooling/mechanism and use third-party gallery material only through the normal provenance gate.

## 3. Source: Robbie Tilton / Compositor

- X source locator: https://x.com/robbietilton/status/2100946395972976843
- Primary code repository: https://github.com/robbietilton/Compositor
- Observed immutable revision: `a19db9011282399785dc18efcfded904627bdcc2`
- Repository license: MIT.
- Planning posture: **ADAPT / COPY_SELECTIVE**.

Useful mechanisms:

- layers/folders, blend modes, opacity;
- layer/clipping/folder masks;
- non-destructive transforms;
- selections and content-aware fill;
- brush/retouching primitives;
- adjustment layers and filters;
- background removal;
- crop/canvas/image sizing;
- familiar keyboard/interaction patterns;
- pixel-accurate post-processing workflow.

Ineractive should not become a general Photoshop clone. The useful product boundary is a **bounded creative-asset refinement surface** for assets already connected to a generated product: crop, transform, mask, erase/fill, background removal, tonal/color adjustment, compositing, and export. The native Swift/macOS implementation is a donor/reference, not a mandatory runtime dependency.

## 4. Source: Higgsfield AI X post

- Source locator: https://x.com/higgsfield_ai/status/2101117855622463719
- Planning posture: **REFERENCE** pending direct post capture.

Direct X retrieval was blocked during this planning pass, so the exact post body is not treated as captured evidence. Public material from the same account on 2026-09-19 demonstrates a closely related pattern: a bounded decision model selects/ranks generative image/video models or assets, then a separate generative provider performs the expensive creative work.

Architectural lesson:

```text
typed task + constraints
-> low-latency decision adapter
-> selected compatible media model/provider
-> generation
-> evaluator
-> evidence
```

Do not encode a provider name into the caller. Cost, latency, modality, quality floor, policy, privacy, and availability belong in the typed request and model capability registry.

## 5. Source: Nerea Solenne X post

- Source locator: https://x.com/nereasolenne/status/2101265048824074535
- Planning posture: **REFERENCE / DESIGN WORKFLOW LEAD**.

The surfaced post describes a free tutorial about using a Claude-family workflow to build animated, award-oriented websites. Treat the claims as author/repost claims, not qualification evidence.

Useful planning pressure:

- motion must be designed as part of product interaction, not decorative noise;
- animated-site generation needs a reproducible motion system, responsive behavior, reduced-motion fallbacks, and runtime performance evidence;
- visually impressive examples must still pass accessibility, usability, source ownership, and browser verification;
- tutorial/demo quality is not production acceptance evidence.

This source strengthens the existing Frontend Quality OS and P08 motion/design direction; it does not justify copying a branded site or bypassing design provenance.

## 6. Source: convaiinnovations/laya

- Hugging Face: https://huggingface.co/convaiinnovations/laya
- Observed Hub head on 2026-09-20: short revision `1c5edc1`; resolve and record the full commit SHA before any code/weight import.
- License: Apache-2.0.
- Model class: non-autoregressive bounded/System-1 decision model.
- Planning posture: **OPTIONAL QUALIFIED SOURCE / BENCHMARK / ADAPT**.

Relevant characteristics reported by the model card:

- typed `choice`, ordinal `score`, and calibrated boolean-style decisions;
- probability/confidence output;
- ~421M parameters;
- ModernBERT-large backbone plus decision head;
- multi-question batching;
- explicit calibration/evaluation artifacts;
- English/text and token-budget limits;
- explicit recommendation to keep arithmetic/counting/date/index logic deterministic.

Ineractive implication:

Laya is a candidate decision-adapter implementation/benchmark, not a default public runtime claim. It should be evaluated behind the existing provider-neutral bounded decision interface alongside any other qualified decision engine. Hard permissions, deterministic invariants, and acceptance authority stay outside the model.

## 7. New canonical contracts

Candidate contracts introduced by this research delta:

### VisualPromptProtocol

Structured, versioned representation of:

- subject/content intent;
- composition/layout;
- brand/design tokens;
- typography/copy constraints;
- media/style references;
- camera/lens/lighting where applicable;
- dimensions/aspect ratio;
- edit/reference assets;
- negative constraints;
- safety/rights constraints;
- reproducibility metadata.

### MediaGenerationRequest

Typed request including:

- modality: image / video / animation / future media;
- operation: generate / edit / variation / extend / remove / composite;
- quality floor;
- latency preference;
- cost ceiling;
- privacy class;
- provider/model eligibility;
- deterministic seed when supported;
- source/reference asset IDs;
- required output metadata.

### MediaProviderAdapter

Provider-neutral interface returning:

- generated asset references;
- provider/model identity in private run evidence;
- generation configuration;
- usage/cost/timing;
- safety/provider warnings;
- retry/fallback lineage;
- reproducibility metadata where available.

### CreativeAsset

Product-owned asset record with:

- immutable asset ID/version;
- origin: generated / imported / edited / user-supplied;
- source/provenance chain;
- rights/license metadata where known;
- generation/edit lineage;
- Product Graph bindings;
- DesignSystemRevision bindings;
- acceptance/evaluation evidence.

## 8. Routing policy

Media routing is an extension of ModelTask routing, not a separate autonomous authority.

Candidate decision inputs:

- required modality and operation;
- quality floor;
- speed target;
- cost ceiling;
- prompt/reference complexity;
- typography/text-rendering needs;
- brand/style adherence;
- edit precision;
- output dimensions/duration;
- privacy/policy eligibility;
- current provider health/availability.

The router may rank compatible providers/models. Deterministic code filters forbidden/incompatible candidates first. A low-confidence decision escalates to a more capable decision/generative path or user-visible blocker according to policy.

## 9. Bounded raster/compositing refinement

The design editor should gain only the asset-editing operations required to finish product assets without leaving the Ineractive workflow:

- crop/resize/rotate/transform;
- masks and alpha;
- layer ordering/blending;
- background removal;
- erase/fill/inpaint adapter;
- simple clone/heal where safely supported;
- brightness/contrast/levels/curves/hue/saturation;
- blur/sharpen/noise where justified;
- export with provenance preserved.

A full general-purpose illustration/raster package remains outside the core product scope.

## 10. Task-graph delta

Add candidate future tasks without changing current P00 authority:

- `IN-P08-S12-T01` — implement VisualPromptProtocol, MediaGenerationRequest, MediaProviderAdapter integration, CreativeAsset lineage, and generated-asset evaluation flow.
- `IN-P08-S12-T02` — implement bounded raster/compositing refinement for product-bound creative assets.
- `IN-P13-S08-T01` — qualify multiple creative-media provider adapters and bounded decision routing by modality/quality/cost/latency/policy.

These remain dependency-gated future work. No source import, model download, provider call, or product implementation is claimed by this planning change.
