# PR Train Slot 137: Atlas authority decision expiry

Status: **planned contract slice, not runtime implementation**
Phase: **129-176 · Atlas identity / permission / evidence adapters**

## Intent
Define explicit decision expiry/staleness handling without silently extending old permission.

## Boundary
Atlas owns identity/authority/evidence. Swarm owns local residence lifecycle. Adapter state is never a replacement truth store.

## Gate
Search existing federation and transport code first, extend existing seams, keep references opaque, preserve attribution, and fail closed on ambiguity.

## Falsification
Reject if stale/mismatched authority is accepted, evidence is copied as Swarm truth, transport errors become approval, or local policy is bypassed.

Implementation status: **not implemented in this PR**.
