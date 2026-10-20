# PR Train Slot 192: Provider latency observation standing

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Separate measured local latency observations from provider promises or global performance claims.

## Boundary
Commercial/performance metadata is external observation, not Swarm truth. Historical offering identity remains append-only even when providers change products or prices.

## Gate
Search current provider contracts first. Preserve timestamp, scope, source, version, and predecessor/successor relationships. Add tests that distinguish observation from promise.

## Falsification
Reject if dated pricing becomes timeless, local latency becomes global fact, deprecation erases history, replacement implies equivalence, or compatibility is assumed without evidence.

Implementation status: **not implemented in this PR**.
