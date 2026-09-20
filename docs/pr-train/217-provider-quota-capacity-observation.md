# PR Train Slot 217: Provider quota and capacity observation

Status: **planned contract slice, not runtime implementation**
Phase: **177-224 · provider and model offering adapters**

## Intent
Represent account quota, project limits, burst capacity, and provider-side capacity signals as time-bound observations.

## Boundary
Quota/capacity observations are not guaranteed future availability and must not be promoted into global provider limits.

## Gate
Reuse rate-limit and availability projections. Preserve account/project scope, metric kind, reset semantics, observed_at, and source evidence.

## Falsification
Reject if one tenant's quota becomes provider truth, temporary capacity becomes permanent, undocumented limits are guessed, or reset time is treated as guaranteed.

Implementation status: **not implemented in this PR**.
