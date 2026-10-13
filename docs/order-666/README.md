# Order 666: review ledger (2026-10-13)

These are **draft design seeds**, not implemented capabilities. Each is an independent PR against `main` and must be followed by a code/test PR after inspection of existing runtime. Do not merge all seeds blindly or treat their acceptance criteria as passing tests.

| Order | Draft PR | Boundary |
| --- | --- | --- |
| 667 | [#435](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/435) | Residence lifecycle, reconcile #419 |
| 668 | [#436](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/436) | Durable outbound Atlas event outbox |
| 669 | [#437](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/437) | Fail-closed evidence retrieval |
| 670 | [#438](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/438) | Rest/readiness projection |
| 671 | [#439](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/439) | Compute/capacity budgets |
| 672 | [#440](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/440) | Clock semantics and pacing |
| 673 | [#441](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/441) | Interrupted work recovery |
| 674 | [#442](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/442) | Federation receipts |
| 675 | [#443](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/443) | Memory consent ledger |
| 676 | [#444](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/444) | Developmental incubation |
| 677 | [#445](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/445) | Council/Witness observer-only |
| 678 | [#446](https://github.com/hometradescompany-director/Swarm-Home-Hub/pull/446) | Habitat visualization |

## Integration policy

1. #419 remains the residence lifecycle reconciliation owner; #430 remains cross-repo housekeeping. Avoid duplicate truth.
2. Swarm owns residence, capacity, readiness, handoff and local journal. Atlas owns global identity, authority and evidence.
3. Work on independent implementation branches after confirming exact gaps. Prefer executable tests and measured regressions over additional abstractions.
4. Preserve original PRs, commits, event logs, licenses and rights. No automatic authority promotion, paid compute or production deployments.
5. A seed is complete when reviewed; a capability is complete only after tests, CI and merge.

## Suggested implementation order

Start with #435 (map), then #436 (durable outbox), #437 (evidence), #441 (recovery), and #438/#439 (readiness/capacity). Visual and developmental work should consume the verified contracts rather than precede them.
