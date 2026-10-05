# Transition Intelligence Proof

Status: bounded policy projection, no new state or authority.

## Doctrine

> Intelligence should govern transitions, not become a state.

Swarm Home already owns an explicit residence transition grammar and append-only
transition event path. This proof makes one narrow consequence executable:
intelligence may inspect a candidate edge, but the advice itself is not a
residence state, authority decision, workflow mutation, or transition event.

## Existing ownership

- `src/policy/transitions.ts` owns the local residence transition grammar.
- `src/service/residence-service.ts` applies an allowed transition by appending
  the corresponding residence event.
- Atlas authority remains separate where a transition requires it.
- Current residence state remains a projection over the event path.

No new registry, journal, decision engine, or truth store is introduced.

## Projection

`projectTransitionIntelligence(...)` accepts:

- the current residence state;
- a proposed next state;
- an opaque source reference;
- the observation time for the advice.

It returns whether that edge exists in the existing local transition grammar,
while preserving these invariants:

- `authorityImplication = "none"`;
- `mutatesState = false`;
- `becomesState = false`;
- `requiresTransitionEvent = true`.

A locally valid edge is therefore still only an edge. It does not happen until
the existing transition path produces the attributable event and satisfies any
separate authority or policy gate.

## Falsification

The proof fails if advice can:

1. become a residence state;
2. mutate the event journal;
3. substitute for an Atlas authority decision;
4. bypass the existing transition grammar; or
5. lose its source reference or observation time.

## Provenance

2026-09-25 repository doctrine:

> Intelligence should govern transitions, not become a state.

2026-09-26 Dory-method follow-on: convert that sentence into the smallest
runtime-checkable proof without introducing a parallel state machine.
