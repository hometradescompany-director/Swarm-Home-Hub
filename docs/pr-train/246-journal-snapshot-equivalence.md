# PR Train Slot 246: Snapshot equivalence verification

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define how a derived projection checkpoint is compared against a fresh rebuild from canonical journal history.

## Boundary
Equivalence is a cache-validity proof; the journal remains authoritative even when snapshot and rebuild match.

## Gate
Compare projection version, source range, canonical output digest, typed differences, and reproducibility metadata.

## Falsification
Reject if matching row counts imply equivalence, snapshot-only fields are accepted as truth, mismatches are auto-patched, or comparison depends on unordered serialization.

Implementation status: **not implemented in this PR**.
