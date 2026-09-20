# Claude Design, Figma, Manus, and OpenManus — Capability and Harness Research

**Research date:** 2026-09-20  
**Status:** research only; no implementation authority  
**Repository baseline:** main at e8014ea1feb9cb9c37a05f2399f23b33465490fa

## 1. Purpose

This document surveys the strongest current design-agent and general-agent product patterns from:

- Anthropic Claude Design and the wider Claude agent stack;
- Figma Design Agent, Figma Make, Make kits, MCP, and Skills;
- commercial Manus;
- FoundationAgents/OpenManus.

The objective is not to concatenate products. The objective is to extract mechanisms that can make **Ineractive** a stronger AI Product Compiler while preserving its existing architecture:

- Product Graph as semantic center;
- real code and user ownership;
- capability-before-power;
- provider-neutral core contracts;
- minimal user interrogation;
- exact evidence rather than agent self-report;
- Supabase as the first backend compiler target;
- generated-product portability;
- SpecGrain, Alibaba Open Code Review, and Diffcipline as delivery governance.

This research intentionally does **not** mutate specs/tasks.md or current SpecGrain state while P00 is in progress.

---

# 2. Executive synthesis

The source families reveal four complementary operating systems.

## 2.1 Claude: Design + Evaluation + Safety Harness

The strongest transferable ideas are:

- design-system ingestion from code and design files;
- conversational, direct-manipulation, inline-comment, and control-based iteration;
- structured handoff from design intent to coding;
- generator/evaluator separation;
- requirements-derived build contracts;
- live-browser evaluation rather than screenshot-only review;
- adaptive compaction/context reset;
- checkpoints;
- lifecycle hooks;
- subagents and background work;
- prompt-injection screening on tool output;
- action classification against user intent;
- deny-and-continue rather than constant human interruption.

## 2.2 Figma: Design Truth + Code/Canvas Round Trip

The strongest transferable ideas are:

- native editable canvas objects rather than flattened AI images;
- design system as shared source of truth;
- design-to-code and code-to-design;
- Code Connect/component mapping;
- real-code editing with branch/commit/PR;
- annotations anchored to the live interface;
- direct property editing;
- reusable Skills;
- persistent Guidelines;
- Make kits combining code packages, tokens/styles, and operating instructions;
- MCP as a structured bridge rather than a prompt dump.

## 2.3 Manus: Persistent Work OS

The strongest transferable ideas are:

- persistent Projects with instructions, files, connectors, chats, and skills;
- Project Skills;
- project context that proposes self-updates after useful work;
- Branch: point-in-time context reused in parallel directions;
- Scheduled Tasks bound to the project/artifact where they belong;
- Wide Research as parallel general-agent execution;
- per-task isolated cloud computers;
- scoped local-computer access;
- authenticated browser operation;
- connectors as first-class integrations;
- Plan Mode;
- versioning, copy, rollback, and last-good publishing;
- file-system externalization of large context;
- KV-cache-aware context engineering;
- stable tool definitions with state-aware masking instead of constant tool-list mutation.

## 2.4 OpenManus: Inspectable Implementation Patterns

OpenManus provides concrete mechanisms for:

- BaseAgent lifecycle;
- ReAct think/act loop;
- ToolCallAgent;
- ToolCollection;
- Terminate;
- AskHuman;
- bounded step counts;
- duplicate/stuck detection;
- MCP clients over SSE and stdio;
- preservation of MCP server instructions;
- Browser Use MCP;
- Python execution;
- file editing;
- planning with step states;
- multi-agent PlanningFlow;
- Daytona sandbox;
- sandbox browser/files/shell/vision;
- data-analysis specialist;
- A2A examples.

OpenManus is useful implementation evidence, but its current architecture is materially weaker than Ineractive's planned governance for durable memory, capability security, exact evidence, and long-running state.

---

# 3. Claude Design capability inventory

Primary source: Anthropic, "Introducing Claude Design by Anthropic Labs", 2026-04-17.

## 3.1 Creation surfaces

Claude Design can create:

- designs;
- interactive prototypes;
- product wireframes;
- product mockups;
- design explorations;
- slides;
- pitch decks;
- presentations;
- one-pagers;
- landing pages;
- social assets;
- campaign visuals;
- code-powered prototypes;
- experiences using voice;
- video;
- shaders;
- 3D;
- built-in AI behavior.

### Ineractive implication

Do not restrict the Design Engine conceptually to styling web screens. V1 compilation can remain web-focused, but the internal design representation should be extensible to richer product experience artifacts.

## 3.2 Input and context ingestion

Claude Design can begin from:

- text;
- images;
- DOCX;
- PPTX;
- XLSX;
- a codebase;
- design files;
- captured elements from an existing website.

During onboarding it can read a team's codebase and design files to derive a design system. Teams can maintain more than one design system.

### Ineractive implication

Add a future **Design Context Compiler** that can ingest:

~~~text
source code
component library
CSS/tokens
Figma
screenshots
existing website
brand documents
reference assets
PRODUCT.md / BRAND.md / DESIGN.md
~~~

and produce a versioned **Design System Model** instead of passing raw material into every model call.

## 3.3 Refinement surfaces

Claude Design supports:

- conversation;
- inline comments on elements;
- direct text editing;
- direct visual edits;
- generated custom sliders/knobs;
- fine-grained spacing controls;
- color controls;
- layout controls;
- applying a local correction across a broader design.

### Ineractive implication

Add an **Intent Locality Model**.

A design change may originate from:

~~~text
global chat
selected element
anchored annotation
property panel
design token
multi-selection
named component
whole-product design rule
~~~

The harness must know whether the requested scope is:

~~~text
local instance
component-wide
token-wide
page-wide
product-wide
~~~

before mutating source.

## 3.4 Design-system behavior

Claude Design can:

- infer a team design system from code/design files;
- automatically apply colors, typography, and components;
- refine the system over time;
- maintain multiple systems.

### Ineractive implication

DESIGN.md should not be treated as static prose. It should be one projection of a versioned **Design Constitution** connected to:

- source components;
- tokens;
- asset rules;
- typography;
- layout grammar;
- motion;
- content voice;
- accessibility;
- responsive behavior;
- allowed deviations.

## 3.5 Collaboration

Claude Design provides:

- private documents;
- organization-scoped sharing;
- link-based internal viewing;
- edit permissions;
- shared/group conversation around design.

### Ineractive implication

P12 collaboration should eventually support artifact-scoped conversation and anchored annotations, not only generic project comments.

## 3.6 Export and handoff

Claude Design supports:

- internal organization URL;
- folder export;
- Canva;
- PDF;
- PPTX;
- standalone HTML.

It creates a handoff bundle for Claude Code containing design artifacts and design intent.

### Ineractive implication

Create an internal **Design-to-Build Handoff Artifact** containing:

~~~text
Product Graph revision
Design System revision
selected direction
design intent
interaction intent
component/token bindings
responsive behavior
assets
annotations
acceptance criteria
provenance
~~~

Even inside one product, the boundary between intent and implementation should be explicit.

---

# 4. Claude agent and harness inventory

## 4.1 Core agent loop

A strong general pattern is:

~~~text
goal
→ inspect
→ plan
→ act with tools
→ observe ground truth
→ update approach
→ stop / escalate
~~~

The important lesson is that environment feedback is part of the intelligence system.

## 4.2 Planner / Generator / Evaluator

Anthropic's March 2026 long-running application harness used a three-agent pattern.

### Planner

- expands a short prompt into a richer product spec;
- focuses on product context and high-level technical design;
- intentionally avoids over-specifying low-level implementation too early.

### Generator

- implements;
- historically worked feature-by-feature;
- uses Git;
- receives external evaluator feedback;
- repairs.

### Evaluator

- is separate from the generator;
- uses Playwright against the live app;
- tests UI, API, and database behavior;
- grades explicit criteria;
- reports concrete defects.

### Build-contract negotiation

Before a chunk is built, producer and evaluator can agree on what "done" means.

### Ineractive implication

Strengthen producer/verifier separation into a typed **Build Contract**:

~~~text
requested capability
Product Graph slice
expected behavior
negative behavior
visible UX state
data mutations
security invariants
browser journeys
backend assertions
design criteria
evidence requirements
~~~

The producer may propose the contract, but the verifier should independently challenge it when risk, novelty, or uncertainty justify the extra cost.

## 4.3 Design evaluator

Anthropic's design harness used explicit criteria around:

- design quality/coherence;
- originality;
- craft;
- functionality.

The key lesson is not the exact scoring. Subjective quality becomes more tractable when taste is expressed as explicit critique dimensions and a separate evaluator uses the real rendered product.

### Ineractive implication

A **Design Evaluation Profile** can compose:

~~~text
brand identity
design-system compliance
originality
information hierarchy
craft
interaction clarity
accessibility
responsive behavior
content credibility
product fit
~~~

Do not collapse taste into one universal score.

## 4.4 Context reset vs compaction

Two useful continuation mechanisms:

### Compaction

Compress earlier context while preserving the current session.

### Reset with structured handoff

Start a fresh agent with a deliberate handoff artifact.

Different model generations can need different strategies.

### Ineractive implication

Add a **Context Continuation Policy**:

~~~text
CONTINUE
COMPACT
RESET_WITH_HANDOFF
BRANCH
DELEGATE_FRESH
~~~

based on:

- context pressure;
- model capability;
- task phase;
- accumulated failures;
- semantic drift;
- WorkPacket state.

## 4.5 Checkpoints

Claude Code can checkpoint source state and rewind code, conversation, or both.

### Ineractive implication

Distinguish:

~~~text
SourceCheckpoint
ProductGraphCheckpoint
RunCheckpoint
DesignCheckpoint
ConversationBranchPoint
ExternalStateReceipt
~~~

Git cannot rewind a remote database or external side effect; external receipts remain separate.

## 4.6 Hooks

Claude Code hooks can trigger deterministic actions around lifecycle events.

### Ineractive implication

Add a typed **Lifecycle Hook Bus**:

~~~text
before.plan
after.product_graph_change
before.source_write
after.source_write
before.tool_call
after.tool_call
before.commit
after.commit
before.deploy
after.deploy
on.failure
on.checkpoint
~~~

Hooks must be capability-scoped and evidence-producing. Repository hooks do not gain ambient authority.

## 4.7 Subagents and background tasks

Claude supports:

- specialized subagents;
- parallel delegated work;
- background processes such as dev servers.

### Ineractive implication

Use capability specialists, not role-play personas. Parallelism is justified when work is independent and write surfaces do not conflict.

## 4.8 Auto-mode safety

Anthropic's 2026 auto-mode design uses two important defenses.

### Input layer

A prompt-injection probe screens tool outputs before they enter the main context.

### Output layer

A separate action classifier evaluates high-risk proposed actions against user intent.

Important design choices include:

- low-risk/read-only operations bypass expensive classification;
- in-project source edits may receive a lower-risk path;
- dangerous shell/network/external actions get stronger gates;
- the classifier sees user intent plus the executable action rather than the generator's persuasive explanation;
- subagent delegation and return can be separately screened;
- denied actions return to the agent so it can attempt a safer route;
- repeated denials escalate instead of looping forever.

### Ineractive implication

Evolve the Capability Kernel toward:

~~~text
Tool Output
   ↓
Untrusted-Content Probe
   ↓
Harness Context
   ↓
Action Proposal
   ↓
Deterministic Capability Policy
   ↓
Intent Alignment Guard when risk requires
   ↓
Grant / Deny / Human Gate
   ↓
Execution
~~~

This complements, not replaces, sandboxing and egress controls.

---

# 5. Figma capability inventory

## 5.1 Figma Make

Current Figma Make combines:

- prompting/dictation;
- design/style context;
- interactive web preview;
- real code;
- visual editing;
- design-system packages;
- Guidelines;
- Skills;
- MCP/connectors;
- web/reference context;
- publishing.

## 5.2 Make in the local codebase

The current beta supports:

- open a local repository;
- clone GitHub;
- operate against the actual running app;
- real-data preview;
- select elements;
- edit properties;
- annotate rendered UI;
- describe changes in chat;
- create/switch branches;
- commit prompts/changes;
- push;
- open GitHub PRs;
- run multiple prompt sessions concurrently.

Current scope is UI-centric rather than full backend/infrastructure/native mobile.

### Ineractive opportunity

Ineractive should exceed this with:

- frontend and backend semantics;
- Supabase schema/RLS/functions;
- Product Graph propagation;
- browser/runtime proof;
- exact review/proof;
- production-safe migration behavior.

## 5.3 Figma MCP

Figma MCP can expose:

- components;
- variables;
- layout;
- design context;
- Code Connect mappings;
- design-to-code workflows;
- code-to-design workflows;
- native canvas mutation.

### Ineractive implication

Use a **Design Tool Adapter** rather than embedding Figma-specific structures into core semantics.

Canonical concepts:

~~~text
DesignDocument
DesignSelection
DesignComponent
DesignVariable
DesignToken
DesignLayout
DesignBinding
CanvasMutation
~~~

Figma becomes one adapter.

## 5.4 Write to canvas

The figma-use skill creates and edits native Figma content:

- frames;
- components;
- variables;
- auto layout;
- design-system assets.

### Ineractive rule

Future canvas integrations should prefer native editable structure over screenshots or flattened artifacts.

## 5.5 Code-to-canvas and canvas-to-code

Figma supports both directions:

~~~text
code → Figma
Figma → code
~~~

With component mappings, code can correspond to real design-system components.

### Ineractive implication

Add **Round-Trip Design Binding**:

~~~text
ProductComponentID
↔ SourceSymbol
↔ DesignComponentID
↔ DesignSystemComponentID
~~~

Support drift states:

~~~text
CLEAN
CODE_AHEAD
DESIGN_AHEAD
DIVERGED
UNBOUND
~~~

Never silently choose one side when both changed independently.

## 5.6 Code Connect

Code Connect maps design components to production components.

### Ineractive implication

Expand source bindings into a **Semantic Component Binding** that knows:

- Product Graph component;
- source symbol;
- design component;
- design-system package/version;
- supported variants;
- token inputs;
- responsive contract.

## 5.7 Skills

Figma describes Skills as plain-text reusable workflows guiding:

- which MCP tools to use;
- their order;
- how results should be applied.

Examples include:

- connect design components to code;
- generate design-system rules;
- translate designs into code;
- generate/update libraries;
- accessibility/design polish;
- handoff audit.

### Ineractive implication

Skills should become first-class before a full plugin marketplace.

Scopes:

~~~text
system
organization
project
user
imported
~~~

Skill content may include:

~~~text
SKILL.md
scripts
templates
fixtures
references
schemas
~~~

Skills never grant capabilities.

## 5.8 Guidelines

Figma Make supports durable Markdown guidelines, including multiple files and generated guidance from npm packages/design libraries.

Guidelines can capture:

- component usage;
- variants;
- tokens;
- code conventions;
- design-system quirks;
- behavior/personality.

Figma explicitly warns that more context is not always better.

### Ineractive implication

Replace giant standing instruction files with a **layered context tree**:

~~~text
.ineractive/
  context/
    product.md
    brand.md
    design/
      principles.md
      typography.md
      layout.md
      motion.md
      accessibility.md
      components/
    domain/
      vocabulary.md
    backend/
      authorization.md
  skills/
~~~

The Context Compiler selects only relevant fragments.

## 5.9 Make kits

A Make kit can combine:

- npm design-system package;
- Figma variables/styles;
- Guidelines.

### Ineractive implication

Eventually support a **Product Kit**:

~~~text
component package
design tokens
brand assets
design-system bindings
domain conventions
project skills
verification rules
starter Product Graph fragments
~~~

This accelerates construction without turning Ineractive into a template marketplace.

## 5.10 Plan mode and concurrent prompt work

Figma supports planning and multiple concurrent prompt sessions.

### Ineractive implication

Use SpecGrain/WorkPackets underneath:

- inferred plan for routine low-risk edits;
- explicit Plan View for material changes;
- queue of ChangeIntents;
- parallel independent WorkPackets when write surfaces are disjoint.

---

# 6. Commercial Manus capability inventory

## 6.1 Projects

Manus Projects persist:

- instructions;
- reference files;
- related chats;
- connectors;
- project skills;
- recurring context.

### Ineractive implication

The UI can expose project memory later, but the harness-level durable project context should arrive earlier because Skills, design context, and long-running work depend on it.

## 6.2 Project Skills

Project Skills provide a curated project-specific workflow library.

### Ineractive implication

A Skill should carry:

~~~text
id
version
scope
purpose
trigger hints
required tools
required capabilities
required context selectors
input schema
output/evidence contract
risk class
provenance
~~~

A skill does not grant its own tools or secrets.

## 6.3 Self-updating Projects

Manus can propose updates to:

- project instructions;
- files;
- examples;
- terminology;
- workflows;
- skills.

Updates require approval.

### Ineractive implication

Add a **Project Learning Loop**:

~~~text
proven work
→ extract reusable learning candidates
→ classify:
   decision
   convention
   domain fact
   design rule
   repair pattern
   skill improvement
→ propose context diff
→ approval/policy
→ versioned update
~~~

Do not write permanent memory silently after every chat.

## 6.4 Branch

Manus can fork from a message/context point and inherit instructions, files, and history while preserving the original.

### Ineractive implication

Add **Exploration Branches** binding:

~~~text
ConversationBranch
ProductGraphBranch
DesignBranch
CodeWorktree
~~~

This supports trying several directions before merging one. Git alone is insufficient because product/design/context can diverge before source exists.

## 6.5 Wide Research

Manus uses parallel general-purpose agents for independent subtasks and explicit synthesis. Official help currently describes up to 20 concurrent subtasks in Wide Research.

### Ineractive implication

Build a future **Wide Work** primitive, not a "20 agents" gimmick.

Good cases:

- source/competitor research;
- multiple design directions;
- component audit;
- many-page QA;
- cross-browser/device validation;
- bulk assets;
- independent migration/security checks.

Avoid it for deeply sequential work.

## 6.6 Scheduled Tasks

Manus can bind recurring work to:

- task;
- Project;
- web app;
- recurring artifact;
- connectors;
- execution environment.

### Ineractive implication

Separate:

### Generated-app schedules

Cron/jobs inside the user's product.

### Ineractive automation schedules

Examples:

- dependency audit;
- weekly accessibility audit;
- design-system drift review;
- production health report;
- analytics-driven improvement report.

The second category requires capability/spend budgets and proof.

## 6.7 Sandbox and cloud computer

Manus runs tasks in isolated cloud VMs with:

- filesystem;
- network;
- browser;
- software tools;
- parallel execution.

### Ineractive implication

This validates the existing Runtime Fabric direction. Distinguish ephemeral build sandboxes from persistent user-owned/persistent cloud runtime classes.

## 6.8 My Computer

Manus can work with authorized local folders and terminal commands and supports allow-once vs durable trust.

### Ineractive implication

Future desktop access should use scoped durable grants rather than a global computer-access toggle.

Example:

~~~text
filesystem.read:<project>
filesystem.write:<project>
process.run:pnpm
expiry/project scope
~~~

## 6.9 Browser Operator / Preferred Browser

Manus can operate cloud and user-authenticated browsers.

### Ineractive implication

Expose different browser trust classes:

~~~text
PreviewBrowser
TestBrowser
ResearchBrowser
AuthenticatedUserBrowser
~~~

They must not share the same capabilities.

## 6.10 Connectors

Manus Projects can use connectors while each team member keeps their own account authorization.

### Ineractive implication

Separate:

~~~text
Connector = capability/data transport
Skill     = workflow/operating method
~~~

## 6.11 Plan Mode

Manus Plan Mode exposes a reviewable plan before material execution.

### Ineractive implication

SpecGrain is stronger underneath. The UI should surface a lightweight Plan View only when impact/irreversibility warrants it.

## 6.12 Versioning / copy / rollback / auto-publish

Manus supports:

- rollback;
- copy/duplicate;
- branch-like experimentation;
- auto-publish;
- retaining stable live output when a candidate fails.

### Ineractive implication

Publish through:

~~~text
Candidate
→ Proof
→ Preview
→ Qualify
→ Promote
~~~

A failed candidate never replaces the last-known-good release.

---

# 7. Manus context-engineering lessons

## 7.1 Stable prompt prefix and cacheability

Manus recommends:

- stable system prefix;
- deterministic serialization;
- append-only context where possible;
- explicit cache breakpoints when supported;
- avoiding needless mutation near the beginning of context.

### Ineractive addition

Measure and optimize:

~~~text
cache hit ratio
effective context size
required-context retention
optional-context waste
~~~

Provider-specific caching stays behind ModelAdapter.

## 7.2 Mask tools instead of constantly removing them

Manus reports that changing visible tool definitions mid-run can break caching and confuse tool references.

### Ineractive addition

Use:

~~~text
Stable Tool Catalog
        ↓
Eligibility / Capability Mask
        ↓
Allowed action set
~~~

Use stable namespaces:

~~~text
browser.*
shell.*
repo.*
git.*
supabase.*
design.*
figma.*
deploy.*
research.*
~~~

When provider APIs require changing tool lists, preserve stable tool IDs/catalog revisions and record every change.

## 7.3 File system as external context

Large observations can live outside active model context.

### Ineractive addition

Formalize an **Artifact Store** for:

- logs;
- screenshots;
- DOM;
- traces;
- reports;
- research;
- captures;
- build artifacts;
- database plans.

Pass summaries and stable references; retrieve details on demand.

## 7.4 Recite active objective

Manus keeps active objectives near the context tail.

### Ineractive addition

Generate a deterministic **Execution Header** each turn:

~~~text
Current WorkPacket
Current requirement
Current attempt
Allowed write surface
Required proof
Unresolved blockers
Budget remaining
~~~

## 7.5 Keep failures

Failed actions and stack traces are useful evidence.

### Ineractive addition

Maintain a structured Failure Ledger. Summarize old failures only when context pressure requires it; never erase the historical evidence.

## 7.6 Avoid repetitive demonstration ruts

Skills should teach principles, constraints, and workflow rather than flooding context with repetitive action transcripts.

---

# 8. OpenManus concrete architecture

Exact repository inspected: **FoundationAgents/OpenManus**.

## 8.1 BaseAgent

Current implementation includes:

- IDLE;
- RUNNING;
- FINISHED;
- ERROR;
- message memory;
- max_steps;
- step loop;
- duplicate-response stuck detection;
- strategy-change prompt;
- cleanup.

### Ineractive improvement

Use richer durable states:

~~~text
PLANNED
ADMITTED
RUNNING
WAITING_EXTERNAL
VERIFYING
SUCCEEDED
FAILED
BLOCKED
INCONCLUSIVE
~~~

## 8.2 ReActAgent

OpenManus implements:

~~~text
think
→ act
→ observe
→ repeat
~~~

### Ineractive improvement

Use typed stages where appropriate:

~~~text
ContextCompile
Decision/Route
ActionProposal
CapabilityAdmission
Execute
Observe
Assess
~~~

## 8.3 ToolCallAgent

OpenManus provides:

- tool choice NONE/AUTO/REQUIRED;
- JSON argument parsing;
- ToolCollection;
- sequential execution;
- errors;
- image results;
- termination;
- output truncation;
- cleanup.

### Ineractive improvement

Every tool descriptor additionally needs:

~~~text
risk class
capability requirement
side-effect class
idempotency
resource scope
evidence emitted
redaction rules
retry semantics
~~~

## 8.4 General Manus agent

Default/OpenManus agent mechanisms include:

- PythonExecute;
- StrReplaceEditor;
- AskHuman;
- Terminate;
- MCPClients;
- Browser Use MCP.

Browser Use CLI 3.0 is exposed through MCP with persistent browser-session behavior and native browser execution/screenshot tools.

### Ineractive lesson

Preserve provider/server instructions as provenance, but never treat arbitrary MCP server instructions as higher-priority trusted authority.

## 8.5 MCPClients

OpenManus supports:

- SSE;
- stdio;
- multiple servers;
- discovery;
- tool proxying;
- text results;
- image results;
- server instructions;
- tool-name prefixing/sanitization;
- disconnect/cleanup.

### Ineractive improvement

Add:

- server trust identity;
- installation provenance;
- capability mapping;
- tool risk;
- user/org approval;
- catalog revision;
- output prompt-injection screening;
- secret scope;
- network scope;
- execution receipt.

## 8.6 PlanningTool

OpenManus can create/update/list/get/activate/mark/delete plans.

Statuses:

- not started;
- in progress;
- completed;
- blocked.

### Limitation

It is an in-memory planning utility, not evidence-backed delivery governance.

### Ineractive rule

Do not replace SpecGrain with it. Reuse only useful Plan View interaction concepts.

## 8.7 PlanningFlow

PlanningFlow:

- generates a concise plan;
- can route steps to executors;
- chooses the current active step;
- runs agent;
- marks progress;
- finalizes.

### Ineractive improvement

Use WorkGraph dependencies and explicit write ownership, not labels parsed from step text.

## 8.8 SandboxManus

OpenManus integrates Daytona:

- sandbox browser;
- sandbox files;
- sandbox shell;
- sandbox vision;
- VNC preview;
- web preview;
- lifecycle cleanup.

### Ineractive implication

Useful donor mechanisms may be adapted after provenance gates, but the Kernux/Ineractive capability contract remains architectural authority.

## 8.9 DataAnalysis

OpenManus includes a specialist using:

- Python;
- planning;
- visualization preparation;
- visualization tools.

### Ineractive implication

Represent specialists as capability bundles rather than permanent character/personality classes.

## 8.10 A2A

OpenManus includes Agent2Agent protocol examples and skill/capability metadata.

### Ineractive implication

A2A can become an interoperability adapter later. Do not make it the internal orchestration substrate.

---

# 9. OpenManus weaknesses Ineractive should not inherit

## 9.1 Shallow durable memory

OpenManus Memory is primarily a bounded message list.

Ineractive needs governed memory with scope, provenance, freshness, versioning, conflict handling, and approval where appropriate.

## 9.2 Plan state is not proof

A completed plan step is not execution evidence.

Ineractive keeps SpecGrain + machine evidence + Diffcipline.

## 9.3 Capability model is weaker

Tool availability is not authorization.

Ineractive retains:

~~~text
request
→ deterministic policy
→ risk gate
→ scoped grant
→ execution
→ receipt
~~~

## 9.4 MCP instructions are too trusted

External integration instructions are untrusted context and must be scoped beneath Ineractive governance.

## 9.5 Observability may expose sensitive reasoning/data

OpenManus logs agent "thoughts" and tool arguments.

Ineractive exposes operational state/evidence, not private chain-of-thought, and redacts secrets.

## 9.6 Dynamic tool loading needs context discipline

OpenManus dynamically adds/removes MCP tools.

Ineractive should preserve stable tool identity/catalog semantics and use eligibility/capability masking.

---

# 10. Proposed Ineractive additions

These are research recommendations only.

## 10.1 Design Context Compiler

Compile:

~~~text
code design system
Figma libraries
tokens
brand documents
screenshots
site capture
PRODUCT.md / BRAND.md / DESIGN.md
~~~

into:

~~~text
DesignSystemRevision
DesignPrinciples
ComponentCatalog
TokenGraph
AssetRules
InteractionPatterns
ResponsiveRules
~~~

## 10.2 Design/Code Round-Trip Contract

Support:

~~~text
code → design
design → code
rendered UI → selected source
~~~

with semantic bindings and drift detection.

## 10.3 Annotation Intent Layer

Anchored annotations become typed ChangeIntents tied to DOM/source/Product Graph/design component and viewport/state.

Multiple annotations may be batched into one bounded WorkPacket.

## 10.4 Skills OS

Introduce bounded system/project skill loading earlier than the generic plugin marketplace.

Skill scopes:

~~~text
system
organization
project
user
imported
~~~

Skills can carry instructions, scripts, templates, fixtures, references, and schemas.

Skills never grant capabilities.

## 10.5 Project Learning Loop

After proven work:

~~~text
extract reusable learning
→ classify
→ propose context/skill diff
→ approve
→ versioned update
~~~

No silent permanent memory mutation.

## 10.6 Exploration Branches

Bind:

~~~text
ConversationBranch
ProductGraphBranch
DesignBranch
CodeWorktree
~~~

Support compare and selective merge.

## 10.7 Wide Work

Parallel execution primitive for independent homogeneous units with shared rubric, bounded budget, individual evidence, and explicit synthesis.

## 10.8 Context Continuation Policy

Choose among:

~~~text
CONTINUE
COMPACT
RESET_WITH_HANDOFF
BRANCH
DELEGATE_FRESH
~~~

based on actual context/task state.

## 10.9 Stable Tool Catalog + Capability Mask

Maintain:

~~~text
ToolCatalogRevision
ToolDescriptor
ToolNamespace
EligibilityState
CapabilityRequirement
~~~

and avoid uncontrolled tool-list churn.

## 10.10 Artifact Store

Externalize bulky observations:

- logs;
- screenshots;
- DOM;
- traces;
- PDFs;
- research;
- design captures;
- build artifacts.

## 10.11 Intent-aware action guard

For high-risk actions:

~~~text
user intent
+ proposed executable action
+ environment policy
→ allow / deny / require approval
~~~

Do not include generator persuasion/reasoning in the guard input.

## 10.12 Lifecycle Hook Bus

Typed lifecycle hooks can run verification, design checks, provenance checks, learning proposals, or deployment smoke checks without ambient authority.

## 10.13 Runtime classes

Distinguish:

- ephemeral build sandbox;
- preview/test browser;
- research browser;
- authenticated user browser;
- optional persistent cloud computer;
- optional scoped local computer.

## 10.14 Scheduled Ineractive automations

Later recurring builder operations can include dependency audits, accessibility audits, design-system drift, production health, and analytics-driven product reports.

## 10.15 Last-known-good publishing

~~~text
Candidate
→ Proof
→ Preview
→ Qualify
→ Promote
~~~

A failed candidate cannot replace the last proven release.

---

# 11. Proposed integrated harness

~~~text
                           INERACTIVE HARNESS
                                  │
                       User / Project Intent
                                  │
                    ┌─────────────▼─────────────┐
                    │     Context Compiler       │
                    │ project / graph / skills   │
                    │ design / source / evidence │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Product / Work Planner   │
                    │ Product Graph + SpecGrain  │
                    └─────────────┬─────────────┘
                                  │
                          Build Contract
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
      ┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼─────────┐
      │ Generator      │  │ Design Engine   │  │ Wide Work      │
      │ code/backend   │  │ canvas/tokens   │  │ parallel units │
      └───────┬────────┘  └───────┬────────┘  └──────┬─────────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                        Proposed Actions
                                  │
                    ┌─────────────▼─────────────┐
                    │     Capability Kernel      │
                    │ deterministic policy       │
                    │ + optional intent guard    │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │       Runtime Fabric        │
                    │ sandbox/browser/git/data   │
                    │ connectors/secrets/design  │
                    └─────────────┬─────────────┘
                                  │
                             Observations
                                  │
                      untrusted-content probe
                                  │
              ┌───────────────────▼───────────────────┐
              │           Independent Evaluator       │
              │ browser / backend / design / security │
              └───────────────────┬───────────────────┘
                                  │
                        Findings / Evidence
                                  │
               ┌──────────────────▼──────────────────┐
               │ Repair / Pivot / Accept Decision    │
               └──────────────────┬──────────────────┘
                                  │
                 Alibaba OCR + Diffcipline + exact head
                                  │
                              Checkpoint
                                  │
                 Project Learning Proposal (optional)
                                  │
                             Publish / Next
~~~

---

# 12. Priority recommendation

At the next canonical planning reconciliation, consider moving these architectural substrates earlier:

- harness-level governed project context;
- bounded system/project Skills runtime;
- Artifact Store;
- design-system semantic model;
- independent high-risk action guard;
- stable Tool Catalog.

Keep these later until the core compiler proves itself:

- public skill/plugin marketplace;
- unrestricted community plugins;
- authenticated personal-computer automation;
- persistent cloud computer;
- general scheduled agent workflows;
- native mobile;
- unconstrained multi-agent parallelism.

---

# 13. Where Ineractive should exceed each source

## vs Claude Design

Add:

- backend semantics;
- database/auth/RLS;
- production source ownership;
- exact runtime proof;
- security evidence;
- Product Graph propagation;
- deployment truth.

## vs Figma Make

Add:

- full backend compiler;
- Supabase schema/policy;
- requirements-derived verification;
- semantic product graph;
- stronger Git/evidence governance;
- design/code drift reconciliation;
- cross-domain changes beyond UI.

## vs Manus

Add:

- exact software evidence;
- source/diff qualification;
- semantic product compiler;
- deterministic authorization;
- stronger producer/verifier separation;
- generated-product portability;
- explicit database/security proof.

## vs OpenManus

Add:

- durable governed context;
- typed WorkPackets;
- capability grants;
- strong sandbox/egress policy;
- exact evidence;
- Product Graph;
- design-system semantics;
- Supabase compiler;
- production-safe delivery.

---

# 14. Conclusion

The target should not be:

> Claude Design + Figma + Manus in one interface.

The target should be:

> **Ineractive as a Product Operating System whose harness understands product intent, preserves design truth, loads reusable skills, operates real tools/computers safely, branches and parallelizes context when useful, builds frontend and backend, and independently proves the result.**

The highest-value new primitives from this research are:

1. Design Context Compiler;
2. Design/Code Round-Trip Binding;
3. Annotation Intent Layer;
4. Skills OS;
5. Project Learning Loop;
6. Exploration Branches;
7. Wide Work;
8. Context Continuation Policy;
9. Stable Tool Catalog + Capability Mask;
10. Artifact Store;
11. Intent-aware Action Guard;
12. Lifecycle Hook Bus;
13. distinct browser/computer runtime classes;
14. scheduled Ineractive automation;
15. last-known-good promotion;
16. explicit Build Contract between producer and verifier.

---

# 15. Primary sources

## Anthropic

- https://www.anthropic.com/news/claude-design-anthropic-labs
- https://www.anthropic.com/engineering/harness-design-long-running-apps
- https://www.anthropic.com/engineering/claude-code-auto-mode
- https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously
- https://www.anthropic.com/engineering/building-effective-agents
- https://www.anthropic.com/engineering/multi-agent-research-system
- https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- https://www.anthropic.com/research/trustworthy-agents
- https://www.anthropic.com/engineering/how-we-contain-claude
- https://www.anthropic.com/news/claude-for-creative-work

## Figma

- https://help.figma.com/hc/en-us/articles/40219873508247-Workflow-lab-Code-to-canvas
- https://help.figma.com/hc/en-us/articles/39166810751895-Figma-skills-for-MCP
- https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server
- https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/
- https://help.figma.com/hc/en-us/articles/40775535020695-Make-in-your-local-codebase
- https://help.figma.com/hc/en-us/articles/33665861260823-Add-guidelines-to-Figma-Make
- https://help.figma.com/hc/en-us/articles/39241689698839-Get-started-with-Make-kits
- https://help.figma.com/hc/en-us/articles/35946832653975-Use-your-design-system-package-in-Make-kits
- https://help.figma.com/hc/en-us/articles/40287261761559-Code-to-canvas-with-your-design-system

## Manus

- https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
- https://manus.im/blog/manus-sandbox
- https://manus.im/blog/introducing-wide-research
- https://www.manus.im/blog/manus-branch
- https://manus.im/blog/manus-plan-mode
- https://manus.im/blog/manus-schedules
- https://manus.im/blog/manus-project-skills
- https://manus.im/blog/manus-projects-self-updating
- https://manus.im/blog/projects-connectors
- https://manus.im/blog/manus-my-computer-desktop

## OpenManus

- https://github.com/FoundationAgents/OpenManus

Key inspected paths:

- app/agent/base.py
- app/agent/react.py
- app/agent/toolcall.py
- app/agent/manus.py
- app/agent/browser.py
- app/agent/sandbox_agent.py
- app/flow/planning.py
- app/tool/planning.py
- app/tool/mcp.py
- app/tool/python_execute.py
- app/tool/str_replace_editor.py
- app/agent/data_analysis.py
