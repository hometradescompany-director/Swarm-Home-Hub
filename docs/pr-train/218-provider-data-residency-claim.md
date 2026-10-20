# PR Train Slot 218: Provider data-residency claim

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent provider claims about processing/storage locality with jurisdiction, service, region, and effective-period scope.

## Boundary
A provider residency claim is evidence-backed metadata; it is not an independent legal determination or proof of physical location.

## Gate
Extend jurisdiction/data-policy primitives. Record claim source, scope, dates, exceptions, and verification standing separately.

## Falsification
Reject if marketing copy becomes legal fact, region availability becomes residency, storage locality implies processing locality, or unknown exceptions are ignored.

Implementation status: **not implemented in this PR**.
