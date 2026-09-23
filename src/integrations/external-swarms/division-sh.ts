import type { ProtocolEvidence } from "../../refinery/protocol-fingerprint.js";

export const DIVISION_SWARM_REPOSITORY =
  "https://github.com/division-sh/swarm" as const;

export const DIVISION_SWARM_OPENRPC_PATH = "/v1/rpc" as const;
export const DIVISION_SWARM_MCP_PATH = "/mcp" as const;

export const DIVISION_SWARM_OBSERVED_METHODS = Object.freeze([
  "health.check",
  "event.publish",
  "event.subscribe",
  "run.start",
  "run.get",
  "run.fork",
  "run.subscribe_trace"
] as const);

export const DIVISION_SWARM_PROTOCOL_EVIDENCE: readonly ProtocolEvidence[] =
  Object.freeze([
    {
      family: "mcp",
      version: "2026-observed",
      evidenceRef:
        "github:division-sh/swarm:internal/runtime/mcp/gateway.go"
    },
    {
      family: "openrpc",
      version: "1.2.6-observed",
      evidenceRef: "github:division-sh/swarm:openrpc.json"
    },
    {
      family: "jsonrpc",
      version: "2.0",
      evidenceRef: "github:division-sh/swarm:/v1/rpc"
    }
  ]);

/**
 * This profile is source-near interoperability evidence only.
 * It does not assert a live endpoint, credentials, federation standing,
 * execution authority, or that every observed upstream method is enabled.
 */
export function divisionSwarmAdapterProfile() {
  return Object.freeze({
    upstreamRef: "repo:division-sh/swarm",
    repository: DIVISION_SWARM_REPOSITORY,
    protocols: DIVISION_SWARM_PROTOCOL_EVIDENCE,
    endpoints: Object.freeze({
      openrpc: DIVISION_SWARM_OPENRPC_PATH,
      mcp: DIVISION_SWARM_MCP_PATH
    }),
    observedMethods: DIVISION_SWARM_OBSERVED_METHODS,
    adapterPosture: "bounded_external_provider" as const,
    authorityImplication: "none" as const
  });
}
