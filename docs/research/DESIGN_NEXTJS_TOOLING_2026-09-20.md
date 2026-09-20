# Ineractive Frontend, Design, and Next.js Tooling Research

**Date:** 2026-09-20  
**Status:** research input for candidate canonical planning; not dependency authorization  
**Branch:** `research/design-agent-harness-2026-09-20`

## 1. Research question

What frontend/design/tooling stack should Ineractive use so generated web products are:

- visually distinctive rather than generic AI output;
- accessible;
- source-owned and editable;
- agent-readable;
- fast in Next.js/React;
- testable at component and page level;
- portable beyond Ineractive;
- safe from uncontrolled component-registry/dependency sprawl?

The answer is not a single library. It is a layered **Frontend Quality and Component Supply System**.

---

# 2. Current ecosystem snapshot

This is a dated research snapshot. Implementation must reverify current security-supported versions.

## Next.js

Current public release/security state observed during research:

- Next.js 16.3 is the current major/minor line;
- Next.js 16.3.3 is the Active LTS security patch advertised after the August 2026 security release;
- Next.js 16.3 adds Instant Navigations, improved Turbopack behavior, agent-ready docs/Skills, Agent Browser/React introspection direction, and a more focused MCP story;
- Next.js 16+ includes DevTools MCP support for agent access to runtime errors, logs, route/page metadata, Server Action identity, and project metadata;
- Next.js 16.2 introduced a stable Adapter API, supporting the portability goal beyond one hosting vendor.

Planning consequence:

> Qualify the latest security-supported Active LTS at implementation time. Never freeze a stale research-version number as permanent product semantics.

## React

Current stable observed:

- React 19.3;
- stable View Transitions are now available;
- React remains the generated-web V1 foundation.

Planning consequence:

- use platform/React View Transitions where they solve the problem;
- do not import a heavyweight animation dependency for every simple transition.

## Tailwind CSS

Current observed release line:

- Tailwind CSS 4.3;
- current v4 line has strong logical-property support, useful for RTL/bidirectional layouts.

Planning consequence:

- retain Tailwind as the V1 styling compiler target;
- generate semantic CSS variables/tokens above raw utility choices;
- use logical properties for bidirectional layout where possible.

## shadcn/ui

shadcn/ui now explicitly describes itself as:

- open code;
- a composable component foundation;
- a distribution/registry format;
- AI-ready because agents can read and modify the actual source.

Current ecosystem changes observed:

- GitHub repositories can be used directly as shadcn source registries;
- registry items can distribute components, hooks, utilities, design tokens, feature kits, project conventions, agent instructions, testing setup, CI/release workflows, and other source files;
- Base UI became the default primitive base for new shadcn projects in July 2026;
- React Aria is now a first-class shadcn base;
- Radix remains supported and should not be migrated merely for novelty.

Planning consequence:

> shadcn-compatible source distribution is a strong candidate format for an Ineractive-owned qualified component/feature registry, but the Ineractive semantic contract must remain independent of shadcn internals.

---

# 3. Impeccable

Current Impeccable capabilities observed from the official repository/site:

- one design skill with 24 commands;
- durable `PRODUCT.md` / `DESIGN.md` project truth;
- live browser iteration;
- deterministic design detector engine;
- current README reports 61 deterministic detector rules;
- design critique/audit/polish flows;
- hooks for multiple coding harnesses;
- source and rendered-page inspection;
- CI-friendly JSON detector output.

Relevant strengths:

- explicit anti-AI-slop rules;
- durable product/design context;
- deterministic findings separate from subjective critique;
- edit hooks that can surface findings close to the write;
- source-first rather than proprietary canvas state;
- responsive/accessibility/implementation-integrity checks.

Adoption posture:

**PRIMARY DESIGN QUALITY REFERENCE / SELECTIVE TOOL ADAPTER CANDIDATE**

Do not make Impeccable the sole definition of design quality.

Ineractive should combine its strongest mechanisms with independent accessibility, component-state, browser, performance, and product-task evidence.

---

# 4. Strong complementary rule packs

## Vercel Web Interface Guidelines

The current Vercel Labs Web Interface Guidelines cover a broad set of interface decisions, including:

- keyboard/focus;
- forms;
- touch targets;
- responsive behavior;
- safe areas;
- typography/content;
- loading/error feedback;
- animation/reduced motion;
- images/fonts;
- performance/layout work;
- i18n;
- theming;
- design details.

The official agent skill is designed to review UI code against the current guidelines.

Adoption posture:

**VERSIONED FRONTEND RULE PACK / PROCESS REFERENCE**

## Vercel React Best Practices

The Vercel agent skill is designed specifically for React/Next.js agent-generated code.

It covers prioritized rule families such as:

- eliminating waterfalls;
- bundle-size optimization;
- server-side performance;
- client data fetching;
- re-render performance;
- rendering performance;
- JavaScript performance;
- advanced patterns.

Adoption posture:

**VERSIONED REACT/NEXT QUALITY RULE PACK / PROCESS REFERENCE**

The rule set should be pinned/reviewed for deterministic project use rather than silently fetching mutable upstream guidance during acceptance-critical CI.

---

# 5. React Doctor

React Doctor currently provides deterministic scanning across:

- correctness;
- state/effects;
- performance;
- architecture;
- security;
- accessibility;
- maintainability;
- dependency/supply-chain checks.

It supports changed-scope scans and structured output, and has an agent skill.

Adoption posture:

**QUALIFY AS A DETERMINISTIC REACT QUALITY ADAPTER**

Important rule:

- React Doctor findings feed Ineractive Finding/Evidence;
- a numeric health score is not a PASS oracle;
- acceptance uses typed findings and required evidence.

React Scan remains a useful runtime performance visualization/reference, but its own current README recommends React Doctor for the broader agent-oriented workflow.

---

# 6. Accessible primitive bases

A generated project should have **one declared primary primitive base**.

Mixing unrelated focus/portal/keyboard models casually creates subtle accessibility and styling defects.

## Base UI

Current shadcn default.

Strengths:

- unstyled;
- composable;
- React-focused;
- WAI-ARIA interaction/focus behavior;
- WCAG-oriented design;
- works with Tailwind and Motion.

Candidate default for new Ineractive-generated projects.

## React Aria

Current first-class shadcn base.

Strengths:

- mature accessibility semantics;
- strong interaction/internationalization behavior;
- useful alternate for projects where its component model better fits the requirements.

Candidate qualified alternate.

## Radix

Mature and widely deployed.

Policy:

- preserve imported/existing Radix projects unless evidence justifies migration;
- retain as a supported qualified base;
- do not migrate working applications merely because Base UI is currently the shadcn default.

---

# 7. Source-owned component registry architecture

The strongest direction is not “install many component libraries”.

It is:

~~~text
Existing project components
        ↓
Project Product Kit / private registry
        ↓
Ineractive Qualified Registry
        ↓
Qualified external registry/search providers
        ↓
Generate a new component only when necessary
~~~

## 7.1 ComponentResolver

For every requested UI capability:

1. search current project source;
2. search the project's Product Kit/component catalog;
3. search the Ineractive Qualified Registry;
4. optionally search explicitly connected external registries;
5. synthesize only when no qualified source fits;
6. normalize to project tokens/primitive base;
7. verify component states and accessibility;
8. record provenance.

This is a direct defense against duplicate Buttons, Dialogs, Tables, and design drift.

## 7.2 Ineractive Qualified Registry

Candidate implementation format:

- shadcn-compatible source registry adapter;
- source copied into the generated product;
- no hidden runtime registry dependency;
- exact provenance and revision;
- explicit npm and registry dependency closure;
- project-owned final source.

The canonical Ineractive contract remains `ComponentRegistryAdapter`, not “shadcn forever”.

## 7.3 RegistryAdmissionGate

No third-party component or block enters the qualified Ineractive registry without checking:

- source/provenance;
- license/notice obligations;
- dependency closure;
- package/security state;
- primitive-base compatibility;
- token compatibility;
- server/client boundary;
- React/Next compatibility;
- keyboard/focus behavior;
- automated accessibility findings;
- responsive states;
- dark/light/theme behavior where applicable;
- RTL/bidirectional behavior where applicable;
- reduced-motion behavior;
- bundle/runtime cost;
- component states;
- testability;
- visual quality;
- duplicate overlap with existing primitives.

---

# 8. Component workbench: Storybook

Current Storybook 10.x direction is particularly relevant to an AI product compiler.

Observed capabilities:

- component-driven state catalog;
- Vitest-powered component testing;
- interaction testing;
- accessibility testing;
- visual testing support;
- Storybook MCP for React so agents can discover real components/stories and run focused component/a11y tests;
- Next.js 16.x support.

Adoption posture:

**QUALIFY STORYBOOK AS THE COMPONENT WORKBENCH / INTROSPECTION ADAPTER**

Do not require a full Storybook install inside every tiny generated application.

Policy:

- Ineractive's own UI/design system: Storybook is strongly justified;
- complex generated products/design systems: emit normal stories/tests when useful;
- tiny apps: an ephemeral compiler-owned component harness may be sufficient;
- no paid Chromatic dependency is required for the baseline.

---

# 9. Browser and accessibility proof

## Playwright

Use for:

- critical product journeys;
- real-browser state;
- responsive viewport matrix;
- page screenshots;
- visual comparisons;
- console/network observations;
- auth/backend flows.

Playwright supports screenshot comparisons through `toHaveScreenshot()`.

Keep baselines in a controlled environment to reduce renderer noise.

## axe-core / @axe-core/playwright

Use for deterministic automated accessibility findings.

Automated accessibility scanning is not complete accessibility verification.

Therefore:

~~~text
axe automated findings
+ primitive semantics
+ keyboard/focus browser journeys
+ selected manual/evaluator checks
!= "WCAG fully proven"
~~~

Do not make unsupported compliance claims.

---

# 10. Animation and motion

Default hierarchy:

~~~text
CSS transition/animation
→ React 19.3 ViewTransition / browser View Transition API
→ Motion only when interaction complexity justifies it
~~~

Motion is a strong React animation engine for:

- springs;
- gestures;
- complex presence/layout animation;
- orchestration;
- interactive motion.

Policy:

- do not ship Motion merely for a hover/color transition;
- every non-essential animation respects reduced motion;
- performance/bundle evidence matters.

---

# 11. Optional design/component sources similar to Impeccable's ecosystem

These are not equivalent to Impeccable; they solve adjacent problems.

## Magic UI

Current public positioning:

- 150+ free/open-source animated React/TypeScript/Tailwind/Motion components;
- shadcn-compatible install path.

Posture:

**OPTIONAL QUALIFIED SOURCE / DESIGN REFERENCE**

Best for marketing/delight patterns, not a universal application primitive layer.

## Motion Primitives

Open-source reusable animated components built around Motion + Tailwind.

Posture:

**OPTIONAL QUALIFIED SOURCE / MOTION REFERENCE**

## tweakcn

Visual theme editor/generator for shadcn themes with real-time preview and Tailwind export.

Posture:

**THEME/DESIGN REFERENCE; POSSIBLE TOKEN-IMPORT ADAPTER**

Do not let theme presets become product identity.

## 21st

Current ecosystem provides:

- large human-created UI catalog;
- shadcn-compatible source installation;
- MCP search/install experience;
- private/team component libraries.

Limitations observed:

- installation through its catalog may require membership/API key;
- community quality varies;
- a catalog does not solve design judgement, focus behavior, reduced motion, or project-specific token consistency.

Posture:

**OPTIONAL EXTERNAL REGISTRY/DISCOVERY PROVIDER; NOT CORE DEPENDENCY**

Ineractive must work fully without 21st.

---

# 12. Browser-first visual feedback tools

A second research pass identified complementary browser-to-agent patterns.

## Agentation

Useful mechanism:

- annotate clicked elements, selected text, multiple elements, or regions;
- capture selectors/positions/context;
- freeze animation to describe a precise visual state;
- emit structured feedback that helps an agent locate source.

License note: the observed repository uses PolyForm Shield 1.0.0. Treat as REFERENCE unless separately license-qualified.

## stagewise

Useful mechanism:

- running app, open web, DOM, console/debugger, codebase, and agent in one workspace;
- browser-first editing context rather than forcing the user to translate a visual issue into file names.

Observed repository license: AGPL-3.0. Treat as REFERENCE unless a deliberate compatible reuse decision is made.

## Domscribe

Useful mechanism:

- bidirectional mapping from clicked DOM element to source;
- query from a source location back to the live rendered element;
- stable build/runtime IDs;
- MCP-compatible agent bridge;
- no production runtime requirement claimed by the project.

Strong reference for Ineractive semantic source/rendered bindings.

## Design Mode

Useful mechanism:

- direct visual editing in the browser;
- change capture;
- MCP handoff to coding agents.

Reference for visual-change intent, not canonical state.

## Planning conclusion

These tools validate the existing Ineractive direction:

~~~text
Annotation Intent
+ rendered/source semantic binding
+ browser observations
+ visual direct manipulation
+ normal source diff
~~~

No additional top-level subsystem is needed.

# 13. Next.js architecture policy

## 12.1 Server-first

Default:

- App Router;
- Server Components for server-safe rendering/data access;
- Client Components only for state/events/effects/browser APIs;
- push `"use client"` boundaries down.

Do not mark whole page trees client-side because one leaf is interactive.

## 12.2 Data fetching

Default:

- use framework/server data APIs first;
- parallelize independent server work;
- use Suspense/streaming intentionally;
- avoid request waterfalls.

TanStack Query is qualified **on demand**, not injected into every new App Router application.

TanStack's own current guidance says a new Server Components application should start with framework data fetching and add Query only when its capabilities are actually needed.

## 12.3 Forms

Default:

- native HTML semantics;
- Next.js Server Actions / React form actions where appropriate;
- typed server-side validation;
- Zod 4 candidate for runtime boundary schemas.

Add a client form-state library only when interaction complexity requires it.

## 12.4 Data tables

TanStack Table is a strong candidate for complex tables/data grids because:

- it is headless;
- source markup/design remain controlled by the generated app;
- table features are opt-in;
- it composes with shadcn/Base UI/React Aria.

Do not use it for trivial two-column static tables.

## 12.5 Internationalization

Keep locale/RTL semantics in Product Graph.

A Next.js-specific library such as next-intl may be qualified as an implementation adapter, but the semantic contract cannot depend on it.

## 12.6 Navigation quality

Current Next.js 16.3 Instant Navigation capabilities and related testing should be part of the performance-quality profile for navigation-heavy products.

## 12.7 Framework diagnostics

Qualify Next.js DevTools MCP as a harness diagnostic adapter.

Useful read surfaces:

- build/runtime/type errors;
- logs;
- project metadata;
- route/page metadata;
- Server Action identity.

It remains a tool through Ineractive's Tool Catalog/capability policy, not trusted authority.

## 12.8 Deployment portability

Use the stable Next.js Adapter API/OpenNext ecosystem as evidence that the generated target must remain portable across qualified providers.

Vercel may be one deployment adapter, never the only runtime contract.

---

# 14. FrontendQualityProfile

Introduce a generated-project quality profile.

Conceptually:

~~~text
FrontendQualityProfile
├── framework target + qualified version range
├── React target
├── styling target
├── primitive base
├── component registry policy
├── server/client boundary policy
├── data-fetch policy
├── form policy
├── table policy
├── i18n/RTL policy
├── motion policy
├── design rule packs
├── React/Next rule packs
├── component workbench policy
├── browser test policy
├── accessibility policy
├── visual regression policy
└── performance/navigation policy
~~~

This is a compiler profile, not a permanent dependency list.

Imported applications preserve compatible existing architecture rather than being rewritten to the current default stack.

---

# 15. Frontend quality evidence pipeline

Candidate pipeline:

~~~text
source change
→ type/lint
→ React Doctor changed-scope scan
→ Vercel React/Next rule pack
→ Impeccable deterministic detectors
→ Vercel Web Interface Guidelines
→ component state/story tests
→ Storybook/Vitest accessibility where configured
→ browser journey
→ axe page scan
→ responsive viewport matrix
→ Playwright visual comparison where useful
→ navigation/performance checks
→ independent design critique
→ findings/repair
→ exact-source evidence bundle
~~~

No single score or tool grants PASS.

---

# 16. Proposed default web stack

At implementation time, requalify the then-current patched versions.

Current research direction:

~~~text
Next.js App Router
React
TypeScript
Tailwind CSS
shadcn-compatible source-owned UI
Base UI default primitive base
Zod boundary schemas
Vitest
Playwright
axe-core
Storybook for Ineractive + complex component systems
Motion on demand
TanStack Table on demand
TanStack Query on demand
Next.js DevTools MCP as qualified diagnostics
Storybook MCP as qualified component introspection
Impeccable + Vercel Web Guidelines + Vercel React Best Practices
React Doctor deterministic React scan
~~~

Potentially qualified adapters:

~~~text
React Aria primitive base
Radix primitive base preservation
next-intl
Magic UI
Motion Primitives
tweakcn token/theme import
21st external component discovery
React Scan runtime performance visualization
~~~

---

# 17. Explicit rejections

Do not:

- install five overlapping component libraries by default;
- let each generation invent a new primitive set;
- combine Base UI/Radix/React Aria randomly inside one generated project;
- force every component to be a Client Component;
- add TanStack Query to every Next.js app;
- use Motion for trivial CSS effects;
- import an external registry block without provenance/security/a11y/token/base review;
- require a paid design/visual-testing/catalog service for core Ineractive functionality;
- treat automated accessibility scanning as complete compliance proof;
- treat a design/React quality score as acceptance authority;
- migrate an imported project's working primitive base merely to match the current Ineractive default;
- couple generated products to Ineractive's private component runtime.

---

# 18. Planning recommendation

The candidate canonical plan should add:

1. `FrontendQualityProfile`;
2. one primitive-base identity per generated project;
3. `ComponentRegistryAdapter`;
4. `ComponentResolver`;
5. `RegistryAdmissionGate`;
6. an Ineractive-qualified source registry;
7. versioned Design/Frontend rule packs;
8. Storybook component introspection/testing;
9. Next.js DevTools MCP runtime diagnostics;
10. deterministic React quality scanning;
11. free/local visual and accessibility proof paths;
12. explicit on-demand dependency policy rather than default dependency bloat.

This creates a stronger moat than merely adding more UI libraries.
