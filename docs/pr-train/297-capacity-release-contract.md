# PR Train Slot 297: Capacity release contract

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 296**
- Merge after: **296**
- Supersedes: **none**
- Proves: release changes capacity accounting only and preserves the causal relationship to the reservation or lease.
- Resulting state: define how reserved or occupied capacity is released and returned to the available pool.

## Intent
Define how reserved or occupied capacity is released and returned to the available pool.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
release changes capacity accounting only and preserves the causal relationship to the reservation or lease.

## Gate
Require originating allocation identity, release reason, actor authority where needed, and event timestamp.

## Falsification
Reject the contract if capacity is double-released, provenance is lost, or release mutates unrelated allocations.

Implementation status: **not implemented in this PR**.
