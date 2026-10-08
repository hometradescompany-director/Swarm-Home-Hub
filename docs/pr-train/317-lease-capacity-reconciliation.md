# PR Train Slot 317: Lease capacity reconciliation

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 316**
- Merge after: **316**
- Supersedes: **none**
- Proves: reconciliation derives one explainable projection from event lineage rather than patching divergent counters.
- Resulting state: define reconciliation between active leases, reservations, residence state, and available capacity.

## Intent
Define reconciliation between active leases, reservations, residence state, and available capacity.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
reconciliation derives one explainable projection from event lineage rather than patching divergent counters.

## Gate
Require all active allocation relationships, event timestamps, typed absences, and contradiction surfacing.

## Falsification
Reject the contract if reconciliation overwrites source events, hides conflicts, or invents capacity to make totals balance.

Implementation status: **not implemented in this PR**.
