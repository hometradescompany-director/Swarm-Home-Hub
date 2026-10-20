# PR Train Slot 273: Admission policy extension boundary

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Intent
Extend the existing admission policy with explicit policy inputs and outcomes without creating a second admission authority path.

## Boundary
Atlas supplies bounded authority evidence; Swarm still owns local admission policy and capacity enforcement.

## Gate
Reuse AdmissionService, policy/admission.ts, habitat state, and existing transition rules. Keep decision evidence and local policy reasons separately attributable.

## Falsification
Reject if local policy bypasses Atlas authority, Atlas decision becomes automatic admission, or duplicate admission truth appears outside the residence event journal.

Implementation status: **not implemented in this PR**.
