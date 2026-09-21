# PR Train Slot 313: Capacity contradiction queue

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 312**
- Merge after: **312**
- Supersedes: **none**
- Proves: the queue preserves contradictions without granting them authority or silently selecting a winner.
- Resulting state: define a bounded queue for unresolved capacity contradictions awaiting reconciliation.

## Intent
Define a bounded queue for unresolved capacity contradictions awaiting reconciliation.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
the queue preserves contradictions without granting them authority or silently selecting a winner.

## Gate
Require contradiction identity, implicated claims, evidence links, status, and stewardship ownership.

## Falsification
Reject the contract if queued contradictions mutate capacity, disappear without resolution, or become hidden backlog.

Implementation status: **not implemented in this PR**.
