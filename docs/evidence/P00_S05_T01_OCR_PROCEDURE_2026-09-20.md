# P00-S05-T01 — Alibaba OCR Local Procedure Evidence

**Task:** IN-P00-S05-T01 (SpecGrain SG-000006)  
**Date:** 2026-09-20  
**Branch:** `p00/s05-ocr-init`  
**Base:** `main` @ `3e1bf790a3a66bbef97b588be857b592032de095`

## Tooling and provenance

- Alibaba Open Code Review `ocr` CLI, release `v1.12.7`
  (`open-code-review v1.12.7 (85cecfe) windows/amd64`, built 2026-09-19T08:48:49Z).
- Asset: `opencodereview-windows-amd64.exe`.
- SHA-256 verified against the published `sha256sum.txt` for tag `v1.12.7`:
  `7c40f72363c66bd49aa16ddde48ddb458eed6d8492c3a0c35a94d6a9bac1bb64` — MATCH.

## What was executed (real, not fabricated)

### Deterministic file accounting (no LLM) — EXECUTED

Against the real merged P00-S03 diff
(`--from 402981ad... --to 3e1bf790...`):

```text
ocr delegate preview --from 402981ad2f157cc168b8699c6a255c1ea1b42fde \
                     --to 3e1bf790a3a66bbef97b588be857b592032de095 --format json
```

Result (`schema_version 1`, exit 0):

- `total_files`: 5, `reviewable_count`: 1, `excluded_count`: 4
- `merge_base`: `402981ad2f157cc168b8699c6a255c1ea1b42fde`
- reviewable: `.diffcipline.toml` [added] +52/-0
- excluded (`exclude_reason: "unsupported_ext"`): `docs/engineering/DIFFCIPLINE.md`,
  `docs/evidence/P00_S03_T01_DIFFCIPLINE_POLICY_2026-09-20.md`,
  `docs/evidence/P00_S03_T02_DIFFCIPLINE_PROOF_2026-09-20.md`, `specs/CURRENT.md`

Every changed file is deterministically accounted for as **reviewable** or
**excluded-with-reason** — the OCR coverage contract.

### Rule resolution (no LLM) — EXECUTED

```text
ocr delegate rule .diffcipline.toml
```

Resolved the applicable review rule group (correctness / security / performance /
maintainability / test coverage) for the reviewable file. Exit 0.

## Credential blocker (truthful, NOT RUN)

The **semantic** `ocr review` requires a configured LLM endpoint. None is configured:
no `OCR_LLM_*` / `ANTHROPIC_*` / `*_API_KEY` environment variables, no
`~/.opencodereview/config.json`, and no local model runtime. `ocr review` fails closed:

```text
Error: resolve LLM endpoint: no valid LLM endpoint configured; one of
OCR_LLM_URL/OCR_LLM_TOKEN/OCR_LLM_MODEL, ~/.opencodereview/config.json, or
ANTHROPIC_BASE_URL/ANTHROPIC_AUTH_TOKEN/ANTHROPIC_MODEL must be set
```

**Semantic OCR review: NOT RUN.** This is a genuine external blocker: provisioning a
scoped LLM endpoint/token for OCR is a founder/operations decision (which provider, key
scope, and how the secret is brokered). It is recorded here, not fabricated.

Per `docs/canonical/P00_BOOTSTRAP_HANDOFF.md` §8, the P00 exit accepts the OCR gate as
satisfied when "Alibaba OCR workflow has actually executed against an exact candidate
**or the canonical plan explicitly records a truthful external blocker preventing
execution**." The deterministic layer has actually executed; the semantic layer has a
truthful recorded blocker.

## Changes

- `docs/engineering/ALIBABA_OCR.md` — procedure, provenance, evidence contract.

## Baseline gates on this branch

`prettier --check .`, `eslint .`, `tsc --noEmit`, `vitest run` (17/17) — PASS.

## NOT RUN (truthfully)

- OCR semantic (LLM) review: NOT RUN — credential blocker recorded above.
- OCR CI/GitHub-Action wiring: NOT RUN (added only when scoped credentials are configured).
