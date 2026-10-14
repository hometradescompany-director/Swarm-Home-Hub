# Delivery progress receipt — 2026-10-07

A bounded sweep repeatedly inspected the first `limit` events. Once that prefix was delivered, later events could remain pending forever. A regression with three events and three limit-one sweeps failed on the second sweep (delivered 0).

The publisher now rotates a transient inspection cursor. Each sweep still inspects at most `limit` entries, delivered receipts remain the only delivery truth, and failed entries are eligible again after wraparound. Restart resets inspection but does not reset receipts or deterministic event IDs. Stable journal ordering and a reused publisher instance are required for fair progress. `allEvents()` still loads full history; no bounded storage query or durable cursor is claimed.

A second regression proved durability declarations alone let a journal without callable `allEvents` pass readiness. The gate now checks this required capability as well. Both tests failed before the fix and pass after it.

Validation: TypeScript typecheck, 288 Bun tests across 87 files, demo build. Independent read-only code review found no critical or important scoped issues. No durable adapter or live Atlas federation is introduced. The previous hosted results certify the earlier commit only; check final hosted workflows before merge.
