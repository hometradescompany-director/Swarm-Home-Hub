export const swarmHomeToolNames = [
  "swarm.home.inspect",
  "swarm.home.recover",
  "swarm.home.heartbeat",
  "swarm.home.request",
  "swarm.home.admit",
  "swarm.home.rest",
  "swarm.home.ready",
  "swarm.home.handoff",
  "swarm.home.depart"
] as const;

export type SwarmHomeToolName = (typeof swarmHomeToolNames)[number];

export interface SwarmHomeToolDescriptor {
  readonly name: SwarmHomeToolName;
  readonly description: string;
  readonly mutatesState: boolean;
}

export const swarmHomeToolManifest: readonly SwarmHomeToolDescriptor[] = Object.freeze([
  {
    name: "swarm.home.inspect",
    description: "Inspect habitats and current residence projections.",
    mutatesState: false
  },
  {
    name: "swarm.home.recover",
    description: "Recover one residence with its authoritative event timeline or typed absence.",
    mutatesState: false
  },
  {
    name: "swarm.home.heartbeat",
    description: "Evaluate one residence heartbeat against current habitat freshness policy.",
    mutatesState: false
  },
  {
    name: "swarm.home.request",
    description: "Request residence for an opaque Atlas agent identity.",
    mutatesState: true
  },
  {
    name: "swarm.home.admit",
    description: "Evaluate Atlas authority and local habitat policy, then admit or reject.",
    mutatesState: true
  },
  {
    name: "swarm.home.rest",
    description: "Transition an admitted residence into resting state.",
    mutatesState: true
  },
  {
    name: "swarm.home.ready",
    description: "Transition a resting residence into ready state.",
    mutatesState: true
  },
  {
    name: "swarm.home.handoff",
    description: "Mint a bounded ready handoff without creating new truth ownership.",
    mutatesState: false
  },
  {
    name: "swarm.home.depart",
    description: "Depart a ready or otherwise policy-eligible residence.",
    mutatesState: true
  }
]);
