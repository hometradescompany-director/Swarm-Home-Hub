# PR Train Slot 257: Storage health projection

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define a read-only projection of journal persistence health from integrity scans, durability signals, corruption standings, and recovery receipts.

## Boundary
Storage health is an operational projection, not canonical domain state and not proof that every event is semantically correct.

## Gate
Reuse existing corruption, durability, backup, and recovery evidence. Keep health dimensions separate and attributable.

## Falsification
Reject if green health hides unknown ranges, one successful append proves global durability, missing scans count as healthy, or operational status mutates journal history.

Implementation status: **not implemented in this PR**.
