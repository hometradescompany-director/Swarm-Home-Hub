# PR Train Slot 235: Journal compaction boundary

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define what storage compaction may optimize without deleting or rewriting canonical residence events.

## Boundary
Canonical events are non-compacting truth. Only derived indexes, redundant encoding, and disposable acceleration artifacts may be compacted.

## Gate
Reuse checkpoint/cache boundaries. Require reproducibility, digest verification, explicit retained source range, and reversible disposal.

## Falsification
Reject if compaction drops canonical events, collapses contradictory history, rewrites payloads, or leaves a projection that cannot be rebuilt from retained events.

Implementation status: **not implemented in this PR**.
