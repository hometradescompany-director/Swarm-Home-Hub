# Cross-framework handoff conformance

Swarm Home has one canonical handoff source: the current ready-handoff capsule.

This slice projects that capsule into a small external envelope and a few
framework-shaped payloads without creating a task store, message store or second
handoff lifecycle.

## Canonical projection

\`SwarmHomeExternalHandoff/v1\` carries only:

- source residence ref;
- source residence event ref;
- opaque agent identity ref;
- capability and offering refs;
- opaque Atlas relational-context refs;
- generation and freshness times;
- \`authorityImplication: "none"\`.

The envelope is a projection, not a new source of truth.

## Framework profiles

### Agency Swarm

The host supplies:
- recipient agent;
- bounded task summary.

Swarm Home adds the external handoff envelope as structured additional context.
It does not reconstruct full conversation history.

### LangGraph-style swarm

The projection supplies:
- \`goto\`;
- \`active_agent\`;
- \`swarm_home_handoff\`.

It intentionally does **not** populate a \`messages\` array. LangGraph supports
custom parent/child state projection, so disclosure of conversational history
remains a separate host decision.

### Generic packet

Runtimes that accept opaque handoff data can receive one target ref plus the
same canonical envelope.

## Conformance rule

A framework projection may change shape but must not silently add:

- raw human communications;
- full conversation history;
- remote task state;
- local memory state;
- authority;
- departure from the Swarm residence;
- a claim that the target accepted or completed work.

Handoff is evidence of bounded readiness and context transfer. It is not proof
of execution or permission.
