# PR Train Slot 128: Provenance phase falsification harness

Status: **planned contract slice, not runtime implementation**

Phase: **081-128 · provenance**

## Intent
Close the phase with explicit falsification criteria for receipts, typed absence, contradiction, and supersession.

## Boundary
Swarm keeps residence lifecycle ownership. Atlas keeps global identity, authority, and evidence ownership. This slot may define a seam, reference, or falsification target, never a second source of truth.

## Implementation gate
Search existing Atlas federation contracts first. Extend rather than duplicate. Use opaque references, fail closed on unresolved authority/evidence, and add focused tests before marking implemented.

## Falsification
Fails if Swarm copies Atlas-owned truth, if absence becomes permission, if adapter failure silently succeeds, or if historical provenance is rewritten.

Implementation status: **not implemented in this PR**.
