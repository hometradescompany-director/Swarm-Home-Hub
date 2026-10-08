# PR Train Slot 303: Departure intent boundary

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 302**
- Merge after: **302**
- Supersedes: **none**
- Proves: intent is advisory state until a valid departure transition occurs.
- Resulting state: define a non-terminal declaration that a resident or agent intends to depart.

## Intent
Define a non-terminal declaration that a resident or agent intends to depart.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
intent is advisory state until a valid departure transition occurs.

## Gate
Require subject identity, declaring actor, intended timing, and optional reason evidence.

## Falsification
Reject the contract if intent immediately revokes rights, silently completes departure, or mutates unrelated leases.

Implementation status: **not implemented in this PR**.
