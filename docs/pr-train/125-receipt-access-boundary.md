# PR Train Slot 125: Receipt access boundary

Status: **planned contract slice, not runtime implementation**

Phase: **081-128 · provenance**

## Intent
Separate evidence existence from caller authority to retrieve it.

## Boundary
Swarm keeps residence lifecycle ownership. Atlas keeps global identity, authority, and evidence ownership. This slot may define a seam, reference, or falsification target, never a second source of truth.

## Implementation gate
Search existing Atlas federation contracts first. Extend rather than duplicate. Use opaque references, fail closed on unresolved authority/evidence, and add focused tests before marking implemented.

## Falsification
Fails if Swarm copies Atlas-owned truth, if absence becomes permission, if adapter failure silently succeeds, or if historical provenance is rewritten.

Implementation status: **not implemented in this PR**.
