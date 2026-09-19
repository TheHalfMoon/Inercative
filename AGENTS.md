# Ineractive Agent Governance

## Language

All repository, GitHub, code, comments, commands, specifications, plans, reports, evidence, commit messages, PR bodies, reviewer responses, and agent prompts are English.

## Authority order

When sources disagree, use this order:

1. live repository and GitHub truth;
2. this `AGENTS.md`;
3. canonical SpecGrain state once initialized;
4. accepted ADRs and `docs/canonical/*`;
5. active Grain / WorkPacket;
6. source-ledger and research material;
7. historical chat summaries.

A plan is not implementation authority. An agent saying "done" is not proof.

## Product identity

The canonical product name is **Ineractive**. The current repository locator is `TheHalfMoon/Inercative`; that spelling mismatch is not product authority.

## Core delivery rules

- Use SpecGrain for decomposition, readiness, dependency ordering, context budgeting, acceptance, and WorkPackets.
- Use Diffcipline for exact-diff proof, risk profile, executed verification, and PASS/REVIEW/FAIL semantics.
- Use Alibaba Open Code Review (OCR) as the designated AI review engine. OCR findings are review observations, not acceptance authority.
- Bind acceptance-critical evidence to the exact candidate revision.
- `NOT RUN` is never `PASS`.
- Never force-push, rebase shared history, rewrite a shared branch, bypass a ruleset, weaken a gate, or rerun-to-green without preserving the earlier evidence.
- Prefer normal merge commits for canonical integration.
- Keep donor/import commits mechanically separable from Ineractive adaptation when practical.
- Never fabricate CI, tests, review coverage, runtime behavior, provider behavior, security evidence, or readiness.

## Model and harness policy

Ineractive is provider-neutral at its public interface. Public product language may describe a **multi-provider model router** or **model-routing architecture**. It must not falsely imply that every request is executed by multiple models.

Provider/model identity is an internal operational fact and must remain available to private run/evidence records for reproducibility, cost, debugging, and incident response even when it is not exposed in marketing.

Initial planned roles:

- a generative/reasoning model adapter for open-ended planning and code generation;
- a bounded decision-model adapter where typed choices, scores, or confidence-aware gates are a better fit than text generation;
- deterministic code/policy whenever a rule can be expressed without a model.

Models propose. Code, policy, capability grants, runtime observations, tests, and evidence decide.

## User-question policy

Do not turn Ineractive into an interview product.

The default is **infer, state assumptions, build, and let the user correct the preview**.

Ask a user only when all are true:

1. the missing answer materially changes the product or trust boundary;
2. the choice is expensive or dangerous to reverse;
3. confidence is insufficient to choose a safe default;
4. the answer cannot be learned from existing project context, imported material, or runtime evidence.

Question budget:

- default: zero questions;
- normal maximum before the first useful preview: one compact batch of up to three high-impact questions;
- additional questions are event-driven only when a genuine blocker appears.

Never ask for information the system can derive. Prefer reversible defaults and an explicit Assumption Ledger.

## Donor/source policy

The founder has stated permission to use and adapt all sources named in the canonical source ledger, all relevant sources available in the founder's connected GitHub repositories, and the additional named design/engineering references.

Permission makes a source eligible; it does not make it architecturally correct.

Every copied/adapted import still requires:

- exact source and revision;
- exact paths/components;
- destination mapping;
- dependency closure;
- security review;
- notices/attribution obligations where applicable;
- independent Ineractive verification.

Ineractive-owned contracts control architecture. Do not concatenate donor products.

## Security rules

- Models, browser pages, generated apps, imported repositories, tool output, MCP servers, and external content are untrusted inputs.
- No model or UI component is an authorization authority.
- Privileged actions pass through typed capability policy.
- Secrets are referenced/brokered and scoped; they are not copied into prompts or logs.
- Generated applications execute in isolated runtimes before publication.
- Destructive database, production, billing, credential, permission, publication, or externally side-effecting actions require explicit policy admission.
- Supabase service-role/secret credentials must never enter browser-delivered code.

## Completion

A Grain may be considered complete only when:

1. its current SpecGrain acceptance contract is satisfied;
2. required verification has executed against the exact candidate;
3. Diffcipline returns the required verdict for its risk profile;
4. Alibaba OCR has reviewed the exact diff or its omission is explicitly inapplicable and accounted for;
5. material findings are fixed, dispositioned, or explicitly block the change;
6. no acceptance-critical evidence is stale for the candidate head.
