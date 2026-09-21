# A2A Agent Card discovery profile

Swarm Home exposes a bounded Agent Card compatible with the current A2A 1.0
discovery model.

## Scope

This slice implements **discovery only**.

It projects the existing Swarm Home tool manifest into A2A skills and serves the
card at the well-known discovery path:

\`/.well-known/agent-card.json\`

It does not implement:
- message/send;
- A2A task state;
- task polling;
- streaming;
- push notifications;
- extended Agent Cards;
- A2A-owned memory or session state.

## Ownership

The Agent Card owns no truth. It is a projection over the canonical Swarm Home
tool manifest.

Read-only Swarm Home capabilities are advertised by default. State-mutating
skills require explicit host exposure and still gain no authority merely by
being advertised.

## Protocol posture

- A2A protocol version: \`1.0\`
- preferred protocol binding: \`JSONRPC\`
- production HTTP endpoints must use HTTPS;
- loopback HTTP remains available for local development;
- unsupported optional capabilities are omitted rather than claimed.

A2A discovery is a transport edge. It is not
\`SwarmHomeFederation/v1\` and does not establish residence, identity,
permission, or remote mutation rights.
