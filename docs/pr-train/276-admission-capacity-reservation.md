# PR Train Slot 276: Admission capacity reservation boundary

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Intent
Define whether and how a short-lived local reservation may protect a final habitat slot between evaluation and durable admission append.

## Boundary
A reservation is temporary coordination state, not residence state and not authority to admit.

## Gate
Reuse habitat capacity guard and writer concurrency semantics. Require explicit expiry, owner/request ref, atomic conversion or release, and fail-closed conflict behavior.

## Falsification
Reject if reservation consumes permanent capacity, survives expiry silently, bypasses durable admission append, or becomes a hidden parallel occupancy store.

Implementation status: **not implemented in this PR**.
