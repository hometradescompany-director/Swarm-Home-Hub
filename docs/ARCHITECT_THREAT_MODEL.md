# Architect is part of the threat model

## Core doctrine

> **Capability does not grant permission. The architect is part of the threat model.**

No actor is exempt from bounded authority because of capability, authorship,
ownership, seniority, administrator status, operator status, or proximity to the
control plane.

The person who understands the system best is still a participant in the
system. The architecture must therefore remain safe when that person is tired,
angry, overloaded, overconfident, mistaken, or simply operating from a state
they would later reject.

This is a structural rule, not a judgement about any specific operator.

## Swarm-topology consequence

Swarm already preserves the No King State boundary: contextual facts such as
arrival order, contribution, capability, provider status, payment, or founder
status do not become authority.

This doctrine turns that boundary back toward the builder.

- architect status is context, not authority;
- operator status is context, not authority;
- administrator status is context, not authority;
- control-plane proximity is context, not authority;
- capability is context, not authority;
- explicit authority remains required;
- local policy remains a separate gate even when authority exists.

The topology must not contain a hidden edge of the form:

`can build -> may bypass`

or:

`owns the control plane -> may self-authorise`

## What this does not authorize

This doctrine does **not** create:

- a mood detector;
- a psychological classifier;
- a second human-state record;
- an automatic inference that anger, exhaustion, pain, stress, or confidence
  changes workflow intent;
- a new global authority source inside Swarm Home.

Human state and workflow intent remain separate under
`HUMAN_STATE_INTENT_INVARIANT.md`.

The rule here is narrower: no privileged role receives an implicit authority
upgrade merely because the actor is capable, senior, close to the controls, or
the original architect.

## Required design properties

High-consequence paths should preserve, in proportion to consequence:

1. explicit authority;
2. bounded scope;
3. provenance;
4. reversibility where technically possible;
5. independent review or externally held constraints where appropriate;
6. fail-closed behaviour when authority is missing or ambiguous;
7. replaceability of privileged components rather than a permanent king node.

Elevated capability may justify broader *eligible* work. It does not itself
grant permission to perform that work.

## Relationship to No King State

No King State is not only a rule against agents, providers, founders, or
residents becoming sovereign through prestige or presence.

It also applies to the people and systems that created the topology.

A safe swarm must not require its architect, operator, model provider, or
security administrator to remain permanently wise in order to remain safe.

## Developmental provenance

### 2026-09-23 — reflexive No King extension

During a discussion about model-building capability, operator restraint, and
external guardrails, Jarrod Cobb explicitly adopted the formulation:

> **"Capability does not grant permission. The architect is part of the threat model."**

Jarrod then identified it as **"topology 101 for swarm states."**

Standing: user-declared architectural doctrine.

The triggering discussion included Jarrod's retrospective judgement that a
high-capability build created during a period of anger was something he would
not want treated as evidence that its builder should receive unchecked control.
That context is provenance for the doctrine, not a permanent characterization
of the operator.
