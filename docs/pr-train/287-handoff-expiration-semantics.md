# PR Train Slot 287: Handoff expiration semantics

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 286**
- Merge after: **286**
- Supersedes: **none**
- Proves: expiration invalidates use without deleting provenance or rewriting the historical handoff event.
- Resulting state: define expiration semantics for handoff capsules after their bounded validity window closes.

## Intent
Define expiration semantics for handoff capsules after their bounded validity window closes.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only the bounded upstream identities, events, relationships, and evidence required to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
expiration invalidates use without deleting provenance or rewriting the historical handoff event.

## Gate
Require explicit validity bounds and typed expired state before any downstream use.

## Falsification
Reject the contract if expired capsules remain actionable, history is deleted, or expiration silently becomes revocation of unrelated authority.

Implementation status: **not implemented in this PR**.
