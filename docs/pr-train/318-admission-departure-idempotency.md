# PR Train Slot 318: Admission departure idempotency

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 317**
- Merge after: **317**
- Supersedes: **none**
- Proves: repeated delivery of the same transition cannot create duplicate residence or departure events.
- Resulting state: define idempotency keys and replay behavior for admission and departure state transitions.

## Intent
Define idempotency keys and replay behavior for admission and departure state transitions.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
repeated delivery of the same transition cannot create duplicate residence or departure events.

## Gate
Require stable operation identity, prior outcome lookup, deterministic replay response, and preserved observation evidence.

## Falsification
Reject the contract if replay duplicates state, loses the original outcome, or lets retries bypass policy checks.

Implementation status: **not implemented in this PR**.
