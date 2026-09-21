# PR Train Slot 308: Lease to admission promotion boundary

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 307**
- Merge after: **307**
- Supersedes: **none**
- Proves: promotion requires a fresh admission decision and cannot occur merely because a lease lasted long enough.
- Resulting state: define the explicit transition from temporary lease state to admitted residence.

## Intent
Define the explicit transition from temporary lease state to admitted residence.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
promotion requires a fresh admission decision and cannot occur merely because a lease lasted long enough.

## Gate
Require active lease identity, current admission policy evaluation, authority, and new decision receipt.

## Falsification
Reject the contract if temporary access silently becomes permanent, stale lease terms govern admission, or admission evidence is skipped.

Implementation status: **not implemented in this PR**.
