# PR Train Slot 169: Atlas adapter configuration boundary

Status: **planned contract slice, not runtime implementation**
Phase: **129-176 · Atlas identity / permission / evidence adapters**

## Intent
Separate endpoint/configuration data from identity, authority, and residence truth.

## Boundary
Operational controls may protect the adapter, but they cannot mint authority, rewrite residence history, or absorb Atlas-owned truth.

## Gate
Search current configuration, gateway, delivery, tests, and diagnostics first. Extend existing host/adaptor seams and keep secrets out of domain state.

## Falsification
Reject if outage becomes permission, recovery loses uncertain deliveries, config becomes identity, secrets enter events/logs, fixtures are mistaken for production, or conformance ignores failure cases.

Implementation status: **not implemented in this PR**.
