# PR Train Slot 289: Handoff duplicate receipt coalescing

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 288**
- Merge after: **288**
- Supersedes: **none**
- Proves: coalescing preserves every observation while preventing duplicate canonical receipt state.
- Resulting state: define how repeated equivalent handoff receipts collapse into one canonical acknowledgement relationship.

## Intent
Define how repeated equivalent handoff receipts collapse into one canonical acknowledgement relationship.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
coalescing preserves every observation while preventing duplicate canonical receipt state.

## Gate
Require stable capsule identity, equivalent destination decision, and preserved observation events.

## Falsification
Reject the contract if duplicate observations are deleted, divergent decisions are merged, or duplicate receipts mint authority.

Implementation status: **not implemented in this PR**.
