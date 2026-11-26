# Host reachability and verification

This is a read-only preflight over the existing Swarm transport, not a new server or a completed deployment receipt.

After a real HTTPS Swarm host exists, run:

`bun scripts/verify-host.mjs <public-https-events-url>`

Supply its actual `/swarm-home/events` address. No token argument is supported. The tool sends only unauthenticated GET health and OPTIONS events, never POST. Redirects are not followed. The health body must identify the existing Swarm web transport; a generic 200 is insufficient. OPTIONS 404 is informational: the existing transport only routes POST events. The exit code is 0 for passing health, 1 for failed health and 2 for invalid input. Exit 0 does not certify admission, persistence or production readiness. Use only a trusted operator-known hostname; public-looking DNS is not an SSRF defence and this CLI must not become an internet-facing probe service.

## Existing entry points and owners

- `scripts/play.mjs` serves the existing web transport, with loopback-first binding, synthetic Atlas authority, in-memory persistence and a refusing work handler. Do not expose it as a production host.
- `src/platform/web-transport.ts` already owns GET `/swarm-home/health` and POST `/swarm-home/events`.
- `src/platform/atlas-federation-transport.ts` already authenticates ingress with `SWARM_ATLAS_INGRESS_TOKEN` and delegates policy to `SwarmWorkHandoffHandler`.
- `src/integrations/atlas/work-result.ts` owns `swarm.work.result` delivery to Atlas `/api/public/v1/events`. Do not duplicate this in Control.
- Extend existing persistence and pairing work (#421/#458, #436/#461); PR #503 is compiled Linux loopback proof, not durable/live federation evidence.

## Gates before recording a verified host

1. Actual deployed health returns 200 with the Swarm transport identity.
2. Missing authentication returns 401 or unconfigured 503; wrong credentials return 401. Run these POST tests only in the authorised host verification environment, not Control's read-only check.
3. An authenticated non-sensitive handoff receives 202 only after durable admission/refusal; its journal record survives restart. Tenant/instance binding, explicit work-kind policy and fail-closed limits must be enforced first.
4. Replay returns the original outcome without repeated execution.
5. The existing reporter delivers a correlated `swarm.work.result`, accepted by Atlas; durable retry/recovery is proved.
6. Old credentials fail after revocation or the applicable rotation grace period.

Steps 2–6 remain pending in the CLI. A manually typed “durable” flag or a healthy URL is not evidence. Keep credential values in deployment secret stores and omit them from test output, logs and receipts. Install ingress as `SWARM_ATLAS_INGRESS_TOKEN` on Swarm and `SWARM_HANDOFF_TOKEN` on Atlas; Atlas uses `SWARM_HANDOFF_URL`. The return path uses a separate Atlas-issued token.

Register the real events address in Swarm Hub Control only after deployment. Its Run check remains GET/OPTIONS-only and reports configured/verification pending; the host-side six-gate evidence is separate.

## Implementation observation — 25 November 2026

Requested by Jarrod Cobb; implemented by Lovable. Inspected main archive f7a0b8e and the open related PRs. No deployed HTTPS host, durable work adapter or tenant-bound admitted work handler was found in main. No new runtime was enabled, no token was issued, no live verification was claimed. The first new test run failed to import the not-yet-created preflight module (no executed assertions); record subsequent successful tests separately, not as proof of a live host.

Validation: 6 new tests passed; 28 focused contract/residence tests passed; full run 305 assertions passed across 90 files, but the browser-workbench suite could not load the missing Playwright package. Full typecheck is blocked by the same pre-existing dependency (and a consequent implicit-any parameter); focused strict typecheck passed. The helper browser bundle succeeded. Invalid CLI input returned exit 2. No live host test was possible.
