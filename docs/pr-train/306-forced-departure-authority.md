# PR Train Slot 306: Forced departure authority

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 305**
- Merge after: **305**
- Supersedes: **none**
- Proves: forced departure requires explicit bounded authority, typed cause, evidence, and heightened auditability.
- Resulting state: define the exceptional authority path for non-consensual departure.

## Intent
Define the exceptional authority path for non-consensual departure.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
forced departure requires explicit bounded authority, typed cause, evidence, and heightened auditability.

## Gate
Require governing policy, authorized actor, cause evidence, subject reference, and effective time.

## Falsification
Reject the contract if force can be invoked ambiently, evidence is absent, or exceptional power becomes ordinary policy.

Implementation status: **not implemented in this PR**.
