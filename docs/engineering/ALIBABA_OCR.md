# Ineractive Alibaba Open Code Review (OCR) Procedure

**Status:** active P00 engineering procedure  
**Task:** IN-P00-S05-T01 (SpecGrain SG-000006)  
**Tool:** alibaba/open-code-review `v1.12.7` (`ocr` CLI)

## 1. Role

Alibaba Open Code Review is Ineractive's **designated AI review engine**. It performs
semantic, line-level review of the exact diff. OCR findings are **review observations,
not acceptance authority** — OCR does not grant PASS.

CodeRabbit, cubic, or any other bot status is **not** substitute qualification evidence.

## 2. Tool pinning and provenance

- Release: `v1.12.7` (tag), built 2026-09-19, `windows/amd64`.
- Asset: `opencodereview-windows-amd64.exe`.
- SHA-256 (verified against the published `sha256sum.txt` for tag `v1.12.7`):
  `7c40f72363c66bd49aa16ddde48ddb458eed6d8492c3a0c35a94d6a9bac1bb64`.
- Local install: the verified binary is placed on PATH as `ocr`.
- Pin upgrade = re-download the asset, re-verify the checksum against the new release's
  `sha256sum.txt`, and record the change here.

## 3. Two execution layers

OCR separates a **deterministic** layer from a **semantic** layer. Only the
deterministic layer runs without an LLM.

### 3.1 Deterministic layer (no LLM required) — always available

- **File accounting** (the review coverage contract):

  ```bash
  ocr delegate preview --from <base> --to <head> --format json
  ```

  Emits the exact base/head/merge-base and, for every changed file, either
  `reviewable_files[]` or `excluded_files[]` with a deterministic `exclude_reason`.
  This is the machine-readable "every material changed file is reviewed or accounted
  for" record.

- **Rule resolution** (applicable review rules for a file, no LLM):

  ```bash
  ocr delegate rule <path> [<path>...]
  ```

### 3.2 Semantic layer (requires an LLM endpoint)

```bash
ocr review --from <base> --to <head> --format json --output <findings.json>
```

`--from`/`--to` bind the exact base and head (merge-base mode). `--format json` /
`sarif` give machine-readable findings. `--background` / `--background-file` inject the
active Grain / product / spec context.

Semantic review requires a configured LLM endpoint: `OCR_LLM_URL` / `OCR_LLM_TOKEN` /
`OCR_LLM_MODEL`, or `~/.opencodereview/config.json`, or an Anthropic-compatible
`ANTHROPIC_BASE_URL` / `ANTHROPIC_AUTH_TOKEN` / `ANTHROPIC_MODEL`.

## 4. Current credential state (truthful)

**No LLM endpoint is configured in this environment.** No `*_API_KEY` /
`OCR_LLM_*` / `ANTHROPIC_*` variables are set, no `~/.opencodereview/config.json`
exists, and no local model runtime (Ollama etc.) is present.

Attempting `ocr review` fails closed with:

```text
Error: resolve LLM endpoint: no valid LLM endpoint configured; one of
OCR_LLM_URL/OCR_LLM_TOKEN/OCR_LLM_MODEL, ~/.opencodereview/config.json, or
ANTHROPIC_BASE_URL/ANTHROPIC_AUTH_TOKEN/ANTHROPIC_MODEL must be set
```

Therefore the **semantic** OCR review is **NOT RUN** — blocked on an external credential
that is a founder/operations decision (which provider/key, scoped how). The
**deterministic** OCR layer (file accounting + rule resolution) **is executed and
proven** against the real merged P00-S03 diff (see evidence record).

Secrets must remain brokered and scoped: when an OCR LLM endpoint is provisioned, its
token is supplied via a scoped environment/secret, never committed, never logged, and
never exposed to a browser bundle.

## 5. Evidence contract (feeds IN-P00-S05-T02)

Every OCR-attached change must record:

- exact `base`, `head`, and `merge_base`;
- `reviewable_files[]` and `excluded_files[]` with `exclude_reason`;
- applicable rule resolution;
- OCR version/config provenance;
- semantic findings (JSON/SARIF) when the semantic layer ran, or an explicit recorded
  blocker when it did not;
- disposition of every material finding (fixed / dispositioned / blocking).

If the candidate head changes materially after review, the review is re-run or
explicitly reconciled against the new exact head.
