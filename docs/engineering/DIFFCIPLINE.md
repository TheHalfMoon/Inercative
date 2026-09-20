# Ineractive Diffcipline Proof Procedure

**Status:** active P00 engineering procedure  
**Task:** IN-P00-S03-T01 (SpecGrain SG-000002)  
**Tool:** TheHalfMoon/Diffcipline v1.0.0 (immutable release)

## 1. Purpose

Diffcipline is Ineractive's proof-before-done layer. It inspects the exact Git diff,
policy boundaries, and executed verification evidence for one candidate change, and
returns an explainable `PASS` / `REVIEW` / `FAIL` verdict bound to the exact base/head.

It does not grant acceptance by itself; it proves that the configured evidence actually
executed against the exact change.

## 2. Tool pinning and provenance

- Release: `v1.0.0` (immutable). Release commit `5cb1c77340b75649f6168e0e8f66479ea047ea96`.
- Windows CLI asset: `diffcipline-x86_64-pc-windows-msvc.exe`.
- SHA-256 (verified against the published `SHA256SUMS` for tag `v1.0.0`):
  `5fee721d3837ab86f2c36003d02ca67ebac793ff8dadcdb3b7eea074690e57a8`.
- Local install: the verified binary is placed on PATH as `diffcipline`.
- Pin upgrade = re-download the asset, re-verify the checksum against the new release's
  `SHA256SUMS`, and record the change here. Never run an unverified binary.

## 3. Policy

The repository policy is `.diffcipline.toml` at the repo root (policy mode
`repository`; source `.diffcipline.toml`). It defines:

- bounded change budget (`max_changed_files`, `max_added_lines`);
- dependency-manifest / lockfile / untracked handling (all `review` — a lockfile change
  is a reviewable change, never a side effect);
- `forbidden_surfaces` that are never in scope for an ordinary bounded Grain;
- default and R0–R3 verification command profiles mapped to the repository's own
  baseline gates.

Risk profiles map to the canonical model in `docs/canonical/PLANNING_GOVERNANCE.md` §9:

| Profile | Meaning | Verification command(s) |
| --- | --- | --- |
| R0 | docs / non-behavioral metadata | `pnpm run format:check` |
| R1 | isolated deterministic behavior | `format:check` + `lint` + `typecheck` + `test` |
| R2 | shared behavior, contracts, infra, new dependency | `pnpm run check` |
| R3 | authorization / secrets / migrations / production / sandbox security | `pnpm run check` **plus** the additional review/proof obligations in `docs/canonical/QUALITY_AND_REVIEW.md` and `AGENTS.md` |

Passing the baseline gate set alone is never sufficient for R3.

## 4. Running a proof

Inspect scope and pending verification without executing (verification shows NOT RUN):

```bash
diffcipline check --base origin/main
```

Execute the configured verification explicitly (required for PASS):

```bash
diffcipline check --base origin/main --run
```

With a configured risk profile and machine-readable output:

```bash
diffcipline check --base origin/main --risk R2 --run --json
```

The `--json` output conforms to `diffcipline.proof/v1` and records policy provenance,
the exact base, changed/added/deleted files, scope violations, and per-command
verification state (`PASS` / `FAIL` / `NOT RUN`).

## 5. Verdict semantics

- **PASS (0)** — every configured hard requirement observed and satisfied.
- **REVIEW (1)** — no hard failure, but judgment or optional evidence remains
  (including configured-but-not-run verification).
- **FAIL (2)** — a hard requirement or verification command failed.
- **64** — usage/execution error; no proof verdict.

`NOT RUN` is never `PASS`. Changing the candidate head after a proof invalidates that
proof; re-run against the exact new head.

## 6. Relation to other gates

Diffcipline complements, and never substitutes for:

- the deterministic CI baseline (`pnpm run check` on Ubuntu and Windows);
- Alibaba OCR semantic review (IN-P00-S05);
- SpecGrain acceptance for the active Grain.

A merge requires all required gates green on the **same exact head**.
