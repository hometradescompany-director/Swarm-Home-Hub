# PR Train Slot 243: Canonical event encoding

Status: **planned contract slice, not runtime implementation**
Phase: **225-272 · local persistence and deterministic rebuild from the event journal**

## Intent
Define a stable canonical representation used for digests, verification receipts, and portable journal comparison.

## Boundary
Canonical encoding is a verification format, not permission to overwrite original captured representations.

## Gate
Specify deterministic field order, normalization rules limited to representation, exact timestamp/string handling, and versioned canonicalization.

## Falsification
Reject if semantically distinct values normalize together, whitespace-sensitive payloads are altered, unknown fields disappear, or canonicalization mutates stored source evidence.

Implementation status: **not implemented in this PR**.
