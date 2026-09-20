# PR Train Slot 220: Provider cache semantics

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent provider prompt/input caching capabilities, eligibility rules, cache scope, and observable cache-hit metadata where available.

## Boundary
Cache capability does not imply persistence, confidentiality, billing treatment, or determinism beyond explicit provider evidence.

## Gate
Reuse provider capability, accounting, and data-policy primitives. Record cache key semantics when public, scope, TTL/standing, source, and unknowns.

## Falsification
Reject if cache hit implies identical output, undocumented persistence is assumed, billing discount becomes architectural truth, or cache scope leaks across tenants.

Implementation status: **not implemented in this PR**.
