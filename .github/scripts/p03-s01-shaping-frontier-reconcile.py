from pathlib import Path

path = Path("specs/CURRENT.md")
text = path.read_text()

old = "- P03 — planned and dependency-governed; `IN-P03-S01-T01` is independently dependency-eligible and its first bounded Grain is now shaped canonically.\n"
new = "- P03 — planned and dependency-governed; `IN-P03-S01-T01` is independently dependency-eligible and its bounded shaping set is complete, but implementation is not complete and downstream P03 tasks remain dependency-blocked.\n"
assert old in text
text = text.replace(old, new, 1)

ledger = "| SG-000038 | IN-P03-S01-T01A | Deterministic Run lifecycle and continuation semantics | GRAIN / SHAPED | PR #91; `docs/evidence/FRONTIER_RECONCILIATION_2026-09-29.md` |\n"
assert ledger in text
text = text.replace(
    ledger,
    ledger
    + "| SG-000039 | IN-P03-S01-T01B | Provider-neutral append-only Run event-store contract | GRAIN / SHAPED | PR #94; `docs/evidence/P03_S01_SHAPING_FRONTIER_2026-09-29.md` |\n"
    + "| SG-000040 | IN-P03-S01-T01C | Authenticated durable Run/Event control-plane persistence | GRAIN / SHAPED | PR #95; `docs/evidence/P03_S01_SHAPING_FRONTIER_2026-09-29.md` |\n",
    1,
)

old_s06 = "Implementation PR #92 is Draft at exact candidate `c34e790f00bae19de985c12a696e0fe8dc89d90d` against canonical base `1b1f14ff3e2ee3378fc31c411c63d6cc3a1deaaf`. Current qualification proves repository verification, 662 tests, Diffcipline R2, and checksum-verified Alibaba OCR accounting/rule resolution. Jev v2026.919.0 installs and verifies successfully, but its semantic review is `NOT_RUN / BLOCKED_MISSING_GITHUB_SECRET` because neither `JEV_API_KEY` nor compatible `TYPESAFE_API_KEY` is configured. PR #92 MUST_NOT_MERGE until that exact hard gate passes.\n"
new_s06 = "Implementation PR #92 remains Draft. Candidate `c34e790f00bae19de985c12a696e0fe8dc89d90d` was qualified against former canonical base `1b1f14ff3e2ee3378fc31c411c63d6cc3a1deaaf`; canonical main has since advanced through spec/documentation merges, so that candidate is now stale and is not current merge authority. Its last qualification proved repository verification, 662 tests, Diffcipline R2, and checksum-verified Alibaba OCR accounting/rule resolution, but Jev semantic review remained `NOT_RUN / BLOCKED_MISSING_GITHUB_SECRET`. Before any merge, PR #92 requires forward-only reconciliation to then-current main plus fresh exact-head qualification and credentialed Jev PASS.\n"
assert old_s06 in text
text = text.replace(old_s06, new_s06, 1)

start = text.index("### P03-S01\n")
end = text.index("\n## Current dependency-unlocking frontier", start)
replacement = """### P03-S01

Shaping complete; implementation is not complete.

The bounded parent-task shaping set is now canonical:

- SG-000038 / `IN-P03-S01-T01A` — deterministic Run lifecycle and continuation semantics; PR #91 merged as `1b1f14ff3e2ee3378fc31c411c63d6cc3a1deaaf`; fresh-main CI `36408501348` passed Ubuntu and Windows.
- SG-000039 / `IN-P03-S01-T01B` — provider-neutral append-only Run EventStore contract/reference semantics; PR #94 merged as `8bb0e36600f610af9af360b32c57b4334af059b7`; fresh-main CI `36571131041` passed Ubuntu and Windows.
- SG-000040 / `IN-P03-S01-T01C` — authenticated durable project-owned Run/Event control-plane persistence with RLS/tenant isolation and no service-role/generated-app credential authority; PR #95 merged as `091ac844f918627fb64b9582482eda81851f1ee8`; fresh-main CI `36571905540` passed Ubuntu and Windows.

Together these Grains define the bounded implementation authority required for parent `IN-P03-S01-T01 — Implement Run lifecycle/event store`: pure lifecycle/continuation semantics, provider-neutral append/replay semantics, and the security-sensitive durable control-plane adapter boundary.

They do **not** implement the parent task. Implementation of SG-000038, SG-000039, and SG-000040 must still land through qualified code changes before `IN-P03-S01-T01` can be marked complete.

Because `IN-P03-S02-T01` depends on `IN-P03-S01-T01`, P03-S02 and its downstream chain remain dependency-blocked. Do not shape or implement P03-S02 early merely because the P03-S01 specifications are complete.

All meaningful P03-S01 code-changing candidates remain subject to repository verification, truthful Diffcipline at the applicable risk tier, checksum-verified Alibaba Open Code Review, required credentialed Jev semantic review, exact-head CI, normal merge, and fresh-main CI.
"""
text = text[:start] + replacement + text[end:]

old_safe = """### Safe reversible/spec-only frontier

- Reconcile canonical documentation to current live truth.
- Shape the next bounded P03-S01 event-store semantics Grain using existing EventRecord and SG-000038 as prerequisites.
- Continue only spec/documentation/governance work that does not bypass required implementation qualification.
"""
new_safe = """### Safe reversible/spec-only frontier

- Reconcile canonical documentation to the completed P03-S01 shaping set.
- Keep P03-S02 and later task-level dependents blocked until `IN-P03-S01-T01` is genuinely implemented and qualified.
- Continue only documentation/governance maintenance that does not bypass required implementation qualification; no additional speculative P03-S01 shaping Grain is authorized by current evidence.
"""
assert old_safe in text
text = text.replace(old_safe, new_safe, 1)
path.write_text(text)

evidence = Path("docs/evidence/P03_S01_SHAPING_FRONTIER_2026-09-29.md")
evidence.write_text("""# P03-S01 shaping frontier — 2026-09-29

## Canonical identity

- Repository: `TheHalfMoon/Inercative`
- Canonical main after PR #95: `091ac844f918627fb64b9582482eda81851f1ee8`
- Parent task: `IN-P03-S01-T01 — Implement Run lifecycle/event store`
- Parent dependencies: `IN-P01-S02-T02`, `IN-P01-S05-T01` — already canonical

## Canonical bounded shaping set

### SG-000038 / IN-P03-S01-T01A

Deterministic Run lifecycle and continuation semantics.

- PR #91
- merge: `1b1f14ff3e2ee3378fc31c411c63d6cc3a1deaaf`
- fresh-main CI: `36408501348`
- Ubuntu: PASS
- Windows: PASS

Authority shaped: explicit Run transition semantics, closed terminal-state behavior, and continuation as a distinct child Run preserving exact target revision.

### SG-000039 / IN-P03-S01-T01B

Provider-neutral append-only Run EventStore contract/reference semantics.

- PR #94
- merge: `8bb0e36600f610af9af360b32c57b4334af059b7`
- shaping run: `36570735358` SUCCESS
- exact-head PR CI: `36570922075` Ubuntu PASS / Windows PASS
- fresh-main CI: `36571131041` Ubuntu PASS / Windows PASS

Authority shaped: validated EventRecord append/replay, zero-based contiguous per-Run sequence, immutable history, duplicate/gap/regression rejection, deterministic Run-isolated replay, and a deterministic in-memory reference that is explicitly not durable persistence.

### SG-000040 / IN-P03-S01-T01C

Authenticated durable Run/Event control-plane persistence.

- PR #95
- merge: `091ac844f918627fb64b9582482eda81851f1ee8`
- shaping run: `36571460825` SUCCESS
- exact-head PR CI: `36571588311` Ubuntu PASS / Windows PASS
- fresh-main CI: `36571905540` Ubuntu PASS / Windows PASS
- SpecGrain risk: `high`

Authority shaped: project-owned durable Run/Event persistence in the existing authenticated control-plane Supabase domain, RLS on new exposed tables, owner/editor bounded mutation, viewer read-only access, unrelated-user isolation, anonymous denial, concurrency-safe append-only Event history, atomic SG-000038 lifecycle enforcement, exact protocol round-trip, and continued rejection of service-role/secret/generated-app credentials for ordinary control-plane store initialization.

## Completion boundary

`P03-S01 SHAPING_COMPLETE = YES`.

`P03-S01 IMPLEMENTATION_COMPLETE = NO`.

No source/runtime implementation for SG-000038, SG-000039, or SG-000040 is claimed by these spec-only merges. Parent `IN-P03-S01-T01` cannot close until those bounded implementation obligations are implemented and qualified.

Downstream `IN-P03-S02-T01` depends on the parent task, not merely on its specifications. Therefore P03-S02 remains blocked and must not be shaped or implemented early.

## External qualification blocker

Meaningful code-changing merges remain blocked by the required credentialed Jev semantic review while GitHub Actions lacks `JEV_API_KEY` or compatible `TYPESAFE_API_KEY`.

The latest demonstrated rerun on PR #92 was qualification run `36408957403`, job `109409766921`: repository verification, 662 tests, Diffcipline R2, and checksum-verified Alibaba Open Code Review accounting/rule resolution passed; Jev CLI installation/version passed; semantic review was `NOT_RUN / BLOCKED_MISSING_GITHUB_SECRET`; the final enforcement gate failed intentionally.

No Jev PASS is inferred or waived.

## Governance conclusion

The safe specification frontier for P03-S01 is exhausted. Further progress on the parent task requires implementation plus the existing qualification gates. Creating downstream P03 authority before that would violate the task dependency graph.
""")
