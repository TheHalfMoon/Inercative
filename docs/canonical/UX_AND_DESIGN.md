# Ineractive UX and Design System

**Status:** canonical planning direction  
**Date:** 2026-09-19

## 1. Design thesis

Ineractive should feel simpler than the system it controls.

The complexity belongs behind the interface.

The core mental model is:

> **Tell Ineractive what you are trying to make, then work directly on the product while Ineractive builds and proves it.**

Do not present users with an agent topology, DAG, context-window dashboard, or model picker as the default experience.

## 2. Brand concept

Canonical name: **Ineractive**.

The missing letter from "interactive" is a useful identity device, but it must not force a gimmick into every surface.

Possible brand idea:

> **The space where the product takes shape.**

The missing-form concept can inform:

- wordmark negative space;
- cursor/insertion motion;
- transitions from intent to structure;
- empty/loading states;
- component construction animation;
- editorial graphics.

Do not copy Pentagram client identities. Study the method: one strong strategic idea expressed consistently through typography, layout, motion, product UI, and storytelling.

## 3. Impeccable integration

Impeccable is a primary design-process donor/reference.

Adapt:

- durable product truth;
- design-system documentation;
- shape-before-build;
- critique;
- technical audit;
- polish;
- responsive adaptation;
- typography/layout/color checks;
- hardening;
- live variant iteration;
- deterministic anti-pattern detectors.

Ineractive should make these part of the build loop rather than requiring the user to manually invoke dozens of design commands.

## 4. First-run experience

The empty state should contain:

- one clear intent input;
- optional attachments/import;
- a few examples;
- no mandatory configuration wizard.

Supported starting context:

- text;
- screenshot/image;
- Figma/design reference when integrated;
- URL/reference site;
- Git repository;
- existing project import.

After intent submission:

1. acknowledge the interpreted product in one compact sentence;
2. show assumptions only if important;
3. ask at most one compact question batch if blocked;
4. start generating a first real slice;
5. show live product preview as soon as useful.

## 5. Main workspace

Desktop layout direction:

~~~text
+------------------------------------------------------------------+
| Ineractive | Project | branch/status | activity | Publish        |
+---------------------+--------------------------------------------+
|                     |                                            |
| Conversation /      |                Product                     |
| Change Intent       |                Preview                     |
|                     |                                            |
| activity summary    |                                            |
+---------------------+--------------------------------------------+
| Code | Data | Auth | Design | Tests | Logs | Git | Deploy       |
+------------------------------------------------------------------+
~~~

Panels are adaptive. The system should not reserve permanent space for tools the current user does not need.

## 6. Progressive modes

### Builder

Default. Intent + preview + important status.

### Designer

Canvas/DOM/source selection, tokens, components, responsive behavior, variants, assets.

### Developer

Code, terminal, diffs, runtime logs, Git, network/console.

### Data

Schema, rows, relationships, RLS, auth, storage, functions, migrations.

### Proof

Requirements, tests, browser journeys, review findings, security state, evidence.

These are views over one project state, not separate products.

## 7. Question UX

Never stream one question at a time like an onboarding bot.

When a question is unavoidable, use compact choices and explain why it matters.

Example:

~~~text
One decision is blocking the backend:

Who can see a patient's record?
[Only assigned staff]  Recommended
[All clinic staff]
[Custom roles...]

Why this matters: it determines the database access policy and is expensive to change after real data exists.
~~~

Defaults should be explicit and editable.

## 8. Assumptions surface

Provide a compact Assumptions view:

- confirmed;
- inferred;
- needs attention;
- corrected.

The user can change one and see affected areas before applying.

This replaces many pre-build questions.

## 9. Build activity

Do not expose private chain-of-thought.

Expose useful operational state:

~~~text
Building appointment flow
  ✓ Data model
  ✓ Access policies
  ✓ Booking screen
  • Testing confirmation flow
  ○ Publish
~~~

Expandable details can show:

- files changed;
- tests;
- runtime actions;
- findings;
- cost/budget where enabled;
- evidence.

## 10. Visual editor requirements

Selection of a rendered element should identify:

- owning component;
- source location;
- props/data bindings;
- design tokens;
- responsive rules;
- variants.

Edits should create normal code diffs.

Required edits:

- text/content;
- spacing;
- layout;
- typography;
- color/tokens;
- radius/border/elevation;
- responsive visibility/structure;
- component props;
- reorder/move within safe source semantics;
- image/assets;
- variants.

## 11. Design quality loop

For a changed surface:

~~~text
render
 -> deterministic design detectors
 -> accessibility checks
 -> responsive viewport matrix
 -> visual critique
 -> interaction/browser journey
 -> repair
 -> rerender
~~~

Use screenshots and DOM facts as evidence.

Avoid common generated-design failure patterns unless explicitly chosen:

- uniform Inter/system-font look;
- gratuitous purple/blue gradients;
- nested cards everywhere;
- excessive pills;
- weak hierarchy;
- gray text on saturated color;
- decorative icons with no meaning;
- animation without purpose;
- desktop-only composition;
- fake metrics or fake testimonials.

## 12. Brand and design artifacts per project

Each generated project should converge on normal, inspectable artifacts:

- PRODUCT.md — durable product truth;
- BRAND.md — brand idea, voice, visual language;
- DESIGN.md — tokens, components, layout/interaction rules;
- code-based tokens/theme;
- component catalog;
- asset inventory.

Do not overgenerate documentation for tiny projects; these can begin compact and deepen as the product grows.

## 13. Accessibility

Accessibility is a build requirement, not a polish mode.

Baseline:

- semantic structure;
- keyboard support;
- focus state;
- accessible names;
- form labels/errors;
- contrast;
- reduced motion;
- responsive reflow;
- touch targets;
- screen-reader-relevant state.

Generated apps should have automated checks plus browser interaction tests for critical flows.

## 14. Internationalization

The compiler should understand whether the product requires:

- locale routing;
- RTL;
- translated content;
- locale-aware numbers/dates/currency;
- content expansion;
- bidirectional design behavior.

Arabic/RTL cannot be treated as a final CSS flip.

## 15. Design evaluation

Measure design-system behavior rather than subjective beauty alone:

- detector findings;
- accessibility violations;
- responsive overflow;
- token consistency;
- duplicate primitive/component rate;
- user edits retained vs reverted;
- visual regression stability;
- interaction success;
- time from intent to acceptable surface.

Human preference remains final for taste. The system should make quality defaults strong without pretending aesthetics are mathematically solved.
