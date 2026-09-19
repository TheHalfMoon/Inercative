# Ineractive Source Ledger

**Research snapshot:** 2026-09-19  
**Founder authority:** the founder states permission to use, copy, and adapt the named sources and relevant sources in the connected GitHub account.  
**Rule:** permission permits consideration; exact import revision, component mapping, dependency closure, security review, notices, and Ineractive-owned qualification remain required.

## 1. Adoption vocabulary

- COPY_SELECTIVE — copy a bounded implementation after exact provenance review.
- ADAPT — preserve mechanism/behavior behind Ineractive-owned contracts.
- DEPEND — use as a replaceable dependency after qualification.
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

## 4. Agent/runtime/sandbox pool

- TheHalfMoon/kernux — primary internal capability kernel/runtime/browser/computer/secret/evidence reference.
- opensandbox-group/OpenSandbox — isolated execution.
- stablyai/orca — agent/computer-runtime patterns.
- TinyFish — browser agent/runtime patterns.
- Desktop Commander — host filesystem/terminal/computer integration patterns.
- OpenHands — coding-agent runtime and workspace patterns.
- Cline / Roo Code / Continue / Aider / Goose / SWE-agent — coding-agent context/tool/execution references.
- Agent Client Protocol, A2A, MCP, Agent Skills — interoperability references.

## 5. Backend/business app pool

- Supabase — first-class V1 backend target.
- appsmithorg/appsmith — data/API/visual business-app patterns.
- ToolJet/ToolJet — visual apps, data sources, MCP, collaboration.
- Budibase/budibase — business apps/workflows/agents.
- NocoBase, Baserow, NocoDB, Saltcorn, Corteza, Windmill, Directus — data/workflow/admin patterns.

These sources inform backend UX and operational features; Supabase remains the first compiler target.

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
