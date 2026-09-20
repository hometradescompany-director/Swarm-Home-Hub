# Bounded Agent Infrastructure Pilot

## Objective

Prove whether explicit identity, authority, event, and evidence boundaries make one existing agent workflow more reliable and explainable without requiring a platform rewrite.

## Scope

One production-adjacent or representative workflow.

Examples include:

- an agent that invokes internal tools;
- an agent that moves between task contexts;
- an automation that performs privileged actions;
- a multi-agent handoff;
- a workflow where humans currently reconstruct why an action occurred after the fact.

The pilot deliberately excludes broad platform migration.

## Inputs required from the design partner

Four things:

1. Agent boundary — the agent or automation being evaluated.
2. Authority source — the existing system that decides whether an action is permitted.
3. Critical transition — one state change the organisation needs to explain reliably.
4. Non-negotiable failure — one condition that must fail closed rather than silently proceed.

No human PII is required by Swarm Home's public architecture.

## Implementation shape

The pilot should:

1. represent the agent through an opaque identity reference;
2. connect, rather than duplicate, the authoritative permission decision;
3. model the chosen state transition as an event;
4. attach evidence/provenance references to the transition;
5. derive the current local state from the event path;
6. expose a bounded inspection surface;
7. exercise both an authorised path and a denied/missing-authority path.

## Deliverables

- working bounded integration for the selected workflow;
- event and evidence path for the exercised transitions;
- authority-boundary map;
- failure-mode report;
- duplicated-truth findings, if any;
- technical recommendation: integrate further, redesign the boundary, or stop.

## Success criteria

The pilot succeeds only if the design partner can answer these questions more clearly after the integration:

- Which identity acted?
- What authority allowed or denied the transition?
- What changed?
- When did it change?
- What evidence supports the current state?
- Which system owns each piece of truth?
- What happens when authority is absent or contradictory?

A successful demo is not enough if these answers remain ambiguous.

## Commercial shape

This is intended as a paid design-partner engagement.

The commercial structure should be matched to the partner and scope, with options such as:

- fixed-fee technical pilot;
- paid architecture engagement;
- strategic integration with licensing;
- pilot credited toward a larger commercial agreement;
- pilot alongside strategic investment.

The technical boundary stays the same regardless of commercial structure.

## Time-to-decision

The goal is to reach a technically grounded continue / change / stop decision quickly.

The pilot is not a commitment to a broad migration.

It is an evidence-producing test of whether the architecture earns a larger deployment.
