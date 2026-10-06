# PR Train Slot 232: Backup and restore boundary

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define backup and restore semantics for the journal while preserving event identity, ordering evidence, and provenance across copies.

## Boundary
Restore recreates durable storage from preserved journal material; it must not mint new domain events merely because bytes moved.

## Gate
Specify backup scope, manifest/digest, creation evidence, restore verification, conflict behavior, and source lineage.

## Falsification
Reject if restore changes event IDs, silently merges divergent journals, backup timestamp becomes event time, or provenance of restored material is lost.

Implementation status: **not implemented in this PR**.
