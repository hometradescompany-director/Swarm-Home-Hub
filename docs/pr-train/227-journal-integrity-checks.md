# PR Train Slot 227: Journal integrity checks

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define integrity validation for persisted events before they participate in deterministic rebuild.

## Boundary
Validation may refuse corrupt or contradictory input but must not repair history silently.

## Gate
Reuse event assertions and typed absence. Check identity, event-id uniqueness, predecessor relationships, timestamp validity, and immutable payload structure.

## Falsification
Reject if corrupt events are normalized into validity, missing predecessors are invented, duplicate IDs are merged, or validation mutates stored history.

Implementation status: **not implemented in this PR**.
