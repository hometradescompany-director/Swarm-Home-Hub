# PR Train Slot 286: Handoff rejection receipt

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 285**
- Merge after: **285**
- Supersedes: **none**
- Proves: rejection remains evidence of refusal only; it cannot mutate source truth or imply destination admission.
- Resulting state: define a typed rejection receipt when a destination refuses a handoff capsule.

## Intent
Define a typed rejection receipt when a destination refuses a handoff capsule.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only the bounded upstream identities, events, relationships, and evidence required to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
rejection remains evidence of refusal only; it cannot mutate source truth or imply destination admission.

## Gate
Require a typed refusal reason, destination identity reference, evaluated capsule reference, and decision timestamp.

## Falsification
Reject the contract if rejection reasons are silently dropped, refusal changes source authority, or rejection can be mistaken for admission.

Implementation status: **not implemented in this PR**.
