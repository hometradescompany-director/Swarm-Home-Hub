# Residence Phase Seal: 033-080

Slots 033-080 complete the bounded residence/readiness phase of Swarm Home Hub.

## Owned locally

Swarm owns:

- residence lifecycle state;
- habitat policy and capacity metadata;
- local rest/readiness projections;
- append-only residence history;
- bounded ready-handoff projection and validation.

Swarm does not own Atlas identity, global authority, global permissions, human PII, or global provenance truth.

## Proven path

The phase contract proves the following sequence through the public service surface:

1. request residence;
2. resolve canonical opaque agent identity;
3. evaluate Atlas admission authority;
4. admit against local habitat capacity;
5. enter rest;
6. become ready;
7. mint a bounded current-ready handoff;
8. revalidate that handoff against authoritative current residence and habitat state;
9. depart;
10. reject the previously minted handoff because its source readiness event has been superseded.

The journal must preserve the path as:

`requested -> admitted -> rested -> ready -> departed`

Current state remains a projection over those events.

## Phase invariants

- Presence never grants authority.
- Request and admission remain distinct state transitions.
- Habitat capacity is checked at write time.
- Readiness is explicit, not inferred from presence.
- Handoffs are derived projections, not independent truth stores.
- Handoffs are runtime-immutable after minting.
- Handoffs expire or fail closed when source state, habitat state, policy, or source event no longer matches.
- Expected absence and refusal remain machine-readable.
- No new registry exists merely to transport a handoff.

## CI release gate

`npm run test:residence-phase` executes the phase-level contract proof explicitly.

The ordinary `npm run check` still runs the full typecheck and test suite. CI requires both the focused phase proof and the complete suite so later work cannot silently break the foundational residence contract.

## Next boundary

Work after slot 080 enters the provenance / typed-absence / contradiction / supersession phase described by the build train. New work should extend existing evidence and event boundaries before introducing any new registry.
