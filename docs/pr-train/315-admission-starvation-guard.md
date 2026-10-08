# PR Train Slot 315: Admission starvation guard

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 314**
- Merge after: **314**
- Supersedes: **none**
- Proves: starvation detection surfaces a governance problem without auto-admitting a subject.
- Resulting state: define detection and escalation when admission requests remain pending beyond bounded fairness thresholds.

## Intent
Define detection and escalation when admission requests remain pending beyond bounded fairness thresholds.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
starvation detection surfaces a governance problem without auto-admitting a subject.

## Gate
Require pending duration, policy threshold, queue evidence, and escalation event.

## Falsification
Reject the contract if the guard grants admission, hides indefinite delay, or discards older requests.

Implementation status: **not implemented in this PR**.
