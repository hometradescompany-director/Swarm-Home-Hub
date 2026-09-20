# PR Train Slot 178: Provider offering capability projection

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider/model adapters**

## Intent
Represent provider-declared capabilities as attributable, versioned projections rather than permanent facts.

## Boundary
Adapters translate external provider/Atlas observations into bounded references and projections. External metadata does not become Swarm residence truth or autonomous authority.

## Gate
Search existing federation/provider contracts and tests first. Preserve attribution, versioning, typed absence, and fail-closed semantics.

## Falsification
Reject if external metadata becomes canonical without evidence, version skew is guessed through, unavailable becomes supported, or an adapter acquires authority by convenience.

Implementation status: **not implemented in this PR**.
