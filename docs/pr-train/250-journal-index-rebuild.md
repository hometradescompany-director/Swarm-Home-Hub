# PR Train Slot 250: Index rebuild semantics

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define deterministic reconstruction of journal indexes from canonical events.

## Boundary
Index rebuild may regenerate acceleration structures only; it must not emit domain events or rewrite journal history.

## Gate
Specify source range, index schema version, deterministic ordering, output digest, and typed failure.

## Falsification
Reject if rebuild consults external mutable state, silently drops unindexable events, changes event order, or requires prior index contents.

Implementation status: **not implemented in this PR**.
