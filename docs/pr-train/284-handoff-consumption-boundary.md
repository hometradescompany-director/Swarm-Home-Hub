# PR Train Slot 284: Handoff consumption boundary

Status: **planned contract slice, not runtime implementation**
Phase: **273-320 · admission, departure, handoff, lease and capacity policy**

## Intent
Define what a downstream consumer may do with a ready-handoff capsule without granting new authority merely by possession.

## Boundary
A handoff capsule conveys bounded state/evidence references, not ambient permission or identity ownership.

## Gate
Require consumer validation against current readiness, capsule freshness, opaque identity/capability refs, and relevant authority checks at the destination.

## Falsification
Reject if possession authorizes entry elsewhere, stale capsules remain valid, destination skips its own policy, or copied capability refs become new canonical truth.

Implementation status: **not implemented in this PR**.
