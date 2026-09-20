# Ineractive Frontend and Design Toolchain

**Date:** 2026-09-20
**Status:** candidate canonical direction; requalify versions at implementation time
**Purpose:** define the frontend compiler and tooling architecture that makes Ineractive-generated products distinctive, accessible, source-owned, fast, testable, and agent-readable.

## 1. Principle

Ineractive must not win by installing the most libraries.

It should win by maintaining a coherent, source-owned frontend system:

~~~text
Product Graph
→ FrontendQualityProfile
→ DesignSystemRevision
→ ComponentResolver
→ qualified source components
→ Next.js/React source
→ component state proof
→ browser proof
→ design/accessibility/performance evidence
~~~

The generated product remains normal application source.

## 2. FrontendQualityProfile

Every generated or imported web product has a typed frontend profile.

Conceptually:

~~~text
FrontendQualityProfile
├── framework target
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
├── browser-test policy
├── accessibility policy
├── visual-regression policy
└── performance/navigation policy
~~~

The profile is a compiler contract, not a permanent dependency lock.

Imported applications preserve compatible existing architecture unless evidence justifies migration.

## 3. Framework target

V1 generated web target remains:

- Next.js App Router;
- React;
- TypeScript;
- Tailwind CSS;
- source-owned accessible component primitives.

Current research snapshot on 2026-09-20 observed:

- Next.js 16.3.3 as the security-patched Active LTS line;
- React 19.3 as the current stable line;
- Tailwind CSS 4.3 as the current observed line.

Implementation rule:

> Requalify the then-current patched Active LTS and stable versions before changing the compiler baseline. Never ship a known-vulnerable version because an old planning document pinned it.

Use:

- Server Components by default;
- Client Components only where state, events, effects, or browser APIs require them;
- Server Actions and native form semantics where appropriate;
- Suspense and streaming intentionally;
- framework metadata, image, and font facilities where applicable;
- portable Next.js runtime/adapter behavior rather than Vercel-only assumptions.

## 4. Server/client boundary policy

Default compiler rule:

~~~text
server first
→ push interactivity to the smallest client leaf
→ keep secrets and trusted data access server-side
→ minimize browser JavaScript
~~~

Do not place a client boundary high in a route tree merely because one child is interactive.

The compiler and evaluator should flag accidental client-boundary expansion.

## 5. Source-owned component architecture

### 5.1 One primitive base

Every project declares one primary primitive base.

Candidate default for new generated products:

- Base UI.

Qualified alternate:

- React Aria.

Preserve when imported or already established:

- Radix.

Do not casually mix primitive bases across equivalent controls.

Reasons include:

- focus behavior;
- portal behavior;
- keyboard behavior;
- state selectors;
- accessibility semantics;
- styling conventions.

A base change is an explicit migration, not a cosmetic refactor.

### 5.2 shadcn-compatible source distribution

Use a replaceable ComponentRegistryAdapter.

The first adapter may use the shadcn registry format because it can distribute source-owned:

- components;
- hooks;
- utilities;
- design tokens;
- feature kits;
- project conventions;
- agent instructions;
- testing setup;
- workflow/support files.

The canonical Ineractive contract is the adapter, not shadcn internals.

All installed components become normal project source.

## 6. ComponentResolver

Before generating a new component, resolve in this order:

~~~text
1. current product source
2. project Product Kit / project registry
3. Ineractive Qualified Registry
4. explicitly authorized external registry providers
5. synthesize a new component
~~~

For every selected candidate:

- normalize to project tokens;
- normalize to the declared primitive base;
- preserve server rendering where possible;
- verify required states;
- verify accessibility;
- verify responsive behavior;
- verify RTL when applicable;
- record provenance.

This prevents duplicated primitive systems and inconsistent generation across prompts.

## 7. Ineractive Qualified Registry

Ineractive should maintain a curated source registry for high-confidence reusable building blocks.

Candidate item classes:

- UI primitives;
- composite components;
- forms;
- tables;
- navigation;
- command/search;
- file workflows;
- dashboards;
- auth flows;
- empty/loading/error states;
- product shells;
- design tokens;
- hooks/utilities;
- feature kits;
- verification fixtures.

The registry is an accelerator.

Generated source cannot depend on an Ineractive-only runtime to render.

## 8. RegistryAdmissionGate

Before a third-party component or block enters the qualified registry:

~~~text
provenance
→ license/notice
→ dependency closure
→ supply-chain scan
→ primitive-base compatibility
→ token compatibility
→ server/client boundary
→ React/Next compatibility
→ keyboard/focus
→ automated accessibility
→ responsive states
→ theme behavior
→ RTL where applicable
→ reduced motion
→ runtime/bundle cost
→ component-state coverage
→ visual/design review
→ duplicate-overlap review
→ admission decision
~~~

An external catalog result is a candidate, not trusted project truth.

## 9. Design rule packs

Frontend quality guidance is versioned and provenance-bound.

Initial candidate rule packs:

### Impeccable

Use for:

- durable product/design context;
- deterministic design anti-pattern detection;
- critique/audit/polish vocabulary;
- responsive/design implementation checks;
- design hooks where safely integrated.

### Vercel Web Interface Guidelines

Use for:

- keyboard/focus;
- forms;
- touch;
- responsive behavior;
- content/error UX;
- typography;
- images/fonts;
- theming;
- performance;
- animation;
- i18n.

### Vercel React Best Practices

Use for:

- async waterfalls;
- bundle size;
- server performance;
- client data fetching;
- re-render behavior;
- rendering performance;
- React/Next implementation patterns.

Rule packs feed findings and evidence.

They do not directly grant acceptance.

Acceptance-critical runs use pinned and reviewed rule revisions rather than mutable live network content.

## 10. Deterministic React quality

Qualify React Doctor as a deterministic React quality adapter.

Candidate coverage:

- correctness;
- state/effects;
- performance;
- architecture;
- security;
- accessibility;
- maintainability;
- dependency/supply-chain findings.

Use changed-scope scanning where possible.

Normalize findings into Ineractive Finding/Evidence.

Never treat an aggregate health score as a PASS oracle.

React Scan remains an optional runtime performance visualization and profiling adapter where evidence justifies it.

## 11. Component workbench and agent introspection

### Storybook

Qualify Storybook as the component workbench for:

- component states;
- stories;
- interaction tests;
- accessibility tests;
- component-level browser execution;
- documentation;
- agent component discovery through Storybook MCP.

Policy:

- Ineractive's own design system should have strong Storybook coverage;
- complex generated products should emit useful stories for important reusable components and states;
- tiny generated applications need not carry unnecessary Storybook weight;
- an ephemeral compiler-owned component harness may be used when sufficient.

Do not require a paid visual-testing service for baseline quality proof.

### Storybook MCP

Treat as a qualified read/test tool:

- discover existing components;
- discover real component states;
- reuse rather than hallucinate;
- run focused component/accessibility tests.

It operates through the Tool Catalog, trust metadata, and capability policy.

## 12. Next.js agent diagnostics

Qualify Next.js DevTools MCP for generated Next.js workspaces.

Useful diagnostic surfaces include:

- build/runtime/type errors;
- logs;
- project metadata;
- page/route metadata;
- rendered/runtime structure;
- Server Action identity.

It is observational and diagnostic evidence.

It is not authority to mutate or publish without the normal capability path.

Use version-matched framework documentation and Skills where available.

## 13. Visual feedback and DOM/source intent

Ineractive's own Annotation Intent and semantic binding system should absorb the strongest patterns from current browser-first frontend-agent tools without depending on them at runtime.

Relevant reference patterns include:

- Agentation: point/click/text/area annotations that produce structured selector/context feedback;
- stagewise: running app + browser/DOM/console/debugger + agent in one work surface;
- Domscribe: bidirectional DOM-to-source and source-to-rendered-element mapping through stable build/runtime identity;
- Design Mode: live browser manipulation and MCP handoff of visual changes.

Canonical Ineractive behavior remains:

~~~text
rendered element / region / text
→ stable rendered locator
→ source/component binding
→ Product Graph / DesignSystem binding
→ typed AnnotationIntent
→ bounded semantic/source diff
→ render and verify
~~~

The goal is to remove translation loss between "what the user sees" and "what the agent edits".

External annotation/browser tools are references or optional adapters. They do not become required generated-product dependencies.

Licensing/provenance is evaluated before any code reuse; a reference pattern does not imply code-import authority.

## 14. Testing and evidence stack

### Unit and logic

Vitest.

### Component

Storybook plus Vitest/browser execution where justified.

### Accessibility

Use:

- primitive-base semantics;
- Storybook accessibility checks;
- axe-core / @axe-core/playwright;
- keyboard/focus browser journeys;
- selected human/evaluator checks.

Automated accessibility is incomplete. Do not claim complete accessibility compliance from axe alone.

### Browser and E2E

Playwright.

Use for:

- critical journeys;
- auth;
- backend integration;
- responsive viewports;
- browser console/network observations;
- screenshots;
- visual comparisons;
- failure states.

Visual baselines must run in a controlled renderer environment.

## 15. Motion policy

Default order:

~~~text
CSS
→ React/browser View Transitions
→ Motion for complex interaction
~~~

Use Motion when the product needs:

- spring behavior;
- gestures;
- complex presence/layout animation;
- orchestrated sequences.

Do not add Motion for trivial hover, fade, or color transitions.

All non-essential motion respects reduced-motion preferences.

Generated image/video/animation assets are a separate concern from UI motion. When product requirements justify generated media:

- compile it through `VisualPromptProtocol` / `MediaGenerationRequest` rather than embedding provider prompts inside components;
- keep generation/edit providers behind `MediaProviderAdapter`;
- retain a static/poster or otherwise equivalent reduced-motion fallback when motion is non-essential;
- enforce loading, dimensions, compression, bandwidth, LCP/INP, autoplay/audio, and mobile-data constraints;
- bind accepted outputs to `CreativeAsset` provenance and the active `DesignSystemRevision`;
- treat visually impressive tutorial/demo output as research input, not browser-quality or accessibility proof.

## 16. Data-fetch policy

Default new Next.js product:

- framework/server fetching first;
- avoid waterfalls;
- parallelize independent work;
- use caching intentionally;
- stream meaningful boundaries.

TanStack Query is on demand.

Use it when its client/server cache or mutation behavior solves an actual requirement.

Do not install it by default in every App Router project.

## 17. Forms policy

Default:

- semantic HTML;
- Server Actions/form actions where appropriate;
- typed server validation;
- Zod as a candidate runtime-boundary schema library.

Qualify a client form-state library only when interaction complexity requires it.

The semantic Form/Requirement model lives above the library.

## 18. Data table policy

For complex product tables, TanStack Table is a strong qualified candidate because it is headless and leaves markup/design ownership with the product.

Use it when features such as:

- sorting;
- filtering;
- pagination;
- selection;
- column visibility;
- virtualization integration;
- editable table state

justify the dependency.

Do not use a data-grid engine for trivial tables.

## 19. i18n / RTL policy

Locale and RTL semantics stay in Product Graph and FrontendQualityProfile.

A Next.js-specific implementation such as next-intl may be qualified as an adapter.

Generated layout should prefer logical CSS properties.

Arabic/RTL remains a release benchmark, not a late CSS mirror pass.

## 20. Performance and navigation quality

The frontend quality profile should cover:

- route-level performance budgets;
- bundle/client-JS pressure;
- async waterfalls;
- image/font behavior;
- render churn;
- navigation responsiveness;
- realistic-data performance.

Current Next.js Instant Navigation capabilities and associated testing should be qualified for navigation-heavy generated products.

React Doctor, React Scan, and browser performance observations can supply complementary evidence.

## 21. External design and component sources

These sources are candidate inputs, not automatic dependencies.

### Magic UI

Use selectively for high-quality animated or marketing patterns after admission checks.

### Motion Primitives

Use selectively for source-owned motion patterns after admission checks.

### tweakcn

Use as a theme/design reference or possible token import adapter.

Do not copy a preset and call it a brand system.

### 21st

Optional external component discovery and registry provider.

Never required for core Ineractive operation.

External membership/API requirements and variable community quality mean every candidate still passes RegistryAdmissionGate.

## 22. No dependency zoo rule

Generated projects do not receive libraries merely because they are popular.

For every optional package, the compiler records:

- requirement that justifies it;
- expected benefit;
- dependency/runtime cost;
- client/server impact;
- portability impact;
- alternative considered.

Examples:

~~~text
TanStack Query   → only when framework data APIs are insufficient
TanStack Table   → only for genuinely complex tables
Motion           → only for complex motion/gestures
Storybook        → only when persistent component-workbench value exists
next-intl        → only after i18n adapter qualification
~~~

## 23. Frontend evidence bundle

A candidate UI change can collect:

~~~text
source identity
FrontendQualityProfile revision
DesignSystemRevision
component provenance
type/lint result
React Doctor findings
React/Next rule-pack findings
Impeccable findings
Web Interface Guideline findings
component tests
accessibility results
browser journeys
responsive evidence
visual comparisons
navigation/performance observations
independent design critique
unresolved findings
~~~

No single detector, score, screenshot, or agent message proves completion.

## 24. Current stack direction

Requalify exact versions at implementation time.

Current architectural direction:

~~~text
Next.js App Router
React
TypeScript
Tailwind CSS
source-owned shadcn-compatible UI
Base UI default for new projects
React Aria qualified alternate
Radix preservation for existing projects
Zod boundary validation
Vitest
Playwright
axe-core
Storybook where justified
Motion on demand
TanStack Table on demand
TanStack Query on demand
Next.js DevTools MCP
Storybook MCP
Impeccable
Vercel Web Interface Guidelines
Vercel React Best Practices
React Doctor
~~~

This is a coherent quality system, not a mandatory package list.

## 25. Explicit boundaries

Do not:

- generate a fresh Button/Dialog primitive every prompt;
- mix primitive bases without an explicit compatibility or migration decision;
- auto-import arbitrary community registry code;
- make the entire route tree client-rendered;
- add client caching/state packages without a requirement;
- depend on paid component or visual-testing services for core correctness;
- use aesthetic presets as the product's brand;
- let an upstream skill/rule pack override Product Graph, capability policy, or exact evidence;
- make Vercel the only valid Next.js deployment target;
- migrate working imported applications to the current preferred stack without evidence.

## 26. Planning outcome

The frontend moat should become:

~~~text
Product meaning
+ DesignSystemRevision
+ FrontendQualityProfile
+ source-owned component registry
+ component reuse before synthesis
+ deterministic design/React rules
+ agent-readable component workbench
+ framework runtime introspection
+ real browser/accessibility/performance evidence
+ source ownership
~~~

That is stronger than any individual UI library.
