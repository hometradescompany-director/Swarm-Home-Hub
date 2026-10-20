# PR Train Slot 182: Provider offering rate-limit metadata

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent declared throttling/rate-limit constraints as external operational metadata.

## Boundary
Provider metadata is externally sourced, attributable, and versioned. It cannot grant Swarm authority, become residence truth, or silently become a permanent capability fact.

## Gate
Search existing offering/provider contracts first. Reuse stable references, preserve source/version/region standing, and model missing information as typed absence.

## Falsification
Reject if credentials enter domain state, external limits are treated as timeless, unsupported capability is invented, or provider metadata becomes canonical authority.

Implementation status: **not implemented in this PR**.
