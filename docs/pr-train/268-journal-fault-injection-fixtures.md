# PR Train Slot 268: Persistence fault-injection fixtures

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define reusable fixtures for torn writes, stale writers, corrupt segments, unsupported schemas, failed fsync/commit, replica lag, and restore gaps.

## Boundary
Fixtures simulate storage failures in isolated environments; they must never be enabled against canonical production history.

## Gate
Each fixture declares trigger, expected typed failure, invariant under test, cleanup procedure, and reproducibility seed/input.

## Falsification
Reject if fault injection can silently target production, expected failure is ambiguous, cleanup mutates source evidence, or nondeterministic fixtures cannot be reproduced.

Implementation status: **not implemented in this PR**.
