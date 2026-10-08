# PR Train Slot 319: Admission departure phase readiness proof

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Merge topology
- Depends on: **Train 318**
- Merge after: **318**
- Supersedes: **none**
- Proves: readiness is established only when each policy path is explainable from identities, events, relationships, evidence, and stewardship.
- Resulting state: define the readiness proof for the completed admission, departure, handoff, lease, and capacity policy phase.

## Intent
Define the readiness proof for the completed admission, departure, handoff, lease, and capacity policy phase.

## Ownership
- Owns: the contract semantics named by this slot.
- Knows: only bounded upstream identities, events, relationships, and evidence needed to evaluate it.
- Emits: an attributable state-transition event or typed refusal/absence.
- Maintains: relationships to predecessor decisions rather than copied canonical fields.

## Boundary
readiness is established only when each policy path is explainable from identities, events, relationships, evidence, and stewardship.

## Gate
Require complete slot lineage, no unresolved blocking contradictions, deterministic projections, and typed absences for missing evidence.

## Falsification
Reject the contract if readiness is declared with hidden contradictions, unexplained state, or missing authority lineage.

Implementation status: **not implemented in this PR**.
