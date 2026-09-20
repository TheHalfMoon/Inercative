# Ineractive Control-Plane UI System v1

**Status:** P01 first-party control-plane baseline  
**Task:** IN-P01-S04-T01  
**SpecGrain:** SG-000013  
**Date:** 2026-09-20

## Purpose

This is the first bounded UI system for Ineractive's own control plane. It is not the
later generated-product Design OS and it does not qualify a third-party primitive library.

## Token contract

The control plane uses source-owned semantic CSS custom properties for:

- typography;
- type scale;
- spacing;
- radii;
- minimum control size;
- canvas/surface/text/border colors;
- brand/focus/warning states;
- elevation and layout widths.

Components consume semantic tokens rather than duplicating recurring brand values.

## Accessibility baseline

The bounded baseline includes:

- native semantic button/input/label structure;
- explicit accessible descriptions for the session-only and no-execution boundaries;
- visible `:focus-visible` treatment;
- 44px minimum ordinary control height;
- disabled and invalid-state styling conventions;
- live status messaging;
- project selection state through `aria-pressed`;
- reduced-motion override.

These checks are evidence for a baseline, not a claim of complete WCAG conformance.

## Responsive baseline

The shell no longer has a fixed desktop minimum width.

Layout modes:

- wide: project / workspace / activity columns;
- tablet: project + workspace with activity below;
- narrow: stacked regions with horizontally scrollable project choices.

Session-only status and activity remain visible at every mode.

## Brand baseline

The first brand expression uses a source-owned geometric mark with an intentional removed
segment, paired with restrained neutral surfaces and a high-contrast signal accent.

The mark is an Ineractive-owned CSS shape, not copied third-party artwork.

No external font or icon dependency is introduced by this Grain.

## Dependency boundary

This Grain intentionally does **not** add Base UI, React Aria, Radix, shadcn, Tailwind,
Storybook, motion, or a component registry. Those remain subject to their dedicated
qualification/admission work.
