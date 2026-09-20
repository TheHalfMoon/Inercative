# Ineractive Generated Product Contract

**Status:** canonical planning direction  
**Date:** 2026-09-19

## 1. Purpose

Ineractive generates products that users must be able to understand, run, own, export, and maintain without continuing to depend on Ineractive.

The generated application is a product artifact, not a proprietary Ineractive runtime extension.

## 2. Portability invariant

A generated application MUST remain operational without the Ineractive control plane after export, provided the user supplies the documented runtime services and secrets.

The generated product MUST NOT require:

- an Ineractive account for ordinary application runtime;
- proprietary Ineractive metadata servers;
- an Ineractive-only database proxy;
- hidden hosted prompts or model calls for normal deterministic product behavior;
- private package registries controlled only by Ineractive;
- undisclosed generated-runtime services.

An explicit AI feature inside a generated application may call a configured AI provider, but that dependency belongs to the generated product and must be represented in its source/configuration.

## 3. Canonical export set

A complete export contains all applicable artifacts:

- source code;
- package manifests and lockfiles;
- Supabase configuration;
- database migrations;
- seed/test fixtures;
- generated database types;
- Edge Functions/server code;
- storage and RLS policy definitions;
- environment-variable schema without secret values;
- deployment configuration;
- ReleaseManifest or equivalent release metadata when publishing is used;
- portable operations/health/logging configuration where applicable;
- product analytics/event schema when enabled;
- data lifecycle/export/delete/audit implementation artifacts when required;
- AI-provider configuration schema for explicit AI features without secret values;
- asset/font inventory and provenance metadata where known;
- test configuration;
- documented runtime requirements;
- third-party notices required by the generated artifact;
- Git history when the user requests/owns the repository.

## 4. Ineractive metadata

Ineractive-specific metadata MAY exist to accelerate future edits, but it is auxiliary.

Examples:

- Product Graph bindings;
- source-to-product semantic maps;
- generation provenance;
- visual-editor source maps;
- evidence references.

Deleting auxiliary Ineractive metadata MUST NOT make the generated application stop serving ordinary product behavior.

If the metadata is needed to continue editing through Ineractive, the system must distinguish:

- **runtime-required** artifacts;
- **Ineractive-editing** artifacts.

## 5. Source quality contract

Generated source should look like maintainable human-owned software.

Requirements:

- normal framework conventions;
- no opaque generated blobs where readable code is practical;
- deterministic formatting;
- bounded module interfaces;
- explicit data access and server/client boundaries;
- generated comments only where they add durable context;
- no unnecessary provider-specific abstractions;
- no secret values in source;
- no hidden mutation of generated code outside Git/diff-visible surfaces.

## 6. Dependency contract

Every generated project must:

- pin dependencies through its normal lockfile;
- use public/documented package sources unless explicitly configured otherwise;
- record material dependency changes;
- avoid unnecessary transitive platforms;
- preserve license/notice obligations;
- remain buildable from a clean environment under its documented toolchain.

Ineractive may recommend upgrades, but upgrade state is visible and reviewable.

## 7. Backend ownership contract

For Supabase-backed products:

- migrations/configuration live with the generated source;
- database project identity is explicit;
- local development can reconstruct from repository state;
- remote project linkage is replaceable;
- user-owned projects remain user-owned;
- managed projects have an explicit transfer/export path;
- generated-app credentials never depend on the Ineractive control-plane browser session.

## 8. Release and operations ownership

A production release is more than a code deployment.

When publishing through Ineractive, release state should bind:

- exact source head;
- generated build artifact identity;
- Product Graph/design revision;
- backend migration set and compatibility expectations;
- environment/config revision;
- proof bundle;
- recovery plan;
- last-known-good identity.

Generated products should expose portable operational basics where applicable:

- health/readiness;
- structured logs;
- deploy/source version identity;
- error handling/reporting adapter;
- backend function/job logs;
- optional OpenTelemetry-compatible instrumentation;
- optional product analytics.

These facilities must remain replaceable/exportable and must not require the Ineractive control plane for normal runtime.

## 9. Data lifecycle ownership

When the Product Graph declares data-retention/export/deletion/audit/residency behavior, the generated product must carry the implementation/configuration needed to honor that behavior and the tests/evidence needed to verify it.

A data-classification mechanism is not a claim of compliance with any law or regulation.

## 10. Deployment ownership

The user can choose:

- a qualified managed deployment adapter;
- Docker/self-host export;
- another deployment mechanism outside Ineractive.

Ineractive-specific deployment convenience cannot become the only supported runtime path.

## 11. Import/re-entry

An exported product may later be re-imported.

Ineractive should reconstruct or reconcile:

- Product Graph;
- routes/pages;
- data model;
- permissions;
- workflows;
- design tokens;
- integrations;
- tests.

Loss of auxiliary metadata can reduce reconstruction precision, but must not invalidate the product itself.

## 12. Portability verification

Before claiming export/self-host support for a compiler target, run a clean-room portability test:

1. export the project;
2. remove access to Ineractive-specific services;
3. provision only documented dependencies;
4. install from lockfile;
5. reconstruct local backend from repository artifacts;
6. build and run;
7. execute critical browser journeys;
8. confirm health/release identity remains usable without Ineractive-specific services where applicable;
9. confirm no undeclared Ineractive runtime dependency.

Portability failure blocks the claim.
