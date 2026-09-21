# PR Train Slot 275: Admission decision receipt

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Intent
Define a bounded receipt capturing the evidence and policy context used for one admission outcome.

## Boundary
The receipt explains the decision path; the residence event remains the canonical state transition.

## Gate
Preserve Atlas authority ref, local policy version, habitat capacity observation, actor, timestamps, outcome, and evidence refs.

## Falsification
Reject if receipt becomes a second state store, capacity is copied without provenance, denied outcomes disappear, or receipt can authorize later actions by itself.

Implementation status: **not implemented in this PR**.
