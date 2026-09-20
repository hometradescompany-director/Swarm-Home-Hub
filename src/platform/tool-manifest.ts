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

export type SwarmHomeJsonSchema = Readonly<Record<string, unknown>>;

export interface SwarmHomeToolDescriptor {
  readonly name: SwarmHomeToolName;
  readonly description: string;
  readonly mutatesState: boolean;
  readonly inputSchema: SwarmHomeJsonSchema;
}

const nonEmptyString = Object.freeze({ type: "string", minLength: 1 });
const stringArray = Object.freeze({
  type: "array",
  items: nonEmptyString
});

const emptyObjectSchema = Object.freeze({
  type: "object",
  properties: Object.freeze({}),
  additionalProperties: false
});

const requestCommandSchema = Object.freeze({
  type: "object",
  properties: Object.freeze({
    requestId: nonEmptyString,
    residenceId: nonEmptyString,
    agentIdentityRef: nonEmptyString,
    habitatId: nonEmptyString,
    requestedAt: nonEmptyString,
    actorRef: nonEmptyString,
    evidenceReceiptIds: stringArray
  }),
  required: Object.freeze([
    "requestId",
    "residenceId",
    "agentIdentityRef",
    "habitatId",
    "requestedAt",
    "actorRef",
    "evidenceReceiptIds"
  ]),
  additionalProperties: false
});

const agentReferenceSchema = Object.freeze({
  type: "object",
  properties: Object.freeze({
    identityRef: nonEmptyString,
    capabilityRefs: stringArray,
    offeringRefs: stringArray
  }),
  required: Object.freeze(["identityRef", "capabilityRefs", "offeringRefs"]),
  additionalProperties: false
});

function objectSchema(
  properties: Readonly<Record<string, unknown>>,
  required: readonly string[]
): SwarmHomeJsonSchema {
  return Object.freeze({
    type: "object",
    properties: Object.freeze({ ...properties }),
    required: Object.freeze([...required]),
    additionalProperties: false
  });
}

export const swarmHomeToolManifest: readonly SwarmHomeToolDescriptor[] = Object.freeze([
  {
    name: "swarm.home.inspect",
    description: "Inspect habitats and current residence projections.",
    mutatesState: false,
    inputSchema: emptyObjectSchema
  },
  {
    name: "swarm.home.recover",
    description: "Recover one residence with its authoritative event timeline or typed absence.",
    mutatesState: false,
    inputSchema: objectSchema(
      { residenceId: nonEmptyString, observedAt: nonEmptyString },
      ["residenceId", "observedAt"]
    )
  },
  {
    name: "swarm.home.heartbeat",
    description: "Evaluate one residence heartbeat against current habitat freshness policy.",
    mutatesState: false,
    inputSchema: objectSchema(
      { residenceId: nonEmptyString, evaluatedAt: nonEmptyString },
      ["residenceId", "evaluatedAt"]
    )
  },
  {
    name: "swarm.home.request",
    description: "Request residence for an opaque Atlas agent identity.",
    mutatesState: true,
    inputSchema: objectSchema(
      { command: requestCommandSchema, observedAt: nonEmptyString },
      ["command", "observedAt"]
    )
  },
  {
    name: "swarm.home.admit",
    description: "Evaluate Atlas authority and local habitat policy, then admit or reject.",
    mutatesState: true,
    inputSchema: objectSchema(
      {
        residenceId: nonEmptyString,
        eventId: nonEmptyString,
        observedAt: nonEmptyString,
        actorRef: nonEmptyString
      },
      ["residenceId", "eventId", "observedAt", "actorRef"]
    )
  },
  {
    name: "swarm.home.rest",
    description: "Transition an admitted residence into resting state.",
    mutatesState: true,
    inputSchema: objectSchema(
      {
        residenceId: nonEmptyString,
        eventId: nonEmptyString,
        at: nonEmptyString,
        actorRef: nonEmptyString
      },
      ["residenceId", "eventId", "at", "actorRef"]
    )
  },
  {
    name: "swarm.home.ready",
    description: "Transition a resting residence into ready state.",
    mutatesState: true,
    inputSchema: objectSchema(
      {
        residenceId: nonEmptyString,
        eventId: nonEmptyString,
        at: nonEmptyString,
        actorRef: nonEmptyString
      },
      ["residenceId", "eventId", "at", "actorRef"]
    )
  },
  {
    name: "swarm.home.handoff",
    description: "Mint a bounded ready handoff without creating new truth ownership.",
    mutatesState: false,
    inputSchema: objectSchema(
      {
        residenceId: nonEmptyString,
        agent: agentReferenceSchema,
        generatedAt: nonEmptyString
      },
      ["residenceId", "agent", "generatedAt"]
    )
  },
  {
    name: "swarm.home.depart",
    description: "Depart a ready or otherwise policy-eligible residence.",
    mutatesState: true,
    inputSchema: objectSchema(
      {
        residenceId: nonEmptyString,
        eventId: nonEmptyString,
        at: nonEmptyString,
        actorRef: nonEmptyString,
        reason: nonEmptyString
      },
      ["residenceId", "eventId", "at", "actorRef"]
    )
  }
]);

const TOOL_NAMES = new Set<string>(swarmHomeToolNames);

export function isSwarmHomeToolName(value: string): value is SwarmHomeToolName {
  return TOOL_NAMES.has(value);
}

export function swarmHomeToolDescriptor(
  name: SwarmHomeToolName
): SwarmHomeToolDescriptor {
  const descriptor = swarmHomeToolManifest.find(tool => tool.name === name);
  if (!descriptor) {
    throw new Error(`Swarm Home tool descriptor cannot be located: ${name}`);
  }
  return descriptor;
}
