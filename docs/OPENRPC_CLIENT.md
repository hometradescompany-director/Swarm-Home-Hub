# OpenRPC / JSON-RPC peer client profile

Swarm Home can inspect and call an external JSON-RPC service described by
OpenRPC without importing that service's runtime, event bus or state engine.

## Ownership

The client owns:
- endpoint framing;
- JSON-RPC request/response correlation;
- response-size bounds;
- an optional remote-method allowlist.

It does not own:
- the peer's state;
- the peer's event history;
- the peer's authority model;
- the peer's identities;
- the peer's OpenRPC document as local truth.

## Discovery

The client uses the OpenRPC reserved \`rpc.discover\` method.

The returned document is treated as **remote source evidence** describing the
peer's API surface. It does not automatically authorize any method call.

## Calls

Hosts may provide an explicit method allowlist. This is the expected production
shape when connecting to deterministic external runtimes such as the
\`division-sh/swarm\` reference found during the refinery pass.

Remote JSON-RPC errors remain attributable remote refusals/errors. They are not
converted into local Atlas authority decisions.

## Network boundary

HTTPS is required for non-loopback endpoints. Loopback HTTP is permitted for
local development.

This adapter is intentionally client-side only. Swarm Home does not expose a
second JSON-RPC control plane through this slice.
