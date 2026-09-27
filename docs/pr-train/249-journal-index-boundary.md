# PR Train Slot 249: Derived journal index boundary

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define secondary indexes that accelerate event lookup without becoming authoritative history.

## Boundary
Indexes are disposable derived structures; missing or corrupt indexes must degrade to slower canonical reads, not altered truth.

## Gate
Tie each index to source event range, index version, rebuild procedure, and validation digest.

## Falsification
Reject if index-only data is treated canonical, stale indexes silently answer, index rebuild mutates events, or index ordering replaces causal relationships.

Implementation status: **not implemented in this PR**.
