# PR Train Slot 299: Capacity pressure signal

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 298**
- Merge after: **298**
- Supersedes: **none**
- Proves: pressure is evidence for planning and policy evaluation, not an automatic eviction or admission decision.
- Resulting state: define an observable pressure signal before hard capacity exhaustion without granting policy authority to the signal itself.

## Intent
Define an observable pressure signal before hard capacity exhaustion without granting policy authority to the signal itself.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
pressure is evidence for planning and policy evaluation, not an automatic eviction or admission decision.

## Gate
Require bounded thresholds, source projection, timestamp, and non-authoritative signal semantics.

## Falsification
Reject the contract if signal mutates leases, forces eviction, or becomes canonical capacity truth by itself.

Implementation status: **not implemented in this PR**.
