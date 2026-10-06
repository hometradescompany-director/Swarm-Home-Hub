# PR Train Slot 229: Projection checkpoint boundary

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define optional projection checkpoints as disposable acceleration artifacts that can shorten rebuild time without becoming canonical truth.

## Boundary
A checkpoint is derived cache, never authority. It must be discardable and independently reproducible from the journal.

## Gate
Record checkpoint source position, projection version, checksum/evidence metadata, and invalidation semantics.

## Falsification
Reject if a checkpoint can survive incompatible projection logic without detection, contains truth absent from events, or cannot be regenerated.

Implementation status: **not implemented in this PR**.
