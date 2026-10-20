# PR Train Slot 259: Write amplification observation

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define how persistence adapters report additional physical writes caused by indexing, checksums, manifests, and durability mechanisms.

## Boundary
Write amplification is an operational metric; it must not alter the logical one-event append contract.

## Gate
Separate logical event count/bytes from physical storage operations and preserve adapter/version attribution.

## Falsification
Reject if physical writes are counted as domain events, metrics hide durability work, adapters are compared across unlike storage scopes, or sampled values become guarantees.

Implementation status: **not implemented in this PR**.
