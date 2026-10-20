# PR Train Slot 291: Lease grant boundary

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 290**
- Merge after: **290**
- Supersedes: **none**
- Proves: a lease grants only enumerated rights for a bounded interval and never transfers identity ownership.
- Resulting state: define the bounded act by which a home grants temporary residence or capability lease terms.

## Intent
Define the bounded act by which a home grants temporary residence or capability lease terms.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
a lease grants only enumerated rights for a bounded interval and never transfers identity ownership.

## Gate
Require grantor authority, subject identity reference, scope, start, expiry, and evidence receipt.

## Falsification
Reject the contract if lease scope is ambient, expiry is absent, or possession becomes ownership.

Implementation status: **not implemented in this PR**.
