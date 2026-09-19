# Ineractive Toolchain and Baseline Checks

**Status:** active P00 engineering procedure
**Decision record:** `docs/adr/ADR-0001-p00-toolchain-baseline.md`

## 1. Prerequisites

| Requirement | Qualified value |
| --- | --- |
| Node.js | `24.x` (`.node-version`); floor `>= 22.13.0` |
| pnpm | `12.4.2` (`packageManager` in `package.json`) |
| Git | any recent version; the repository uses normal commits only |

If pnpm is not installed globally, every command in this document works when invoked as
`npx --yes pnpm@12.4.2 <command>`, which resolves the pinned manager without changing global state.

## 2. Clean install

```bash
git clone https://github.com/TheHalfMoon/Inercative.git
cd Inercative
npx --yes pnpm@12.4.2 install --frozen-lockfile
```

`--frozen-lockfile` is the supported install path. It fails instead of silently changing resolved
versions, and it runs pnpm's supply-chain policy verification against the committed lockfile.

## 3. Baseline checks

```bash
npx --yes pnpm@12.4.2 run format:check   # Prettier, code and configuration only
npx --yes pnpm@12.4.2 run lint           # ESLint + typescript-eslint type-checked
npx --yes pnpm@12.4.2 run typecheck      # tsc --noEmit for tooling and every workspace package
npx --yes pnpm@12.4.2 run test           # Vitest
```

Or run the same gates as one command:

```bash
npx --yes pnpm@12.4.2 run check
```

`check` is the exact set of gates the CI workflow executes. A local `check` pass and a CI pass on the
same commit are intended to be the same claim; a local pass is not a substitute for CI evidence
because CI runs on a pinned Node version and a different operating system.

### Formatting

```bash
npx --yes pnpm@12.4.2 run format        # rewrite code and configuration in place
```

Markdown is intentionally excluded from formatting. Canonical planning documents, ADRs, and evidence
records are authored review artifacts; see ADR-0001 §5.2.

## 4. Layout

```text
package.json            workspace root, pinned toolchain, canonical commands
pnpm-workspace.yaml     workspace membership, install and supply-chain policy
tsconfig.base.json      shared strict compiler options
tsconfig.json           root tooling typecheck (vitest.config.ts)
eslint.config.js        type-checked lint configuration
packages/protocol/      provider-neutral protocol boundary (P00 placeholder)
packages/program-tasks/ deterministic validation of specs/tasks.md
```

Only packages that P00 needs exist. P01 and later phases add packages when their Grain requires them.

## 5. Adding a workspace package

1. Create `packages/<name>/package.json` with `"private": true` and a `typecheck` script.
2. Create `packages/<name>/tsconfig.json` extending `../../tsconfig.base.json`.
3. Export source from `src/index.ts`. P00 has no build step; packages are consumed as source.
4. Run `npx --yes pnpm@12.4.2 install` to update the lockfile, then `run check`.
5. Keep the dependency graph acyclic; `disallowWorkspaceCycles: true` fails the install otherwise.

## 6. Changing a pinned version

1. Change the exact version in `package.json`.
2. Run `npx --yes pnpm@12.4.2 install` and commit the resulting `pnpm-lock.yaml` change.
3. Run `run check` and record the outcome.
4. If the dependency is younger than the `minimumReleaseAge` window, either wait or add a reviewed
   exception to `pnpm-workspace.yaml` with the provenance rationale recorded next to it.
5. Toolchain-shape changes require an ADR update; routine patch bumps do not.

## 7. Determinism rules

- No floating versions in workspace manifests; exact pins plus a committed lockfile.
- No install path that rewrites resolutions in CI.
- No new dependency for a capability that a pinned dependency already provides without qualification
  evidence.
- `--frozen-lockfile` is used in CI. A lockfile change is a reviewable change, never a side effect.