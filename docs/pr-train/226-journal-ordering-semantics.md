# PR Train Slot 226: Journal ordering semantics

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define deterministic event ordering using explicit causal and temporal fields rather than relying on storage insertion order.

## Boundary
Storage order is an observation, not necessarily causal order. Previous-event links and declared timestamps remain distinct.

## Gate
Extend event-chain primitives. Preserve occurred_at, observed_at, persisted_at, previous_event_ref, and deterministic tie-breaking rules.

## Falsification
Reject if database row order becomes causality, observed time overwrites occurred time, equal timestamps create nondeterministic rebuilds, or missing predecessors are guessed.

Implementation status: **not implemented in this PR**.
