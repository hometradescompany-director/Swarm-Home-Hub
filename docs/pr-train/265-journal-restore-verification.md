# PR Train Slot 265: Restore verification semantics

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define the checks required before a restored journal may serve canonical reads or accept new appends.

## Boundary
Successful byte restoration is insufficient until event integrity, ordering, range completeness, and writer authority are verified.

## Gate
Verify manifest/digest, event-chain integrity, schema support, durable tail, projection rebuild, and current fencing epoch.

## Falsification
Reject if restore becomes live before verification, checksum alone proves semantic validity, missing tail is ignored, or a stale writer can append after restore.

Implementation status: **not implemented in this PR**.
