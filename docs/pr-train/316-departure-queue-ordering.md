# PR Train Slot 316: Departure queue ordering contract

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 315**
- Merge after: **315**
- Supersedes: **none**
- Proves: ordering remains an operational projection and does not alter the legitimacy of any departure request.
- Resulting state: define deterministic ordering for pending departures that require shared resources or policy sequencing.

## Intent
Define deterministic ordering for pending departures that require shared resources or policy sequencing.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
ordering remains an operational projection and does not alter the legitimacy of any departure request.

## Gate
Require request identity, ordering rule, resource constraints, and tie-break evidence.

## Falsification
Reject the contract if queue order silently changes authority, hides blocked departures, or becomes nondeterministic.

Implementation status: **not implemented in this PR**.
