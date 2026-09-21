# Relational context in ready handoffs

Date: 2026-09-21

Swarm Home Hub may now carry optional **opaque Atlas relational-context refs** in
a ready handoff. This lets downstream agents preserve the existence of relevant
context without Swarm becoming a second truth store for human relationships or
communications.

## Boundary

Swarm owns the handoff container only. Atlas remains the truth owner for any
underlying communication, source identity, relationship history, provenance,
timing or observed recipient effect.

The handoff therefore carries only refs such as:

`atlas:relational-transmission:<opaque communication ref>`

It does not carry:

- raw message content;
- human names or PII;
- relationship history;
- recipient-effect labels;
- prestige, worth or aggregate trust scores;
- any authority grant.

## Typed absence

There is no `atlas-relational-context/v1` resolution contract yet. The ref can
be preserved through the handoff, but Swarm cannot dereference it. That absence
is deliberate and prevents the existing authority contract from becoming a
generic context tunnel.
