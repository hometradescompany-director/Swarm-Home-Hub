# PR Train Slot 296: Capacity reservation contract

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 295**
- Merge after: **295**
- Supersedes: **none**
- Proves: reservation protects bounded capacity while remaining revocable and non-authoritative for admission.
- Resulting state: define a provisional capacity reservation without conflating reserved capacity with admitted occupancy.

## Intent
Define a provisional capacity reservation without conflating reserved capacity with admitted occupancy.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
reservation protects bounded capacity while remaining revocable and non-authoritative for admission.

## Gate
Require capacity source, quantity or unit, subject reference, expiry, and reservation evidence.

## Falsification
Reject the contract if reservation guarantees admission, exceeds declared capacity, or persists without expiry.

Implementation status: **not implemented in this PR**.
