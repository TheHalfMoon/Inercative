# Ineractive Founder Decisions

**Date:** 2026-09-19  
**Status:** canonical founder direction for planning

## FD-001 — Product name

The canonical product name is **Ineractive**.

The current GitHub repository locator is `TheHalfMoon/Inercative`. The repository spelling is not product authority.

## FD-002 — Product ambition

Ineractive is not limited to generating pages or frontend code.

It is intended to build a complete product from intent through:

- product/domain structure;
- interface and design system;
- real source code;
- Supabase backend;
- authentication/authorization;
- storage and server-side behavior;
- testing and security;
- Git/versioning;
- deployment and ownership.

## FD-003 — Harness over model

The model is not the product moat.

Architecture, context selection, bounded decisions, tools, runtime, Product Graph, Supabase compiler, design intelligence, repair loops, verification, and evidence should make model providers replaceable.

## FD-004 — Public provider posture

Do not publicly declare the concrete initial model/provider stack in canonical public planning.

Public product language may accurately state that Ineractive has a provider-neutral, multi-provider routing architecture.

Do not claim that every request uses multiple models when it does not.

Private operational evidence must still retain actual provider/model identity for debugging, reproducibility, cost, qualification, and incident response.

## FD-005 — Planning and proof

Use:

- **SpecGrain** for bounded planning, dependency order, readiness, context, and WorkPackets;
- **Diffcipline** for proof-before-done and exact-diff verification;
- **Alibaba Open Code Review** as the designated AI reviewer.

Review output is input to acceptance; the reviewer does not grant PASS by itself.

## FD-006 — User questions

Ineractive must not interrogate users before it becomes useful.

Default behavior:

- infer reversible choices;
- record assumptions;
- build a useful preview;
- ask only important, low-confidence, hard-to-reverse decisions.

Normal pre-preview question budget: zero, with at most one compact batch of three high-impact questions when genuinely blocked.

## FD-007 — Engineering skills

Use `mattpocock/skills` lightly for engineering discipline:

- domain language;
- spec synthesis;
- tracer-bullet tickets;
- deep modules;
- TDD/diagnosis;
- sparse ADRs.

Do not copy its relentless-grilling interaction style into the Ineractive user experience.

## FD-008 — Supabase

Supabase is the first-class V1 backend compiler target.

Ineractive should build and manage the ordinary backend lifecycle from A to Z while preserving native Supabase migrations/config/artifacts and user ownership.

Ineractive control-plane Supabase state and generated-application Supabase backends are separate trust/data domains.

## FD-009 — Source reuse

The founder states permission to use, copy, and adapt the sources named in the canonical source ledger and relevant sources in the connected GitHub account, plus the separately authorized design/engineering references.

Permission does not eliminate the need for exact provenance, dependency closure, security review, redistribution/notice handling, or independent qualification.

## FD-010 — Design

Use Impeccable as a primary design-quality/process source.

Study Pentagram's identity method: a strong strategic idea expressed coherently through brand, product, typography, layout, motion, and storytelling.

Do not copy a Pentagram client identity.
