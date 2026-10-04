# PR Train Slot 301: Admission decision receipt

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 300**
- Merge after: **300**
- Supersedes: **none**
- Proves: the receipt records a decision and its evidence without becoming a new source of authority.
- Resulting state: define the receipt emitted for a completed admission decision.

## Intent
Define the receipt emitted for a completed admission decision.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
the receipt records a decision and its evidence without becoming a new source of authority.

## Gate
Require decision identity, subject reference, destination, outcome, timestamp, and evidence links.

## Falsification
Reject the contract if the receipt can grant access independently, loses attribution, or omits the governing decision.

Implementation status: **not implemented in this PR**.
