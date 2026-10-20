# PR Train Slot 149: Atlas decision receipt reference

Status: **planned contract slice, not runtime implementation**
Phase: **129-176 · Atlas identity / permission / evidence adapters**

## Intent
Define stable receipt references for consumed Atlas authority decisions.

## Boundary
The adapter translates and references Atlas-owned decisions/evidence. Swarm does not re-authorize itself from historical receipts or transport success.

## Gate
Search current HTTP gateway, delivery ledger, federation contract, and tests. Reuse existing idempotency and attribution machinery.

## Falsification
Reject if replay grants fresh authority, retry duplicates state transitions, timeout becomes allow/deny, or superseded/contradictory decisions are silently flattened.

Implementation status: **not implemented in this PR**.
