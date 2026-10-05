# External Swarm Refinery — 2026-09-22

Status: reconnaissance and convergence record. No upstream source imported.

## Governing distinction

External "swarm" projects are not automatically Swarm Home federation peers.

- **Transport peer:** speaks MCP, A2A, OpenRPC/JSON-RPC, OpenAPI/HTTP or another protocol to the existing Swarm Home door.
- **Capability provider:** performs bounded work behind an adapter and retains ownership of its own runtime/task/memory state.
- **Reference implementation:** contributes patterns, tests and failure cases without becoming a runtime dependency.
- **Federation peer:** separately implements the SwarmHomeFederation/v1 home-to-home contract.

SwarmHomeToolRouter remains transport-neutral. SwarmHomeDoor remains the only platform door into residence semantics. Atlas remains the owner of global identity, authority and constitutional evidence.

## Inspected upstreams

### division-sh/swarm
Commit: a53e5580f5c1613c195ebf936b304e8764ea7f09
License: Apache-2.0
Posture: protocol peer + deterministic-runtime reference.

Observed: MCP client/gateway, generated OpenRPC 1.2.6, JSON-RPC 2.0 HTTP, WebSocket subscriptions, deterministic state machine, event/mutation history, replay/fork, human mailbox, bounded routing authority.

Refinery value: OpenRPC publication, conformance, deterministic routing, replay/fork receipts, model/state-authority separation.

Do not import its store, event bus or authority model into Swarm Home.

### kyegomez/swarms
Commit: 3009364a7e44dc3e55fec238b56b3a4fa6949a05
License: Apache-2.0
Posture: capability framework + MCP interoperability reference.

Observed: agents consume multiple MCP servers; MCPDeployer exposes agents/workflows/swarms over streamable HTTP, SSE or stdio; auth hooks; many handoff/orchestration topologies.

Refinery value: prove arbitrary external agents/workflows can appear as authenticated MCP tools.

Do not adopt the broad orchestration framework as Swarm Home's runtime.

### VRSEN/agency-swarm
Commit: ed5a0ebff75a4168d92958db54a1edeeb3974d7a
License: MIT
Posture: OpenAI Agents SDK / handoff / MCP lifecycle reference.

Observed: directional communication flows, send_message/handoff semantics, persistent MCP server manager, loop-affine MCP proxies, hosted MCP OAuth, OpenAPI-to-tool conversion, callback-driven thread persistence.

Refinery value: strengthen Swarm Home's existing OpenAI Agents SDK seam and MCP lifecycle tests without importing Agency Swarm ownership.

### langchain-ai/langgraph-swarm-py
Commit: 5442a15cdd0ed210589148900c9960c24c489d04
License: MIT
Posture: handoff/state projection reference.

Observed: dynamic agent handoffs, active_agent continuity, checkpointer state, optional long-term store, custom parent/child state projection, full history passed by default unless customized.

Refinery value: falsification fixture for what should and should not cross a handoff boundary.

Do not copy its graph state/memory model into Swarm Home.

### swarmclawai/swarmclaw
Commit: ed38ba5329c20e48c03b4a4028f4a76a1a75e2d1
License: MIT
Posture: protocol peer.

Observed: MCP client/pool/conformance/gateway, A2A v0.3 Agent Card, authenticated inbound A2A, A2A discovery/client, JSON-RPC 2.0 router, task/run handoff packets, gateway topology.

Refinery value: strongest candidate for an A2A transport adapter at the Swarm Home platform edge.

Do not import SwarmClaw memory, gateway state or task truth.

### desplega-ai/agent-swarm
Commit: 65e0ab6bb1f50f796b9c226e2bb34b5041cbaa66
License: MIT
Posture: external execution/capability provider.

Observed: large MCP surface, capability-gated tools, task pool, deferred tasks, schedules, workflows, review gates, isolated workers, persistent memory/identity, OpenAPI, in-process MCP bridge with allowlist, Codex app-server JSON-RPC, multiple harnesses.

Refinery value: bounded execution substrate behind MCP/API while Swarm Home/Atlas retain residence, identity, authority and provenance ownership.

Do not copy its task, memory, identity, schedule or worker state into Swarm Home.

## Protocol conclusion

No separate protocol named RCP was established in these six repositories.

The concrete interoperability family is:
- MCP
- OpenRPC
- JSON-RPC 2.0
- A2A over JSON-RPC
- OpenAPI/HTTP
- framework-native handoff/state APIs

## Build order earned by this pass

### Phase A: protocol conformance
1. MCP adapter/conformance fixtures around the existing SwarmHomeToolRouter.
2. A2A compatibility profile and bounded Agent Card projection.
3. OpenRPC client profile for external deterministic runtimes.
4. Cross-framework handoff fixtures.

### Phase B: capability-provider federation
5. Define a bounded external execution-provider envelope.
6. Return opaque result/evidence refs without copying remote task state.
7. Require Atlas authority when external provider action crosses an existing permission boundary.

### Phase C: only after evidence
8. Decide whether any external runtime also qualifies as a real SwarmHomeFederation/v1 peer. **Implemented as an evidence gate in `src/policy/federation-peer-qualification.ts`; none of the six inspected upstreams is promoted by the current evidence.**
9. Never import a state engine merely because two systems use the word "swarm".

See `docs/EXTERNAL_FEDERATION_QUALIFICATION.md` for the current typed qualification decision and the evidence required to change it.

## Non-claims

This pass does not:
- endorse an upstream framework as canonical;
- import upstream source code;
- create a new registry;
- add runtime authority;
- create a second task, memory, identity or event truth store;
- claim protocol compatibility that has not yet been executed;
- treat MCP/A2A/OpenRPC connectivity as federation authority.


## Watch harvest — 2026-09-23

The six-upstream watcher produced two changes worth promoting into Swarm Home invariants.

### kyegomez/swarms

Source commits:

- `c43388cf89e00cc9beecf717c8e3eab2bfe636c0` — concurrent results now preserve declared agent order rather than provider completion latency.
- `04c8e97ded472df37a750864f57d4d4134ccf6a8` — self-consistency samples receive independent mutable agent state.
- `5ca698fdecec2228b9bd0646baecae08881b09d4` — round-robin handoff records an agent answer rather than confusing it with the whole transcript.

Harvested invariant:

> Physical completion order, semantic order, result identity, transcript identity and mutable-state ownership are distinct facts.

Implemented in `src/refinery/concurrency-semantics.ts` as a projection/validation layer only. It does not create a scheduler or copy upstream state.

### desplega-ai/agent-swarm

Source commit:

- `e4d9c6a1fa8f79dcbd3580c147ba4f519e82996d` — authenticated agents may create inert extension drafts while activation/version selection stays separately privileged and the active runtime loads a selected immutable version.

Harvested invariant:

> Creation authority is not execution authority. Creator, owner and runtime identity remain separate relationships. A draft is inert until explicit activation evidence exists.

Implemented in `src/policy/external-capability-lifecycle.ts` as an evidence gate before an external capability can approach the existing execution-provider boundary. Provider-local activation evidence never replaces the later Atlas execution-authority decision.

### division-sh/swarm adapter profile

A source-near profile now records the observed Division interoperability surface without claiming a live connection:

- MCP gateway at the observed `/mcp` boundary;
- generated OpenRPC / JSON-RPC surface at `/v1/rpc`;
- observed methods including `health.check`, `event.publish`, `event.subscribe`, `run.start`, `run.get`, `run.fork`, and `run.subscribe_trace`.

The profile lives at `src/integrations/external-swarms/division-sh.ts`. It is interoperability evidence and adapter configuration, not federation qualification, remote authority, credentials, or imported runtime state.

## System Architect gate for the harvest

- **Owns:** no new truth domain.
- **Knows:** declared semantic order, observed completion order, branch-state identity, provider-local capability lifecycle evidence and source-near protocol evidence.
- **Emits:** no new domain events in this slice.
- **Relationships:** external provider/capability/protocol evidence remains related by opaque refs to existing Swarm Home execution and provenance boundaries.

No upstream source code is copied into Swarm Home by this harvest.


## Watch harvest — 2026-09-24

The next watcher delta sharpened four interoperability boundaries. These are
harvested as local projections/gates only; no upstream scheduler, task store,
identity store, lease table or idempotency database is imported.

### Principal is not worker

Source commit:

- `desplega-ai/agent-swarm@8701ab38b336074e350d12c2012efeda1f8fa8ba` — extension identities remain authenticated API principals while being excluded from worker listing, assignment, claim, polling and scheduling paths.

Harvested invariant:

> Authentication identity and execution eligibility are separate facts.

Implemented in `src/policy/external-principal-execution.ts`. An observed
`principal_only` identity is never schedulable merely because it can call an
API. Unknown worker posture also fails closed. This does not create a local
identity registry or replace Atlas identity/authority.

### Storage status is not semantic state

Source commit:

- `desplega-ai/agent-swarm@3f6726fc2cca89bca5692779125d917fcfcda08c` — a deferred task may be persisted as `completed` while semantically waiting for a wake-up, with `deferredAt` distinguishing the parked state.

Harvested invariant:

> A provider's storage enum is evidence, not automatically the semantic state Swarm Home should project.

Implemented in `src/refinery/external-semantic-state.ts`. The raw provider
status is preserved while an evidence-backed semantic standing is derived.
A provider row that is storage-level `completed` with deferral evidence
projects as `waiting`, not `done`.

### Recovery is not authority

Source commit:

- `desplega-ai/agent-swarm@bf12ab53e70ec8eff1eaa24ccd1ae6686ae38304` — heartbeat recovery now avoids runs with live graph walks, while explicitly documenting that the ownership guard is process-local rather than a distributed lease.

Harvested invariant:

> Local liveness evidence may suppress local recovery; absence of a local owner does not mint distributed exclusivity or mutation authority.

The existing Swarm Home recovery-authority boundary already separates recovery
intent from authority. `src/observability/recovery-ownership.ts` now adds the
missing ownership-scope projection so process-local guards cannot be
misrepresented as cross-process leases.

### Observed completion is not durable replay-safe success

Source commit:

- `division-sh/swarm@4a742790eff98b575f6dc1cead0c1e30788868b4` — post-activation cleanup failure can retain stored-success semantics only when activation was acknowledged and the operation has a normalized non-empty idempotency key; healthy keyless calls remain valid but do not create stored keyed completion.

Harvested invariant:

> Durable replay-safe success requires an explicit acknowledgement boundary plus stable keying; a healthy keyless success may remain an observed success without gaining replay authority.

The existing external execution envelope now preserves an optional normalized
`idempotencyKey`. `src/integrations/execution-provider/durable-standing.ts`
projects `observed_success_only`, `replayable_success`, or `incomplete`
without creating a local completion store. A post-commit fault cannot retain
success standing unless the keyed acknowledgement evidence is complete.

## 2026-09-24 System Architect gate

- **Owns:** no new mutable truth domain.
- **Knows:** external principal posture, provider storage status plus deferral evidence, recovery ownership scope, and durable acknowledgement/idempotency evidence.
- **Emits:** no new domain events in this slice.
- **Relationships:** opaque external identity/task/workflow/execution refs attach to the existing execution-provider, recovery, provenance and refinery boundaries.

The existing rule remains governing: connectivity, authentication, freshness,
completion status and recovery candidacy do not independently create authority.
