# Competitive Landscape and Product Baseline — 2026-09-24

**Status:** planning/research input for the canonical roadmap  
**Snapshot date:** 2026-09-24  
**Canonical execution authority:** unchanged; `specs/CURRENT.md` and the active SpecGrain frontier remain authoritative.  
**Related quality work:** PR #63 owns the generated-app browser-verification hardening; this document does not duplicate or activate that work.

## 1. Purpose

This study refreshes Ineractive's competitive baseline after the 2026-09-20 source-ledger snapshot.

The goal is not to copy one builder. The goal is to extract the strongest product behaviors across current AI builders, design tools, coding agents, no-code platforms, internal-tool builders, and adjacent product-operating systems, then assign every required behavior to an Ineractive-owned contract and roadmap owner.

The product target is:

> **Ineractive is a provider-neutral Product Operating System that can understand, design, build, verify, publish, operate, learn from, and safely evolve a real software product while preserving source ownership, evidence, user authority, and exit portability.**

## 2. Research method

Current public product/docs pages were checked for the major market categories already represented in the source ledger:

- AI-native full-stack builders;
- coding-agent/product builders;
- design-to-code systems;
- no-code and low-code application platforms;
- internal-tool builders;
- mobile builders;
- deployment/hosting-oriented builders;
- adjacent agentic coding systems.

Open-source alternatives already present in `SOURCE_LEDGER.md` were also retained as implementation references.

Feature claims are a dated benchmark snapshot, not permanent truth. Competitor capabilities can disappear, change plan tier, or move product surface. Ineractive therefore treats competitor evidence as **benchmark pressure**, never as architecture authority.

## 3. Current market map

| Product / family | Strong current capabilities relevant to Ineractive | Ineractive disposition |
|---|---|---|
| Replit Agent 4 | infinite design canvas; direct manipulation; responsive variants; parallel isolated tasks; shared project context; multi-artifact output; native/mobile direction; plan-while-building | BENCHMARK for parallel product work, canvas UX, artifact breadth and mobile |
| v0 / Vercel | prompt-to-product; existing Git import; branch/commit/PR flow; full code editor; production-like sandbox previews; design mode; integrations; deploy/domain path | BENCHMARK for Git-native generation, preview parity and source ownership |
| Lovable | prompt-to-product; Git integration; Supabase-class backend workflow; pre-publish security scanning; mobile builder control; generated-app MCP integration direction | BENCHMARK for publish security, remote control and AI-product interoperability |
| Bolt / Bolt.new | browser-resident full-stack generation; filesystem/server/package-manager/terminal loop; Bolt Cloud; Supabase; Figma/GitHub/Expo/Stripe integrations | BENCHMARK / donor family for browser build loop and integration breadth |
| Base44 | generated data/auth/backend/functions/hosting; security/access controls; code/developer workflow; RLS; custom domains; app-platform surface | BENCHMARK for integrated product backend and governed enterprise surface |
| Figma Make | design context + code; direct/visual editing; annotations; component/design-system context; publishing; collaboration | BENCHMARK for design/code round trip and live visual refinement |
| Google Stitch | AI-native infinite design canvas; multi-idea Agent Manager; code/design context; DESIGN.md; interactive prototypes; voice steering; MCP/SDK; export to build tools | BENCHMARK for design exploration, portable design truth and voice-first design |
| Google Antigravity / AI Studio path | agent-first editor/terminal/browser execution and browser prototyping direction | BENCHMARK for cross-surface agent execution; never a hard provider dependency |
| GitHub Copilot coding agents | repository-native agents; custom agents; reusable prompts/instructions; subagent orchestration; MCP; PR-centric delivery | BENCHMARK for repository-native agent governance |
| Cursor | multi-file agent work; terminal/tests; checkpoints; subagents; browser control; isolated cloud-agent/PR evidence patterns | BENCHMARK for agent ergonomics, checkpoints and browser/dev loop |
| Bubble | AI-assisted web/mobile generation; visual workflows; database/logic; native mobile; device preview; store-submission path | BENCHMARK for no-code editability and native product delivery |
| Wix / Harmony | prompt + visual editing; AI assistant; sites and app extensions; collaboration; data/API/plugin surfaces | BENCHMARK for visual/business-product breadth |
| Retool | AI-native internal app creation; production data connections; permissions/audit; workflows/agents; web/mobile; approval gates; MCP-assisted building | BENCHMARK for enterprise data/app governance |
| Webflow AI | AI site generation; visual design system; CMS; SEO/AEO; localization; code components and MCP direction | BENCHMARK for production web/CMS/marketing quality; note App Gen lifecycle changes |
| Framer | AI website generation; visual refinement; CMS; SEO; forms; analytics; managed publish/hosting | BENCHMARK for polished marketing-site workflow |
| Stunning | full-stack web/business systems; database/accounts/admin; GitHub export; domains; spreadsheets; bilingual/RTL; regional payments; mobile packaging; business agent/cowork direction | BENCHMARK for end-to-end business-product value and MENA relevance |
| Appsmith / ToolJet / Budibase | data sources; visual app construction; workflows; admin/internal tools; extension/integration patterns | REFERENCE for business-app primitives and admin/data UX |
| Plasmic / Webstudio / GrapesJS / Puck / Craft.js | visual composition and component/source editing patterns | REFERENCE / ADAPT under existing design contracts |
| Onlook / screenshot-to-code / OpenUI | source-mapped visual editing and multimodal UI generation | REFERENCE / ADAPT under P08/P09 |
| bolt.diy / Dyad / Open-Lovable / Libra / Open-Laudable / Doable | open/self-hosted/local-first builder mechanisms, provider choice, sandboxes, project lifecycle | DONOR/REFERENCE pool under existing provenance gates |
| OpenHands / Cline / Roo / Continue / Aider / Goose / SWE-agent | coding-agent context, tool use, terminal, repository execution and repair loops | REFERENCE for P03/P04/P07 agent harness mechanics |

## 4. Product-lifecycle evidence that changes the architecture

Provider lifecycle is itself a product risk.

As of this snapshot:

- GitHub Spark on github.com was retired in August 2026.
- Firebase Studio is on a sunset/migration path while Google shifts agentic development toward Antigravity and prototyping toward AI Studio.
- Webflow's full-stack App Gen path has been paused and is moving toward deprecation while other AI surfaces continue.

Therefore a capability is not "done" merely because one hosted provider supports it. Ineractive must make product state portable across provider change, revocation, deprecation and exit.

This reinforces P11-S00/P11-S03/P11-S11 and adds explicit **provider-sunset fixtures** to the portability benchmark.

## 5. Feature taxonomy: parity floor

The following is the competitive parity floor. A credible broad "AI product builder" claim must eventually cover every applicable row or explicitly mark it out of scope.

### 5.1 Product understanding

- natural-language intent;
- uploaded files/images/designs/code/data as context;
- explicit assumptions and clarification gate;
- Product Graph as durable product truth;
- requirement/data/privacy/locale/external-effect semantics;
- brownfield repository and backend reconstruction;
- explicit completeness blockers rather than silent guesses.

### 5.2 Build and coding

- full-stack project generation;
- incremental edits rather than regenerate-and-pray;
- real file/source ownership;
- terminal/package/test/build execution;
- model-agnostic generation;
- bounded multi-agent/parallel work;
- checkpoints/resume/replay;
- branch-isolated work and merge reconciliation;
- source-to-runtime observation and repair.

### 5.3 Visual product design

- live product preview;
- visual/direct manipulation;
- DOM/source/design binding;
- design-system ingestion;
- design variants and branch comparison;
- responsive state editing;
- screenshot/image/design import;
- on-canvas annotations;
- design critique and independent rendered evaluation;
- design-system portability such as DESIGN.md-like artifacts.

### 5.4 Data and backend

- schema/migrations;
- auth/tenancy;
- row-level access control;
- storage;
- realtime/functions/jobs;
- external integrations;
- spreadsheet/data import;
- safe seed/synthetic data;
- product-level admin/data studio;
- lifecycle/export/delete/retention semantics;
- backend reconstruction and reconciliation.

### 5.5 Git and ownership

- existing Git repository import;
- branch-per-change / branch-per-agent isolation;
- automatic commits with meaningful evidence;
- PR review/merge path;
- no silent direct-to-main agent write by default;
- exact-head qualification before promotion;
- repository remains user-owned;
- code export without proprietary trap.

### 5.6 Runtime and preview

- isolated sandbox;
- reproducible preview;
- production-like runtime parity for server/database/environment behavior;
- browser observation;
- logs/console/network evidence;
- deterministic external-effect boundaries;
- cross-browser/device/locale/RTL qualification;
- restore/recovery testing.

### 5.7 Assurance and publish safety

- lint/type/unit/component/browser/a11y/security checks;
- dependency/secret/backend/RLS checks;
- pre-publish security gate;
- proposed safe fixes with evidence;
- independent verification that cannot be bypassed by a generator claim;
- evidence bundle bound to exact source/runtime;
- release manifest and rollback path.

### 5.8 Deployment and operations

- preview deploy;
- production deploy;
- custom domains/TLS;
- environment/secrets;
- analytics/observability;
- backup/recovery where provider supports it;
- provider capability/preflight;
- degraded/revoked/expired handling;
- export/detach/reconnect;
- provider-sunset migration receipt.

### 5.9 Collaboration and project intelligence

- teams/roles;
- comments/annotations;
- parallel tasks;
- shared project context;
- approved durable memory;
- project skills;
- branch/variant comparison;
- action history/evidence;
- mobile/remote steering as an optional later surface.

### 5.10 Extensibility and generated AI products

- multiple model providers;
- MCP / Skills / OpenAPI;
- plugin/extension capabilities;
- product kits/templates;
- generated AI primitives;
- generated application can optionally expose its own typed MCP surface;
- generated-app AI provider remains owned/configured by the generated product, not coupled to Ineractive internals.

### 5.11 Mobile

- PWA baseline;
- Expo/React Native compiler path;
- device preview;
- native navigation/components;
- platform capability boundaries;
- user-owned signing/developer accounts;
- TestFlight/internal-track submission evidence before broader release claims.

### 5.12 Web and business quality

- SEO/AEO where applicable;
- sitemap/robots/canonical/social metadata;
- CMS/content/data workflows where product requires them;
- localization/RTL;
- commerce/payment/invoicing adapters only behind qualified external-effect contracts;
- MENA-specific product quality is a first-class benchmark dimension, not a theme toggle.

## 6. New benchmark requirements derived from the refresh

The existing roadmap already covers most of the parity floor. The refresh adds or strengthens the following requirements:

1. **Branch-safe agent delivery** — branch/worktree isolation and PR-first promotion are the default for autonomous changes.
2. **Production-like preview parity** — previews must exercise the same relevant server/runtime/backend/environment semantics required for production qualification.
3. **Pre-publish security gate** — dependency, secret, auth, RLS/backend, browser/security and supply-chain findings are visible before promotion.
4. **Generated-app MCP surface** — an optional typed capability surface may be emitted for generated products after auth/permission/audit qualification.
5. **Provider-sunset portability** — provider deprecation is a first-class failure fixture with export, migration, reconnect and ownership evidence.
6. **Physical-device mobile proof** — native/mobile claims require real-device preview and user-owned signing/submission evidence, not a responsive web screenshot.
7. **Portable design truth** — design rules/tokens/intent must be importable/exportable in an agent-readable product-owned artifact.
8. **Live parallel design/build steering** — parallel alternatives may be generated, observed and compared without contaminating the canonical branch.
9. **Competitive regression corpus** — market-baseline workflows become dated benchmark cases in the Evaluation Lab.
10. **Fast bounded decision plane** — a CLM-class verifier/ranker is evaluated as an optional fast decision provider under P03 rather than embedding routing policy in generators.

## 7. What Ineractive should do better than the market

The differentiator should not be "more prompts."

Ineractive should combine:

- **product truth** — Product Graph + design/data/runtime identity;
- **source ownership** — Git-native, exportable, user-owned code and backend;
- **provider neutrality** — replaceable model/runtime/backend/deployment adapters;
- **decision intelligence** — fast bounded routing/ranking plus full generative reasoning only where needed;
- **evidence-first delivery** — exact revision, exact runtime, exact findings, exact provenance;
- **safe external effects** — decisions do not equal permissions;
- **durable governed context** — memory is attributable, scoped, inspectable and revocable;
- **design/code round trip** — no silent divergence;
- **real browser/device proof** — not screenshot-only success;
- **exit portability** — a user can leave Ineractive without losing the product.

## 8. Source URLs checked for the 2026-09-24 refresh

The implementation team must re-check these pages when the owning Grain is shaped because plan tiers and product capabilities can change.

- https://replit.com/agent4
- https://replit.com/mobile-apps
- https://v0.dev/
- https://v0.dev/docs
- https://lovable.dev/blog/how-lovable-protects-your-apps-automatically
- https://lovable.dev/blog/agent-integrations
- https://lovable.dev/blog/mobile-app
- https://support.bolt.new/
- https://base44.com/features
- https://base44.com/developers
- https://help.figma.com/
- https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/
- https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-updates/
- https://firebase.google.com/docs/studio/migrating-project
- https://developers.googleblog.com/
- https://github.blog/changelog/
- https://bubble.io/
- https://webflow.com/
- https://www.wix.com/
- https://docs.retool.com/
- https://www.framer.com/
- https://stunning.so/
- https://cursor.com/docs
- https://docs.github.com/en/copilot

