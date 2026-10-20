# PR Train Slot 290: Handoff destination-local evidence binding

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 289**
- Merge after: **289**
- Supersedes: **none**
- Proves: evidence from one home cannot be transplanted as if another home independently evaluated the capsule.
- Resulting state: bind handoff evaluation evidence to the destination that actually performed the decision.

## Intent
Bind handoff evaluation evidence to the destination that actually performed the decision.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
evidence from one home cannot be transplanted as if another home independently evaluated the capsule.

## Gate
Require opaque destination identity, evidence references, decision event, and local provenance linkage.

## Falsification
Reject the contract if foreign evidence becomes local truth, destination attribution is lost, or copied evidence grants permission.

Implementation status: **not implemented in this PR**.
