# PR Train Slot 258: Storage capacity observation

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Represent storage usage, remaining capacity, growth rate, and configured limits as time-bound operational observations.

## Boundary
Capacity observations inform operations only; they are not residence capacity policy or domain authority.

## Gate
Record storage scope, metric units, observed_at, source, confidence/standing, and unknown limits explicitly.

## Falsification
Reject if filesystem capacity becomes habitat capacity, stale observations are treated current, estimated growth becomes fact, or missing limits become unlimited.

Implementation status: **not implemented in this PR**.
