# PR Train Slot 233: Journal export and import boundary

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define a portable event-journal representation for controlled export/import without coupling domain history to one persistence engine.

## Boundary
Export is a representation of canonical events, not a second truth store. Import must validate before append and preserve original event identity.

## Gate
Reuse event serialization and integrity rules. Include format version, source scope, canonical ordering data, digest, and provenance manifest.

## Falsification
Reject if import rewrites IDs, drops unknown fields silently, trusts an unverified digest, or merges conflicting histories by file order.

Implementation status: **not implemented in this PR**.
