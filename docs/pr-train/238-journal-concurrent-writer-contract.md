# PR Train Slot 238: Concurrent writer contract

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define the persistence-side compare-and-append behavior required to uphold EventJournal expectations across multiple writers.

## Boundary
Concurrency control protects append invariants; it does not create a separate lock-owned truth or serialize unrelated residences unnecessarily.

## Gate
Extend expectedLastEventId semantics with atomic compare/append guarantees and explicit stale-writer failure.

## Falsification
Reject if check and append are separable races, stale writers overwrite, unrelated residence chains are globally blocked without need, or storage sequence replaces event predecessor relationships.

Implementation status: **not implemented in this PR**.
