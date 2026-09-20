# P00-S03-T02 — Diffcipline End-to-End Exact-Diff Proof Evidence

**Task:** IN-P00-S03-T02 (SpecGrain SG-000003)  
**Date:** 2026-09-20  
**Branch:** `p00/s03-diffcipline-init`  
**Base:** `main` @ `402981ad2f157cc168b8699c6a255c1ea1b42fde`  
**Candidate head proven:** `23958292a0d208ef99b9931abcb83885b4a396b4`

## Subject change

The harmless, bounded change proven end to end is the Diffcipline policy
initialization itself (IN-P00-S03-T01): `.diffcipline.toml`,
`docs/engineering/DIFFCIPLINE.md`, and the S03-T01 evidence record. It is R0
(configuration + documentation, non-behavioral), 3 files, +227/-0.

## Executed proof (real output)

```text
diffcipline check --base origin/main --risk R0 --run
Checking formatting...
All matched files use Prettier code style!
DIFFCIPLINE PROOF
Verdict       PASS
Risk          R0
Scope         PASS
Comparison    origin/main...HEAD
Changed       3 files
Diff          +227 / -0
Dependencies  unchanged
Lockfiles     unchanged
Untracked     0
Verification  PASS — pnpm run format:check
PASS   (exit 0)
```

Machine-readable form:

```text
diffcipline check --base origin/main --risk R0 --run --json
{"schema":"diffcipline.proof/v1","policy":{"mode":"repository","sources":[".diffcipline.toml"]},
 "verdict":"PASS","base":"origin/main","changed_files":3,"added_lines":227,"deleted_lines":0,
 "files":[".diffcipline.toml","docs/engineering/DIFFCIPLINE.md",
          "docs/evidence/P00_S03_T01_DIFFCIPLINE_POLICY_2026-09-20.md"],
 "risk":"R0","scope_violations":[],
 "verification":[{"command":"pnpm run format:check","state":"PASS"}]}
(exit 0)
```

This is an executed verification (`PASS`), not a `NOT RUN`.

## Exact-head / freshness invariant demonstrated

After the PASS above, the working tree was mutated (a throwaway line appended to
`docs/engineering/DIFFCIPLINE.md`, then reverted). With the candidate state changed,
re-running without `--run` reported `verification: NOT RUN` and verdict `REVIEW`
(exit 1) — the earlier PASS no longer applied to the mutated state. The change was
reverted; the tree is clean and identical to the proven head. This demonstrates that
proof binds the exact candidate and that stale proof is not carried forward.

## Semantics observed

- `PASS` (0) only when configured verification actually executed and passed.
- `REVIEW` (1) when verification is configured but NOT RUN, with no hard failure.
- `NOT RUN` is never `PASS` (verified in S03-T01 and again here).
- Scope PASS with the policy's forbidden surfaces present but untouched.
- Dependency and lockfile state reported unchanged.

## Baseline gates on this head

`prettier --check .`, `eslint .`, `tsc --noEmit` (root + packages), `vitest run`
(17/17) — all PASS on `23958292a0d208ef99b9931abcb83885b4a396b4`.

## NOT RUN (truthfully)

- Diffcipline GitHub Action in CI: NOT RUN (deferred; see DIFFCIPLINE.md §6).
- Alibaba OCR: NOT RUN (SG-000006).
