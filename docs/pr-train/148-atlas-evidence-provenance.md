# PR Train Slot 148: Atlas evidence provenance linkage

Status: **planned contract slice, not runtime implementation**
Phase: **129-176 · Atlas identity / permission / evidence adapters**

## Intent
Relate residence transitions to Atlas evidence receipts by stable identifier.

## Boundary
Atlas remains authoritative for evidence and global authority. Swarm may keep stable references and local transition relationships only.

## Gate
Search existing evidence/federation contracts first. Reuse opaque refs, preserve temporal/provenance fields, and add fail-closed tests before implementation.

## Falsification
Reject if evidence payloads become duplicated Swarm truth, unavailable becomes absent, redacted becomes false, timestamps collapse, or evidence attribution is lost.

Implementation status: **not implemented in this PR**.
