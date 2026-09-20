# Ineractive End-to-End Product Factory Contract

**Date:** 2026-09-20  
**Status:** candidate canonical direction; not current execution authority  
**Purpose:** define what "A-to-Z / end-to-end building" means for Ineractive.

## 1. Product promise

Ineractive must not stop at generating a frontend or handing the user an unfinished codebase.

The target experience is:

> **Describe the product once. Ineractive can take it from idea to owned, connected, tested, deployed, observable, evolvable software.**

The default journey should be:

~~~text
Intent
→ Product understanding
→ Product Graph
→ Data/Dataset Workspace
→ UX/Design System
→ Frontend
→ Supabase backend
→ Auth / RLS / Storage / Functions / Realtime
→ Integrations
→ Seed/Synthetic data
→ Runtime
→ Browser verification
→ Security / Review / Diff proof
→ GitHub repository
→ Preview
→ Production release
→ Domain / environment
→ Operations / logs / analytics
→ Recovery
→ Iteration / maintenance
~~~

There must be no hidden "now hire a developer to finish the backend" handoff.

---

# 2. Ownership principle

End-to-end does not mean Ineractive owns the user's product infrastructure.

Preferred production model:

~~~text
User
├── owns GitHub repository
├── owns Supabase project
├── owns domain
├── owns deployment account where applicable
├── owns data
├── owns generated source
├── owns third-party service accounts
└── can leave Ineractive without losing the running product
~~~

Ineractive provides orchestration, compilation, verification, and management.

It must not create unnecessary lock-in.

---

# 3. Connected-account model

## 3.1 GitHub

Use a GitHub App / equivalent least-privilege integration.

Support:

- connect existing repository;
- create a repository under an authorized user/organization when permitted;
- initialize generated source;
- commit;
- create branch/worktree relationship;
- push;
- open pull request;
- observe checks;
- attach exact source identity to evidence;
- respect repository permissions/rulesets;
- react to installation/repository-access revocation.

Do not use a user's long-lived personal access token as the preferred product architecture.

GitHub authorization and repository installation are separate concepts and must remain explicit.

## 3.2 Supabase

Support two user-owned modes:

### Connect existing

- user authorizes Ineractive using supported Supabase OAuth/integration mechanisms;
- inspect existing project safely;
- reconcile schema/migrations/config;
- establish explicit project identity;
- never assume dashboard state equals repository state.

### Create for user

Where current Supabase APIs and the user's account/organization/billing permissions allow it:

- select authorized organization;
- create project;
- record user ownership;
- wait for healthy provisioning;
- configure project through supported API/CLI mechanisms;
- establish local/remote relationship;
- create migrations/config in the generated repository.

Ineractive never hides a generated application's database behind the Ineractive control-plane database.

## 3.3 Other services

Use the same ownership model for:

- deployment providers;
- domains/DNS;
- email;
- SMS/WhatsApp;
- payments;
- analytics;
- storage outside Supabase;
- AI providers.

A provider adapter must make ownership, billing, credentials, and portability explicit.

---

# 4. Data and Dataset Workspace

A-to-Z product building requires more than schema generation.

Ineractive needs a first-class **Data Workspace**.

## 4.1 Dataset semantic model

Add explicit semantics for:

~~~text
Dataset
DatasetVersion
DataSource
DataImport
DataMapping
DataProfile
DataQualityRule
SeedDataset
SyntheticDataset
VectorCorpus
EvalDataset
~~~

Not every generated product needs every dataset type.

## 4.2 Business dataset workflow

Supported starting points should include:

- CSV;
- XLSX/spreadsheet;
- JSON;
- SQL/Postgres source where authorized;
- existing Supabase tables;
- API response samples;
- manually described records.

Pipeline:

~~~text
Source
→ inspect without unsafe execution
→ infer columns/types/relationships
→ classify sensitive data
→ profile quality
→ identify duplicates/nulls/outliers
→ propose normalization/relational mapping
→ user-visible preview
→ import plan
→ create migrations/schema
→ import/transform
→ verify counts/constraints/relationships
→ bind to Product Graph
~~~

## 4.3 Dataset quality

Dataset verification may include:

- schema/type validity;
- required fields;
- uniqueness;
- referential integrity;
- duplicate detection;
- missingness;
- range/domain constraints;
- encoding/locale;
- date/time interpretation;
- invalid enum/category values;
- row-count reconciliation;
- transformation lineage.

Ineractive must expose uncertainty instead of silently coercing ambiguous data.

## 4.4 Seed and synthetic data

Every generated application should be able to receive representative **synthetic/local seed data** for development and browser verification.

Synthetic data must:

- match schema constraints;
- cover important roles/states;
- include edge cases;
- avoid copying private production values by default;
- be deterministic/reproducible when used for tests.

## 4.5 Dataset version and lineage

Record:

~~~text
dataset_id
version
source/provenance
import time
schema mapping
transformations
row/object counts
quality findings
privacy class
target environment
verification evidence
~~~

Data import is a side effect and follows normal capability/reconciliation rules.

## 4.6 AI-oriented datasets

Later, when generated AI-app primitives are qualified, support:

- retrieval/vector corpus preparation;
- chunking/index strategy;
- metadata;
- eval datasets;
- expected-answer/rubric fixtures;
- synthetic eval generation with independent review;
- corpus versioning.

Do not mix model-training promises into V1 unless explicitly authorized and qualified.

---

# 5. Supabase A-to-Z compiler

For the first backend target, Ineractive should be able to orchestrate the full product backend lifecycle.

~~~text
Product Graph
+ Dataset/Data Policies
        ↓
BackendPlan
        ↓
Local Supabase
        ↓
Schema / migrations
Auth
Organizations / memberships
RLS
Storage
Realtime
Edge Functions
Webhooks
Jobs / schedules
Secrets references
Seed data
Data lifecycle
        ↓
Verification
        ↓
User-owned remote Supabase
        ↓
Preview/staging branch where qualified
        ↓
Production migration/promotion
~~~

## 5.1 Local first

The default implementation workflow remains:

~~~text
generate candidate
→ apply locally
→ reconstruct from empty
→ seed
→ test roles/policies
→ run application
→ browser-test
→ review
→ remote plan
~~~

Never send raw model-generated SQL directly to production.

## 5.2 Supabase configuration as source

Repository-owned artifacts should cover applicable:

- migrations;
- config;
- seeds;
- Edge Functions;
- storage declarations;
- generated database types;
- environment-variable schema;
- tests.

Remote dashboard state that cannot be reconstructed from source should be detected as drift.

## 5.3 Branch alignment

Where Supabase branching is available/appropriate, align:

~~~text
GitHub branch / PR
↔ generated source
↔ Supabase preview branch
↔ preview deployment
↔ proof bundle
~~~

Production data should not automatically populate preview environments.

---

# 6. GitHub A-to-Z workflow

The generated project should become a normal Git repository from the beginning.

~~~text
Project created
→ repo initialized/connected
→ canonical source written
→ migrations/config/data fixtures committed
→ bounded feature branch
→ checks
→ review
→ proof
→ PR
→ preview
→ merge
→ production promotion
~~~

The Ineractive UI may hide Git complexity from non-technical users, but must not hide Git truth.

User-facing actions can be:

~~~text
Save checkpoint
Create version
Try another direction
Publish preview
Ship
Undo
Compare
Restore
~~~

while the underlying system uses branches, commits, WorkPackets, and ReleaseManifests.

---

# 7. Product generation completeness contract

A product is not "built" merely because the main route renders.

For applicable product types, Ineractive should determine whether the following are required and compile them:

## Product
- product purpose;
- audience/personas;
- roles;
- workflows;
- requirements;
- assumptions;
- metrics.

## Data
- entities;
- relationships;
- datasets/imports;
- seed data;
- validation;
- lifecycle policy.

## Backend
- database;
- auth;
- authorization/RLS;
- storage;
- functions;
- realtime;
- jobs;
- integrations.

## Frontend
- routes;
- layouts;
- screens;
- forms;
- loading/error/empty states;
- responsive behavior;
- accessibility;
- i18n/RTL where needed.

## Design
- brand/design system;
- tokens;
- components;
- assets;
- source/design bindings.

## Operations
- environments;
- secrets references;
- logs;
- health;
- error handling;
- release identity;
- analytics where requested.

## Delivery
- GitHub;
- tests;
- semantic review;
- proof;
- preview;
- deployment;
- domain;
- recovery.

## Documentation
- README/runbook;
- environment-variable schema;
- architecture/backend notes where useful;
- migration/recovery instructions;
- ownership/export instructions.

A missing category can be legitimately "not applicable"; it must not disappear accidentally.

---

# 8. Product Admin / Data Studio

A user should not need the Supabase Dashboard for ordinary product administration.

Ineractive should expose a safe **Data / Backend Studio** over the generated application's backend.

Candidate surfaces:

~~~text
Data
├── Tables
├── Relations
├── Rows
├── Import
├── Dataset Versions
├── Data Quality
└── Export

Auth
├── Users
├── Organizations
├── Roles
└── Sessions / invitations

Security
├── RLS
├── API exposure
├── Storage policies
└── findings

Backend
├── Functions
├── Realtime
├── Jobs
├── Webhooks
└── Logs

Operations
├── Environments
├── Migrations
├── Drift
├── Release
├── Health
└── Recovery
~~~

This is an Ineractive management surface over user-owned infrastructure, not a proprietary replacement for ownership.

---

# 9. Import existing business data

A user may begin with:

- an idea only;
- a spreadsheet;
- a GitHub repository;
- an existing Supabase project;
- source + Supabase;
- a URL/design;
- a running app;
- combinations of the above.

Ineractive should reconcile available truth into:

~~~text
Product Graph
+ DesignSystemRevision
+ Dataset/Data bindings
+ Source bindings
+ Backend bindings
+ Environment identities
~~~

with confidence/conflict state.

This makes "start where I already am" a first-class path.

---

# 10. End-to-end onboarding principle

Do not ask users to manually perform infrastructure steps that Ineractive can safely automate with authorized APIs.

Bad:

~~~text
1. Go create a Supabase project.
2. Copy this secret.
3. Paste it here.
4. Go create a GitHub repository.
5. Paste another token.
6. Run migrations yourself.
~~~

Preferred:

~~~text
Connect Supabase
→ choose organization/project or Create new
→ authorize scoped access

Connect GitHub
→ choose account/org/repository access
→ connect existing or Create repository

Ineractive performs the remaining qualified workflow and shows exactly what it did.
~~~

Manual fallback remains available if APIs/permissions/account plans prevent automatic provisioning.

---

# 11. Zero hidden handoff rule

Before calling a generated product "ready", Ineractive must surface all remaining non-automated user obligations.

Examples:

- external provider business verification;
- domain registrar approval;
- Apple/Google developer account steps;
- payment-provider compliance;
- production billing approval;
- organization-owner authorization.

The product may be ready with explicit external blockers, but Ineractive must never conceal them behind a green "Done."

---

# 12. A-to-Z benchmark

Create a dedicated benchmark after the required phases exist:

## B17 — Idea to owned production product

Start with:

> "Build a bilingual inventory and ordering system for a small distributor. I have a spreadsheet of products and stock."

The benchmark must prove:

1. infer Product Graph;
2. import/profile spreadsheet;
3. create DatasetVersion;
4. derive/confirm data model;
5. create local Supabase schema;
6. generate synthetic test records and import supplied data safely;
7. implement Auth/RLS;
8. build responsive Arabic/English UI;
9. implement inventory/order workflows;
10. add one transactional notification/integration;
11. test browser/backend/security;
12. create/connect user-owned GitHub repository;
13. create/connect user-owned Supabase project through qualified authorization;
14. commit migrations/config/source/data fixtures;
15. create preview;
16. prove release compatibility;
17. promote production candidate;
18. verify health/log/release identity;
19. export/restore from source;
20. perform one incremental post-launch feature change.

Success means no manual developer coding in the golden path.

External account authorization steps are allowed and must remain explicit.

---

# 13. Competitive principle

Stunning's public builder positioning correctly raises the market baseline: a serious builder should produce a working full-stack product with a live database rather than a frontend handoff, and should be able to ingest existing spreadsheet/business data and connect external systems.

Ineractive should exceed that baseline through:

- user-owned Supabase;
- user-owned GitHub;
- Product Graph semantics;
- explicit Dataset/Data lineage;
- reproducible migrations;
- source/backend reconstruction;
- design/code round-trip;
- capability security;
- independent verification;
- exact evidence;
- release/schema compatibility;
- clean-room portability;
- governed project intelligence;
- end-to-end recovery.

---

# 14. End-to-end definition

The canonical product-level definition is:

> **Ineractive is done when the user's product can be understood, built, populated, connected, verified, owned, shipped, observed, recovered, and evolved from one coherent system.**

A beautiful preview is only an intermediate artifact.
