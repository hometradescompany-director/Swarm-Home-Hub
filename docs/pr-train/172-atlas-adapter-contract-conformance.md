# PR Train Slot 172: Atlas adapter contract conformance

Status: **planned contract slice, not runtime implementation**
Phase: **129-176 · Atlas identity / permission / evidence adapters**

## Intent
Specify conformance checks for identity, authority, evidence, and event-delivery contracts.

## Boundary
Operational controls may protect the adapter, but they cannot mint authority, rewrite residence history, or absorb Atlas-owned truth.

## Gate
Search current configuration, gateway, delivery, tests, and diagnostics first. Extend existing host/adaptor seams and keep secrets out of domain state.

## Falsification
Reject if outage becomes permission, recovery loses uncertain deliveries, config becomes identity, secrets enter events/logs, fixtures are mistaken for production, or conformance ignores failure cases.

Implementation status: **not implemented in this PR**.
