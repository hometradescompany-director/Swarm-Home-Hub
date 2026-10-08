# PR Train Slot 311: Reservation revocation semantics

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 310**
- Merge after: **310**
- Supersedes: **none**
- Proves: revocation affects only the named reservation and preserves its full causal history.
- Resulting state: define explicit revocation of a live reservation before natural expiry.

## Intent
Define explicit revocation of a live reservation before natural expiry.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
revocation affects only the named reservation and preserves its full causal history.

## Gate
Require revoker authority when applicable, reservation identity, typed reason, and effective time.

## Falsification
Reject the contract if revocation erases the reservation, releases unrelated capacity, or lacks attribution.

Implementation status: **not implemented in this PR**.
