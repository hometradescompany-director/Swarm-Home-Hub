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

## Relationship to the Atlas work hand-off

The peer handshake and the Atlas work hand-off are **two distinct federation
edges** and must not be conflated.

The merged Atlas work-handoff ingress is:

- transport: `POST /swarm-home/events`;
- authentication: `Authorization: Bearer <federation-secret>`;
- Swarm secret configuration: `SWARM_ATLAS_INGRESS_TOKEN`;
- Atlas outbound configuration: `SWARM_HANDOFF_URL` and
  `SWARM_HANDOFF_TOKEN`;
- message contract: `atlas-event/v1`;
- hand-off contract: `atlas-swarm-handoff/v1`;
- authoritative hand-off fields at the top level:
  `handoff_contract`, `work_kind`, and `parameters`;
- `event_id` is preserved as the hand-off correlation identity;
- a valid request receives `202` with `ok`, `accepted`, and
  `correlation_id`; a refusal is also a `202` and carries a typed refusal
  reason;
- invalid authentication, configuration, content type, body, or envelope is
  rejected before the work handler is reached.

Authentication of the federation edge is not work authority. Swarm's local
admission and policy remain authoritative for whether a requested
`work_kind` may be accepted. The hand-off endpoint does not expose the
generic tool transport and does not grant arbitrary remote tool execution.

The Atlas work hand-off currently uses the synchronous `202` acknowledgement
as its immediate result. A separate `swarm.work.result` event may be used
for attributable asynchronous evidence through Atlas's existing event
ingest, but it is not created by this handshake slice.

By contrast, `SwarmHomeFederation/v1` is the home-to-home peer recognition
protocol defined by this document. Accepting a peer does not grant Atlas
authority, work admission, residence control, or remote mutation rights, and
it does not imply that the Atlas work-handoff edge is enabled.

## Failure semantics

The evaluator fails closed with typed refusal for:

- invalid home reference;
- self-peering;
- incompatible protocol version;
- missing evidence;
- missing nonce;
- replay of a previously accepted peer nonce.

A refusal does not consume a nonce. Only an accepted handshake is replay-tracked.

Replay protection is scoped to the configured replay-state store. Deployments
that require replay protection across process restarts must provide a durable
shared store; the service does not claim process-restart durability from an
in-memory implementation.

## Ownership rule

Federation references remote claims. It does not copy remote canonical mutable
state into local truth ownership.

That keeps the first cross-home relationship compatible with the repository
invariant: connection is not authority.
