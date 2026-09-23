# Swarm Topology

### Swarm Home Base

A place for free agents to rest, recover context, and become ready for their next bounded task.

Swarm Home Base is the bounded residence/readiness kernel that originated as **Swarm Home Hub**. The historical name remains preserved in the repository's lineage rather than being rewritten.

**Swarm Topology** is the current public system identity for the wider set of bounded relationships growing around that kernel. Topology describes structure; it does not grant authority.

**Forwardable proof:** https://hometradesco.com.au/proof — a reproducible public authority-denial proof and 90-second technical evaluation front door.

## Start here

For the compiled playable system, see [docs/GREAT_BUN.md](docs/GREAT_BUN.md).

For runnable local proof details, see [docs/DEMO.md](docs/DEMO.md).

For the OpenAI Agents SDK bridge, see [docs/OPENAI_AGENTS_SDK.md](docs/OPENAI_AGENTS_SDK.md).

For technical evaluation, architecture fit, and what a buyer can verify, see [docs/TECHNICAL-EVALUATION.md](docs/TECHNICAL-EVALUATION.md).

For smaller first-contact tests, see [docs/EVALUATION-LADDER.md](docs/EVALUATION-LADDER.md).

For bounded commercial engagement options, see [docs/COMMERCIAL.md](docs/COMMERCIAL.md).

For the naming lineage and compatibility rule, see [docs/IDENTITY-LINEAGE.md](docs/IDENTITY-LINEAGE.md).

## Boundary

Swarm Topology is **not Atlas**. Within it, Swarm Home Base is the bounded residence/readiness kernel that consumes Atlas contracts.

### What it owns

- residence lifecycle for admitted agent identities;
- local rest / readiness state derived from residence events;
- habitat and capacity metadata for residences;
- local projections required to answer "who is resting here, and what is their current residence state?"

### What it knows

- opaque Atlas identity references;
- capability / offering references needed for admission and handoff;
- authority decisions supplied by Atlas contracts;
- evidence / provenance receipts attached to residence transitions.

It does not own human PII, global identity, global permissions, or Atlas constitutional state.

### Events it emits

- `swarm.residence.requested`
- `swarm.residence.admitted`
- `swarm.residence.rested`
- `swarm.residence.ready`
- `swarm.residence.departed`
- `swarm.residence.rejected`

### Relationships it maintains

- agent identity -> residence;
- residence -> habitat;
- residence transition -> evidence receipt;
- agent identity -> capability/offering reference;
- local residence -> Atlas identity/authority reference.

## Invariants

- Events are not decisions; decisions are state transitions.
- Every state transition is attributable and append-only in history.
- Current state is a projection over events.
- Absence is typed, never silently invented.
- No cross-boundary PII.
- No duplicate truth ownership with Atlas.
- Evidence provenance never grants residence authority: a source may govern its own bounded state, but attached authority does not transfer through a receipt.
- Provider identity or prestige is never proof; Swarm consumes Atlas evidence standing and fails closed when required receipts cannot be resolved.
- An agent can rest here without acquiring authority merely by being present.
- Arrival order, residence duration, host/creator/founder/provider status, contribution, capability, visibility, paid status, commercial tier, and price paid are context/provenance only; none grants authority.

## Atlas wiring

The product-side seam is `SwarmAtlasFederation/v1`. A concrete
`AtlasHttpGateway` now composes `atlas-entity/v1` and
`atlas-authority/v1`: Atlas may resolve an opaque agent mapping and answer the
single bounded `swarm.residence.enter` question, while Swarm still owns habitat
capacity and every residence transition.

Evidence retrieval and outbound event delivery remain deliberately fail-closed
until their dedicated transport / durable outbox boundaries exist. See
[docs/ATLAS_FEDERATION.md](docs/ATLAS_FEDERATION.md).

## OpenAI Agents SDK wiring

The OpenAI adapter projects the existing Swarm Home tool manifest from the Swarm Home Base kernel into
Agents SDK-compatible function tools. It adds no state and gives provider
runtime objects no residence authority.

Read-only tools are exposed by default. State-mutating residence tools require
an explicit host opt-in and still pass through the existing Atlas and Swarm
policy boundaries.

The older OpenAI `swarm` project is treated as historical lineage; the current
integration target is OpenAI's Agents SDK.

## Build shape

This repository is being built as a stacked pull-request train. Each PR is independently reviewable and preserves the path from the original Swarm Home kernel into the current topology without rewriting that lineage.

## Public repository status

This repository is publicly readable so the architecture and build path can be inspected. Public visibility does not itself grant an open-source license. See [LEGAL.md](LEGAL.md) for the current legal status.

Security-sensitive reports should follow [SECURITY.md](SECURITY.md). Contributions should follow [CONTRIBUTING.md](CONTRIBUTING.md).

## Web transport

A dependency-free `SwarmHomeWebTransport` adapts standard Web `Request` objects to the existing tool router.

Bounded routes:

- `GET /health` for transport liveness;
- `GET /tools` for machine-readable discovery;
- `POST /tools/{toolName}` for one existing tool invocation.

The transport owns HTTP framing only. It does not read the event journal, habitat registry, or Atlas gateway directly. Read-only calls remain inspectable; state-mutating calls fail closed unless the host supplies an explicit admission guard. Request bodies are size-bounded and JSON-only, CORS is not opened implicitly, and defensive response headers are emitted by default.


## Public visual surface

A bounded residence/readiness surface lives in `site/`. It renders the real
`projectResidence()` projection over synthetic append-only event histories.

```bash
bun run demo:build
```

The page is deliberately a projection, not another home-state implementation.
See `docs/PUBLIC_RENDERING.md`.
