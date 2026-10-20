# PR Train Slot 335: Boundary crossing receipt

Status: **planned contract slice, not runtime implementation**
Phase: **333-344 · Facehugger Observatory contracts**

## Intent
Capture when a capability appears to survive a handoff, tool boundary, agent boundary, repository boundary, or context reset.

## Boundary
Crossing evidence records before/after state and boundary identity; it does not grant authority across that boundary.

## Gate
Preserve origin, destination, boundary kind, source receipts, observed delta, and unresolved causal alternatives.

## Falsification
Reject if coexistence is called transfer, destination authority is inferred, or missing before-state is treated as continuity.

Implementation status: **not implemented in this PR**.
