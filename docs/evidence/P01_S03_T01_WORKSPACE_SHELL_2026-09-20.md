# P01-S03-T01 — Workspace Shell Candidate Evidence

**Task:** IN-P01-S03-T01  
**SpecGrain:** SG-000012  
**Date:** 2026-09-20  
**Canonical baseline:** `6dd721f355511d7ffaf7cf2619b07ec8c5f6290d`

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
