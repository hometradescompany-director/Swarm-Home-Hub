# External federation peer qualification

This slice closes the current External Swarm Refinery Phase C question without
promoting protocol resemblance into federation status.

A system earns the label **SwarmHomeFederation/v1 peer** only when the inspected
evidence establishes all of these separately:

1. explicit implementation of the `SwarmHomeFederation/v1` protocol;
2. evidence of the federation-handshake surface;
3. independent mutable truth ownership rather than a required shared state
   engine;
4. bounded explicit authority semantics rather than authority transferring
   merely because two systems are connected.

Missing evidence is a typed qualification gap. It is not a claim that the
external project is defective.

## Architecture gate

**What does it own?**

Only a derived, non-persistent qualification result for one observed external
runtime. It owns no remote state and no canonical peer identity.

**What does it know?**

Opaque candidate references, the observed protocol label, boundary
classification, observation time, and source/evidence references supplied by
the caller.

**What events does it emit?**

None. Qualification is a pure evidence gate. A later real handshake remains the
event-capable runtime boundary.

**What relationships does it maintain?**

None persistently. The returned projection relates a candidate reference to the
evidence refs that justified, or failed to justify, federation classification.

## Current upstream decision

Using the 2026-09-22 refinery observations already recorded in this repository,
none of the six inspected upstreams is currently promoted to a real
`SwarmHomeFederation/v1` peer.

| Upstream | Current posture | Federation standing from current evidence |
| --- | --- | --- |
| division-sh/swarm | transport peer + deterministic-runtime reference | not qualified yet: no explicit SwarmHomeFederation/v1 implementation/handshake evidence |
| kyegomez/swarms | capability framework + MCP reference | not qualified yet: MCP exposure is not federation protocol evidence |
| VRSEN/agency-swarm | Agents SDK / handoff / MCP reference | not qualified yet: handoff/runtime compatibility is not federation protocol evidence |
| langchain-ai/langgraph-swarm-py | handoff/state-projection reference | not qualified yet: no SwarmHomeFederation/v1 implementation evidence |
| swarmclawai/swarmclaw | MCP/A2A transport peer | not qualified yet: A2A/MCP connectivity is not Swarm Home federation authority |
| desplega-ai/agent-swarm | external execution/capability provider | not qualified yet: provider execution is intentionally kept behind a bounded adapter |

This does not freeze those classifications. New source-near evidence can move a
candidate through the gate later without rewriting the earlier observation.

## Boundary

Qualification does not:

- perform a federation handshake;
- grant Atlas authority;
- admit an agent or create a residence;
- copy external runtime, task, memory, schedule, identity, or event truth;
- treat a project name containing "swarm" as evidence;
- treat MCP, A2A, OpenRPC or OpenAPI compatibility as federation status.

The runtime handshake remains governed by `FederationHandshakeService` after a
candidate has actually earned the stronger peer classification.
