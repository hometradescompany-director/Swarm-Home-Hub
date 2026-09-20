import type { AgentIdentityRef } from "../../domain/agent.js";
import type { ProvenanceReceipt } from "../../provenance/receipt.js";
import type { AtlasAuthorityDecision, AtlasGateway } from "./contract.js";
import {
  ATLAS_AUTHORITY_CONTRACT,
  ATLAS_ENTITY_CONTRACT,
  SWARM_RESIDENCE_ENTER_ACTION,
} from "./federation.js";

type Fetcher = typeof fetch;

interface AtlasEnvelope<T> {
  readonly ok: boolean;
  readonly request_id?: string;
  readonly data?: T;
  readonly refusal?: {
    readonly reason?: string;
    readonly stage?: string;
    readonly missing_capability?: string;
  };
}

interface EntityResult {
  readonly atlas_entity_id: string;
  readonly external_id: string;
  readonly enabled: boolean;
}

interface AuthorityResult {
  readonly allowed: boolean;
  readonly authority_ref: string;
  readonly decided_at: string;
  readonly reason: string;
}

export interface AtlasHttpGatewayOptions {
  readonly baseUrl: string;
  readonly token: string;
  readonly fetcher?: Fetcher;
}

export class AtlasHttpGateway implements AtlasGateway {
  readonly #baseUrl: URL;
  readonly #token: string;
  readonly #fetcher: Fetcher;

  constructor(options: AtlasHttpGatewayOptions) {
    const token = options.token.trim();
    if (!token) throw new Error("Atlas gateway token is required");

    const baseUrl = new URL(options.baseUrl);
    if (!["http:", "https:"].includes(baseUrl.protocol)) {
      throw new Error("Atlas gateway baseUrl must use http or https");
    }

    this.#baseUrl = baseUrl;
    this.#token = token;
    this.#fetcher = options.fetcher ?? fetch;
  }

  async #post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const url = new URL(path, this.#baseUrl);
    const response = await this.#fetcher(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.#token}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    let envelope: AtlasEnvelope<T>;
    try {
      envelope = (await response.json()) as AtlasEnvelope<T>;
    } catch {
      throw new Error(`Atlas gateway returned non-JSON HTTP ${response.status}`);
    }

    if (!response.ok || envelope.ok !== true || envelope.data === undefined) {
      const reason = envelope.refusal?.reason ?? `HTTP ${response.status}`;
      const stage = envelope.refusal?.stage ? ` at ${envelope.refusal.stage}` : "";
      throw new Error(`Atlas gateway refused request${stage}: ${reason}`);
    }

    return envelope.data;
  }

  async resolveAgentIdentity(
    ref: AgentIdentityRef,
  ): Promise<{ exists: boolean; canonicalRef: AgentIdentityRef }> {
    const data = await this.#post<EntityResult>("/api/public/v1/entities", {
      contract: ATLAS_ENTITY_CONTRACT,
      external_type: "agent_identity",
      external_id: ref,
      atlas_entity_kind: "agent",
      metadata: {},
    });

    if (data.external_id !== ref) {
      throw new Error("Atlas identity response does not match the requested opaque identity");
    }

    return {
      exists: data.enabled === true,
      // Swarm retains its own product identity. Atlas's UUID is a mapping target,
      // not a replacement for the product's canonical local reference.
      canonicalRef: ref,
    };
  }

  async canEnterHome(ref: AgentIdentityRef): Promise<AtlasAuthorityDecision> {
    const data = await this.#post<AuthorityResult>("/api/public/v1/authority", {
      contract: ATLAS_AUTHORITY_CONTRACT,
      action: SWARM_RESIDENCE_ENTER_ACTION,
      subject_ref: ref,
    });

    return {
      allowed: data.allowed,
      authorityRef: data.authority_ref,
      decidedAt: data.decided_at,
      reason: data.reason,
    };
  }

  async evidence(receiptIds: readonly string[]): Promise<readonly ProvenanceReceipt[]> {
    if (receiptIds.length === 0) return [];
    throw new Error(
      "Atlas evidence transport is intentionally unavailable in SwarmAtlasFederation/v1; non-empty evidence requests fail closed",
    );
  }
}
