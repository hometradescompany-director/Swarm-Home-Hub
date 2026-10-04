import type {
  StateDomain,
  StateOwnershipFingerprint,
  StateOwnershipStanding,
} from "../refinery/state-ownership.js";

export interface StateOwnershipDomainDrift {
  readonly domain: StateDomain;
  readonly before: StateOwnershipStanding;
  readonly after: StateOwnershipStanding;
}

export interface StateOwnershipDrift {
  readonly changed: boolean;
  readonly domains: readonly StateOwnershipDomainDrift[];
}

const DOMAINS: readonly StateDomain[] = ["task","memory","identity","event","schedule"];

export function compareStateOwnership(
  before: StateOwnershipFingerprint,
  after: StateOwnershipFingerprint
): StateOwnershipDrift {
  const domains = DOMAINS
    .filter((domain) => before[domain] !== after[domain])
    .map((domain) => Object.freeze({
      domain,
      before: before[domain],
      after: after[domain],
    }));

  return Object.freeze({
    changed: domains.length > 0,
    domains: Object.freeze(domains),
  });
}
