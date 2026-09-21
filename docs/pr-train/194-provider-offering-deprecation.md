# PR Train Slot 194: Provider deprecation semantics

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent deprecation notices and effective dates without deleting historical offering identity.

## Boundary
Commercial/performance metadata is external observation, not Swarm truth. Historical offering identity remains append-only even when providers change products or prices.

## Gate
Search current provider contracts first. Preserve timestamp, scope, source, version, and predecessor/successor relationships. Add tests that distinguish observation from promise.

## Falsification
Reject if dated pricing becomes timeless, local latency becomes global fact, deprecation erases history, replacement implies equivalence, or compatibility is assumed without evidence.

Implementation status: **not implemented in this PR**.
