# PR Train Slot 292: Lease acceptance boundary

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 291**
- Merge after: **291**
- Supersedes: **none**
- Proves: acceptance is explicit, attributable, and scoped to the exact lease terms presented.
- Resulting state: define the acceptance event for a proposed lease without treating proposal delivery as consent.

## Intent
Define the acceptance event for a proposed lease without treating proposal delivery as consent.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
acceptance is explicit, attributable, and scoped to the exact lease terms presented.

## Gate
Require exact proposal identity, accepter authority, current terms hash, and acceptance timestamp.

## Falsification
Reject the contract if stale terms can be accepted, silence counts as consent, or acceptance expands scope.

Implementation status: **not implemented in this PR**.
