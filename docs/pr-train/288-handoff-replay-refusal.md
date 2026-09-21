# PR Train Slot 288: Handoff replay refusal

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 287**
- Merge after: **287**
- Supersedes: **none**
- Proves: replay detection protects idempotency without treating duplicate observation as a new causal event.
- Resulting state: define refusal semantics for replaying an already-consumed or terminally-rejected handoff capsule.

## Intent
Define refusal semantics for replaying an already-consumed or terminally-rejected handoff capsule.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only the bounded upstream identities, events, relationships, and evidence required to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
replay detection protects idempotency without treating duplicate observation as a new causal event.

## Gate
Require capsule identity, prior terminal outcome lookup, and typed replay refusal.

## Falsification
Reject the contract if replay produces duplicate admission, duplicate capability, or a second canonical outcome.

Implementation status: **not implemented in this PR**.
