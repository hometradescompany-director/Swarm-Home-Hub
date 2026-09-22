# PR Train Slot 304: Departure approval boundary

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 303**
- Merge after: **303**
- Supersedes: **none**
- Proves: approval authorizes only the bounded departure transition and does not rewrite historical residence or lease state.
- Resulting state: define approval semantics when departure requires a governing decision.

## Intent
Define approval semantics when departure requires a governing decision.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
approval authorizes only the bounded departure transition and does not rewrite historical residence or lease state.

## Gate
Require approving authority, subject identity, departure intent or trigger, scope, and effective time.

## Falsification
Reject the contract if approval acts as retroactive erasure, expands beyond departure scope, or lacks accountable authority.

Implementation status: **not implemented in this PR**.
