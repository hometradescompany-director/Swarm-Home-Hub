# PR Train Slot 267: Persistence adapter conformance

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define the minimum contract a concrete EventJournal persistence adapter must satisfy before production use.

## Boundary
Conformance proves compatibility with Swarm's persistence invariants only; it does not certify vendor quality or operational fitness.

## Gate
Exercise durable append acknowledgement, compare-and-append, deterministic reads, corruption handling, schema decoding, recovery, and typed failures.

## Falsification
Reject if the adapter can lose acknowledged events, reorder stable history, overwrite duplicates, hide corruption, or fabricate missing data.

Implementation status: **not implemented in this PR**.
