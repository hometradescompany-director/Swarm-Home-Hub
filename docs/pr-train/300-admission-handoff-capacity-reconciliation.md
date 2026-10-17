# PR Train Slot 300: Admission handoff capacity reconciliation checkpoint

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 299**
- Merge after: **299**
- Supersedes: **none**
- Proves: the checkpoint proves current projections can be explained from linked events without inventing cross-domain authority.
- Resulting state: create a checkpoint contract reconciling admission, handoff, lease, and capacity decisions before the phase continues.

## Intent
Create a checkpoint contract reconciling admission, handoff, lease, and capacity decisions before the phase continues.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
the checkpoint proves current projections can be explained from linked events without inventing cross-domain authority.

## Gate
Require traceable identities, event lineage, evidence receipts, typed absences, and contradiction surfacing across the four domains.

## Falsification
Reject the contract if the checkpoint hides contradictions, copies state between domains, or reports clean while causal links are missing.

Implementation status: **not implemented in this PR**.
