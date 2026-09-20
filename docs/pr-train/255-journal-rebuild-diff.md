# PR Train Slot 255: Rebuild diff semantics

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define an explainable diff between two rebuild outputs produced from the same journal under different projection versions.

## Boundary
A diff explains derived-state changes; it does not rewrite either historical result or imply one version is automatically correct.

## Gate
Preserve source journal range, both projection versions, canonical output digests, field-level differences, and interpretation notes.

## Falsification
Reject if unchanged fields are omitted in ways that hide scope, ordering noise becomes semantic change, source ranges differ silently, or one projection overwrites the other.

Implementation status: **not implemented in this PR**.
