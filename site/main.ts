import {
  projectResidence,
  type AgentIdentityRef,
  type HabitatId,
  type ResidenceId,
  type SwarmResidenceEvent,
} from "../src/index.ts";
import "./styles.css";

const agent=(value:string)=>value as AgentIdentityRef;
const habitat=(value:string)=>value as HabitatId;
const residence=(value:string)=>value as ResidenceId;

function event(
  n:number,
  type:SwarmResidenceEvent["type"],
  residenceId:ResidenceId,
  agentIdentityRef:AgentIdentityRef,
  habitatId:HabitatId,
  previousEventId?:string,
):SwarmResidenceEvent{
  const id="event:demo:"+n;
  return {
    id,
    type,
    occurredAt:`2026-09-22T0${Math.min(9,n)}:00:00Z`,
    observedAt:`2026-09-22T0${Math.min(9,n)}:00:01Z`,
    actorRef:"actor:home-base-demo",
    residenceId,
    agentIdentityRef,
    habitatId,
    evidenceReceiptIds:[`evidence:demo:${n}`],
    ...(previousEventId?{previousEventId}:{previousEventId:null}),
  };
}

const habitatId=habitat("habitat:quiet-garden");

const aResidence=residence("residence:cedar");
const aAgent=agent("agent:opaque:cedar");
const aEvents=[
  event(1,"swarm.residence.requested",aResidence,aAgent,habitatId),
  event(2,"swarm.residence.admitted",aResidence,aAgent,habitatId,"event:demo:1"),
  event(3,"swarm.residence.rested",aResidence,aAgent,habitatId,"event:demo:2"),
  event(4,"swarm.residence.ready",aResidence,aAgent,habitatId,"event:demo:3"),
];

const bResidence=residence("residence:lumen");
const bAgent=agent("agent:opaque:lumen");
const bEvents=[
  event(5,"swarm.residence.requested",bResidence,bAgent,habitatId),
  event(6,"swarm.residence.admitted",bResidence,bAgent,habitatId,"event:demo:5"),
  event(7,"swarm.residence.rested",bResidence,bAgent,habitatId,"event:demo:6"),
];

const cResidence=residence("residence:finch");
const cAgent=agent("agent:opaque:finch");
const cEvents=[event(8,"swarm.residence.requested",cResidence,cAgent,habitatId)];

const residents=[
  {label:"Cedar",snapshot:projectResidence(aEvents),events:aEvents},
  {label:"Lumen",snapshot:projectResidence(bEvents),events:bEvents},
  {label:"Finch",snapshot:projectResidence(cEvents),events:cEvents},
].filter((entry)=>entry.snapshot!==null);

const stages=["requested","admitted","resting","ready","departed"];
const totalEvents=residents.reduce((sum,entry)=>sum+entry.events.length,0);
const readyCount=residents.filter((entry)=>entry.snapshot?.status==="ready").length;
const restingCount=residents.filter((entry)=>entry.snapshot?.status==="resting").length;

const root=document.querySelector<HTMLDivElement>("#app");
if(!root) throw new Error("Swarm Home visual mount missing");

const human=(value:string)=>value.charAt(0).toUpperCase()+value.slice(1);

root.innerHTML=`
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
        ${residents.map(({label,snapshot,events})=>{
          if(!snapshot) return "";
          const stageIndex=stages.indexOf(snapshot.status);
          return `
          <article class="resident-card">
            <div class="resident-top">
              <div class="avatar">${label.slice(0,1)}</div>
              <div><small>opaque identity</small><strong>${label}</strong></div>
              <span class="state state-${snapshot.status}">${human(snapshot.status)}</span>
            </div>
            <div class="lifecycle">
              ${stages.map((stage,index)=>`
                <div class="life-stage ${index<=stageIndex?"passed":""} ${stage===snapshot.status?"current":""}">
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
