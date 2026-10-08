# PR Train Slot 307: Graceful handoff before departure

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 306**
- Merge after: **306**
- Supersedes: **none**
- Proves: handoff is prepared and evaluated before departure without making successful handoff a prerequisite for preserving provenance.
- Resulting state: define the preferred handoff path that preserves transferable state before departure completes.

## Intent
Define the preferred handoff path that preserves transferable state before departure completes.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
handoff is prepared and evaluated before departure without making successful handoff a prerequisite for preserving provenance.

## Gate
Require destination or typed absence, capsule reference, source evidence, and departure linkage.

## Falsification
Reject the contract if failed handoff erases departure history, destination possession creates authority, or departure blocks indefinitely.

Implementation status: **not implemented in this PR**.
