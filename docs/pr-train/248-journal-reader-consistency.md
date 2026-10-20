# PR Train Slot 248: Journal reader consistency

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define what guarantees readers receive while concurrent appends occur, including stable-prefix and bounded-scan semantics.

## Boundary
Readers need a coherent event view, not necessarily global transactional isolation across unrelated residences.

## Gate
Specify stable-prefix behavior, cursor/version token, append visibility, residence-chain consistency, and retry semantics.

## Falsification
Reject if a scan can reorder already-seen events, cursor reuse silently changes history, partial chains appear complete, or readers infer causality from storage pagination.

Implementation status: **not implemented in this PR**.
