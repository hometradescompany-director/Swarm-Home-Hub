# Founder Brief

## Endless Technologies

Endless Technologies is building infrastructure for software agents that need to operate across real systems without collapsing identity, authority, state, and provenance into one opaque execution layer.

Swarm Home Hub is the public proof surface for one bounded part of that architecture.

## The problem

As software agents move from answering questions to taking actions, four concerns are routinely blurred together:

1. Identity — which agent or actor is this?
2. Authority — what is it permitted to do right now?
3. State — what condition is it currently in?
4. Evidence — why does the system believe that state is valid?

When those concerns share one mutable blob, debugging becomes archaeology, permissions become implicit, and post-incident explanation becomes guesswork.

## The architecture

The wider architecture separates those concerns.

Swarm Home owns one narrow domain: local residence and readiness lifecycle for admitted software-agent identities.

Atlas remains the orchestration and authority boundary.

Swarm Home therefore does not become a second global identity system, a second permissions database, a CRM, an autonomous authority source, or a store for human PII.

Its current state is derived from attributable events, not treated as unexplained truth.

## What is already public and verifiable

The public repository currently provides:

- a transport-neutral tool manifest;
- a single-call tool router;
- a hardened Web transport;
- machine-readable tool discovery;
- health inspection;
- append-only residence lifecycle events;
- local habitat and residence projections;
- explicit host-owned admission policy;
- fail-closed state mutation when authority is absent;
- a runnable read-only demo host;
- CI and a dedicated end-to-end demo smoke gate;
- security, release, contribution, and operational documentation.

The smoke gate compiles the code, boots the public demo host, verifies health and discovery, exercises a read-only inspection tool, then proves a mutating call is refused with HTTP 403 when no admission guard is present.

## What we are looking for

We are not looking for a conventional employment relationship.

The useful conversations are with organisations that can provide one or more of:

- enterprise distribution;
- design-partner workloads;
- infrastructure or compute leverage;
- strategic platform integration;
- capital for accelerated productisation;
- acquisition or licensing interest in the architecture or underlying IP.

## Why now

Agent infrastructure is shifting from model wrappers toward execution, coordination, policy, identity, auditability, and bounded authority.

The thesis is simple:

**agents become more economically useful as they gain access to real systems, and more dangerous to operate opaquely at exactly the same time.**

The control plane therefore becomes part of the product, not an afterthought.

## Fast evaluation path

A serious evaluator does not need to accept the thesis on faith.

1. Clone the public repository.
2. Run the bounded demo.
3. Inspect the tool manifest and Web surface.
4. Verify that read-only inspection works.
5. Attempt unauthorised mutation and observe the fail-closed response.
6. Review the event/state separation and authority boundary.
7. Choose one real agent workflow and determine whether a paid pilot would produce useful evidence.

If the architecture does not reduce ambiguity, duplicated truth ownership, or authority risk in that workflow, the evaluation should stop there.

## Founder conversation

The first useful conversation is not a deck review.

Bring:

- one agent or automation that crosses an important system boundary;
- the system that is authoritative for identity or permission;
- the transition that most needs to be explainable after the fact;
- the failure that must never silently pass.

From those four inputs, we can determine whether there is a bounded pilot, partnership, investment thesis, or no fit.
