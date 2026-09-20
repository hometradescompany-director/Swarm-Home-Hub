# PR Train Slot 130: Atlas identity not-found semantics

Status: **planned contract slice, not runtime implementation**

Phase: **129-176 · Atlas adapters**

## Intent
Define fail-closed handling when Atlas cannot resolve an opaque agent identity reference.

## Boundary
Swarm keeps residence lifecycle ownership. Atlas keeps global identity, authority, and evidence ownership. This slot may define a seam, reference, or falsification target, never a second source of truth.

## Implementation gate
Search existing Atlas federation contracts first. Extend rather than duplicate. Use opaque references, fail closed on unresolved authority/evidence, and add focused tests before marking implemented.

## Falsification
Fails if Swarm copies Atlas-owned truth, if absence becomes permission, if adapter failure silently succeeds, or if historical provenance is rewritten.

Implementation status: **not implemented in this PR**.
