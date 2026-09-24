# Swarm Home Hub Architecture Map

This is a **projection over the existing public implementation**, not a new source of truth.

Its purpose is to let a reviewer see the system boundary, canonical ownership, Atlas seam, execution-provider path, and evidence flow without reconstructing them from multiple documents.

## Projection boundary

- **What does this map own?** Nothing. It owns no state, policy, identity, event, or authority.
- **What does it know?** Only the public contracts, services, adapters, projections, and documented typed absences already present in this repository.
- **What events does it emit?** None.
- **What relationships does it maintain?** None. It visualises relationships already implemented elsewhere.

If this map conflicts with executable code or a canonical contract, the executable boundary wins and the map should be corrected.

## One-page map

```mermaid
flowchart TD
    U["External human / agent / host"]

    subgraph ADAPTERS["Transport and runtime adapters<br/>(projection only, never truth owners)"]
      OA["OpenAI Agents SDK adapter"]
      MCP["MCP adapter"]
      A2A["A2A discovery / agent card"]
      RPC["OpenRPC / HTTP / CLI host"]
    end

    U --> OA
    U --> MCP
    U --> A2A
    U --> RPC

    OA --> R
    MCP --> R
    A2A --> R
    RPC --> R

    subgraph DOOR["Swarm public door"]
      R["SwarmHomeToolRouter<br/>canonical tool manifest"]
      D["SwarmHomeDoor"]
      R --> D
    end

    subgraph SWARM["Swarm Home Hub<br/>canonical local ownership"]
      S["Lifecycle services + policy<br/>request / admit / rest / ready / depart / reject"]
      J["Append-only residence event journal"]
      H["Habitat registry + capacity"]
      P["Residence / readiness / timeline projections"]
      RH["Bounded ready-handoff capsule"]

      S --> J
      S --> H
      J --> P
      H --> P
      S --> RH
    end

    D --> S
    P --> D
    RH --> D

    subgraph ATLAS["Atlas boundary<br/>global orchestration / identity / authority"]
      F["SwarmAtlasFederation/v1<br/>AtlasHttpGateway"]
      ID["atlas-entity/v1<br/>opaque identity mapping"]
      AU["atlas-authority/v1<br/>swarm.residence.enter decision"]
      F --> ID
      F --> AU
    end

    S -->|"admission asks, never delegates local lifecycle ownership"| F
    AU -->|"positive authority decision is necessary,<br/>but is not itself admission"| S

    subgraph EXEC["Bounded external execution path"]
      OBS["Fresh provider observations"]
      PL["Compute-topology placement projection"]
      ER["SwarmHomeExternalExecutionRequest/v1"]
      AUTH["Explicit authoritative decision<br/>(host supplied)"]
      EP["External execution-provider adapter"]
      EXT["External provider/runtime<br/>owns its internal execution state"]
      RES["SwarmHomeExternalExecutionResult/v1"]
      REC["Source-record provenance receipt"]

      OBS --> PL
      PL --> ER
      RH --> ER
      ER --> AUTH
      AUTH -->|"allow"| EP
      AUTH -.->|"deny: provider is not called"| ER
      EP --> EXT
      EXT --> RES
      RES --> REC
    end

    D -->|"bounded handoff / execution request"| EXEC
    REC -->|"opaque refs + attributable evidence only"| D

    X1["Typed absence:<br/>Atlas evidence retrieval is fail-closed<br/>until a dedicated seam exists"]
    X2["Typed absence:<br/>outbound Atlas event delivery requires<br/>a durable outbox / retry boundary"]

    F -.-> X1
    J -.-> X2
```

## What the map is saying

### 1. Adapters are not the system

OpenAI Agents SDK, MCP, A2A, OpenRPC, HTTP, and CLI surfaces project the same bounded tool semantics inward.

They do not get their own residence state machine, authority database, or canonical identity.

### 2. Swarm owns one narrow domain

Swarm Home Hub owns:

- residence lifecycle for admitted agent identities;
- habitat and capacity state;
- local rest/readiness projection;
- bounded ready-handoff state;
- the attributable event path supporting those projections.

Current state is derived from events. The event path is not rewritten to make the current snapshot look cleaner.

### 3. Atlas remains outside the product boundary

Swarm is **not Atlas**.

The current federation seam lets Atlas resolve an opaque agent identity and answer the bounded `swarm.residence.enter` authority question.

A positive Atlas decision does not become admission by itself. Swarm still applies local habitat capacity and lifecycle policy.

The wider Atlas spine remains:

**Identity · Events · Relationships · Evidence · Stewardship**

Swarm consumes bounded contracts from that spine rather than duplicating it.

### 4. External execution remains externally owned

The execution-provider path can select from fresh provider observations, create a bounded request, require explicit authority, call a provider, and preserve the observed result as provenance.

It does **not** import the provider's task database, queue, worker fleet, memory, schedule engine, conversation history, or internal event stream.

The provider remains canonical for its own execution state.

### 5. Evidence never becomes permission by proximity

A provider result, trace, receipt, capability, price paid, runtime identity, or successful connection is not authority.

The system preserves evidence so later reasoning can inspect what happened. Authority remains an explicit decision boundary.

## Reviewer path

If you have five minutes:

1. Read this map.
2. Read [TECHNICAL-EVALUATION.md](TECHNICAL-EVALUATION.md).
3. Run the proof in [DEMO.md](DEMO.md).
4. Inspect [PLATFORM_DOOR.md](PLATFORM_DOOR.md) and [ATLAS_FEDERATION.md](ATLAS_FEDERATION.md).
5. For bounded external execution, read [END_TO_END_EXECUTION_PROOF.md](END_TO_END_EXECUTION_PROOF.md) and [EXTERNAL_EXECUTION_PROVIDER.md](EXTERNAL_EXECUTION_PROVIDER.md).

The goal is not to make the architecture look large.

The goal is to make **ownership, authority, event flow, and typed absence visible enough that a stranger does not need to become an archaeologist first**.
