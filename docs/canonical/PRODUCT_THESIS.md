# Ineractive Product Thesis

**Status:** canonical planning direction  
**Date:** 2026-09-19

## 1. Product category

Ineractive is an **AI Product Compiler**.

It is not primarily a chatbot, code completion tool, website template generator, low-code database editor, or visual canvas. It accepts product intent and incrementally compiles that intent into a real software product whose code, backend, permissions, tests, runtime behavior, and deployment remain inspectable.

The promise is:

> **From intent to product.**

A useful shorthand is:

> **Products, not templates.**

## 2. What "product" means

For the first generation, a product can include:

- web interface and responsive interaction;
- reusable design system and brand tokens;
- routes, navigation, forms, tables, dashboards, and workflows;
- Supabase Postgres schema and migrations;
- authentication and user lifecycle;
- organization/team/role membership;
- row-level authorization;
- Storage buckets and policies;
- Realtime behavior;
- Edge Functions and server-side logic where needed;
- background/cron/queue behavior where qualified;
- search/vector capabilities where justified;
- third-party API integrations;
- test fixtures and synthetic seed data;
- unit, integration, browser/E2E, auth, data-policy, accessibility, and security checks;
- Git history and checkpoints;
- preview and production deployment;
- logs, health, and repair evidence.

The product is not complete because a screenshot looks plausible.

## 3. Primary user experience

A user should be able to begin with a small amount of intent:

> "Build a CRM for dental clinics. Multi-location clinics, doctors, patients, appointments, WhatsApp reminders, invoices, Arabic/English, analytics, roles, and public booking."

Ineractive should:

1. recover product structure from the request and available context;
2. ask only materially necessary questions;
3. show a useful first preview quickly;
4. expose assumptions rather than hiding them;
5. compile the product into bounded work;
6. build and run in an isolated environment;
7. exercise the actual flows;
8. repair failures;
9. present the result as a working product;
10. allow visual, conversational, and code-level modification;
11. let the user own/export code, data, Git, backend, and deployment.

## 4. The key differentiation

The model is replaceable. The system is the product.

The durable advantage is the combination of:

- **Product Graph** — a typed representation of what the product means;
- **Spec/Work compiler** — intent into bounded, dependency-ordered work;
- **Harness** — context, routing, tools, budgets, policies, and repair loops;
- **Decision Fabric** — fast typed decisions and confidence-aware escalation;
- **Runtime Fabric** — browser, terminal, filesystem, Git, sandbox, and external tool capability;
- **Supabase Compiler** — backend from product semantics rather than hand-written fragments;
- **Design Intelligence** — brand, design system, visual editing, deterministic detectors, accessibility, and rendered feedback;
- **Evidence Loop** — real execution, tests, review, security checks, exact-head proof;
- **Project Memory** — durable decisions, conventions, failures, fixes, and preferences.

A stronger model should improve Ineractive, but Ineractive must not become unusable when a model changes.

## 5. Product principles

### Real code

Generated applications use normal source code and framework primitives. The user can inspect, edit, export, version, and deploy the code without Ineractive.

### Backend ownership

Supabase is the first-class V1 backend target. Users must be able to own the resulting Supabase project and migration history. Ineractive must not hide the backend behind an irreversible proprietary representation.

### Build, observe, repair

The default loop is:

```text
UNDERSTAND
  -> SPECIFY
  -> BUILD
  -> RUN
  -> OBSERVE
  -> TEST
  -> CRITIQUE
  -> REPAIR
  -> VERIFY
  -> SHIP
```

A generated build that has not been run is a candidate, not a result.

### Progressive disclosure

Non-technical users should not need to understand the compiler.

The primary product surface is:

```text
Conversation + Product Preview
```

Power surfaces appear as needed:

```text
Code | Data | Auth | Storage | Logic | Design | Tests | Logs | Git | Deploy
```

### Minimal questioning

The first useful preview is more informative than twenty speculative questions.

Use defaults for reversible decisions. Ask for high-impact, low-confidence, hard-to-reverse decisions only.

### No false autonomy

Ineractive can automate bounded work. It must not silently widen permission, spend money, alter production data, publish externally, or use secrets merely because a model suggested it.

## 6. Target application classes

V1 should be capable of building useful products in these classes with one coherent architecture:

- marketing/product websites with real data;
- SaaS applications;
- dashboards and analytics products;
- CRM and operational systems;
- internal tools;
- portals;
- marketplaces;
- lightweight commerce;
- AI-enabled applications;
- knowledge/data applications;
- admin consoles;
- API-backed workflows.

PWA support belongs in the normal web target. Native mobile/Expo is a later compiler target after web/full-stack quality is proven.

## 7. Non-goals for the first product generation

Do not attempt all of these at once:

- arbitrary native iOS/Android generation;
- arbitrary backend framework generation;
- unrestricted infrastructure-as-code across every cloud;
- production database destructive automation without explicit admission;
- an open-ended autonomous pentesting agent;
- a generic operating system for every coding agent;
- perfect import of every legacy codebase;
- "one prompt and never inspect again" marketing.

## 8. Success definition

Ineractive succeeds when a user can express a product, receive a useful working preview quickly, refine it naturally, connect/own the backend, and publish with substantially less engineering effort **without lowering the standard for correctness, security, maintainability, or ownership**.

The internal success metric is not "lines generated" or "agent tokens used."

Measure:

- time to first useful preview;
- time to first proven vertical slice;
- user corrections required before intent alignment;
- build/test pass rate on first attempt;
- repair-loop convergence;
- browser-flow success;
- RLS/auth defect rate;
- escaped defect rate;
- visual/a11y detector findings per shipped surface;
- cost and latency per proven capability;
- percentage of decisions resolved without user interruption;
- percentage of generated code the user keeps;
- successful export/self-host rate.
