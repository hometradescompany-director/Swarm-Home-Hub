# PR Train Slot 156: Atlas contract version negotiation

Status: **planned contract slice, not runtime implementation**
Phase: **129-176 · Atlas identity / permission / evidence adapters**

## Intent
Specify explicit contract-version handling without guessing incompatible payloads.

## Boundary
Transport success is not authority. Delivery metadata is not residence truth. Atlas and Swarm retain their existing ownership boundaries.

## Gate
Search current gateway/outbox/idempotency code first. Extend existing ledgers and event identity. Add focused fail-closed tests.

## Falsification
Reject if malformed/version-mismatched responses are guessed, authentication becomes authorization, correlation becomes identity, or retries create duplicate residence events.

Implementation status: **not implemented in this PR**.
