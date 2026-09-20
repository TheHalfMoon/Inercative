# Protocol Identity and Revision Primitives

**Status:** P01 candidate contract  
**Task:** IN-P01-S02-T01  
**SpecGrain:** SG-000010

## 1. Purpose

Ineractive needs one provider-neutral way to refer to a logical thing and one explicit
way to bind that logical identity to an immutable exact revision.

Identity and revision are intentionally separate:

```text
logical identity
    +
immutable exact revision
    =
exact-state reference
```

An identity is never an authorization grant, ownership claim, timestamp, sequence
number, database key policy, or provider locator.

## 2. Logical identity format

Canonical text:

```text
ineractive:<kind>:<uuid>
```

Rules:

- `kind` is lowercase and matches `[a-z][a-z0-9-]{0,31}`;
- UUID text is canonical lowercase;
- UUID versions 1-8 with RFC variant bits are accepted;
- nil/non-canonical/uppercase forms are rejected;
- callers supply the UUID; this Grain does not introduce ID generation or randomness.

Examples:

```text
ineractive:project:018f9f3a-7b2a-7f11-8a4c-1234567890ab
ineractive:artifact:550e8400-e29b-41d4-a716-446655440000
```

The explicit kind supports compile-time and runtime separation while the payload remains
opaque.

## 3. Exact revision formats

Git object identity:

```text
git:<40-or-64-lowercase-hex-object-id>
```

SHA-256 content identity:

```text
sha256:<64-lowercase-hex-digest>
```

Mutable labels such as branches, tags, aliases, or short Git hashes are not exact
revisions and are rejected by these primitives.

## 4. Revision binding

`RevisionBinding<Kind>` binds:

- one logical identity;
- one exact immutable revision.

The same logical identity may bind to multiple revisions over time. A new revision does
not silently create a new logical identity.

## 5. Scope boundary

SG-000010 does not define:

- Run/Event/Evidence/Finding schemas;
- ModelTask/DecisionTask;
- capability grants;
- persistence or database identity;
- auth/ownership semantics;
- timestamp/order semantics;
- provider-specific resource IDs.

Those remain dependency-ordered work.

## 6. Dependency posture

`@ineractive/protocol` remains dependency-free at runtime. The public export surface
contains only the identity/revision helpers earned by SG-000010; the P00-specific OCR
evidence validator remains private and is not exported from the package root.


## 7. Machine-readable schema

The canonical structured binding schema is:

`packages/protocol/schema/identity-revision.schema.json`

It mirrors the runtime contract:

- open, grammar-bounded lowercase identity kinds;
- canonical RFC UUID text;
- full 40/64-hex Git object revisions;
- 64-hex SHA-256 content revisions;
- strict identity/revision binding objects with no unknown fields.

The schema is tested against the runtime formats without adding a runtime validation dependency.
