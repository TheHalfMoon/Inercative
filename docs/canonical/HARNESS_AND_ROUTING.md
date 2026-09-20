# Ineractive Harness and Routing Architecture

**Status:** canonical planning direction  
**Date:** 2026-09-19

## 1. Thesis

The harness is the core intelligence product.

A frontier model can write code. Ineractive must decide what should be built, what context is relevant, what may run, what must be asked, which tool/model should be used, what evidence is required, whether a result is good enough, and whether to repair, retry, escalate, or stop.

Those decisions must not all be delegated to one generative model.

## 2. Three intelligence classes

### Deterministic intelligence

Use code whenever the decision can be represented as an invariant, state transition, schema rule, policy, budget, dependency edge, or exact observation.

Examples include dependency order, capability authorization, required verification classes, changed-file identity, whether a test ran, whether a migration changed RLS, whether a secret would cross a trust boundary, and whether a question budget is exhausted.

### Decision intelligence

Use a bounded decision model when the task is fundamentally classification, scoring, ranking, gating, or selecting among known options.

Initial planned implementation: a provider-neutral bounded decision-model adapter.

Suitable jobs:

- task complexity band;
- specialist/tool selection;
- ask / assume / defer;
- continue / repair / retry / escalate / stop;
- risk scoring;
- confidence-aware approval recommendation;
- context keep / truncate / drop for non-required context;
- duplicate/finding triage;
- likely impacted Product Graph region;
- candidate prioritization.

Decision-model output is advisory unless a decision is explicitly defined as non-safety-critical. Permissions and hard policy remain deterministic.

### Generative intelligence

Use a generative/reasoning model for open-ended synthesis:

- product interpretation;
- architecture proposals;
- implementation planning;
- code generation;
- migration generation;
- copy/content generation;
- design variation;
- debugging hypotheses;
- repair patches.

The initial generative provider is an internal deployment choice. Core contracts must not depend on any provider SDK or provider-specific message shape.

## 3. Provider disclosure policy

Public product language may describe a model router, multi-provider architecture, and provider-neutral harness.

Do not make a false claim that many different models execute every request.

Internal run records preserve:

- provider;
- model;
- model revision/alias where available;
- endpoint class;
- prompt/template version;
- tool schema revision;
- generation/reasoning configuration;
- token/usage/cost observations;
- request/response timing;
- retry/fallback lineage.

Public telemetry may redact provider identity while preserving aggregate reliability/cost.

## 4. Harness loop

~~~text
Receive intent/change
      |
      v
Recover scoped project state
      |
      v
Question Gate --------> Ask compact question only if necessary
      |
      v
Update Product Graph
      |
      v
Compile bounded work
      |
      v
Compile Build Contract
      |
      v
Select context/skills/capabilities/models/budget
      |
      v
Propose action
      |
      v
Capability + intent admission
      |
      v
Execute in sandbox
      |
      v
Observe runtime/browser/backend
      |
      v
Untrusted-content handling
      |
      v
Independent evaluation
      |
      +--> repair candidate -> execute/observe again
      |
      +--> blocked -> explain blocker / ask if genuinely required
      |
      v
Review + proof
      |
      v
Ready candidate
~~~

Every transition is explicit state, not an implied conversational mood.

## 5. Question Gate

The Question Gate prevents AI consultant syndrome.

For each unresolved decision, calculate or classify:

- impact: low / medium / high;
- reversibility: easy / moderate / hard;
- confidence in inferred default;
- ability to derive answer from project/runtime;
- safety/privacy/billing significance.

Decision:

~~~text
if derivable:
  derive
else if low impact or easy to reverse:
  assume + record
else if high confidence:
  assume + expose
else if user answer is required for safe progress:
  ask
else:
  build reversible prototype and defer
~~~

Question UX:

- batch related questions;
- use choices with a recommended default when possible;
- explain why the answer changes the build;
- never ask jargon questions when the user can react to a preview instead;
- never ask the same question again if the answer is already in project state.

## 6. Assumption Ledger

Every meaningful inferred choice has:

- assumption_id;
- statement;
- source/reason;
- confidence;
- impact;
- reversibility;
- affected Product Graph nodes;
- status: inferred / confirmed / corrected / superseded.

The user can inspect or change assumptions from one surface.

Corrections update the Product Graph and invalidate dependent work/evidence where necessary.

## 7. Model Router

The router receives a typed ModelTask:

- kind;
- required capabilities;
- input modality;
- context size;
- latency preference;
- quality floor;
- privacy class;
- cost ceiling;
- structured-output requirement;
- tool-use requirement;
- fallback policy.

The registry stores provider/model capability metadata.

Do not hardcode provider names into callers.

V1 routing may use a simple policy:

- generative implementation/reasoning -> configured primary generator;
- bounded decisions -> decision adapter;
- vision -> configured vision-capable adapter if needed;
- provider failure -> approved fallback when policy permits;
- no approved compatible adapter -> block visibly.

### 7.1 Creative-media routing

Creative media uses the same provider-neutral routing philosophy as code/reasoning, with a narrower typed contract.

A `MediaGenerationRequest` carries:

- modality and operation;
- quality floor;
- latency preference;
- cost ceiling;
- privacy class;
- prompt/reference complexity;
- text/typography fidelity needs;
- edit precision;
- dimensions/duration;
- eligible provider/model capabilities;
- fallback policy.

Routing sequence:

```text
request
-> deterministic compatibility/policy filter
-> bounded decision ranking
-> qualified MediaProviderAdapter
-> generation/edit
-> CreativeAsset lineage
-> independent visual/product evaluation
```

The bounded decision model may rank compatible options. It cannot authorize a forbidden provider, exceed a budget, grant a capability, or waive provenance/evidence.

### 7.2 Decision-adapter qualification

The bounded decision interface remains provider-neutral.

Candidate implementations and benchmarks may include specialized System-1 models such as the Apache-2.0 `convaiinnovations/laya` family, provided they pass Ineractive-owned evaluation for the actual target distribution.

Qualification must measure at least:

- task-family accuracy;
- calibration/error;
- confidence/selective-risk behavior;
- latency/throughput;
- deterministic schema conformance;
- input-length/cardinality limits;
- multilingual/domain coverage where required;
- failure/escalation behavior.

Published benchmark claims are research inputs, not Ineractive qualification evidence. Arithmetic, counting, permission checks, dependency checks, exact dates, and other deterministic invariants remain in code.

## 8. Fallback semantics

Fallback is not invisible equivalence.

A run records primary adapter, failure/limit reason, selected fallback, capability differences, and whether requalification is required.

For acceptance-critical tasks, a fallback with weaker or materially different capability can force REVIEW even when output appears plausible.

## 9. Context Compiler

Context is an engineered artifact.

Required context is selected deterministically from:

- WorkPacket;
- Product Graph slice;
- explicit requirements/ADRs;
- files in expected change surface;
- relevant interface contracts;
- mandatory policy/security rules.

Optional context can be ranked using retrieval and decision intelligence.

Never let a decision model drop acceptance criteria, security policy, exact source identity, required interface contracts, or destructive-operation rules.

HarnessMind patterns should be adapted so Ineractive can explain what context, skills, rules, and tools entered a run and why.

### Project Context

Durable project context is versioned product intelligence, not transcript memory.

It may include accepted decisions, assumptions, domain vocabulary, architecture facts, design rules, source/runtime facts, and qualified project Skills.

A deterministic Execution Header reintroduces the current WorkPacket, required proof, allowed/forbidden surfaces, blockers, and remaining budget near the active context.

### Context continuation

Long-running work can choose:

- CONTINUE;
- COMPACT;
- RESET_WITH_HANDOFF;
- BRANCH;
- DELEGATE_FRESH.

The policy is evidence-driven by context pressure, model capability, task phase, failures, drift, and WorkPacket boundaries.

### Artifact Store

Large logs, screenshots, DOM snapshots, traces, research, reports, database plans, and build outputs live outside the active model transcript behind stable artifact references.

## 10. Tool Router

A model chooses among requested intents, not arbitrary ambient functions.

The harness maintains a versioned Stable Tool Catalog with persistent identities/namespaces. Runtime eligibility is controlled by policy/capability masking rather than allowing tool identity to drift silently between turns.

Tool descriptors include action, resource type, provider/provenance, risk class, input schema, output schema, capability required, side-effect class, idempotency, retry semantics, redaction rules, and evidence emitted.

MCP/server instructions are external integration metadata, not system authority.

Tool calls are validated before capability admission.

## 11. Capability policy

Examples:

~~~text
repo.read
repo.write:<worktree>
process.run:<sandbox>
network.egress:<allowlist>
browser.navigate:<preview>
supabase.inspect:<local>
supabase.migrate:<local>
supabase.migrate:<staging>
supabase.migrate:<production>
secret.use:<integration>/<scope>
git.commit:<branch>
git.push:<branch>
deploy.preview
deploy.production
~~~

A capability can carry resource scope, runtime scope, expiry, use count, cost/spend ceiling, network target, allowed command family, and approval source.

High-risk proposed actions can additionally pass an independent intent-alignment guard that sees the user-authorized intent, executable action, resource target, and deterministic policy state. It must not rely on generator persuasion or private reasoning.

External observations can pass an untrusted-content/prompt-injection probe before entering model context. A denied action normally returns a structured boundary so the harness can seek a safer path; bounded repeated denials escalate rather than loop forever.

### Budget Governor

BudgetPolicy governs model/tool/browser/sandbox/network/backend usage, wall-clock time, retry/repair count, and parallelism.

Budget outcomes can continue, reduce optional work, choose a cheaper approved route, reduce parallelism, require approval, or block. The model cannot increase its own budget.

## 12. Repair loop

A failure becomes a typed FailureObservation, not a vague transcript.

Fields include:

- failing requirement;
- observed behavior;
- expected behavior;
- exact runtime/source;
- logs/screenshots/network trace references;
- likely impacted graph/source region;
- prior repair attempts.

Repair is bounded:

1. reproduce;
2. minimize evidence;
3. form hypotheses;
4. patch smallest useful surface;
5. rerun focused check;
6. rerun impacted acceptance;
7. stop after policy-defined attempt/budget ceiling.

Do not repeatedly regenerate the whole application.

## 13. Long-running autonomy

Background/long-running work must have finite task graph, budgets, deadlines, stop conditions, checkpointing, resumable event state, external-effect policy, and notification/escalation rules.

Wide Work is allowed only when subunits are sufficiently dependency-independent, write ownership is isolated, per-unit budgets/evidence are retained, and synthesis is explicit.

"Keep trying until it works" is not a valid runtime policy.

## 14. Harness evaluation

Build a reproducible internal corpus across:

- prompt-to-static UI;
- authenticated CRUD;
- multi-role/RLS;
- file upload/storage;
- realtime;
- complex workflows;
- external APIs;
- migrations;
- import/edit existing project;
- broken build repair;
- visual mismatch repair;
- security failures;
- ambiguous requirements.

The Evaluation Lab supports live execution plus recorded-observation replay for deterministic harness regression without repeating irreversible external effects.

Measure the harness separately from the underlying model:

- first-pass compile rate;
- functional acceptance;
- repair convergence;
- unnecessary questions;
- user correction count;
- context/token efficiency;
- tool-call waste;
- routing accuracy;
- policy violations;
- escaped defects;
- model/provider sensitivity;
- budget adherence and cost;
- latency;
- question count;
- context required vs context wasted;
- security/correctness regressions under replay.

Do not collapse correctness, security, design, cost, and speed into one score that can hide a critical failure.

The goal is to make the system improve even when the underlying model stays constant.
