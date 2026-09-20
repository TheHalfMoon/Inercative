# Ineractive Platform Lifecycle, Ownership, and Provisioning Contract

**Date:** 2026-09-20  
**Status:** candidate canonical direction; not current execution authority  
**Purpose:** define the provider/resource lifecycle required for true A-to-Z product building.

## 1. Principle

Ineractive must be able to create, connect, reconcile, operate, detach, transfer, and recover user-owned product infrastructure without hiding provider truth.

The orchestration problem is larger than "store an OAuth token".

A product can span:

- GitHub;
- Supabase;
- deployment provider;
- DNS/domain provider;
- email/SMS/payment/AI providers;
- analytics/observability providers;
- generated-product environments.

Every external resource has its own owner, billing relationship, permission model, lifecycle, failure modes, and revocation behavior.

Ineractive therefore needs a provider-neutral **Platform Lifecycle layer**.

---

# 2. Deep modules

## 2.1 ProviderAdapter

A provider integration implements a stable Ineractive-owned contract.

Conceptual operations:

~~~text
discoverCapabilities()
discoverAccountsOrOrganizations()
preflight()
connect()
refreshConnection()
listResources()
inspectResource()
planCreate()
createResource()
planUpdate()
applyUpdate()
verify()
reconcile()
detach()
transferOrExport()
planDelete()
deleteResource()
~~~

Not every provider supports every operation.

Unsupported operations remain explicit capabilities, not silent no-ops.

Provider-specific API models must remain behind the adapter.

## 2.2 Connection

A Connection describes authority to act with a provider.

~~~text
Connection
├── connection_id
├── provider
├── principal/account identity
├── organization/workspace identity
├── auth method
├── granted scopes/permissions
├── secret/token references
├── token/credential expiry metadata
├── refresh capability
├── installation identity where applicable
├── repository/resource selection where applicable
├── status
├── last verified at
├── revocation signal
└── provenance
~~~

Connection status:

~~~text
UNCONFIGURED
AUTH_REQUIRED
CONNECTING
CONNECTED
DEGRADED
EXPIRED
REVOKED
DENIED
UNVERIFIABLE
DISCONNECTED
~~~

A product resource can continue running after Ineractive loses management access.

Loss of management access must not be confused with resource deletion or runtime failure.

## 2.3 ResourceBinding

A ResourceBinding maps Ineractive product semantics to a concrete external resource.

Examples:

~~~text
GitRepositoryBinding
SupabaseProjectBinding
DeploymentProjectBinding
DomainBinding
EmailSenderBinding
AnalyticsBinding
AIProviderBinding
~~~

Common fields:

~~~text
binding_id
provider
resource_type
external_resource_id
owner identity
billing owner
environment
region/residency metadata
connection_id
Product/Release references
status
observed configuration digest
last reconciled at
drift state
transfer/export support
delete semantics
~~~

## 2.4 EnvironmentManifest

Every environment is explicit.

~~~text
EnvironmentManifest
├── LOCAL
├── PREVIEW
├── STAGING
└── PRODUCTION
~~~

Each environment maps:

- source revision/branch;
- deployment resource;
- backend resource/branch/project;
- config revision;
- secret-reference set;
- dataset/data policy;
- region;
- domain/URL;
- release identity;
- health state.

An environment may omit a remote provider when policy or plan does not support it.

Example:

~~~text
LOCAL
  app: local sandbox
  backend: local Supabase
  data: synthetic/seed

PREVIEW
  app: remote preview deployment
  backend: Supabase preview branch if available
           OR dedicated authorized staging project
           OR local-only preview when remote preview is unavailable
  data: seed/synthetic by default

PRODUCTION
  app: qualified production deployment
  backend: user-owned production Supabase
  data: production
~~~

Do not require a paid provider feature for core local build functionality.

## 2.5 OwnershipManifest

A product owns more than source code.

~~~text
OwnershipManifest
├── Git repository owner
├── Supabase project owner
├── deployment project owner
├── domains/DNS owner
├── provider accounts
├── billing owner by resource
├── data owner
├── secret owner/custodian
├── generated assets
├── licenses/notices
├── export/transfer mechanisms
└── detach/delete semantics
~~~

Before a product is called portable or transferable, every runtime-critical resource must have an explicit ownership/export story.

## 2.6 ProvisioningSaga

Multi-provider setup is a distributed transaction that usually cannot be rolled back atomically.

Use a durable **ProvisioningSaga**.

State:

~~~text
PLANNED
PREFLIGHTING
WAITING_USER
PROVISIONING
CONFIGURING
VERIFYING
READY
PARTIAL
BLOCKED
FAILED
RECONCILING
DETACHED
DECOMMISSIONING
DECOMMISSIONED
~~~

Each step declares:

- provider/resource;
- operation class;
- idempotency/retry behavior;
- expected external identity;
- cost/spend class;
- required authority;
- preconditions;
- evidence;
- compensation/reconciliation path.

Example:

~~~text
Create Git repository       -> succeeded
Create Supabase project     -> timeout / unknown
Create deployment project   -> not started
~~~

Ineractive must not automatically delete the Git repository merely to pretend the overall operation rolled back.

It records PARTIAL state, reconciles Supabase, and continues or offers explicit cleanup.

---

# 3. Provider preflight

Before any external mutation, run provider-specific preflight.

Preflight checks can include:

- connection healthy;
- required scopes/permissions;
- organization/resource authority;
- plan/feature availability;
- billing requirement;
- quota/rate limits;
- resource naming constraints;
- region availability;
- residency constraints;
- existing conflicting resource;
- organization policy/rulesets;
- repository default branch/rules;
- destructive-operation consequence;
- expected monetary cost.

Preflight result:

~~~text
READY
USER_ACTION_REQUIRED
OWNER_APPROVAL_REQUIRED
PLAN_UPGRADE_REQUIRED
BILLING_REQUIRED
QUOTA_BLOCKED
REGION_UNAVAILABLE
POLICY_BLOCKED
CONFLICT
PROVIDER_UNAVAILABLE
UNVERIFIABLE
~~~

A provider limitation becomes a typed blocker, not a generic chat error.

---

# 4. External Blocker Manifest

Ineractive must expose exactly what remains outside its authority.

~~~text
ExternalBlocker
├── blocker_id
├── provider
├── affected capability
├── reason class
├── exact user/owner action required
├── safe continuation options
├── expiry/freshness
└── resolved evidence
~~~

Examples:

- organization owner must approve GitHub App installation;
- Supabase organization requires billing setup before project creation;
- Supabase preview branching unavailable on current plan;
- DNS registrar requires user confirmation;
- email sender domain requires verification;
- payment provider requires business verification;
- Apple/Google developer enrollment required.

"Blocked by external approval" is a valid product state.

"Done" while hiding the blocker is not.

---

# 5. GitHub lifecycle contract

## 5.1 Connection model

Prefer a GitHub App with least privilege.

Treat separately:

- app installation on personal/org account;
- user authorization when needed;
- repository selection;
- installation token lifecycle.

Never assume authorization implies installation or repository access.

## 5.2 Repository states

~~~text
UNBOUND
DISCOVERED
CONNECTED
CREATING
READY
RULE_RESTRICTED
DRIFTED
ACCESS_REVOKED
ARCHIVED
DELETED
~~~

## 5.3 Preflight

Inspect or discover:

- owner/account/org;
- installation state;
- selected repository access;
- required contents/pull-request/check/workflow permissions;
- branch/default branch;
- rulesets/protection constraints where accessible;
- push vs PR-only path;
- repository visibility intent;
- naming conflict.

If direct push is forbidden, prefer a branch/PR workflow rather than weakening repository rules.

## 5.4 Token lifecycle

Installation/user tokens are brokered references.

The harness receives scoped capability, not raw token value.

Handle:

- expiry;
- refresh/renewal;
- installation suspension;
- repository removal from installation;
- organization approval revocation.

## 5.5 Detach vs delete

Disconnecting Ineractive from GitHub:

- revokes/stops Ineractive management access;
- does not delete the repository;
- does not rewrite history;
- preserves normal source ownership.

Repository deletion is a separate high-consequence operation.

---

# 6. Supabase lifecycle contract

## 6.1 Connection modes

### Existing project

~~~text
Authorize
→ discover organization/project
→ inspect
→ compare repository/local/remote state
→ classify drift
→ bind
~~~

No mutation occurs during discovery unless explicitly authorized.

### New user-owned project

~~~text
Authorize
→ organization selection
→ provider preflight
→ region/plan/billing confirmation if required
→ plan create
→ create
→ wait for healthy provider state
→ configure/link
→ migrate from repository artifacts
→ verify
→ bind
~~~

## 6.2 Supabase project states

~~~text
UNBOUND
DISCOVERED
PROVISIONING
HEALTHY
PAUSED
DEGRADED
DRIFTED
ACCESS_REVOKED
DELETION_REQUESTED
DELETED
UNVERIFIABLE
~~~

## 6.3 Environment allocation policy

Do not require hosted preview branching.

Policy order:

1. local Supabase is always the baseline development environment;
2. hosted preview branch may be used when qualified, available, and budget-authorized;
3. dedicated staging project may be used when explicitly authorized;
4. when neither is available, retain local backend verification and clearly mark the remote preview limitation.

Preview/staging data defaults to seed/synthetic data.

Never automatically copy production data/storage objects into preview.

## 6.4 Remote mutation rule

Before mutation:

- re-read project identity;
- re-read migration/drift state;
- verify connection authority;
- verify environment;
- verify data/recovery policy;
- verify ReleaseManifest relationship when publishing.

After mutation:

- verify schema/migration history;
- regenerate/compare types;
- verify RLS/API exposure;
- execute focused tests;
- update binding digest.

## 6.5 Detach/transfer/delete

Detaching Ineractive:

- does not delete the user's Supabase project;
- preserves migrations/config/source;
- removes management authority only.

Managed mode, when later supported, must define explicit transfer/export before maturity.

Project deletion is a separate destructive operation with explicit resource identity and recovery expectations.

---

# 7. DeploymentProvider contract

P11 should qualify one deployment provider behind a provider-neutral interface.

Capabilities can include:

~~~text
connect account/project
discover projects
create project
bind Git repository
configure build
set environment-variable references
create preview deployment
observe deployment
promote production
configure domain
read logs/health
rollback/redeploy
detach
transfer/export
~~~

The adapter must report unsupported features.

A generated product remains deployable outside this adapter through documented normal mechanisms.

---

# 8. Domain and DNS lifecycle

Custom domain support requires explicit state.

~~~text
DomainBinding
├── domain
├── owner/provider
├── target environment
├── required DNS records
├── verification state
├── certificate state
├── canonical/redirect policy
└── last observed state
~~~

State:

~~~text
UNCONFIGURED
RECORDS_REQUIRED
PROPAGATING
VERIFIED
CERTIFICATE_PENDING
ACTIVE
MISCONFIGURED
REVOKED
~~~

DNS propagation is asynchronous.

A timeout is not proof of failure; reconciliation reads actual DNS/provider state.

Ineractive may automate DNS only through a separately authorized provider capability.

Manual DNS instructions remain a valid fallback.

---

# 9. Secret lifecycle

A secret is not a static string copied into project settings.

Define:

~~~text
SecretRef
SecretVersion
SecretBinding
~~~

Track:

- owner/custodian;
- provider;
- environment;
- consumer;
- created/rotated/revoked state;
- expiry if applicable;
- last validation;
- required restart/redeploy after rotation.

State:

~~~text
MISSING
CONFIGURED
VALID
EXPIRING
EXPIRED
ROTATION_REQUIRED
REVOKED
UNVERIFIABLE
~~~

Rules:

- secret values remain outside ordinary model/browser context;
- never duplicate production secret values into preview by default;
- rotation can invalidate deployments/functions and requires re-verification;
- disconnecting an integration identifies which secret references become unusable.

---

# 10. Configuration and drift

Track desired vs observed state for each provider binding.

Drift classes:

~~~text
CLEAN
LOCAL_AHEAD
REMOTE_AHEAD
DIVERGED
MISSING_REMOTE
ACCESS_REVOKED
UNVERIFIABLE
~~~

Before any material mutation, reconcile drift.

Do not overwrite provider-dashboard changes simply because Ineractive has an older local plan.

Configuration includes:

- environment variables;
- provider project settings;
- region;
- branch/deployment mapping;
- domain;
- build settings;
- backend project linkage;
- provider feature flags.

---

# 11. Data movement safety

Business-data import/export is a side effect.

## 11.1 Import staging

For non-trivial imports:

~~~text
inspect
→ profile
→ preview mapping
→ stage
→ validate
→ apply
→ reconcile counts
→ finalize binding
~~~

Use chunked/streaming execution where file size requires it.

Partial batch failure must retain batch identity and resume/reconcile safely.

## 11.2 Production data

Discovery must be read-only by default.

Do not use production data as model context or synthetic/test data merely because it is accessible.

When non-production environments require realistic data:

- prefer synthetic/seed data;
- allow masked/sanitized subsets only through explicit policy;
- preserve lineage and privacy classification.

## 11.3 Export

Export preserves:

- schema;
- data format;
- encoding/locale;
- row/object counts;
- lineage;
- generated product ownership.

---

# 12. Product Completeness Manifest

The A-to-Z workflow needs a deterministic completeness artifact.

~~~text
ProductCompletenessManifest
├── product_semantics
├── data_and_datasets
├── frontend
├── design
├── backend
├── auth_and_authorization
├── storage
├── integrations
├── internationalization
├── accessibility
├── security
├── tests_and_proof
├── source_and_git
├── environments
├── deployment
├── domain
├── operations
├── release_and_recovery
├── documentation
└── ownership_and_portability
~~~

Each category is:

~~~text
REQUIRED
NOT_APPLICABLE(reason)
BLOCKED(blocker)
IN_PROGRESS
READY
PROVEN
STALE
~~~

A category never disappears because the model forgot it.

Product-level "ready" status is derived from this manifest plus required evidence.

---

# 13. Product operations documentation

Generated projects should include the smallest useful human-owned operational documentation:

- README / local run instructions;
- environment-variable schema;
- backend/migration instructions;
- deployment target instructions;
- provider/resource ownership references without secret values;
- data import/export notes when used;
- release/recovery runbook;
- external blocker/verification steps that cannot be automated.

Documentation is generated from actual manifests/configuration, not invented independently.

---

# 14. Disconnect and exit test

A-to-Z is incomplete without A-to-exit.

Before a provider integration is considered mature, test:

1. connect user-owned resource;
2. use it through Ineractive;
3. export all required source/config;
4. revoke Ineractive provider access;
5. verify the running product still operates;
6. verify the user can continue managing it directly;
7. verify Ineractive correctly reports management access loss;
8. reconnect/reconcile when authorized;
9. verify no resource was silently duplicated or replaced.

This complements clean-room product portability.

---

# 15. Provider adapter qualification

A provider adapter is not production-qualified because its happy-path API call worked.

Qualification requires applicable fixtures for:

- authorization/installation;
- insufficient permission;
- owner approval required;
- expired credential;
- revoked access;
- rate limit;
- provider outage;
- partial create;
- duplicate/idempotent create;
- existing resource import;
- remote drift;
- asynchronous provisioning;
- plan/billing/feature limitation;
- disconnect/reconnect;
- detach without delete;
- explicit delete;
- transfer/export where claimed.

Provider API behavior is version-sensitive and must be reverified during implementation.

---

# 16. UX principle

The user sees one coherent setup/publish journey, not provider internals.

Example:

~~~text
Connections

GitHub     Connected to Acme / inventory-app      ✓
Supabase   Connected to Acme / inventory-prod     ✓
Deploy     Preview ready                           ✓
Domain     DNS verification required               !
Email      Sender domain verification required     !
~~~

Clicking a blocker explains:

- why it is needed;
- whether Ineractive can do it;
- exact authorization/action required;
- whether the rest of the build can continue.

---

# 17. Planning conclusion

A true end-to-end builder requires typed state for:

- provider authority;
- external resource identity;
- ownership;
- environment mapping;
- provisioning;
- secrets;
- drift;
- external blockers;
- release;
- completeness.

Without these contracts, "connected GitHub/Supabase" is a demo integration rather than an A-to-Z product system.
