# P00-S03-T01 — Diffcipline Policy Initialization Evidence

**Task:** IN-P00-S03-T01 (SpecGrain SG-000002)  
**Date:** 2026-09-20  
**Branch:** `p00/s03-diffcipline-init`  
**Base:** `main` @ `402981ad2f157cc168b8699c6a255c1ea1b42fde`

## Tooling and provenance

- Diffcipline CLI: TheHalfMoon/Diffcipline `v1.0.0` (immutable release;
  release commit `5cb1c77340b75649f6168e0e8f66479ea047ea96`).
- The MSVC linker was not available locally (`cargo install` from source failed with
  `link.exe not found`), so the official prebuilt Windows asset was used instead.
- Asset: `diffcipline-x86_64-pc-windows-msvc.exe`.
- SHA-256 verified against the published `SHA256SUMS` for tag `v1.0.0`:
  `5fee721d3837ab86f2c36003d02ca67ebac793ff8dadcdb3b7eea074690e57a8` — MATCH.
- Sigstore provenance asset (`PROVENANCE.sigstore.json`) is published for the release.

## Changes

- `.diffcipline.toml` — repository policy (budgets, forbidden surfaces, R0–R3
  verification profiles mapped to the real `pnpm run check` baseline gates).
- `docs/engineering/DIFFCIPLINE.md` — procedure and provenance.

## Commands executed (real output)

### Policy parse + inspect (no execution)

```text
diffcipline check --base origin/main
DIFFCIPLINE PROOF
Verdict       REVIEW
Risk          default
Scope         PASS
Comparison    origin/main...HEAD
Changed       0 files
Verification  NOT RUN — pnpm run check
Reasons:
- verification configured but NOT RUN
- no change detected
REVIEW   (exit 1)
```

### Machine-readable proof

```text
diffcipline check --base origin/main --json
{"schema":"diffcipline.proof/v1","schema_version":"1.0",
 "policy":{"mode":"repository","sources":[".diffcipline.toml"]},
 "verdict":"REVIEW","base":"origin/main","changed_files":0,
 "verification":[{"command":"pnpm run check","state":"NOT RUN"}], ...}
(exit 1)
```

### Risk-profile selection

```text
diffcipline check --base origin/main --risk R0 --json
{"risk":"R0","verification":[{"command":"pnpm run format:check","state":"NOT RUN"}], ...}
(exit 1)
```

## What this proves

- The policy parses (no usage/execution error, exit 64).
- Policy provenance is explicit: `mode=repository`, `sources=[".diffcipline.toml"]`.
- The proof binds an exact base (`origin/main`) and reports the exact candidate diff.
- **NOT RUN is not PASS**: with verification configured but `--run` absent, the verdict
  is REVIEW, never PASS. This is the core Diffcipline invariant demonstrated live.
- Risk profiles R0–R3 resolve to the mapped verification commands.

## Scope note

This Grain initializes policy + procedure only. Executing a real end-to-end proof on a
harmless change (`--run` → PASS on an exact head) is **IN-P00-S03-T02** (SG-000003),
which depends on this Grain.

## NOT RUN (truthfully)

- End-to-end `--run` PASS on a real change: NOT RUN (deferred to SG-000003).
- Diffcipline GitHub Action in CI: NOT RUN (added only when scoped credentials/config
  are required; see `docs/canonical/ROADMAP.md` P00-S05 / quality §16).
- Alibaba OCR: NOT RUN (SG-000006).
