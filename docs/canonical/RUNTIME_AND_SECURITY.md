# Ineractive Runtime and Security Model

**Status:** canonical planning direction  
**Date:** 2026-09-19

## 1. Security thesis

Ineractive executes untrusted code and interacts with privileged systems. Useful autonomy is therefore a capability-security and distributed-systems problem, not a prompt-engineering problem.

Trust no model, generated application, imported repository, browser page, MCP/tool output, package script, external API response, or visual editor mutation merely because it came through Ineractive.

## 2. Trust domains

Separate at least these domains:

1. Ineractive control plane;
2. user browser/client;
3. orchestration/harness process;
4. generated-project sandbox;
5. local Supabase development stack;
6. remote user Supabase project;
7. production deployment target;
8. external integrations;
9. model/provider endpoints;
10. review/evidence systems;
11. external connector/MCP servers;
12. authenticated-user browser/local-computer surfaces when enabled.

A credential valid in one domain is not ambient authority in another.

## 3. Capability kernel

Every privileged operation maps to a typed action.

Examples:

- file.read / file.write;
- process.spawn;
- network.egress;
- browser.navigate;
- browser.download;
- git.commit / git.push;
- secret.use;
- supabase.inspect;
- supabase.migrate;
- storage.write;
- deploy.preview / deploy.production;
- domain.configure;
- billing.consume.

A grant binds:

- subject/run;
- exact resource scope;
- runtime;
- constraints;
- consequence ceiling;
- expiry/use count;
- issuer/policy revision;
- approval source.

Persistent user preference may authorize a policy to issue future bounded grants. It must not become an immortal wildcard token.

## 4. Sandbox contract

A sandbox provides:

- isolated filesystem/workspace;
- process/PTY lifecycle;
- CPU/memory/time quotas;
- network namespace/policy;
- ephemeral credentials;
- deterministic cleanup;
- artifact export;
- runtime identity;
- event/evidence capture.

Initial runtime adapters may include local Docker-compatible execution and qualified remote sandbox providers. OpenSandbox and Kernux patterns are primary references.

The runtime interface must support degraded capability discovery. A runtime that cannot enforce a required isolation property is not silently treated as equivalent.

## 5. Network policy

Default generated-code policy during build:

- preview application can reach its local backend;
- package installation can reach approved registries under bounded policy;
- arbitrary egress is denied or explicitly brokered;
- external API integration uses allowlisted targets and scoped secrets;
- browser navigation distinguishes preview URLs from arbitrary web content.

Production-like external integrations are opt-in during development when they can create side effects.

## 6. Secret broker

Secrets are stored outside project source and model transcripts.

The harness passes secret references such as:

~~~text
secret://project/integration/stripe/test
secret://project/supabase/staging
~~~

The broker can inject a value directly into the target process/request without revealing it to the model.

Record:

- secret reference;
- consumer action;
- target domain;
- time;
- grant;
- result status.

Do not log secret values.

## 7. Generated code threat model

Generated applications may accidentally or maliciously contain:

- command execution;
- exfiltration;
- destructive SQL;
- SSRF;
- path traversal;
- unsafe uploads;
- XSS;
- auth bypass;
- missing RLS;
- overly broad CORS;
- exposed server secrets;
- vulnerable dependencies;
- package lifecycle scripts;
- browser automation traps;
- infinite loops/resource abuse.

Therefore a build's source origin never acts as a trust signal.

## 8. Imported repository threat model

Importing a repository must not automatically execute:

- postinstall/preinstall scripts;
- hooks;
- project-defined agent instructions as executable authority;
- arbitrary devcontainer setup;
- MCP servers;
- task runner scripts.

Discovery happens before execution. Changed/effective command surfaces receive heightened review.

## 9. Browser, connector, and prompt-injection boundary

Browser content, MCP/server instructions, connector output, downloaded content, and external tool output are untrusted data.

A page can suggest actions but cannot grant new capability.

The harness must preserve provenance for proposals caused by:

- page text;
- downloaded documents;
- form content;
- third-party widgets;
- console output;
- external model/tool output.

An untrusted-content probe can attach provenance/risk signals before observations enter model context.

A request to access a credential, file outside scope, production database, purchase, publish, or change permissions is re-evaluated by deterministic policy regardless of browser/tool instructions.

For risk-bearing executable actions, an independent intent-aware guard may compare the action against user-authorized intent after deterministic capability checks. Denial does not grant the generator a bypass path; it returns a bounded reason and safer alternatives where possible.

### Browser/runtime trust classes

Do not treat every browser/computer runtime as equivalent.

Conceptual classes include:

- BuildSandbox;
- PreviewBrowser;
- TestBrowser;
- ResearchBrowser;
- AuthenticatedUserBrowser;
- PersistentCloudComputer;
- ScopedLocalComputer.

Higher-trust/user-authenticated surfaces require narrower grants, stronger evidence, and explicit policy.

## 10. Filesystem safety

Runtime implementations must protect against:

- symlink/junction/reparse-point escape;
- path traversal;
- archive extraction escape;
- device files/special files;
- unsafe permissions;
- host mount leakage;
- workspace race conditions.

Canonicalize and verify resource identity at the privileged layer, not in model-generated code.

## 11. Package and supply-chain policy

Dependency installation records:

- package;
- version;
- registry/source;
- lockfile change;
- integrity/provenance where available;
- lifecycle-script behavior;
- license/notice impact;
- vulnerability observations;
- imported/generated asset and font provenance where known;
- build artifact/source identity when producing a releasable artifact.

Generated apps must commit lockfiles.

Do not let models silently replace a package source or execute unrelated install scripts to fix an error.

## 12. Supabase security boundary

Separate:

- local development keys;
- preview/staging credentials;
- production credentials.

Production service-role/secret credentials are never available to browser-delivered code or an ordinary code-generation context.

Production migration requires an elevated capability and migration-specific evidence.

RLS/auth/storage policy testing is mandatory for generated backends that process user data.

## 13. Git and publication boundary

Source mutation, commit, push, PR creation, preview deploy, and production deploy are distinct capabilities.

A model that is authorized to modify a sandbox workspace is not automatically authorized to push or publish it.

Publication records exact source head and proof state.

## 14. Cost and external side effects

Operations can have non-code consequences:

- LLM/API spend;
- Supabase project/branch compute;
- cloud deployment;
- email/SMS/WhatsApp send;
- payments;
- domains;
- external record creation.

Each action declares a side-effect and spend class.

The Budget Governor enforces ceilings across model/tool/browser/sandbox/network/backend operations, retries, wall-clock time, and parallelism.

The user may set bounded recurring policy, but silent unbounded spend is forbidden.

## 15. Data privacy

Classify project data at minimum:

- public;
- project-confidential;
- personal/user data;
- secrets/credentials;
- regulated/sensitive.

Provider/model routing respects the data class.

Generated-product semantics can additionally carry retention, export, deletion, audit, residency, consent, and redaction requirements. These mechanisms do not constitute a regulatory-compliance claim by themselves.

Logs/evidence should store the minimum useful data, with redaction and retention controls.

## 16. Security verification

For security-sensitive Grains require relevant negative/adversarial tests in addition to happy-path tests.

Maintain safe fixtures for:

- hostile web content;
- malicious prompts in data;
- cross-tenant access;
- unsafe redirects;
- SSRF;
- file upload attacks;
- path escapes;
- secret leakage;
- dependency attacks;
- revoked/expired sessions;
- production-action denial;
- malicious package scripts.

## 17. Risk profiles

### R0

Non-behavioral docs/metadata.

### R1

Low-risk isolated product behavior.

### R2

Persistence, migrations, runtime, external API, auth-adjacent behavior, new dependencies.

### R3

Authorization, secrets, cross-tenant isolation, production mutation, destructive data operations, sandbox escape surface, release/update integrity, billing or external side effects.

Risk can only raise required evidence. It cannot weaken it.

## 18. Incident truth

A failed or disconnected runtime is UNKNOWN/UNVERIFIABLE unless there is direct evidence of final state.

Do not infer completion from silence.

Preserve enough run, source, capability, provider, and external-effect evidence to reconstruct what Ineractive actually did.
