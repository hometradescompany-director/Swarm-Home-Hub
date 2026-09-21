# PR Train Slot 320: Admission departure phase falsification harness

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 319**
- Merge after: **319**
- Supersedes: **none**
- Proves: the phase is not considered sound unless invalid authority, stale handoffs, replay, overcommit, and contradictory allocation scenarios are rejected observably.
- Resulting state: define the falsification harness that attempts to break the completed phase before federation begins.

## Intent
Define the falsification harness that attempts to break the completed phase before federation begins.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
the phase is not considered sound unless invalid authority, stale handoffs, replay, overcommit, and contradictory allocation scenarios are rejected observably.

## Gate
Require adversarial fixtures spanning admission, departure, handoff, lease, capacity, replay, and contradiction cases.

## Falsification
Reject the contract if the harness cannot surface known-invalid transitions, failures are silent, or passing fixtures depend on hidden state.

Implementation status: **not implemented in this PR**.
