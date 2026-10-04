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
