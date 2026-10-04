# PR Train Slot 302: Admission refusal receipt

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 301**
- Merge after: **301**
- Supersedes: **none**
- Proves: refusal remains explainable and appealable without erasing the attempted admission event.
- Resulting state: define the durable receipt for a refused admission.

## Intent
Define the durable receipt for a refused admission.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
refusal remains explainable and appealable without erasing the attempted admission event.

## Gate
Require typed refusal reason, policy reference, evidence links, and decision timestamp.

## Falsification
Reject the contract if refusal is untyped, evidence is missing, or a denied attempt disappears from history.

Implementation status: **not implemented in this PR**.
