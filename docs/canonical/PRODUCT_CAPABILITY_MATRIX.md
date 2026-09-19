# Ineractive Product Capability Matrix

**Status:** canonical planning scope map  
**Date:** 2026-09-19

## 1. Purpose

This matrix prevents two failure modes:

1. accidentally shipping a shallow page generator and calling it a product builder;
2. trying to build every possible application category before the core compiler is proven.

The matrix distinguishes:

- **V1 CORE** — required for the first credible product compiler;
- **BETA** — important after the core full-stack path is proven;
- **LATER** — explicitly deferred until evidence justifies expansion;
- **OUT** — not part of the current product direction.

## 2. Builder experience

| Capability | Scope | Notes |
|---|---|---|
| Natural-language product intent | V1 CORE | Primary entry point |
| Screenshot/image input | BETA | P09 |
| URL/reference-site input | BETA | P09 |
| Existing Git repository import | BETA | P09 |
| Figma/design import | BETA | P09 |
| Voice intent | LATER | Useful but not core to compiler quality |
| Assumption Ledger | V1 CORE | Replaces excessive questioning |
| Question Gate | V1 CORE | Zero questions by default |
| Product preview | V1 CORE | Real running app, not static mock |
| Build activity/proof surface | V1 CORE | No hidden "done" claim |
| Visual editing | BETA | P08 |
| Direct code editing | V1 CORE | Product remains normal code |
| Terminal/log access | V1 CORE | Developer mode |
| Undo/checkpoints | V1 CORE | Backed by Git/run state |
| Branch/PR workflows | BETA | P11 |

## 3. Product semantics

| Capability | Scope | Notes |
|---|---|---|
| Product Graph | V1 CORE | Semantic center |
| Personas | V1 CORE | Product context |
| Roles/permissions | V1 CORE | Authorization model |
| Entities/relationships | V1 CORE | Backend compiler input |
| Pages/routes | V1 CORE | UI compiler input |
| Actions/workflows | V1 CORE | Behavior compiler input |
| Requirements | V1 CORE | Verification source |
| Assumptions | V1 CORE | Visible inference |
| Metrics | BETA | Product analytics semantics |
| Notifications | V1 CORE | Basic product behavior |
| Integration definitions | V1 CORE | Typed external boundaries |
| Deployment targets | BETA | P11 |
| Multi-target web/mobile semantics | LATER | P14 |

## 4. Generated web application

| Capability | Scope | Notes |
|---|---|---|
| Responsive application shell | V1 CORE | |
| Pages/routes/layouts | V1 CORE | |
| Reusable components | V1 CORE | |
| Forms/validation | V1 CORE | |
| Loading/error/empty states | V1 CORE | |
| Server/client boundary | V1 CORE | Explicit |
| Search/filter/sort | V1 CORE | First benchmark |
| Tables/list/detail views | V1 CORE | Business-app baseline |
| Dashboards | V1 CORE | |
| File upload/download UI | V1 CORE | With Storage |
| Realtime UI updates | V1 CORE | Qualified subset |
| Accessibility baseline | V1 CORE | Build requirement |
| Internationalization framework | BETA | |
| Arabic/RTL | BETA | Required benchmark before broad launch |
| PWA/installability | LATER | P14 |
| Native iOS/Android | LATER | Expo/React Native compiler target |

## 5. Supabase backend

| Capability | Scope | Notes |
|---|---|---|
| Local Supabase development stack | V1 CORE | Default build path |
| Postgres schema generation | V1 CORE | |
| Migrations | V1 CORE | Native artifacts |
| Constraints/indexes | V1 CORE | |
| Generated database types | V1 CORE | |
| Auth | V1 CORE | |
| Organizations/memberships | V1 CORE | Multi-tenant benchmark |
| RLS | V1 CORE | Deny by default |
| Explicit Data API exposure/grants | V1 CORE | Separate from RLS |
| Storage | V1 CORE | |
| Realtime | V1 CORE | Bounded subset |
| Edge Functions | V1 CORE | Trusted server-side behavior |
| Webhooks | V1 CORE | With signature/idempotency |
| Cron/background jobs | BETA | |
| Queues | BETA | |
| Vector/search | BETA | Only when product needs it |
| Remote project connect | V1 CORE | User-owned Supabase |
| Remote project create | BETA | Via scoped management flow |
| Drift detection | V1 CORE | Required before remote mutation |
| Migration risk classification | V1 CORE | Additive/transformative/restrictive/destructive |
| Expand/contract planning | V1 CORE | For risky production changes |
| Backup/restore awareness | BETA | Operational safety |
| Managed Supabase provisioning | LATER | Commercial hardening |

## 6. Runtime and execution

| Capability | Scope | Notes |
|---|---|---|
| Isolated filesystem | V1 CORE | |
| Process/PTY | V1 CORE | |
| Resource quotas | V1 CORE | |
| Network egress policy | V1 CORE | |
| Secret broker | V1 CORE | |
| Browser automation | V1 CORE | Playwright-class |
| Screenshots/DOM/a11y observations | V1 CORE | |
| Git runtime | V1 CORE | |
| Local Docker-compatible runtime | V1 CORE | |
| Remote sandbox adapter | BETA | Hosted execution |
| Resume/checkpoint | V1 CORE | |
| External-effect receipts | V1 CORE | |
| Ambiguous-state reconciliation | V1 CORE | |
| Remote computer control | LATER | Not required for product compiler V1 |

## 7. Harness intelligence

| Capability | Scope | Notes |
|---|---|---|
| Provider-neutral generative adapter | V1 CORE | |
| Provider-neutral bounded decision adapter | V1 CORE | |
| Model capability registry | V1 CORE | |
| Routing by task/capability/privacy/budget | V1 CORE | |
| Fallback lineage | V1 CORE | No silent equivalence |
| Context Compiler | V1 CORE | |
| Project memory | BETA | P12 |
| Work compiler | V1 CORE | Product Graph diff -> bounded work |
| Repair loop | V1 CORE | Finite and evidence-driven |
| Parallel independent work units | BETA | No artificial agent swarm |
| MCP / Skills / OpenAPI tool ecosystem | BETA | P13 |
| Plugin SDK | LATER | P13 after core stability |

## 8. Design system and visual quality

| Capability | Scope | Notes |
|---|---|---|
| Tokenized design system | V1 CORE | |
| Typography/layout hierarchy | V1 CORE | |
| Design anti-pattern detectors | V1 CORE | Impeccable-derived |
| Responsive viewport checks | V1 CORE | |
| Accessibility checks | V1 CORE | |
| Screenshot critique loop | BETA | P08 |
| DOM/source mapping | BETA | P08 |
| Visual source editing | BETA | P08 |
| Brand artifacts | BETA | PRODUCT/BRAND/DESIGN |
| Design variants | BETA | |
| Full freeform design-tool replacement | OUT | Ineractive edits products, not every design artifact category |

## 9. Verification and assurance

| Capability | Scope | Notes |
|---|---|---|
| Requirements-derived verification | V1 CORE | |
| Unit tests | V1 CORE | |
| Integration tests | V1 CORE | |
| Browser/E2E | V1 CORE | |
| Auth/RLS negative tests | V1 CORE | |
| Storage tests | V1 CORE | |
| Migration reconstruction tests | V1 CORE | |
| Accessibility checks | V1 CORE | |
| Dependency/security checks | V1 CORE | |
| Producer/verifier separation | V1 CORE | |
| Alibaba OCR semantic review | V1 CORE | Delivery gate after P00 |
| Diffcipline exact-diff proof | V1 CORE | |
| Changed-code exercise evidence | BETA | |
| Visual regression | BETA | |
| Performance regression | BETA | |
| Mutation/fuzz/property testing | BETA | Risk-driven |
| Formal/model checking | LATER | Only where justified |

## 10. Ownership and deployment

| Capability | Scope | Notes |
|---|---|---|
| Local project ownership | V1 CORE | |
| Source export | V1 CORE | |
| Git repository ownership | V1 CORE | |
| Supabase migration/config ownership | V1 CORE | |
| Docker/self-host export | BETA | P11 |
| First managed preview deploy | BETA | P11 |
| First managed production deploy | BETA | P11 |
| Clean-room portability proof | BETA | Required before portability claim |
| Custom domains | BETA | |
| Environment secrets | BETA | Brokered |
| Multi-cloud arbitrary IaC | LATER | Avoid shallow breadth |
| Ineractive-only runtime dependency | OUT | Violates portability contract |

## 11. Collaboration

| Capability | Scope | Notes |
|---|---|---|
| Personal projects | V1 CORE | |
| Team organizations | BETA | P12 |
| Project roles | BETA | |
| Invitations | BETA | |
| Activity history | BETA | |
| Comments/mentions | BETA | |
| Shared preview | BETA | |
| Real-time multi-cursor visual editing | LATER | Not required for product value |
| Generic Jira replacement | OUT | Keep work view lightweight |

## 12. Application categories

### Must prove before credible V1 claim

- responsive product site;
- authenticated CRUD SaaS;
- multi-tenant CRM/internal tool;
- file/storage application;
- realtime collaboration-like flow;
- external API/webhook integration;
- complex stateful workflow;
- Arabic/RTL application;
- brownfield feature change.

### Later specialization

- commerce;
- payments;
- regulated clinical/financial workflows;
- native mobile;
- high-scale event systems;
- arbitrary infrastructure generation.

These can be built eventually, but they should not distort the first compiler around edge-case infrastructure.

## 13. Scope rule

A feature can move earlier only when it is a dependency of a proven benchmark or removes a material user blocker.

Popularity alone is not enough to pull a feature into V1.
