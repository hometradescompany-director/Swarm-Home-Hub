# PR Train Slot 174: Atlas adapter version-skew handling

Status: **planned contract slice, not runtime implementation**
Phase: **Specify explicit incompatibility handling when Atlas and Swarm contracts diverge.**

## Intent
undefined

## Boundary
Adapters translate external provider/Atlas observations into bounded references and projections. External metadata does not become Swarm residence truth or autonomous authority.

## Gate
Search existing federation/provider contracts and tests first. Preserve attribution, versioning, typed absence, and fail-closed semantics.

## Falsification
Reject if external metadata becomes canonical without evidence, version skew is guessed through, unavailable becomes supported, or an adapter acquires authority by convenience.

Implementation status: **not implemented in this PR**.
