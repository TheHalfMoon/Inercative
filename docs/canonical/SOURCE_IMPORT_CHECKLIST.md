# Ineractive Source Import Checklist

**Status:** canonical P00 admission procedure  
**Task:** IN-P00-S04-T03 / SpecGrain SG-000007

## Before source enters the repository

1. Pin the source repository/artifact and immutable 40/64-hex revision.
2. Bound the exact source paths and destination paths.
3. Record COPY / ADAPT / DEPEND use mode.
4. Record founder/license/contract authority without treating it as a replacement for upstream obligations.
5. Record the exact license expression and NOTICE requirement/reference.
6. Resolve dependency closure to `COMPLETE`; PARTIAL or UNRESOLVED is not admissible.
7. Record modification summary and security impact.
8. Attach verification and review evidence.
9. Run deterministic import admission; any structural issue, incomplete closure, or destination collision blocks admission.
10. Regenerate the notice inventory and require an exact deterministic match with `third_party/notice-inventory.json`.
11. Only after the admission record and notice inventory are accepted may a later bounded Grain import donor product code.

## Current P00 state

No donor product code is imported by SG-000007. The canonical current notice inventory is empty because the admitted donor record set is empty.

Source-ledger/research references remain non-admitted until a future import Grain satisfies this checklist.
