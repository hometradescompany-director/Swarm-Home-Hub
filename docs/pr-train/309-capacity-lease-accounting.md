# PR Train Slot 309: Capacity lease accounting

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 308**
- Merge after: **308**
- Supersedes: **none**
- Proves: capacity accounting projects from lease and residence events rather than storing a competing canonical occupancy record.
- Resulting state: define how active leases consume bounded capacity without duplicating occupancy truth.

## Intent
Define how active leases consume bounded capacity without duplicating occupancy truth.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
capacity accounting projects from lease and residence events rather than storing a competing canonical occupancy record.

## Gate
Require current lease states, residence states, reservation relationships, and deterministic projection rules.

## Falsification
Reject the contract if capacity is double-counted, copied fields diverge, or accounting becomes an independent authority source.

Implementation status: **not implemented in this PR**.
