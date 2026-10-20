# PR Train Slot 295: Lease revocation semantics

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 294**
- Merge after: **294**
- Supersedes: **none**
- Proves: revocation terminates only the named lease scope and records why, by whom, and when.
- Resulting state: define explicit revocation before natural expiry and the authority required to perform it.

## Intent
Define explicit revocation before natural expiry and the authority required to perform it.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
revocation terminates only the named lease scope and records why, by whom, and when.

## Gate
Require revoker authority, lease identity, typed reason, effective time, and evidence receipt.

## Falsification
Reject the contract if revocation is unaudited, revokes unrelated rights, or rewrites the historical grant.

Implementation status: **not implemented in this PR**.
