# PR Train Slot 264: Writer fencing semantics

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define a persistence fencing token or epoch mechanism that prevents deposed writers from appending after failover.

## Boundary
Fencing protects storage authority only; holding a token grants no domain-level permission to create arbitrary events.

## Gate
Specify monotonically ordered epoch identity, append validation, stale-token failure, issuance authority, and provenance.

## Falsification
Reject if stale writers remain accepted, token possession bypasses domain validation, epoch resets silently, or fencing state is copied into event payloads.

Implementation status: **not implemented in this PR**.
