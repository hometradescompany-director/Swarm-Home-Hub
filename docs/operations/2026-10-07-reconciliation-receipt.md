# Reconciliation receipt — 2026-10-07

Requested by Jarrod Cobb; executed through Codex and the GitHub connector.

## PR 421

Removed 811 generated node_modules files (682,876 lines) from the branch without deleting or rewriting prior commits. Added ignore rules for dependencies, compiled outputs and TypeScript caches. The original five authored source/test/documentation changes remain intact.

Applied the source-map-js 1.2.2 advisory fix to both npm and Bun lockfiles. CI installs the frozen Bun lockfile; npm audit reads the npm lockfile, so both must agree.

Local validation on the corrected tree: frozen Bun install, TypeScript typecheck, 286 tests across 87 files, demo build, npm audit (zero vulnerabilities). Hosted results must be checked against the final commit; earlier results do not certify later changes.

## PR 424

Corrected bun.lock in addition to the existing npm lockfile fix. Hosted CI and demo-smoke passed at 510ca02aaeff46df1bc8161a0831d4219f4b96be. This PR targets the lifecycle-reconciliation branch, not main. The connector's synchronous merge endpoint refuses stacked PRs; auto-merge is disabled. No merge success is claimed.

## Live pairing

Swarm Hub Control is the administrative control plane, not the Swarm host. Its published URL does not supply /swarm-home/events. The playable executable uses synthetic Atlas authority and an in-memory journal; its default work handler refuses unsupported work. Passing its smoke test is not production federation evidence.

A production host, durable adapters, explicit work-kind admission and deployment-managed token pairing remain required. No token was created or printed, and no production authority was inferred from endpoint reachability.
