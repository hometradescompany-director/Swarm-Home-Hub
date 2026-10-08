# Epistemic Divergence Topology

Status: bounded Swarm projection, not an Atlas truth model.

## Why this exists

A single "hallucination index" collapses too many distinct failure shapes.

The same bad outcome can arise because the system:

- perceived or generated unsupported content;
- narrowed attention and missed available evidence;
- overweighted salience;
- failed to retrieve relevant memory or context;
- collided meanings or drifted semantically;
- broke provenance or mixed event/observation time;
- bridged evidence with unsupported inference;
- hardened an interpretation against contradiction;
- inflated confidence;
- socially reinforced a claim without independent evidence;
- leaked simulation into intent, authority or action.

Those are not the same failure and should not receive one opaque score.

## Boundary

Swarm may project observed divergence over caller-supplied, attributable observations.

Swarm does **not**:

- diagnose a human;
- decide external truth;
- promote a claim into Atlas doctrine;
- infer workflow intent from a state report;
- grant authority;
- mutate state because divergence was observed.

Atlas C18 remains the epistemic promotion path. This projection is a local observability surface only.

## Layer vector

```text
perception/input
-> attention
-> salience
-> retrieval/memory
-> representation
-> provenance/time
-> inference
-> confidence
-> social reinforcement
-> authority/action
```

The vector is deliberately non-scalar. "No king state" applies here too: no one dimension becomes a universal explanation for epistemic failure.

## Canonical correction loop

```text
observe divergence
-> preserve source + observed_at
-> identify affected layer(s)
-> run the smallest relevant reevaluation check
-> preserve contradiction/absence
-> return stronger claims to Atlas C18
```

Examples:

- attention narrowing -> widen attention;
- unsupported observation content -> seek external observation;
- provenance break -> restore provenance/time;
- unsupported bridge -> generate alternatives/falsifiers;
- social reinforcement without independent evidence -> seek independent evidence;
- simulation-to-execution leak -> separate simulation, intent, authority and action.

## Relation to "hallucination"

"Hallucination" remains a useful failure label for some unsupported generated/perceived content, but it is not the parent class for every divergence.

This topology treats hallucination as one possible **signal at one layer**, while preserving neighboring mechanisms that can produce superficially similar errors.

## Provenance

2026-09-24 conversation correction:

- hyperfocus can narrow evidence intake without changing perception;
- belief/interpretation can resist contradiction;
- perception can itself supply unsupported content;
- a shared social frame can reinforce divergence;
- sandbox/simulation content must never silently become operational intent or action.

Implementation: `src/observability/epistemic-divergence.ts`.
