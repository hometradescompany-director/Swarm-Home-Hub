# PR Train Slot 310: Reservation expiry semantics

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 309**
- Merge after: **309**
- Supersedes: **none**
- Proves: expiry returns capacity without implying admission refusal or mutating unrelated leases.
- Resulting state: define deterministic expiry for provisional capacity reservations.

## Intent
Define deterministic expiry for provisional capacity reservations.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
expiry returns capacity without implying admission refusal or mutating unrelated leases.

## Gate
Require reservation identity, expiry bound, current state, and release event.

## Falsification
Reject the contract if expired reservations continue consuming capacity, disappear without provenance, or alter admission history.

Implementation status: **not implemented in this PR**.
