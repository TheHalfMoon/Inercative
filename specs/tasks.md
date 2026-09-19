# Ineractive Program Tasks

**Status:** roadmap task index; not Grain authority  
**Date:** 2026-09-19

This file provides stable dependency-order handles. SpecGrain is the authority for executable Grain state once initialized.

| ID | Phase | Outcome | Depends on |
|---|---|---|---|
| IN-P00-S01-T01 | P00 | Qualify and pin initial workspace/toolchain | planning merge |
| IN-P00-S01-T02 | P00 | Create minimum monorepo/module skeleton and baseline checks | T01 |
| IN-P00-S01-T03 | P00 | Add CI baseline with exact command evidence | T02 |
| IN-P00-S02-T01 | P00 | Initialize SpecGrain from canonical roadmap | T02 |
| IN-P00-S03-T01 | P00 | Initialize Diffcipline risk/proof policy | T02 |
| IN-P00-S03-T02 | P00 | Prove one harmless exact-diff change end to end | T01 |
| IN-P00-S04-T01 | P00 | Implement donor provenance/import record schema | T02 |
| IN-P00-S04-T02 | P00 | Add provenance validation and notice inventory | T01 |
| IN-P00-S05-T01 | P00 | Establish Alibaba OCR local exact-diff review procedure | T02 |
| IN-P00-S05-T02 | P00 | Define OCR review evidence/file-accounting contract | T01 |
| IN-P01-S01-T01 | P01 | Qualify control-plane framework | P00 exit |
| IN-P01-S02-T01 | P01 | Implement protocol identity/revision primitives | T01 |
| IN-P01-S02-T02 | P01 | Implement run/event/evidence/finding schemas | T01 |
| IN-P01-S03-T01 | P01 | Build project/workspace shell | T02 |
| IN-P01-S04-T01 | P01 | Build first accessible tokenized UI system | T01 |
| IN-P02-S01-T01 | P02 | Prototype Product Graph persistence/interface alternatives | P01 exit |
| IN-P02-S01-T02 | P02 | Select and implement Product Graph v1 contracts | T01 |
| IN-P02-S02-T01 | P02 | Implement domain nodes/edges and deterministic validators | T02 |
| IN-P02-S03-T01 | P02 | Implement Change Intent -> proposed graph delta | T01 |
| IN-P02-S04-T01 | P02 | Implement Question Gate and Assumption Ledger | T01 |
| IN-P02-S05-T01 | P02 | Build Product Graph user views | T02,T04 |
| IN-P03-S01-T01 | P03 | Implement Run lifecycle/event store | P01 contracts |
| IN-P03-S02-T01 | P03 | Implement provider-neutral generative adapter | T01 |
| IN-P03-S03-T01 | P03 | Implement bounded decision adapter and thresholds | T01 |
| IN-P03-S04-T01 | P03 | Implement model capability registry/router | T02,T03 |
| IN-P03-S05-T01 | P03 | Implement context compiler and context provenance | P02 exit,T04 |
| IN-P04-S01-T01 | P04 | Implement capability request/grant kernel | P01 contracts |
| IN-P04-S02-T01 | P04 | Implement sandbox runtime contract | T01 |
| IN-P04-S02-T02 | P04 | Qualify first local Docker-compatible sandbox adapter | T01 |
| IN-P04-S03-T01 | P04 | Implement network policy and secret broker | T01,T02 |
| IN-P04-S04-T01 | P04 | Implement Git runtime/checkpoint primitives | T02 |
| IN-P04-S05-T01 | P04 | Implement Playwright-class browser runtime and evidence | T02 |
| IN-P05-S01-T01 | P05 | Qualify/generated-project V1 scaffold | P02,P03,P04 exit |
| IN-P05-S02-T01 | P05 | Compile routes/pages/components from Product Graph | T01 |
| IN-P05-S03-T01 | P05 | Compile forms/validation/actions | T01,T02 |
| IN-P05-S04-T01 | P05 | Implement incremental bounded source edits | T02,T03 |
| IN-P06-S01-T01 | P06 | Integrate isolated local Supabase CLI stack | P04 exit |
| IN-P06-S02-T01 | P06 | Implement schema/migration/type compiler | P02 graph,T01 |
| IN-P06-S03-T01 | P06 | Implement auth/organization/membership compiler | T02 |
| IN-P06-S04-T01 | P06 | Implement explicit Data API/RLS compiler | T02,T03 |
| IN-P06-S04-T02 | P06 | Implement cross-tenant negative policy tests | T01 |
| IN-P06-S05-T01 | P06 | Implement Storage compiler and policy tests | T04 |
| IN-P06-S06-T01 | P06 | Implement Realtime/functions/jobs subset | T04 |
| IN-P06-S07-T01 | P06 | Implement Supabase OAuth/Management API connection flow | T01 |
| IN-P06-S07-T02 | P06 | Implement remote drift/migration plan | T01,T07 |
| IN-P07-S01-T01 | P07 | Implement Product Graph delta -> bounded WorkPlan | P02,P03 exit |
| IN-P07-S02-T01 | P07 | Implement build orchestrator and write ownership | T01,P04 |
| IN-P07-S03-T01 | P07 | Normalize build/browser/backend failures | T02,P05,P06 |
| IN-P07-S04-T01 | P07 | Implement bounded repair loop | T03 |
| IN-P07-S05-T01 | P07 | Complete golden multi-tenant CRM vertical slice | T04 |
| IN-P08-S01-T01 | P08 | Generate compact product/brand/design artifacts | P05 exit |
| IN-P08-S02-T01 | P08 | Integrate Impeccable-derived deterministic design checks | T01 |
| IN-P08-S03-T01 | P08 | Implement render/critique/repair design loop | T02,P04 browser |
| IN-P08-S04-T01 | P08 | Implement rendered element -> source mapping | P05 |
| IN-P08-S05-T01 | P08 | Implement first visual edits to real code | T04 |
| IN-P08-S06-T01 | P08 | Finalize Ineractive brand system | T01 |
| IN-P09-S01-T01 | P09 | Implement safe existing-repository discovery/import | P04,P05 |
| IN-P09-S02-T01 | P09 | Implement screenshot/image reconstruction flow | P08 |
| IN-P09-S03-T01 | P09 | Implement URL/reference capture and reconstruction | P04 browser,P08 |
| IN-P09-S04-T01 | P09 | Qualify design-tool import path | P08 |
| IN-P09-S05-T01 | P09 | Pass brownfield feature-change benchmark | T01 |
| IN-P10-S01-T01 | P10 | Implement assurance evidence/finding/claim kernel | P01 contracts |
| IN-P10-S02-T01 | P10 | Integrate Ascout test/browser/security evidence adapters | T01 |
| IN-P10-S03-T01 | P10 | Integrate Alibaba OCR machine-readable exact-diff review | T01 |
| IN-P10-S04-T01 | P10 | Integrate Diffcipline exact-candidate proof | T01 |
| IN-P10-S05-T01 | P10 | Complete generated-app security negative fixture pack | T01,P06 |
| IN-P11-S01-T01 | P11 | Implement GitHub repository/branch/push flow | P04 git,P10 |
| IN-P11-S02-T01 | P11 | Qualify first preview deployment target | T01 |
| IN-P11-S03-T01 | P11 | Qualify first production deployment + Docker export | T02 |
| IN-P11-S04-T01 | P11 | Implement env/domain/secret deployment contracts | T02 |
| IN-P11-S05-T01 | P11 | Implement guarded Supabase remote publish | P06,P10 |
| IN-P12-S01-T01 | P12 | Implement Ineractive teams/projects/roles | P11 |
| IN-P12-S02-T01 | P12 | Implement collaboration/activity/comment primitives | T01 |
| IN-P12-S03-T01 | P12 | Implement governed project memory | P03,T01 |
| IN-P12-S04-T01 | P12 | Connect lightweight work/task view to SpecGrain state | T01 |
| IN-P13-S01-T01 | P13 | Qualify second real generative provider adapter | P03 |
| IN-P13-S02-T01 | P13 | Implement bounded MCP/Skills/OpenAPI tool discovery | P04 |
| IN-P13-S03-T01 | P13 | Implement starter archetypes as normal graph/source accelerators | P05,P06 |
| IN-P13-S04-T01 | P13 | Define and prove plugin SDK/capability isolation | T02 |
| IN-P14-S01-T01 | P14 | Harden PWA compiler behavior | P11 |
| IN-P14-S02-T01 | P14 | Prototype/qualify Expo mobile target | P02,P06,P14-S01 |
| IN-P14-S03-T01 | P14 | Define cross-target portability/evidence contract | T02 |
| IN-P15-S01-T01 | P15 | Harden hosted multi-tenant control plane | P12 |
| IN-P15-S02-T01 | P15 | Implement metering/budget/spend controls | T01 |
| IN-P15-S03-T01 | P15 | Qualify managed Supabase provisioning/transfer | T01,P11 |
| IN-P15-S04-T01 | P15 | Establish SLO/recovery/incident observability | T01 |
| IN-P15-S05-T01 | P15 | Complete release/security/supply-chain hardening | P10,P15 |

## Rules

- These IDs are navigation handles, not permission to implement.
- Later tasks may split after earlier evidence.
- A task that grows beyond independent understanding/verification must be refined.
- Cross-phase opportunistic implementation is forbidden unless a canonical plan update changes dependencies.
