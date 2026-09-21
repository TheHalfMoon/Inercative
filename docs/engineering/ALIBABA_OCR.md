# Ineractive Alibaba Open Code Review (OCR) Procedure

**Status:** active P00 engineering procedure
**Task:** IN-P00-S05-T01 (SpecGrain SG-000006), extended by the P02-S01-T02B review record
**Tool:** alibaba/open-code-review `v1.12.7` (`ocr` CLI)

## 1. Role

Alibaba Open Code Review is Ineractive's **designated AI review engine**. It performs
deterministic file selection and rule resolution, and — in delegation mode — supplies the
review frame in which the host agent performs semantic, line-level review of the exact
diff. OCR findings are **review observations, not acceptance authority** — OCR does not
grant PASS.

CodeRabbit, cubic, or any other bot status is **not** substitute qualification evidence.

## 2. Tool pinning and provenance

- Release: `v1.12.7` (tag, published 2026-09-19), `windows/amd64`.
- Asset: `opencodereview-windows-amd64.exe`.
- SHA-256 verified against the published `sha256sum.txt` for tag `v1.12.7`:
  `7c40f72363c66bd49aa16ddde48ddb458eed6d8492c3a0c35a94d6a9bac1bb64`.
- Binary self-report: `open-code-review v1.12.7 (85cecfe) windows/amd64`, built
  `2026-09-19T08:48:49Z`.
- Install location in the founder workstation environment:
  `%USERPROFILE%\.opencodereview\bin\ocr.exe`.
- `@alibaba-group/open-code-review` npm `latest` was `1.12.8` at review time and is
  deliberately **not** used: the repository pins the reviewed `v1.12.7` release.
- Pin upgrade = re-download the asset, re-verify the checksum against the new release's
  `sha256sum.txt`, and record the change here.

## 3. Three execution layers

### 3.1 Deterministic layer (no LLM required) — always available

- **File accounting** (the review coverage contract):

  ```bash
  ocr delegate preview --from <base> --to <head> --format json
  ```

  Emits the exact base/head/merge-base and, for every changed file, either
  `reviewable_files[]` or `excluded_files[]` with a deterministic `exclude_reason`.

- **Rule resolution** (applicable review rules for a file, no LLM):

  ```bash
  ocr delegate rule --format json <path> [<path>...]
  ```

  Files sharing a rule group are reported once, so the semantic reviewer can work
  rule-group by rule-group.

### 3.2 Delegation-mode semantic layer (no OCR LLM endpoint required)

Delegation mode is OCR's supported execution path when the host coding agent supplies the
model. OCR performs file selection and rule resolution; the host agent reads the diffs
with `git diff <merge_base>..<to> -- <path>`, reviews every reviewable file against its
resolved rule group, and returns findings in OCR's comment shape
(`path`, `content`, `start_line`, `end_line`, `category`, `severity`).

This is the layer that satisfies Ineractive's independent-semantic-review requirement in
environments without a scoped LLM endpoint. It is a real review, not a substitute claim:
the coverage accounting, rule resolution, findings, and dispositions are recorded exactly
as in the hosted layer.

Reference implementation of this layer's operation:
`docs/evidence/P02_S01_T02B_OCR_REVIEW_2026-09-21.md`.

### 3.3 Hosted semantic layer (requires an LLM endpoint)

```bash
ocr review --from <base> --to <head> --format json --output <findings.json>
```

`--from`/`--to` bind the exact base and head (merge-base mode). `--format json` /
`sarif` give machine-readable findings. `--background` / `--background-file` inject the
active Grain / product / spec context.

Hosted semantic review requires a configured LLM endpoint: `OCR_LLM_URL` /
`OCR_LLM_TOKEN` / `OCR_LLM_MODEL`, or `~/.opencodereview/config.json`, or an
Anthropic-compatible `ANTHROPIC_BASE_URL` / `ANTHROPIC_AUTH_TOKEN` / `ANTHROPIC_MODEL`.

## 4. Current credential state (truthful)

**No hosted LLM endpoint is configured in this environment.** No `OCR_LLM_*` /
`ANTHROPIC_*` variables are set and no `~/.opencodereview/config.json` exists, so
`ocr review` fails closed:

```text
Error: resolve LLM endpoint: no valid LLM endpoint configured; one of
OCR_LLM_URL/OCR_LLM_TOKEN/OCR_LLM_MODEL, ~/.opencodereview/config.json, or
ANTHROPIC_BASE_URL/ANTHROPIC_AUTH_TOKEN/ANTHROPIC_MODEL must be set
```

The **hosted** semantic layer is therefore **NOT RUN / BLOCKED**. That blocker is
recorded, never converted into PASS, and it no longer blocks semantic review as such:
the **delegation-mode** semantic layer has actually executed against an exact candidate
(see the P02-S01-T02B OCR review record).

Secrets must remain brokered and scoped: if a hosted OCR LLM endpoint is provisioned, its
token is supplied via a scoped environment/secret, never committed, never logged, and
never exposed to a browser bundle.

## 5. Environment hygiene for local OCR runs

- Run OCR against a dedicated clone whose base/head revisions are fetched by exact SHA.
- The founder workstation's global git config contains a non-absolute `safe.directory`
  entry that makes git print a warning on stdout-adjacent channels; OCR parses git output
  and can then fail with a mangled revision. Supply a scoped `GIT_CONFIG_GLOBAL` file
  containing only `init.defaultBranch`, `core.autocrlf`, and the `safe.directory` entries
  required by the candidate clone instead of editing the user's global configuration.
- `ocr delegate` operates on the repository at the current directory; pass `--repo` when
  the reviewer runs outside the candidate worktree.

## 6. Evidence contract (IN-P00-S05-T02 / SG-000008)

The machine-readable contract is defined by:

- `packages/protocol/schema/ocr-review-evidence.schema.json`;
- private P00 validator `packages/protocol/src/ocr-review-evidence.ts`.

Every OCR-attached change must record:

- exact `base`, `head`, and `merge_base`;
- the complete changed-file set;
- deterministic `reviewable_files[]` and `excluded_files[]` with `exclude_reason`;
- separate-review evidence for every material excluded/unsupported file;
- applicable rule resolution for every reviewable file;
- OCR release, verified binary digest, and configuration identity, including which
  semantic layer ran (delegation or hosted);
- semantic state `RUN`, `BLOCKED`, or `NOT_RUN`;
- JSON/SARIF output identity plus findings when semantic review actually ran;
- an explicit blocker/reason and zero semantic findings when it did not;
- disposition and rationale for every material semantic finding.

A material `UNRESOLVED` or `DEFERRED_BLOCKING` finding blocks completion.

If the candidate head changes after review, the evidence becomes stale unless the review
is re-run or an explicit deterministic reconciliation binds the old reviewed head to the
new candidate and proves the reviewed diff unchanged. When a review finding is repaired
forward, the repair commit, its verification, and the fresh review of the new exact head
are recorded together.

OCR remains a reviewer, not acceptance authority.
