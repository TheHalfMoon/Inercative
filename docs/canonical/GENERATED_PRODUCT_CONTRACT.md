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
- asset inventory;
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

## 8. Deployment ownership

The user can choose:

- a qualified managed deployment adapter;
- Docker/self-host export;
- another deployment mechanism outside Ineractive.

Ineractive-specific deployment convenience cannot become the only supported runtime path.

## 9. Import/re-entry

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

## 10. Portability verification

Before claiming export/self-host support for a compiler target, run a clean-room portability test:

1. export the project;
2. remove access to Ineractive-specific services;
3. provision only documented dependencies;
4. install from lockfile;
5. reconstruct local backend from repository artifacts;
6. build and run;
7. execute critical browser journeys;
8. confirm no undeclared Ineractive runtime dependency.

Portability failure blocks the claim.
