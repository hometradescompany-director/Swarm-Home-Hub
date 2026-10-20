# PR Train Slot 263: Persistence failover boundary

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define how append authority may move between storage instances without creating two canonical writers.

## Boundary
Failover changes infrastructure stewardship, not domain ownership or event identity.

## Gate
Require explicit authority transfer, last verified durable position, fencing/epoch semantics, divergence check, and audit receipt.

## Falsification
Reject if two writers can remain active, promotion ignores unverified tail, failover mints replacement events, or infrastructure epoch becomes domain time.

Implementation status: **not implemented in this PR**.
