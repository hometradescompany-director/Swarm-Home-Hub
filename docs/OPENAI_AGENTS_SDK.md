# OpenAI Agents SDK bridge

Date: 2026-09-21

This integration connects OpenAI's current Agents SDK to the existing Swarm Home
platform door without creating another residence engine, authority service or
truth store.

OpenAI's earlier `openai/swarm` repository is treated as historical lineage
only. Its own README describes that project as experimental/educational and
directs production users to the Agents SDK.

Primary references observed for this slice:

- https://openai.github.io/openai-agents-js/
- https://openai.github.io/openai-agents-js/guides/tools/
- https://openai.github.io/openai-agents-js/guides/handoffs/
- https://openai.github.io/openai-agents-js/guides/mcp/
- https://github.com/openai/swarm

## Architecture decision

```
OpenAI Agents SDK
  Agent / Runner / session
  function tools / MCP / handoffs / traces
            |
            | transport adapter only
            v
OpenAI Agents adapter
            |
            v
SwarmHomeToolRouter
            |
            v
SwarmHomeDoor
            |
  residence lifecycle + projections
            |
     +------+------+
     |             |
     v             v
event journal   Atlas contracts
                identity / authority / events
```

The adapter owns no state.

### What owns what

| Concern | Canonical owner |
| --- | --- |
| Agent runtime loop | OpenAI Agents SDK host |
| Residence lifecycle | Swarm Home Hub |
| Habitat capacity | Swarm Home Hub |
| Rest/readiness | Swarm Home Hub |
| Ready-handoff capsule | Swarm Home Hub |
| Global identity mapping | Atlas |
| Residence authority decision | Atlas |
| Provider trace/event observations | provider evidence until ingested by Atlas |
| SDK-visible tool alias | adapter only, never canonical identity |

## Function-tool surface

`src/integrations/openai/agents-sdk.ts` converts the existing
`swarmHomeToolManifest` into Agents SDK-compatible function-tool definitions.

The SDK sees underscore aliases such as:

```
swarm_home_inspect
swarm_home_recover
swarm_home_heartbeat
swarm_home_handoff
```

The adapter translates those calls back to the canonical dotted names before
invoking `SwarmHomeToolRouter`.

No domain logic is copied into the adapter.

### Mutation boundary

Default exposure is **read only**.

That means an Agents SDK host receives only:

- `swarm.home.inspect`
- `swarm.home.recover`
- `swarm.home.heartbeat`
- `swarm.home.handoff`

A host must deliberately request `{ exposure: "all" }` before the adapter
will expose state-mutating residence tools.

This does not replace authorization. Atlas authority and Swarm habitat/lifecycle
policy still decide whether a requested state transition is lawful.

## Agents SDK host example

The repository does not add `@openai/agents` as a runtime dependency. This
keeps the integration at the edge and avoids making one provider part of Swarm
Home's domain core.

A host that already uses the Agents SDK can wire the adapter like this:

```ts
import { Agent, tool } from "@openai/agents";
import {
  createOpenAIAgentsTools,
  type OpenAIAgentsToolFactoryOptions
} from "@endless-technologies/swarm-home-hub";

const tools = createOpenAIAgentsTools(
  router,
  (options: OpenAIAgentsToolFactoryOptions) => tool(options)
);

const residentAgent = new Agent({
  name: "Swarm resident",
  instructions: "Inspect current Swarm Home state before making claims.",
  tools: [...tools]
});
```

The current Agents SDK documentation explicitly supports raw JSON Schema
objects for function-tool `parameters`, which lets Swarm reuse its canonical
manifest instead of maintaining a second schema.

## Handoff semantics

An OpenAI Agents SDK handoff and a Swarm Home handoff are related but not
identical.

**Agents SDK handoff:** runtime control moves to another agent.

**Swarm Home handoff:** the current resident mints a bounded capsule proving its
current ready state and permitted context references.

Use `prepareOpenAIAgentsHandoff()` from an SDK `onHandoff` callback before
the transfer is allowed to proceed.

Conceptually:

```
source agent
   |
   | wants SDK handoff
   v
prepareOpenAIAgentsHandoff()
   |
   | swarm.home.handoff
   v
current-ready capsule
   |
   | application attaches/records bounded context
   v
Agents SDK transfers control
```

A successful SDK handoff **does not imply `swarm.home.depart`**.

Departure remains a separate terminal Swarm transition.

## MCP

The existing platform door remains deliberately transport-neutral:

```
OpenAI / MCP / CLI / HTTP
          |
  SwarmHomeToolRouter
```

OpenAI's current Agents SDK can consume MCP servers directly, but this slice
does not create a second MCP-specific state machine. A future MCP transport may
project the same canonical manifest and invoke the same router.

## Tracing and Atlas

OpenAI tracing is provider/runtime evidence, not canonical Atlas truth.

A later trace bridge may ingest bounded observations such as:

- agent run began/completed;
- function tool invoked;
- SDK handoff requested/completed;
- guardrail blocked an action;
- provider trace/run identifiers.

Before adding event names, Atlas must first reconcile them against its existing
AI-agent and gateway event vocabulary. Provider trace IDs remain provenance
references and never grant authority.

## Non-claims

This slice does **not** claim:

- access to any private OpenAI internal swarm infrastructure;
- that OpenAI agents acquire Atlas authority by existing;
- that an SDK handoff changes Swarm residence state;
- that provider traces are canonical truth;
- that the retired OpenAI Swarm runtime is a production dependency;
- that an external provider can bypass Atlas or Swarm policy.
