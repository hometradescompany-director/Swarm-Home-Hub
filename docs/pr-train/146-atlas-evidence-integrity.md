# PR Train Slot 146: Atlas evidence integrity metadata

Status: **planned contract slice, not runtime implementation**
Phase: **129-176 · Atlas identity / permission / evidence adapters**

## Intent
Carry integrity metadata by reference so Swarm can inspect standing without becoming the evidence source.

## Boundary
Atlas remains authoritative for evidence and global authority. Swarm may keep stable references and local transition relationships only.

## Gate
Search existing evidence/federation contracts first. Reuse opaque refs, preserve temporal/provenance fields, and add fail-closed tests before implementation.

## Falsification
Reject if evidence payloads become duplicated Swarm truth, unavailable becomes absent, redacted becomes false, timestamps collapse, or evidence attribution is lost.

Implementation status: **not implemented in this PR**.
