# P01-S03-T01 — Workspace Shell Candidate Evidence

**Task:** IN-P01-S03-T01  
**SpecGrain:** SG-000012  
**Date:** 2026-09-20  
**Canonical baseline:** `9ec10a179ee93e0e4279d806ecb48922e66f06ec`

## Candidate scope

The candidate creates the first real Ineractive control-plane package on the qualified
Next.js 16.3.5 / React 19.3.0 baseline.

The shell contains:

- session-only project list;
- session-only project creation and open/select behavior;
- primary workspace layout;
- activity panel backed by canonical protocol EventRecord values;
- explicit product-preview placeholder;
- command/change-intent entry that records activity only.

## Truth boundaries

- no durable persistence;
- no auth/user/project membership;
- no Supabase control-plane data;
- no generated-app backend;
- no Product Graph;
- no model call or code generation;
- no filesystem/source mutation;
- no deployment;
- no acceptance/PASS claim from the shell.

The user-facing shell explicitly labels session data as non-persistent and states that
recording change intent does not execute a model, mutate source, save data, or deploy.

## Required proof

- focused shell-state tests;
- production Next.js standalone build;
- real HTTP smoke against the standalone server observing
  `INERACTIVE_WORKSPACE_SHELL_READY`;
- exact-head Ubuntu and Windows repository CI.

No PASS is claimed before those checks execute.


## Qualification attempt history

- run `35530495242`: workflow YAML was invalid because an evidence heredoc escaped the
  YAML block; no job was created and no product qualification executed.
- run `35530524106`: lockfile refresh, frozen install, formatting, five focused shell
  state tests, and control-plane typecheck passed. The production Next.js build compiled
  successfully, then failed at Next's TypeScript integration because `@types/react`
  was not installed. No standalone HTTP smoke ran on that candidate.

The failed heads are preserved and are not re-run to green. React type packages are
added explicitly at 19.3.0 and acceptance requires a fresh qualification run.

## Executed qualification

GitHub Actions run: `35530591053`

- baseline: `9ec10a179ee93e0e4279d806ecb48922e66f06ec`
- Node: `v24.20.0`
- pnpm: `12.4.2`
- Next.js: `Next.js v16.3.5`
- refreshed root workspace lockfile: EXECUTED
- frozen install from refreshed lockfile: PASS
- focused shell-state tests: PASS
- control-plane typecheck: PASS
- production standalone build: PASS
- real standalone HTTP smoke: PASS
- observed marker: `INERACTIVE_WORKSPACE_SHELL_READY`

This qualification is branch evidence. Final acceptance still requires exact-head Ubuntu
and Windows repository CI after the one-shot workflow is removed.


## Build-artifact hygiene

The successful one-shot qualification initially staged the package directory recursively,
which accidentally included `.next` build output. Those generated artifacts are removed
from the candidate history before PR acceptance, and
`packages/control-plane/.gitignore` now excludes `.next/`.

No build artifact is part of the intended source diff.


## Repository CI repair history

- PR CI #123 / run `35530695984` on candidate
  `bde699d4bad208b73e53bd36d66451f883e30f67` passed frozen install and format on
  Ubuntu, then failed at lint only because the smoke harness consumed Node stream
  `data` values through an `any`-typed callback. The shell state tests and prior
  standalone qualification remain recorded separately.
- The repair sets child stdout/stderr encoding to UTF-8 and narrows callback payloads to
  strings before accumulation. No shell behavior, HTTP target, marker, or runtime
  capability changes.
- Because the smoke harness changed, standalone build/smoke is re-executed on the repaired
  head before acceptance.
