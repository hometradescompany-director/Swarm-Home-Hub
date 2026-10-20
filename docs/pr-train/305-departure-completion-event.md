# PR Train Slot 305: Departure completion event

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 304**
- Merge after: **304**
- Supersedes: **none**
- Proves: completion changes current residence state while preserving the full pre-departure timeline.
- Resulting state: define the terminal event that records completed departure from a home.

## Intent
Define the terminal event that records completed departure from a home.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
completion changes current residence state while preserving the full pre-departure timeline.

## Gate
Require prior valid departure path, final handoff or typed absence, effective time, and evidence receipt.

## Falsification
Reject the contract if departure completes without a valid predecessor path, deletes history, or leaves current residence ambiguous.

Implementation status: **not implemented in this PR**.
