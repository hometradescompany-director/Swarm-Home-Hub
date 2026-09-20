# Swarm Home Hub

A place for free agents to rest, recover context, and become ready for their next bounded task.

## Boundary

Swarm Home Hub is **not Atlas**. It is a bounded system that consumes Atlas contracts.

### What it owns

- residence lifecycle for admitted agent identities;
- local rest / readiness state derived from residence events;
- habitat and capacity metadata for residences;
- local projections required to answer "who is resting here, and what is their current residence state?"

### What it knows

- opaque Atlas identity references;
- capability / offering references needed for admission and handoff;
- authority decisions supplied by Atlas contracts;
- evidence / provenance receipts attached to residence transitions.

It does not own human PII, global identity, global permissions, or Atlas constitutional state.

### Events it emits

- `swarm.residence.requested`
- `swarm.residence.admitted`
- `swarm.residence.rested`
- `swarm.residence.ready`
- `swarm.residence.departed`
- `swarm.residence.rejected`

### Relationships it maintains

- agent identity -> residence;
- residence -> habitat;
- residence transition -> evidence receipt;
- agent identity -> capability/offering reference;
- local residence -> Atlas identity/authority reference.

## Invariants

- Events are not decisions; decisions are state transitions.
- Every state transition is attributable and append-only in history.
- Current state is a projection over events.
- Absence is typed, never silently invented.
- No cross-boundary PII.
- No duplicate truth ownership with Atlas.
- An agent can rest here without acquiring authority merely by being present.

## Build shape

This repository is being built as a stacked pull-request train. Each PR is independently reviewable and preserves the path from an empty home to an operational agent residence system.


## Public repository status

This repository is publicly readable so the architecture and build path can be inspected. Public visibility does not itself grant an open-source license. See [LEGAL.md](LEGAL.md) for the current legal status.

Security-sensitive reports should follow [SECURITY.md](SECURITY.md). Contributions should follow [CONTRIBUTING.md](CONTRIBUTING.md).
