# Ineractive Source Ledger

**Research snapshot:** 2026-09-24  
**Founder authority:** the founder states permission to use, copy, and adapt the named sources and relevant sources in the connected GitHub account.  
**Rule:** permission permits consideration; exact import revision, component mapping, dependency closure, security review, notices, and Ineractive-owned qualification remain required.

## 1. Adoption vocabulary

- COPY_SELECTIVE — copy a bounded implementation after exact provenance review.
- ADAPT — preserve mechanism/behavior behind Ineractive-owned contracts.
- DEPEND — use as a replaceable dependency after qualification.
- DEPEND_SELECTIVE — qualified dependency used only when the active FrontendQualityProfile/product requirement justifies it.
- PRESERVE — retain a compatible existing/imported architecture rather than migrating for novelty.
- OPTIONAL QUALIFIED SOURCE — source candidate considered only through the normal admission/provenance/security/quality gate.
- OPTIONAL EXTERNAL REGISTRY — discovery provider only; no candidate becomes trusted source before RegistryAdmissionGate.
- REFERENCE — architecture/product/design reference.
- PROCESS_REFERENCE — engineering/review/planning discipline.
- BENCHMARK — evaluation/reference only.

Never concatenate donor applications into the product architecture.

## 2. Primary AI app-builder donor pool

| Source | Primary value | Planning posture |
|---|---|---|
| stackblitz/bolt.new | prompt-to-app UX, WebContainer-era workspace patterns | ADAPT / COPY_SELECTIVE |
| stackblitz-labs/bolt.diy | multi-provider app generation, terminal/files/Git/MCP/local models | ADAPT / COPY_SELECTIVE |
| dyad-sh/dyad | local-first desktop app builder, BYOK, project lifecycle | ADAPT / COPY_SELECTIVE |
| firecrawl/open-lovable | conversational React generation and sandbox loop | ADAPT |
| nextify-limited/libra | full-stack generation/IDE/sandbox/deploy patterns | REFERENCE / ADAPT |
| codinit-dev/codinit-dev | local-first web/mobile builder patterns | ADAPT |
| Jamessdevops/micracode | local desktop workspace + Monaco + local provider ownership | ADAPT |
| totalumlabs/ai-app-builder-open | full-stack product surface, visual/data/deploy UX | REFERENCE / ADAPT |
| ishandutta2007/Open-Laudable | local-first full-stack generation | REFERENCE / ADAPT |
| SimaDevelopment/opsiforce | persistent isolated workspace + hosted generated apps | ADAPT |
| doable-me/Doable | self-hosted multi-tenant builder/security patterns | ADAPT |
| sa4hnd/vibra-code | mobile generation / native preview direction | LATER ADAPT |
| BuildingTechAlternatives/OpenThorn | browser BYOK generation and export patterns | ADAPT |
| mobius-os/mobius | agent workspace + on-demand application concept | REFERENCE |

## 3. Visual/design/code-editing pool

| Source | Primary value |
|---|---|
| onlook-dev/onlook | visual edits mapped to real React/Next source |
| wandb/openui | intent-to-UI and cross-framework component generation |
| abi/screenshot-to-code | screenshot/image to source and visual verification |
| plasmicapp/plasmic | mature visual component/page builder |
| webstudio-is/webstudio | code-oriented visual web builder |
| GrapesJS/grapesjs | extensible visual builder framework |
| chaibuilder/core | Next.js visual builder and typed block patterns |
| Puck | React visual editing/component registry concepts |
| Craft.js | editor-node/component interaction concepts |
| Penpot | open design-system/canvas reference |
| pbakaus/impeccable | design guidance, live visual iteration, deterministic AI-design detectors |
| Pentagram work/methodology | identity strategy: one central idea expressed across brand/product/motion; reference only, never copy a client identity |
| Anthropic Claude Design | design-system ingestion, multimodal design creation, direct/annotated refinement, design-to-build handoff | REFERENCE |
| Figma Make / Figma MCP / Code Connect / Skills / Make kits | native design/code round trip, design-system truth, annotations, Skills, real-code editing | REFERENCE / INTEGRATE |
| shadcn/ui | source-owned component distribution/registry format and AI-readable component supply | ADAPT / DEPEND_SELECTIVE |
| Base UI | unstyled accessible primitive base; current shadcn new-project default candidate | DEPEND_SELECTIVE |
| React Aria | accessible/internationalized primitive alternative | DEPEND_SELECTIVE |
| Radix Primitives | mature accessible primitive base; preserve compatible existing projects | DEPEND_SELECTIVE / PRESERVE |
| Storybook | component state workbench, interaction/a11y testing, MCP introspection | DEPEND_SELECTIVE |
| Magic UI | animated/marketing source components | OPTIONAL QUALIFIED SOURCE |
| Motion Primitives | source-owned motion components | OPTIONAL QUALIFIED SOURCE |
| tweakcn | shadcn theme/token exploration and possible import patterns | REFERENCE |
| 21st | external component discovery/registry/MCP catalog | OPTIONAL EXTERNAL REGISTRY |
| Agentation | structured visual annotation → selector/context feedback for coding agents | REFERENCE only unless separately license-qualified |
| stagewise | browser/DOM/console/debugger + agent co-working and visual change loop | REFERENCE; AGPL/code reuse requires explicit provenance/license decision |
| Domscribe | bidirectional DOM/source mapping and MCP context | REFERENCE / ADAPT after provenance review |
| Design Mode | browser visual manipulation and MCP handoff patterns | REFERENCE |

## 4. Agent/runtime/sandbox pool

- TheHalfMoon/kernux — primary internal capability kernel/runtime/browser/computer/secret/evidence reference.
- opensandbox-group/OpenSandbox — isolated execution.
- stablyai/orca — agent/computer-runtime patterns.
- TinyFish — browser agent/runtime patterns.
- Desktop Commander — host filesystem/terminal/computer integration patterns.
- OpenHands — coding-agent runtime and workspace patterns.
- Cline / Roo Code / Continue / Aider / Goose / SWE-agent — coding-agent context/tool/execution references.
- Agent Client Protocol, A2A, MCP, Agent Skills — interoperability references.
- FoundationAgents/OpenManus — inspectable general-agent, ToolCallAgent, planning, MCP, browser, sandbox, and data-analysis mechanisms; selective adaptation only after provenance review.
- Manus — Projects, Project Skills, approved self-updating context, Branch, Wide Research, scheduled tasks, sandbox/computer/browser trust patterns, and context-engineering reference.
- Anthropic Claude agent/harness publications — planner/generator/evaluator separation, build contracts, checkpoints, hooks, context continuation, and intent-aware safety layers.

## 5. Backend/business app pool

- Supabase — first-class V1 backend target.
- appsmithorg/appsmith — data/API/visual business-app patterns.
- ToolJet/ToolJet — visual apps, data sources, MCP, collaboration.
- Budibase/budibase — business apps/workflows/agents.
- NocoBase, Baserow, NocoDB, Saltcorn, Corteza, Windmill, Directus — data/workflow/admin patterns.

These sources inform backend UX and operational features; Supabase remains the first compiler target.

## 5A. Current competitive baseline references

These are BENCHMARK / REFERENCE sources rather than automatic code donors.

- Replit Agent 4 — infinite design canvas, parallel isolated tasks, shared collaboration, full-stack build, multi-artifact direction, and plan-while-building workflow.
- Bolt — integrated database/auth/functions/storage/secrets/analytics/domains and external Supabase/deployment/payment integration baseline.
- v0 / Vercel — prompt-to-live product flow including database, email notifications, domains, GitHub, and payment/database integrations.
- Lovable — prompt-to-product workflow plus built-in dependency/secret/database/RLS/code security scanning and external security-integration direction.
- Stunning — current full-stack business-system benchmark: real database/accounts/admin, spreadsheet-to-working-table import, GitHub source ownership, domains/hosting, mobile packaging, integrations, and live-business-data/agent direction; BENCHMARK/REFERENCE only.

Use these references to define market baseline and benchmark pressure. Do not let competitor feature breadth override Ineractive's evidence-first dependency order.

## 6. Internal TheHalfMoon source pool

Directly relevant:

- SpecGrain — recursive bounded planning and WorkPackets.
- Diffcipline — proof-before-done and exact-diff verification.
- HarnessMind — harness/context/tool provenance and optimization.
- Kernux — runtime/capability/browser/computer fabric.
- Ascout — test/browser/security/assurance evidence.
- Kodac — review/workflow/GitHub/qualification patterns.
- Sentrdel — security invariant and evidence patterns.
- Morize — governed project memory and context.
- Qdrat — roles, teams, workflows, approvals, business-app patterns.
- Himsat — local-first files/connectors/document intelligence.
- MESC — model/runtime qualification and reproducibility.
- Golam / Golam-research — local agent/runtime/memory research.
- Ecra — browser/search/agent execution patterns.
- Tarif — action authority/secret isolation/receipts.
- Flake — canonical planning/source-admission discipline.
- Winds — agent/runtime engineering evidence.
- wepld — research/source-gap methodology.
- commandF / commandMed / MedScale — typed contracts, provenance, verification, data workspace patterns.
- Zyara — rich entity/relationship/workflow/product-graph patterns.
- Wispral — voice/context/permission UX patterns.
- Signthos, MSTR, Delethos — evidence/governance/planning patterns where useful.

Surveyed connected repositories with no automatic adoption: Fanatir, Hikma, Coddev, ProtocolWISE, Trcel, Paina, Balott, kodac-phase-b-gate, and other connected repositories. Their existence is not implementation authority.

Private source material must not be published wholesale into this public repository without an explicit bounded transfer decision.

## 6A. Frontend quality/tooling references

- Vercel Web Interface Guidelines — versioned interface quality rule-pack reference.
- Vercel React Best Practices / agent-skills — React/Next performance and implementation rule-pack reference.
- React Doctor — deterministic React correctness/performance/security/accessibility/maintainability scan candidate.
- React Scan — optional runtime render-performance visualization/profiling reference.
- Next.js DevTools MCP — framework diagnostics/introspection adapter candidate.
- Playwright — browser/E2E/visual evidence.
- axe-core / @axe-core/playwright — automated accessibility findings; never sufficient alone for a compliance claim.
- Vitest — unit/component test baseline.
- TanStack Table — on-demand headless complex-table adapter candidate.
- TanStack Query — on-demand client/server cache/mutation adapter; not a default dependency for App Router products.
- Motion — on-demand complex motion/gesture engine; CSS/View Transitions first for simple effects.
- Zod — runtime boundary schema candidate.
- next-intl — Next.js i18n adapter candidate; locale semantics remain above the library.

Exact versions and security state are requalified at implementation time.

## 6B. Creative media and decision-routing sources

| Source | Primary value | Planning posture |
|---|---|---|
| freestylefly/awesome-gpt-image-2 @ `0dc09c46c8a30b1fdd89c18cc78a894dac2104e3` | Prompt-as-Code schemas, industrial visual templates, reusable style Skill/data patterns, visual-case/evaluation UX | ADAPT / COPY_SELECTIVE / BENCHMARK; third-party gallery items still require item-level provenance/rights review |
| robbietilton/Compositor @ `a19db9011282399785dc18efcfded904627bdcc2` | layers/masks/transforms/selections/content-aware fill/retouching/adjustments for bounded product-asset refinement | ADAPT / COPY_SELECTIVE; do not turn Ineractive into a general Photoshop clone |
| X: robbietilton/status/2100946395972976843 | product/interaction demonstration associated with Compositor | REFERENCE; GitHub repository is the primary code source |
| X: higgsfield_ai/status/2101117855622463719 | creative-media routing research lead | REFERENCE pending direct post capture; surrounding same-account evidence supports decision-routing -> media-provider separation, but must not be misattributed to the exact post |
| X: nereasolenne/status/2101265048824074535 | animated-web/design workflow research lead | REFERENCE only; tutorial/award claims are not acceptance evidence |
| convaiinnovations/laya (Hub head observed as `1c5edc1` on 2026-09-20) | bounded System-1 typed decisions, calibrated probabilities/confidence, routing/scoring benchmark | OPTIONAL QUALIFIED SOURCE / BENCHMARK / ADAPT; resolve full immutable Hub SHA before import |

Canonical integration direction is documented in `docs/research/CREATIVE_MEDIA_DECISION_ROUTING_2026-09-20.md`.

The architecture must preserve this separation:

```text
VisualPromptProtocol
-> MediaGenerationRequest
-> deterministic eligibility filter
-> bounded decision routing
-> qualified MediaProviderAdapter
-> CreativeAsset candidates
-> independent evaluation
-> bounded raster/compositing refinement
-> provenance-bound Product Graph / DesignSystemRevision asset
```

A decision model never receives hard permission authority. A media provider never becomes the canonical router. Generated or edited assets never bypass provenance and evidence requirements.

## 7. Process and review sources

### mattpocock/skills

Use lightly:

Adopt:
- shared domain vocabulary;
- to-spec synthesis from existing conversation;
- tracer-bullet tickets;
- domain modeling;
- deep-module/codebase design;
- TDD/diagnosis principles;
- ADRs only for hard-to-reverse surprising tradeoffs.

Do not adopt:
- relentless grilling as the product UX;
- mandatory long interviews before first preview.

Ineractive applies a question budget and assumption ledger instead.

### alibaba/open-code-review

PROCESS_REFERENCE / designated review engine.

Adopt:
- deterministic file selection;
- grouping;
- path/rule targeting;
- agent review;
- machine-readable findings;
- file-coverage accounting;
- CI/agent integration patterns.

OCR does not grant PASS.

### Decision-model ecosystem

REFERENCE for bounded typed choices, scores, confidence-aware routing, and gating. Concrete runtime providers are intentionally not declared in this public planning ledger.

Use bounded decision models for classification/routing/gating rather than general code generation. Hard permissions and deterministic invariants stay in code.

## 7A. 2026-09-24 source refresh

### Contrastive decision model

| Source | Exact reviewed revision | Candidate value | Planning posture |
|---|---|---|---|
| `Contrastive-LM/CLM` | `7956937c58ed5839c06ddc4dc6b6b61c3a3e4094` | fast typed NOUL/CHOICE/SCORE decisions, candidate ranking, best-of-N verification, action-vector caching, fine-tunable projection heads | ADAPT / DEPEND_SELECTIVE / BENCHMARK behind P03 `DecisionPlaneAdapter`; never authorization authority |

The founder explicitly states permission to use/copy/adapt this source. The reviewed public
repository and reference weights state Apache-2.0. Permission and license eligibility do not
skip exact import provenance, dependency/model/data-rights review, NOTICE handling, sandbox/runtime
qualification, security review, or Ineractive-owned evaluation.

CLM is **not** a mandatory local V1 dependency. Its reference serving path uses a Qwen3-8B-class
pooling encoder and accelerator-oriented examples, so Ineractive must keep deterministic/Jev/generative
fallbacks and may use user-owned or organization-owned qualified endpoints. A decision score cannot
create a capability Grant or security PASS.

See:

- `docs/research/CLM_INTERNAL_SOURCE_DEEP_DIVE_2026-09-24.md`;
- `docs/canonical/PLAN_REVISION_2026-09-24.md`.

### Internal source consolidation

The 2026-09-24 deep dive strengthens these source assignments:

- **Kernux** — capability/grant boundary; ContextSource/ContextItem/ContextBundle; local privacy;
  egress/provider lifecycle evidence.
- **Golam** — authority/taint/freshness-bearing context; candidate-vs-durable memory; live truth
  outranks stale memory; ranking cannot raise authority.
- **Morize** — governed memory writer and user-controlled durable memory.
- **Ascout** — exact-target assurance contracts and generated-app/browser/security evidence.
- **MESC** — content-addressed experiment/model/data/evaluation qualification.
- **Himsat + Wispral** — multi-engine voice routing and speech-as-evidence-not-authority.
- **MedScale** — capability-scoped extension ecosystem, re-consent, SBOM/revocation patterns.

Whole donor architectures do not become Ineractive policy. Reuse remains bounded behind
Ineractive-owned contracts.

### Competitive lifecycle refresh

In addition to the existing competitive baseline, current benchmark/reference coverage now
explicitly includes:

- Base44;
- Figma Make;
- Google Stitch;
- Google Antigravity / Google AI Studio migration direction;
- GitHub Copilot coding agents;
- Cursor;
- Bubble;
- Wix/Harmony;
- Retool;
- Webflow AI;
- Framer.

Provider lifecycle changes are benchmark evidence too. The 2026-09-24 research snapshot records
GitHub Spark retirement, Firebase Studio sunset/migration direction, and Webflow App Gen lifecycle
changes as concrete reasons to require P11 provider-deprecation/retirement portability fixtures.

Detailed feature evidence and dated source URLs are recorded in
`docs/research/COMPETITIVE_LANDSCAPE_2026-09-24.md`.

## 8. Import rule

Every future code import record must capture:

- source repository;
- immutable revision;
- source path(s);
- destination path/module;
- use mode: copy/adapt/depend;
- founder-authority reference;
- license/notice obligations where applicable;
- dependency closure;
- security impact;
- modifications;
- verification;
- reviewer evidence.

## 9. Product ownership rule

Donor internals do not become public Ineractive contracts.

The canonical contracts belong to Ineractive:

- Product Graph;
- WorkPacket integration;
- Harness events;
- ModelTask / DecisionTask;
- CapabilityRequest / Grant;
- Runtime contract;
- BackendPlan;
- Design model;
- Finding / Evidence / Claim Assessment.

A donor is replaceable when these contracts survive its removal.
