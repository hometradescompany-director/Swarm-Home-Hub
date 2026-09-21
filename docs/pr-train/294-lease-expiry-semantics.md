# PR Train Slot 294: Lease expiry semantics

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 293**
- Merge after: **293**
- Supersedes: **none**
- Proves: expiry removes current lease effect while preserving the full event and evidence chain.
- Resulting state: define lease expiry as a terminal time-bound state transition with retained history.

## Intent
Define lease expiry as a terminal time-bound state transition with retained history.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
expiry removes current lease effect while preserving the full event and evidence chain.

## Gate
Require deterministic expiry evaluation and typed terminal state before access continues.

## Falsification
Reject the contract if expired access remains active, provenance is deleted, or expiry mutates unrelated identity state.

Implementation status: **not implemented in this PR**.
