# PR Train Slot 139: Atlas authority action binding

Status: **planned contract slice, not runtime implementation**
Phase: **129-176 · Atlas identity / permission / evidence adapters**

## Intent
Require decisions to bind to the exact Swarm action rather than generalized approval.

## Boundary
Atlas owns identity/authority/evidence. Swarm owns local residence lifecycle. Adapter state is never a replacement truth store.

## Gate
Search existing federation and transport code first, extend existing seams, keep references opaque, preserve attribution, and fail closed on ambiguity.

## Falsification
Reject if stale/mismatched authority is accepted, evidence is copied as Swarm truth, transport errors become approval, or local policy is bypassed.

Implementation status: **not implemented in this PR**.
