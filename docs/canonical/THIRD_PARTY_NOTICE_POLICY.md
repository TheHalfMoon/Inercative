# Ineractive Third-Party Notice and Attribution Policy

**Status:** canonical P00 policy  
**Date:** 2026-09-20  
**Task:** IN-P00-S04-T01 / SpecGrain SG-000004

## 1. Project-owned license

Ineractive-owned source code is licensed under **Apache-2.0**.

The repository license does not relicense any third-party material.

## 2. Third-party obligations survive intake

Every copied, adapted, vendored, bundled, generated-from, or otherwise redistributed third-party material must preserve the obligations that apply to that material.

Applicable obligations may include:

- license text;
- copyright and attribution notices;
- NOTICE content;
- modification notices;
- source-offer or reciprocal-license requirements;
- model/dataset/asset terms;
- trademark restrictions;
- dependency-level notices.

Founder permission to use a source is an authority input. It does not erase upstream license or redistribution obligations.

## 3. Admission rule

No donor product code may be imported until the provenance gate records, at minimum:

- source repository or artifact locator;
- immutable revision;
- exact source path(s);
- destination path/module;
- use mode;
- permission/authority reference;
- license and notice state;
- dependency closure;
- modification summary;
- security impact;
- verification evidence;
- review evidence.

Unknown, conflicting, path-specific, or transitive rights are blockers until resolved.

## 4. NOTICE handling

The root `NOTICE` file contains project notice information and any attribution notices that must travel with general distributions.

Where an upstream license requires its NOTICE text to be retained, the applicable text must be preserved in a compliant distribution surface.

A generated notice inventory may supplement the root NOTICE file but may not silently drop required upstream notices.

## 5. License-boundary policy

Permissively licensed sources such as Apache-2.0, MIT, BSD, or ISC may be admitted only after exact provenance and obligation review.

Copyleft or source-available material is not automatically incompatible, but it requires an explicit boundary decision before linking, vendoring, copying, or redistribution. A source being listed in the research/source ledger is not sufficient admission authority.

Private source material must not be published into this public repository without an explicit bounded transfer decision and rights verification.

## 6. Verification

P00 provenance validation must fail incomplete records and must be able to produce or validate the notice inventory.

Later source admission must bind the exact imported revision and destination to its provenance record and review evidence.
