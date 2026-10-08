# PR Train Slot 279: Admission refusal taxonomy

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Intent
Define explicit local refusal categories for admission attempts while preserving Atlas denials, capacity conflicts, stale evidence, and malformed requests as distinct causes.

## Boundary
Refusal categories describe why no admission transition occurred; they do not create a residence state beyond existing requested/rejected semantics.

## Gate
Reuse RejectionService and typed absence/contradiction primitives. Preserve machine category, human reason, authority ref when present, evidence refs, and observed_at.

## Falsification
Reject if all failures collapse into denied, transport errors become policy refusals, Atlas denial is rewritten as local policy, or refusal reasons gain authority.

Implementation status: **not implemented in this PR**.
