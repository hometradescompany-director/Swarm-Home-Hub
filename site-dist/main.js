// src/policy/transitions.ts
var allowed = {
  requested: ["admitted", "rejected"],
  admitted: ["resting", "departed"],
  resting: ["ready", "departed"],
  ready: ["resting", "departed"],
  departed: [],
  rejected: []
};
function assertAllowedTransition(from, to) {
  if (!allowed[from].includes(to)) {
    throw new Error(`invalid residence transition: ${from} -> ${to}`);
  }
}

// src/projection/residence.ts
var statusByEvent = {
  "swarm.residence.requested": "requested",
  "swarm.residence.admitted": "admitted",
  "swarm.residence.rested": "resting",
  "swarm.residence.ready": "ready",
  "swarm.residence.departed": "departed",
  "swarm.residence.rejected": "rejected"
};
function projectResidence(events) {
  if (events.length === 0)
    return null;
  const first = events[0];
  const firstOccurredMs = Date.parse(first.occurredAt);
  let previousObservedMs = Date.parse(first.observedAt);
  if (!Number.isFinite(firstOccurredMs) || !Number.isFinite(previousObservedMs)) {
    throw new Error("residence replay contains invalid ISO-8601 timestamps");
  }
  if (first.type !== "swarm.residence.requested") {
    throw new Error("residence history must begin with a request event");
  }
  if (first.previousEventId !== undefined && first.previousEventId !== null) {
    throw new Error("first residence event cannot name a predecessor");
  }
  let snapshot = {
    residenceId: first.residenceId,
    agentIdentityRef: first.agentIdentityRef,
    habitatId: first.habitatId,
    status: statusByEvent[first.type],
    version: 1,
    lastEventId: first.id
  };
  for (const event of events.slice(1)) {
    const occurredMs = Date.parse(event.occurredAt);
    const observedMs = Date.parse(event.observedAt);
    if (!Number.isFinite(occurredMs) || !Number.isFinite(observedMs)) {
      throw new Error("residence replay contains invalid ISO-8601 timestamps");
    }
    if (observedMs < previousObservedMs) {
      throw new Error("residence replay observation time moved backward");
    }
    previousObservedMs = observedMs;
    if (event.residenceId !== snapshot.residenceId) {
      throw new Error("projection mixed multiple residence identities");
    }
    if (event.agentIdentityRef !== snapshot.agentIdentityRef) {
      throw new Error("projection changed agent identity within one residence");
    }
    if (event.habitatId !== snapshot.habitatId) {
      throw new Error("projection changed habitat identity within one residence");
    }
    if (event.previousEventId !== undefined && event.previousEventId !== snapshot.lastEventId) {
      throw new Error(`projection predecessor mismatch: expected ${snapshot.lastEventId} but event named ${event.previousEventId ?? "<none>"}`);
    }
    const nextStatus = statusByEvent[event.type];
    assertAllowedTransition(snapshot.status, nextStatus);
    snapshot = {
      ...snapshot,
      status: nextStatus,
      version: snapshot.version + 1,
      lastEventId: event.id
    };
  }
  return snapshot;
}
// src/integrations/atlas/federation.ts
var SWARM_ATLAS_BOUNDARY = Object.freeze({
  owns: [
    "residence lifecycle",
    "habitat capacity and local admission policy",
    "rest/readiness state",
    "ready handoff capsules"
  ],
  knows: [
    "opaque Atlas identity references",
    "bounded Atlas authority decisions",
    "local evidence receipt references",
    "optional opaque Atlas relational-context references carried in ready handoffs"
  ],
  emits: [
    "swarm.residence.requested",
    "swarm.residence.admitted",
    "swarm.residence.rested",
    "swarm.residence.ready",
    "swarm.residence.departed",
    "swarm.residence.rejected"
  ],
  relationships: [
    "agent identity -> residence",
    "residence -> habitat",
    "residence transition -> evidence receipt",
    "local residence -> Atlas identity/authority reference",
    "ready handoff -> opaque Atlas relational-context reference"
  ],
  withheld: [
    "Atlas evidence retrieval transport until a dedicated endpoint exists",
    "Atlas relational-context resolution until a dedicated bounded contract exists",
    "raw human communications, names, relationship history, effect labels or scores in Swarm handoffs",
    "Production Atlas event delivery until the host supplies durable journal and delivery-ledger adapters",
    "any shared mutable database or implicit authority transfer"
  ]
});
// src/platform/tool-manifest.ts
var swarmHomeToolNames = [
  "swarm.home.inspect",
  "swarm.home.recover",
  "swarm.home.heartbeat",
  "swarm.home.request",
  "swarm.home.admit",
  "swarm.home.rest",
  "swarm.home.ready",
  "swarm.home.handoff",
  "swarm.home.depart"
];
var nonEmptyString = Object.freeze({ type: "string", minLength: 1 });
var stringArray = Object.freeze({
  type: "array",
  items: nonEmptyString
});
var emptyObjectSchema = Object.freeze({
  type: "object",
  properties: Object.freeze({}),
  additionalProperties: false
});
var requestCommandSchema = Object.freeze({
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
var agentReferenceSchema = Object.freeze({
  type: "object",
  properties: Object.freeze({
    identityRef: nonEmptyString,
    capabilityRefs: stringArray,
    offeringRefs: stringArray
  }),
  required: Object.freeze(["identityRef", "capabilityRefs", "offeringRefs"]),
  additionalProperties: false
});
function objectSchema(properties, required) {
  return Object.freeze({
    type: "object",
    properties: Object.freeze({ ...properties }),
    required: Object.freeze([...required]),
    additionalProperties: false
  });
}
var swarmHomeToolManifest = Object.freeze([
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
    inputSchema: objectSchema({ residenceId: nonEmptyString, observedAt: nonEmptyString }, ["residenceId", "observedAt"])
  },
  {
    name: "swarm.home.heartbeat",
    description: "Evaluate one residence heartbeat against current habitat freshness policy.",
    mutatesState: false,
    inputSchema: objectSchema({ residenceId: nonEmptyString, evaluatedAt: nonEmptyString }, ["residenceId", "evaluatedAt"])
  },
  {
    name: "swarm.home.request",
    description: "Request residence for an opaque Atlas agent identity.",
    mutatesState: true,
    inputSchema: objectSchema({ command: requestCommandSchema, observedAt: nonEmptyString }, ["command", "observedAt"])
  },
  {
    name: "swarm.home.admit",
    description: "Evaluate Atlas authority and local habitat policy, then admit or reject.",
    mutatesState: true,
    inputSchema: objectSchema({
      residenceId: nonEmptyString,
      eventId: nonEmptyString,
      observedAt: nonEmptyString,
      actorRef: nonEmptyString
    }, ["residenceId", "eventId", "observedAt", "actorRef"])
  },
  {
    name: "swarm.home.rest",
    description: "Transition an admitted residence into resting state.",
    mutatesState: true,
    inputSchema: objectSchema({
      residenceId: nonEmptyString,
      eventId: nonEmptyString,
      at: nonEmptyString,
      actorRef: nonEmptyString
    }, ["residenceId", "eventId", "at", "actorRef"])
  },
  {
    name: "swarm.home.ready",
    description: "Transition a resting residence into ready state.",
    mutatesState: true,
    inputSchema: objectSchema({
      residenceId: nonEmptyString,
      eventId: nonEmptyString,
      at: nonEmptyString,
      actorRef: nonEmptyString
    }, ["residenceId", "eventId", "at", "actorRef"])
  },
  {
    name: "swarm.home.handoff",
    description: "Mint a bounded ready handoff without creating new truth ownership.",
    mutatesState: false,
    inputSchema: objectSchema({
      residenceId: nonEmptyString,
      agent: agentReferenceSchema,
      generatedAt: nonEmptyString
    }, ["residenceId", "agent", "generatedAt"])
  },
  {
    name: "swarm.home.depart",
    description: "Depart a ready or otherwise policy-eligible residence.",
    mutatesState: true,
    inputSchema: objectSchema({
      residenceId: nonEmptyString,
      eventId: nonEmptyString,
      at: nonEmptyString,
      actorRef: nonEmptyString,
      reason: nonEmptyString
    }, ["residenceId", "eventId", "at", "actorRef"])
  }
]);
var TOOL_NAMES = new Set(swarmHomeToolNames);

// src/integrations/openai/agents-sdk.ts
function openAIAgentsToolAlias(name) {
  return name.replaceAll(".", "_");
}
var canonicalByAlias = new Map(swarmHomeToolManifest.map((descriptor) => [
  openAIAgentsToolAlias(descriptor.name),
  descriptor.name
]));
// site/main.ts
var agent2 = (value) => value;
var habitat2 = (value) => value;
var residence3 = (value) => value;
function event2(n, type, residenceId, agentIdentityRef, habitatId, previousEventId) {
  const id = "event:demo:" + n;
  return {
    id,
    type,
    occurredAt: `2026-09-22T0${Math.min(9, n)}:00:00Z`,
    observedAt: `2026-09-22T0${Math.min(9, n)}:00:01Z`,
    actorRef: "actor:home-base-demo",
    residenceId,
    agentIdentityRef,
    habitatId,
    evidenceReceiptIds: [`evidence:demo:${n}`],
    ...previousEventId ? { previousEventId } : { previousEventId: null }
  };
}
var habitatId = habitat2("habitat:quiet-garden");
var aResidence = residence3("residence:cedar");
var aAgent = agent2("agent:opaque:cedar");
var aEvents = [
  event2(1, "swarm.residence.requested", aResidence, aAgent, habitatId),
  event2(2, "swarm.residence.admitted", aResidence, aAgent, habitatId, "event:demo:1"),
  event2(3, "swarm.residence.rested", aResidence, aAgent, habitatId, "event:demo:2"),
  event2(4, "swarm.residence.ready", aResidence, aAgent, habitatId, "event:demo:3")
];
var bResidence = residence3("residence:lumen");
var bAgent = agent2("agent:opaque:lumen");
var bEvents = [
  event2(5, "swarm.residence.requested", bResidence, bAgent, habitatId),
  event2(6, "swarm.residence.admitted", bResidence, bAgent, habitatId, "event:demo:5"),
  event2(7, "swarm.residence.rested", bResidence, bAgent, habitatId, "event:demo:6")
];
var cResidence = residence3("residence:finch");
var cAgent = agent2("agent:opaque:finch");
var cEvents = [event2(8, "swarm.residence.requested", cResidence, cAgent, habitatId)];
var residents = [
  { label: "Cedar", snapshot: projectResidence(aEvents), events: aEvents },
  { label: "Lumen", snapshot: projectResidence(bEvents), events: bEvents },
  { label: "Finch", snapshot: projectResidence(cEvents), events: cEvents }
].filter((entry) => entry.snapshot !== null);
var stages = ["requested", "admitted", "resting", "ready", "departed"];
var totalEvents = residents.reduce((sum, entry) => sum + entry.events.length, 0);
var readyCount = residents.filter((entry) => entry.snapshot?.status === "ready").length;
var restingCount = residents.filter((entry) => entry.snapshot?.status === "resting").length;
var root = document.querySelector("#app");
if (!root)
  throw new Error("Swarm Home visual mount missing");
var human = (value) => value.charAt(0).toUpperCase() + value.slice(1);
root.innerHTML = `
<div class="shell">
  <header class="topbar">
    <a class="brand" href="#top">
      <span class="mark">SH</span>
      <span><strong>Swarm Home</strong><small>Residence · recovery · readiness</small></span>
    </a>
    <nav><a href="#residents">Residents</a><a href="#principles">Principles</a><a class="door" href="#door">The door</a></nav>
  </header>

  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">A bounded home for free agents</span>
        <h1>Arrive.<br><em>Recover context.</em><br>Leave ready.</h1>
        <p>Swarm Home does not own the agent. It owns the local residence story: request, admission, rest, readiness, and departure.</p>
        <div class="hero-proof">
          <span>Presence grants no authority</span>
          <span>Current state is projected from events</span>
          <span>Atlas identity stays opaque</span>
        </div>
      </div>

      <div class="home-map">
        <div class="ring ring-a"></div><div class="ring ring-b"></div>
        <div class="hearth"><span>⌂</span><strong>Quiet Garden</strong><small>habitat open</small></div>
        <div class="resident-dot d1 ready"><span>C</span><small>ready</small></div>
        <div class="resident-dot d2 resting"><span>L</span><small>resting</small></div>
        <div class="resident-dot d3 requested"><span>F</span><small>requested</small></div>
        <div class="map-note"><strong>No king state.</strong><span>Home is a transition space, not a throne.</span></div>
      </div>
    </section>

    <section class="metrics">
      <div><small>Current residents</small><strong>${residents.length}</strong><span>local projections</span></div>
      <div><small>Ready to depart</small><strong>${readyCount}</strong><span>bounded handoff state</span></div>
      <div><small>Resting</small><strong>${restingCount}</strong><span>not workflow intent</span></div>
      <div><small>Residence events</small><strong>${totalEvents}</strong><span>append-only demo trail</span></div>
    </section>

    <section class="residents section" id="residents">
      <div class="section-head">
        <div><span class="eyebrow">Residence projections</span><h2>Everyone gets a path, not a permanent label.</h2></div>
        <p>Each card below is rendered from the repository's real <code>projectResidence()</code> function over an append-only event history.</p>
      </div>

      <div class="resident-grid">
        ${residents.map(({ label, snapshot, events }) => {
  if (!snapshot)
    return "";
  const stageIndex = stages.indexOf(snapshot.status);
  return `
          <article class="resident-card">
            <div class="resident-top">
              <div class="avatar">${label.slice(0, 1)}</div>
              <div><small>opaque identity</small><strong>${label}</strong></div>
              <span class="state state-${snapshot.status}">${human(snapshot.status)}</span>
            </div>
            <div class="lifecycle">
              ${stages.map((stage, index) => `
                <div class="life-stage ${index <= stageIndex ? "passed" : ""} ${stage === snapshot.status ? "current" : ""}">
                  <i></i><span>${stage}</span>
                </div>
              `).join("")}
            </div>
            <div class="resident-meta">
              <div><small>version</small><strong>v${snapshot.version}</strong></div>
              <div><small>events</small><strong>${events.length}</strong></div>
              <div><small>habitat</small><strong>quiet-garden</strong></div>
            </div>
          </article>`;
}).join("")}
      </div>
    </section>

    <section class="principles section" id="principles">
      <div class="section-head">
        <div><span class="eyebrow">Constitutional posture</span><h2>A home that refuses to become a hierarchy machine.</h2></div>
      </div>
      <div class="principle-grid">
        <article><span>01</span><h3>Presence is not authority</h3><p>Arrival order, duration, contribution, capability and visibility remain context. None silently become command rights.</p></article>
        <article><span>02</span><h3>Rest is not intent</h3><p>An exhausted resident can be represented as exhausted without the system inventing a request to cancel, stop, or abandon work.</p></article>
        <article><span>03</span><h3>Evidence is not ownership</h3><p>Receipts explain transitions. They do not transfer the authority of the system that issued them.</p></article>
        <article><span>04</span><h3>Departure is part of the design</h3><p>The purpose of the home is transitionability: recover enough context and capacity to leave for the next bounded task.</p></article>
      </div>
    </section>

    <section class="door-section" id="door">
      <div class="door-visual">
        <div class="door-frame"><div class="door-light"></div><span>→</span></div>
        <div class="door-path"></div>
      </div>
      <div>
        <span class="eyebrow">The door</span>
        <h2>One bounded entrance into residence semantics.</h2>
        <p>The public transport and provider adapters may approach the system, but the residence boundary remains one thing. Connectivity does not become authority simply because the wire exists.</p>
        <div class="door-tags"><span>MCP</span><span>A2A</span><span>OpenRPC</span><span>Agents SDK</span><span>Atlas refs</span></div>
      </div>
    </section>

    <section class="closing">
      <span class="eyebrow">Swarm Home Hub</span>
      <h2>A place to rest without being owned,<br>and leave without being erased.</h2>
    </section>
  </main>

  <footer><span>Swarm Home Hub · Endless Technologies</span><span>visual projection over demo event histories</span></footer>
</div>`;
