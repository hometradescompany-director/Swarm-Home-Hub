# PR Train Slot 225: Event journal storage contract

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define the persistence boundary for the append-only residence event journal without coupling domain code to one database engine.

## Boundary
Persistence stores events and retrieval metadata; it does not own residence state, which remains a projection over events.

## Gate
Reuse the existing event journal interface. Specify append, ordered read, event-id uniqueness, durable acknowledgement, and typed storage failure semantics.

## Falsification
Reject if storage mutates historical events, current-state snapshots become canonical, ordering is inferred from ingestion alone, or duplicate event IDs silently overwrite.

Implementation status: **not implemented in this PR**.
