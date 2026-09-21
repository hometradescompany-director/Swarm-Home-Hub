# Federation Handshake v1

This slice is the first runtime implementation for the 321-368 federation phase.

It proves a deliberately small seam: one Swarm Home Hub may recognize another
home as a protocol-compatible peer without either home acquiring ownership of
the other's mutable truth.

## Contract

Protocol: `SwarmHomeFederation/v1`

A peer advertises:

- an opaque home reference;
- protocol version;
- bounded capability references;
- evidence receipt identifiers;
- a replay-protection nonce;
- observation time.

A successful handshake records only the bounded peer relationship result.
It does **not** establish:

- Atlas authority;
- admission permission;
- shared habitat capacity;
- shared residence ownership;
- shared identity ownership;
- remote mutation rights.

## Failure semantics

The evaluator fails closed with typed refusal for:

- invalid home reference;
- self-peering;
- incompatible protocol version;
- missing evidence;
- missing nonce;
- replay of a previously accepted peer nonce.

A refusal does not consume a nonce. Only an accepted handshake is replay-tracked.

## Ownership rule

Federation references remote claims. It does not copy remote canonical mutable
state into local truth ownership.

That keeps the first cross-home relationship compatible with the repository
invariant: connection is not authority.
