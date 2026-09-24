# Higgsfield Open-Source Source Deep Dive — 2026-09-24

**Status:** planning/research input; no import or implementation authority
**Founder authorization:** the founder permits use, copy, adaptation, and modification of the named source repositories.
**Boundary:** public Higgsfield code and workflows are not the hosted Higgsfield platform, models, weights, or data.

## 1. Exact repositories and licenses

The following public repositories and revisions were re-fetched from GitHub on 2026-09-24. License evidence is recorded separately from code/model/data rights and must be checked again at import time.

| Repository | Reviewed revision | License evidence | Candidate value |
|---|---|---|---|
| `higgsfield-ai/skills` | `d071406147a37b835bed09543d85ab3e9bd85c7d` | MIT | creative Skills, BrandKit, product/media workflows, website/game composition |
| `higgsfield-ai/cli` | `dc7e2d2eac0b1fdad255de24d87552d1ba479037` | MIT | provider-neutral job lifecycle, workflow discovery, async polling, CLI/agent UX |
| `higgsfield-ai/higgsfield-client` | `aefd1ca677929762b9f69a7a7ea530a4a695d6a8` | Apache-2.0 | Python queued job states, callbacks, sync/async lifecycle |
| `higgsfield-ai/higgsfield-js` | `e3f274249962417e21f6566d4eecec6d8491d11c` | MIT in package metadata; no GitHub license API result | server-side TypeScript credential, polling, webhook patterns |
| `higgsfield-ai/cursor-plugin` | `c9215059e409dc81c69ff0fe77ea2740c5fc6249` | MIT | plugin/MCP packaging and agent integration |
| `higgsfield-ai/higgsfield` | `d12a36e66024a93d33ec61826a77d5a346c16869` | Apache-2.0 | distributed experiment/training reference; not a default dependency |

These are research pins, not copied or imported source. A later WorkPacket must record exact paths, destination mapping, dependency/asset/model/data closure, notices, transformations, security review, tests, and removal/upgrade strategy.

## 2. Mechanisms worth adapting

### Skills and compound workflows

`higgsfield-ai/skills` turns multi-step creative work into reusable agent-loadable workflows. Candidate mechanisms include image/video/3D/audio generation, product photoshoot, BrandKit, marketplace cards, website generation, explainers, thumbnails, browser games, character workflows, and marketing analysis. Ineractive should adapt the workflow and packaging contract, not hard-code Higgsfield as the only provider.

### Async media job lifecycle

The clients expose a useful normalization seam for `queued`, `in_progress`, `completed`, `failed`, moderation, and `cancelled` states. An Ineractive-owned media job contract should bind request, provider/model/workflow, source assets, prompt/config revision, progress, moderation, cancellation, result references, usage/cost, evidence/provenance, retry, and reconciliation. Provider-specific states remain adapter details.

### CLI, plugin, and research references

The CLI suggests provider-neutral discovery, asynchronous polling, and agent-facing media workflow UX. The Cursor plugin suggests plugin packaging and MCP distribution patterns. The older `higgsfield` framework suggests distributed experiment and GPU workload scheduling only if Ineractive later owns a training program; it is not a current runtime dependency.

## 3. Adoption boundaries

Do not make Higgsfield the canonical media provider, model router, design system, Product Graph, security authority, permission system, deployment provider, generated-app AI provider, or memory system. Ineractive-owned contracts remain authoritative.

Open-source client/Skill code does not make hosted models or platform APIs open source, and code permission does not grant rights to third-party weights, training data, generated media, or provider terms. Hosted calls remain optional external-provider operations behind `MediaProviderAdapter`, with user/product-owned credentials and explicit cost, privacy, moderation, egress, and retention policy.

Base operation remains functional without Higgsfield. Local/free providers, BYOK, user-owned accounts, and explicit unavailable/provider-required states are valid; no hidden fallback may spend money or change authority.

## 4. Security and qualification requirements

Before copied code lands, Ineractive must:

- pin source revision and exact paths and preserve license/NOTICE obligations;
- inspect transitive dependencies, install scripts, package assets, and model/data references;
- keep credentials server-side and out of browser bundles, prompts, and ordinary logs;
- replace provider-specific secret assumptions with Ineractive `SecretRef` contracts;
- validate webhook destinations, signatures, replay/idempotency, and unknown outcomes;
- bound polling, retries, uploads/downloads, egress, and artifact retention;
- record moderation/provider failure as evidence, never security or release authority;
- run characterization, negative, security, dependency, license, and independent review gates.

Creative work is not automatically safe because it is user supplied. Prompt injection, malicious media, unsafe downloads, cross-tenant leakage, and external effects remain capability-policy problems.

## 5. Roadmap mapping and conclusion

No new top-level phase or task is required:

- **P03-S07** — adapt Skill packaging/composition behind Ineractive Skills contracts.
- **P08-S12** — adapt branded media workflow composition, asset provenance, and bounded refinement.
- **P10-S06** — independently benchmark media quality, reliability, cost, latency, and safety.
- **P13-S04** — learn from plugin/MCP packaging and isolation patterns.
- **P13-S07** — adapt suitable compound workflows into Product Kit patterns.
- **P13-S08** — qualify Higgsfield only as an optional `MediaProviderAdapter`.
- **P15** — consider training/orchestration lessons only if a future Ineractive-owned training program exists.

The intended composition is:

```text
Higgsfield-style Skills/workflows
  + Ineractive Product Graph and DesignSystemRevision
  + provider-neutral MediaProviderAdapter
  + bounded decision routing
  + provenance-bound CreativeAsset
  + independent evaluation
  + user-owned credentials
```

This is a donor and benchmark input, not a claim that the hosted platform, models, weights, or outputs are open source or free to operate. Re-fetch every selected repository and license before an owning Grain relies on this study.
