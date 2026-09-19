# ADR-0001 — P00 toolchain baseline

**Status:** Accepted (P00-S01-T01)
**Date:** 2026-09-19
**Authority:** founder-approved canonical plan (`docs/canonical/P00_BOOTSTRAP_HANDOFF.md`, `specs/CURRENT.md`)
**Related evidence:** `docs/evidence/P00_S01_T01_TOOLCHAIN_QUALIFICATION_2026-09-19.md`

## 1. Context

P00 requires a small, deterministic toolchain that can host later Ineractive packages without
pre-selecting P01+ implementation choices. The pinned baseline must support: workspace packages,
strict TypeScript, a deterministic test runner, formatting, type-aware linting, and a CI baseline
that executes the exact same commands a developer runs locally.

The canonical plan explicitly defers the control-plane React framework, Product Graph persistence,
sandbox provider, visual mapping mechanism, deployment adapter, and generated primitives to later
qualification points. None of those are selected here.

## 2. Decision

| Concern | Pinned choice | Reason |
| --- | --- | --- |
| Workspace / package manager | pnpm `12.4.2` workspaces | single lockfile, frozen installs, content-addressable store, workspace-cycle and supply-chain policy settings |
| Node.js (CI baseline) | Node `24.x` (Active LTS, `.node-version` = `24`) | `v24` entered LTS 2025-10-28 and leaves maintenance 2028-04-30 |
| Node.js floor | `engines.node >= 22.13.0` | floor derived from ESLint 10's own engine range (`^20.19.0 \|\| ^22.13.0 \|\| >=24`); local qualification ran on Node 22.23.1 |
| TypeScript | `6.0.3` | supported by `typescript-eslint@8.70.0` (`>=4.8.4 <6.1.0`); see §4.1 for why not 7.0.2 |
| Test runner | `vitest 5.0.1` + `vite 8.3.0` | `vite` is a required (non-optional) peer of Vitest 5; both satisfy each other's engine/peer ranges |
| Lint | `eslint 10.11.0` + `typescript-eslint 8.70.0` (`recommendedTypeChecked`) | typed rules are needed to catch the async/await and floating-promise defects this project must not ship |
| Format | `prettier 3.9.8` | deterministic formatting for code and config only; Markdown is excluded (§5.2) |
| Node typings | `@types/node 24.13.3` | matches the qualified Node 24 LTS runtime |
| Supported local platform | Windows 11 x64 (development), `ubuntu-latest` (CI) | the development host used for qualification; CI is a separate cell |
| Command naming | `format`, `format:check`, `lint`, `typecheck`, `test`, `check` | `check` is the single local equivalent of the CI gate |

Version pins are **exact** (no ranges) in `package.json`; the committed `pnpm-lock.yaml` is the
authority for the full transitive closure.

## 3. Evidence summary

Qualification executed real installs and real gates, including negative controls:

- `pnpm@12.4.2 install` resolved the full pinned set in 17.4 s (131 packages).
- `pnpm install --frozen-lockfile` re-ran in 2.3 s, reported "Lockfile is up to date, resolution step
  is skipped", and passed pnpm's supply-chain policy verification (156 entries).
- `tsc --noEmit`, `eslint .`, `prettier --check .`, and `vitest run` all exited `0`.
- Negative controls: a type error produced `TS2322` (exit 2); a floating promise produced
  `@typescript-eslint/require-await` and `@typescript-eslint/no-floating-promises` (exit 1); a wrong
  assertion failed the test run (exit 1).

A wrong expectation in the qualification test was found and fixed rather than described: the first
run failed because the test oracle was wrong, not the toolchain.

## 4. Rejected alternatives

### 4.1 TypeScript 7.0.2 (rejected for now)

TypeScript `7.0.2` is the current npm `latest`. It was rejected because `typescript-eslint@8.70.0`
declares `peerDependencies.typescript: ">=4.8.4 <6.1.0"`. Selecting TS 7 would either break typed
linting or force an unsupported peer range. Pinning `6.0.3` keeps the declared support contract
intact. TS 7 is a revisit trigger, not a permanent rejection.

### 4.2 npm workspaces (rejected)

npm `10.9.8` is present on the qualification host, but pnpm was already installed and provides
deterministic frozen installs, workspace-cycle enforcement, and explicit supply-chain policy
settings in a committed file. Adding npm as a second manager would duplicate lockfile authority.

### 4.3 Bun (rejected)

Not installed on the qualification host and would add a second JavaScript runtime plus a second
lockfile format before any evidence requires it.

### 4.4 Biome (rejected)

A single-binary formatter/linter is attractive, but the project needs type-aware rules with the
ESLint rule ecosystem (`typescript-eslint` type-checked configs) that later phases will extend.
Choosing Biome now would trade a real requirement for an install-size saving.

### 4.5 Turborepo / Nx (rejected)

No evidence yet of a task graph large enough to justify a build orchestrator. pnpm's `--filter`
recursion is sufficient for two packages.
## 5. Consequences

### 5.1 Supply-chain policy is explicit, not default-dependent

`pnpm-workspace.yaml` sets `minimumReleaseAge: 1440` (1 day), `blockExoticSubdeps: true`,
`engineStrict: true`, and `disallowWorkspaceCycles: true`. One release-age exception is recorded
(`eslint@10.11.0`), with the provenance rationale written next to it. `disallowWorkspaceCycles: true`
turns the P00-S01-T02 "no circular workspace dependencies" acceptance criterion into a deterministic
install-time failure rather than a review checklist item.

### 5.2 Markdown is excluded from the formatter

The first `prettier --write` run rewrote 13 canonical planning documents under `docs/canonical/` and
`specs/tasks.md` (table alignment and prose reflow). That would have produced an unreviewed diff
against canonical planning authority, so the change was reverted and `**/*.md` was added to
`.prettierignore`. Canonical planning text, ADRs, and evidence records are authored review artifacts.
Code and configuration remain formatter-controlled.

This is a deliberate tradeoff: formatting drift in prose is accepted in exchange for never having a
tool silently rewrite canonical planning text.

### 5.3 Engine floor versus CI pin

`engines.node` expresses the floor compatible with the chosen tools; CI and `.node-version` pin the
qualified LTS. Local development on Node 22.23.1 was verified, but the authoritative cell is Node 24
in CI.

### 5.4 No build step at P00

Workspace packages are consumed as TypeScript source and type-checked with `tsc --noEmit`. P00 ships
no emit pipeline, and later phases introduce one only when a real consumer requires compiled output.

## 6. Revisit triggers

- `typescript-eslint` publishes support for TypeScript 7 (then re-qualify and re-pin).
- Node 26 reaches LTS on 2026-10-28 (candidate successor to the Node 24 baseline).
- A supported-platform failure appears in pnpm 12 that requires a documented workaround.
- A third workspace package creates a real need for build orchestration.
- Canonical planning text gains a stable, review-preserving formatting convention.