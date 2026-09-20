# Protocol Identity and Revision Primitives

**Status:** P01 protocol baseline  
**Task:** IN-P01-S02-T01  
**SpecGrain:** SG-000010

## Purpose

The first public `@ineractive/protocol` surface provides only two things:

1. stable opaque identities;
2. immutable exact revision references.

They are intentionally authority-free. Possessing an ID or revision never grants a
capability, permission, secret, or provider authority.

## Protocol IDs

Canonical form:

```text
ineractive:<namespace>:<uuid>
```

Initial namespaces:

- project;
- workspace;
- work;
- run;
- event;
- artifact;
- evidence;
- finding;
- resource.

The namespace list is explicit. Unknown namespaces are rejected rather than silently
accepted. UUID text is lower-case canonical RFC-style identity text; callers must treat
the identifier as opaque rather than deriving product meaning or authority from it.

## Revision references

Canonical immutable forms:

```text
git:<40-lowercase-hex-sha>
sha256:<64-lowercase-hex-digest>
```

Branch names, floating tags, short SHAs, mutable labels, whitespace variants, and
upper-case alternate spellings are rejected.

## Exact-state binding

`IdentityRevisionRef` pairs one validated protocol identity with one validated immutable
revision. Its canonical serialized representation is:

```text
<protocol-id>@<revision-ref>
```

Parse/serialize round trips are deterministic.

## Public boundary

SG-000010 exports only identity/revision primitives. It does **not** define:

- Run/Event/Evidence/Finding object schemas;
- ModelTask or DecisionTask;
- CapabilityRequest/Grant;
- runtime identity objects;
- persistence or authorization semantics.

Those remain dependency-ordered work owned by later Grains.

Machine-readable schema:

`packages/protocol/schema/identity-revision.schema.json`
