# External provider adapters

The external execution-provider contract can now be backed by either:

- one allowlisted MCP tool; or
- one allowlisted OpenRPC / JSON-RPC method.

These adapters are translators, not task systems.

## MCP

\`SwarmHomeMcpClient\` owns outbound stateless MCP request framing, response
bounds, HTTPS enforcement and an optional tool allowlist.

\`McpExternalExecutionProvider\` translates one
\`ExternalExecutionRequest\` into one host-defined MCP tool argument shape.

## OpenRPC

\`OpenRpcExternalExecutionProvider\` uses the existing bounded OpenRPC client and
one configured method.

## Codecs

Provider-specific request/result shapes are supplied through a codec:

- \`encodeRequest(request)\`
- \`decodeOutcome(value, request)\`

This keeps vendor/runtime schemas outside the canonical Swarm execution
envelope.

## Invariants

Adapters do not:
- create provider task state locally;
- copy worker or queue state;
- invent authority;
- bypass the upstream execution authorizer;
- call arbitrary remote methods/tools when an allowlist is configured.

A remote refusal remains a bounded provider refusal. It does not become an
Atlas authority decision.
