# PR Train Slot 240: Persisted event schema versioning

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define explicit schema/version metadata for persisted event representations while preserving stable domain event identity.

## Boundary
Storage schema version describes encoding/shape, not a new domain event version unless the domain contract itself changes.

## Gate
Reuse event identity and export format versioning. Record schema version, compatible readers, migration provenance, and unknown-version failure.

## Falsification
Reject if old events are rewritten in place without provenance, unknown versions are coerced, storage version becomes event type, or decoder defaults fabricate absent fields.

Implementation status: **not implemented in this PR**.
