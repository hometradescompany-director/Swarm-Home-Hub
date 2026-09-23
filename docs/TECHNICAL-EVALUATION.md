# Swarm Topology · Swarm Home Base: Technical Evaluation

Swarm Topology is the current public system identity. Swarm Home Base, historically Swarm Home Hub, remains its bounded residence and readiness kernel for software agents.

The kernel gives an agent a place to enter, rest, recover context, become ready for work, and depart without confusing presence with authority.

## The 30-second version

Most agent systems blur three different questions:

1. Who is this agent?
2. Is this agent allowed to act?
3. What state is this agent currently in?

Swarm Home Base keeps those questions separate.

Atlas remains the authority and identity source. Swarm Home Base owns only local residence lifecycle and readiness projection. State changes are events, current state is derived, provenance is preserved, and the public transport fails closed on mutation unless an explicit host admission guard is supplied.

## What a technical buyer can verify now

The public repository exposes a bounded Web transport with:

- `GET /swarm-home/health`
- `GET /swarm-home/tools`
- `POST /swarm-home/tools/{toolName}`
- machine-readable tool discovery
- append-only residence events
- local habitat and residence projections
- a host-owned admission seam
- mutation denied by default
- defensive response headers
- request size and JSON validation
- CI, dependency audit, security policy, contribution rules, and runbooks

The demo smoke workflow compiles the project, boots the host, verifies health and discovery, invokes the read-only inspection tool, then proves that an unauthorised mutating call receives HTTP 403.

## Where it fits

Swarm Home Base is useful when an organisation has multiple agents, models, automations, or workers moving between tasks and needs to answer:

- Which agent is here?
- Why is it here?
- What can it currently do?
- What changed?
- Who authorised the transition?
- What evidence supports the current state?
- Can the system refuse action when authority is missing?

It is deliberately not a CRM, chat UI, model wrapper, autonomous authority source, or replacement for an organisation's existing identity provider.

## Paid pilot

A pilot should be narrow enough to verify value quickly.

Suggested scope:

1. Connect one existing agent or automation identity through an opaque reference.
2. Define one bounded admission policy supplied by the customer or its authority system.
3. Exercise residence request, admission, rest, readiness, and departure.
4. Export the resulting event/evidence path.
5. Review failure cases, especially denied or missing authority.
6. Decide whether the pattern merits integration into a larger orchestration stack.

The pilot should succeed or fail on observable evidence, not presentation.

## Evaluation standard

Do not buy this because the architecture sounds elegant.

Evaluate whether it:

- removes duplicated state ownership;
- makes agent transitions explainable after the fact;
- preserves authority boundaries under pressure;
- fails closed when admission is missing;
- remains inspectable by engineers who did not build it;
- integrates without taking ownership of data that belongs elsewhere.

If those properties are not useful in your environment, this component should not be adopted.
