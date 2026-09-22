# External execution-provider envelope

This contract lets Swarm Home hand bounded work to an external execution
runtime without importing that runtime's task system, worker fleet, memory,
schedule engine or identity store.

## Contract

Request: \`SwarmHomeExternalExecutionRequest/v1\`

A request carries:
- request ref;
- provider ref;
- capability ref;
- opaque instruction ref;
- opaque artifact refs;
- evidence receipt refs;
- the existing \`SwarmHomeExternalHandoff/v1\`;
- request and expiry timestamps.

The request cannot outlive the handoff that justified it.

Result: \`SwarmHomeExternalExecutionResult/v1\`

A result carries:
- request/provider/capability refs;
- authority ref;
- opaque provider execution ref;
- bounded status;
- opaque result refs;
- evidence receipt refs;
- observation time;
- optional summary message.

It deliberately does not copy the provider's task row, queue state, worker
record, schedule, memory, conversation history or internal event stream.

## Authority

Execution requires a host-supplied authoritative decision before the provider
is called.

The execution-provider contract does not implement or own permission policy.
It only refuses to call the provider unless the supplied decision says the
bounded request is allowed.

Connectivity, provider capability, residence readiness and evidence do not
themselves grant execution authority.

## Provider boundary

A provider implements one method:

\`execute(request) -> ExternalExecutionProviderOutcome\`

The provider retains canonical ownership of its internal execution state.

Swarm Home receives only opaque refs and attributable evidence/result standing.

This makes large external runtimes such as agent-swarm usable as capability
providers without turning Swarm Home into a mirror of their architecture.


## Compute-topology placement proof

Swarm Home may project a bounded placement decision over fresh external provider observations before creating an execution request.

The projection is deliberately **not** a GPU scheduler or remote task store. It evaluates provider capability, accelerator class, observed available memory, queue depth, estimated start latency, estimated cost, and artifact locality while retaining source evidence refs and observation/freshness times.

The first proof uses deterministic ordering:

1. reject stale, future-dated, capability-mismatched or resource-ineligible observations;
2. prefer fewer non-local artifacts;
3. then lower estimated start latency;
4. then lower queue depth;
5. then lower estimated cost;
6. finally stable provider identity as the deterministic tie-breaker.

A selected provider ref can then feed the existing `SwarmHomeExternalExecutionRequest/v1` boundary, where authority remains separately required before execution.

GPU is therefore one accelerator class inside capability topology, not a new source of truth or a parallel execution system.
