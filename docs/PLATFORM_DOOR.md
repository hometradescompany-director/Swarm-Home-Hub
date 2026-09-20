# Swarm Home Platform Door

This surface exposes the existing Swarm Home residence semantics to an external agent/tool transport without creating a parallel state machine.

## Ownership

The door owns no new truth. It delegates to the existing residence event journal, habitat registry, Atlas authority gateway, projections, and lifecycle services.

It knows only the same opaque references already permitted by the Swarm boundary.

## Callable surface

- `swarm.home.inspect` — habitats plus current residence projections
- `swarm.home.recover` — one residence and its authoritative timeline or typed absence
- `swarm.home.heartbeat` — freshness/status evaluation
- `swarm.home.request` — request residence
- `swarm.home.admit` — Atlas authority plus habitat-policy decision
- `swarm.home.rest` — admitted -> resting
- `swarm.home.ready` — resting -> ready
- `swarm.home.handoff` — mint a bounded current-ready handoff
- `swarm.home.depart` — terminal departure

The transport-neutral `SwarmHomeToolRouter` turns a named tool call plus arguments into one bounded result envelope. MCP, OpenAI, CLI, HTTP, or another adapter can sit outside this router without reaching into domain internals.

## Why there is no `claim` state

The current domain does not define a task-claim lifecycle. Inventing `claim` inside the residence state machine would create authority and truth ownership that do not presently exist.

For now, the ready handoff is the lawful boundary: a resident can become ready and issue a bounded handoff capsule. A future task/lease/claim capability should be added only when its authoritative owner, event contract, and relationship to Atlas are explicit.

## Journal inspection

`EventJournal.allEvents` is optional. The in-memory journal implements it so the platform door can derive a whole-home inspection without adding a second store. Persistence adapters must either implement an authoritative deterministic scan or the door fails closed for whole-home inspection.

## Intended adapter path

```
OpenAI / MCP / CLI / HTTP
          |
  SwarmHomeToolRouter
          |
     SwarmHomeDoor
          |
existing services + projections
          |
event journal / habitat registry / Atlas contract
```

No adapter is allowed to become a source of truth.


## Web transport

A dependency-free `SwarmHomeWebTransport` now adapts standard Web `Request` objects to the existing `SwarmHomeToolRouter`.

Bounded routes:

- `GET /health` — service/transport liveness only
- `GET /tools` — machine-readable tool manifest, including mutation standing and input schema
- `POST /tools/{toolName}` — invoke exactly one existing Swarm Home tool

The adapter owns HTTP framing only. It does not read the event journal, habitat registry, or Atlas gateway directly, and it cannot create a second residence truth path.
