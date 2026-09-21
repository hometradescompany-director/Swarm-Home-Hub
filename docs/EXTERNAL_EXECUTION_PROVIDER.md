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
