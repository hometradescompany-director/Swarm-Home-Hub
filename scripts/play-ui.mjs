export const playHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>Swarm Home // Playable Bun</title>
  <link rel="stylesheet" href="/play/styles.css">
</head>
<body data-play-token="__PLAY_TOKEN__">
  <div class="noise"></div>
  <main class="shell">
    <header class="hero">
      <div>
        <div class="eyebrow">ENDLESS TECHNOLOGIES · SWARM HOME HUB</div>
        <h1>PLAYABLE <span>BUN</span></h1>
        <p class="dek">Bunch of files → executable program → observable state transition.</p>
      </div>
      <div class="truth-stack">
        <span class="truth live">REAL RUNTIME</span>
        <span class="truth">LOCAL ONLY</span>
        <span class="truth synthetic">SYNTHETIC ATLAS AUTHORITY</span>
        <span class="truth">IN-MEMORY DEMO STATE</span>
      </div>
    </header>

    <section class="control-grid">
      <article class="panel mission">
        <div class="panel-kicker">MISSION CONTROL</div>
        <h2>Move one bounded agent through the real Swarm lifecycle.</h2>
        <p>No mocked residence engine. The buttons call the same public tool router and services exercised by the repository tests.</p>
        <div class="actions primary-actions">
          <button id="runFull" class="primary">RUN FULL LIFECYCLE</button>
          <button id="reset">RESET HABITAT</button>
        </div>
        <div class="actions">
          <button data-step="request">01 REQUEST</button>
          <button data-step="admit">02 ADMIT</button>
          <button data-step="rest">03 REST</button>
          <button data-step="ready">04 READY</button>
          <button data-step="handoff">05 HANDOFF</button>
          <button data-step="depart">06 DEPART</button>
        </div>
        <div class="run-meta">
          <span>RUN</span><strong id="runId">not started</strong>
          <span>RESIDENCE</span><strong id="residenceId">none</strong>
        </div>
      </article>

      <article class="panel state-panel">
        <div class="panel-kicker">LIVE PROJECTION</div>
        <div class="state-rail" id="stateRail">
          <div data-state="requested">REQUESTED</div>
          <div data-state="admitted">ADMITTED</div>
          <div data-state="resting">RESTING</div>
          <div data-state="ready">READY</div>
          <div data-state="departed">DEPARTED</div>
          <div data-state="rejected">REJECTED</div>
        </div>
        <div class="metric-grid">
          <div><span>Habitat</span><strong id="habitatStatus">loading</strong></div>
          <div><span>Occupancy</span><strong id="occupancy">0</strong></div>
          <div><span>Events</span><strong id="eventCount">0</strong></div>
          <div><span>Last result</span><strong id="lastResult">boot</strong></div>
        </div>
      </article>
    </section>

    <section class="topology panel">
      <div class="panel-kicker">BOUNDARY TOPOLOGY</div>
      <div class="topology-row">
        <div class="node ghost"><small>EXTERNAL OWNER</small><b>ATLAS</b><span>synthetic authority adapter</span></div>
        <i>→</i>
        <div class="node hot"><small>PUBLIC DOOR</small><b>SWARM TOOL ROUTER</b><span>bounded commands</span></div>
        <i>→</i>
        <div class="node"><small>NERVE</small><b>EVENT JOURNAL</b><span>append-only transitions</span></div>
        <i>→</i>
        <div class="node"><small>VIEW</small><b>PROJECTION</b><span>current residence state</span></div>
        <i>→</i>
        <div class="node"><small>EXIT</small><b>HANDOFF</b><span>bounded capsule</span></div>
      </div>
      <p class="boundary-note">The executable demonstrates the Swarm boundary. It does not import private Atlas, HomeFlow, Diamond, Media Forge, Skills Foundry, Trade Hubs or CropZero truth.</p>
    </section>

    <section class="two-col">
      <article class="panel">
        <div class="panel-kicker">EVENT TIMELINE</div>
        <ol id="timeline" class="timeline"><li class="empty">No residence events yet.</li></ol>
      </article>
      <article class="panel">
        <div class="panel-kicker">EVIDENCE / RESPONSE</div>
        <pre id="evidence">{ "standing": "waiting for action" }</pre>
      </article>
    </section>

    <section class="two-col">
      <article class="panel failure">
        <div class="panel-kicker">FALSIFICATION FORGE</div>
        <h2>Try to make it lie.</h2>
        <p>These are not happy-path theatre. They deliberately push invalid authority and invalid transition order through the same runtime.</p>
        <div class="actions">
          <button id="deny">DENY AT AUTHORITY</button>
          <button id="illegal">ILLEGAL READY TRANSITION</button>
          <button id="unauthorized">MUTATE WITHOUT TOKEN</button>
        </div>
        <div id="falsifierResult" class="falsifier-result">No falsifier fired yet.</div>
      </article>
      <article class="panel constellation">
        <div class="panel-kicker">ESTATE CONTEXT · SNAPSHOT 2026-09-21</div>
        <div class="constellation-grid">
          <span class="current">Swarm Home<b>LIVE HERE</b></span>
          <span>Atlas<b>ORCHESTRATION</b></span>
          <span>HomeFlow<b>PRODUCT</b></span>
          <span>Trade Hubs<b>PRODUCT</b></span>
          <span>Diamond<b>SECURITY</b></span>
          <span>Skills Foundry<b>CAPABILITY</b></span>
          <span>Media Forge<b>CREATIVE</b></span>
          <span>CropZero<b>PLATFORM</b></span>
        </div>
        <p class="boundary-note">Cards are architectural context, not live imports or claims of runtime federation.</p>
      </article>
    </section>

    <footer>
      <span>Identity → Event → Transformation → Evidence → Outcome</span>
      <b>THE PILE BECOMES PLAYABLE.</b>
    </footer>
  </main>
  <script>window.__SWARM_PLAY_TOKEN__ = "__PLAY_TOKEN__";</script>
  <script src="/play/app.js"></script>
</body>
</html>`;

export const playCss = `:root {
  color-scheme: dark;
  --bg:#07100d;
  --panel:#0d1814;
  --panel2:#101f1a;
  --line:#284238;
  --text:#ecf7f1;
  --muted:#8ca79b;
  --hot:#b7ff4a;
  --cyan:#5cf2cf;
  --amber:#ffcf5a;
  --red:#ff6b6b;
}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
body{background:
 radial-gradient(circle at 20% -20%,rgba(92,242,207,.13),transparent 36rem),
 radial-gradient(circle at 90% 0%,rgba(183,255,74,.08),transparent 28rem),
 #07100d}
.noise{pointer-events:none;position:fixed;inset:0;opacity:.035;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E")}
.shell{width:min(1500px,calc(100% - 32px));margin:0 auto;padding:42px 0 60px}
.hero{display:flex;justify-content:space-between;gap:30px;align-items:flex-end;border-bottom:1px solid var(--line);padding-bottom:28px;margin-bottom:22px}
.eyebrow,.panel-kicker{font:700 11px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.18em;color:var(--cyan)}
h1{font-size:clamp(52px,9vw,118px);line-height:.85;letter-spacing:-.07em;margin:14px 0 16px;font-weight:900}
h1 span{color:var(--hot)}
.dek{font-size:clamp(15px,2vw,23px);color:var(--muted);margin:0;max-width:760px}
.truth-stack{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;max-width:430px}
.truth{font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;border:1px solid var(--line);padding:9px 11px;border-radius:999px;color:var(--muted)}
.truth.live{border-color:var(--hot);color:var(--hot);box-shadow:0 0 20px rgba(183,255,74,.12)}
.truth.synthetic{border-color:var(--amber);color:var(--amber)}
.panel{background:linear-gradient(180deg,rgba(16,31,26,.96),rgba(11,23,19,.96));border:1px solid var(--line);border-radius:18px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.18)}
.control-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:18px;margin-bottom:18px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:18px 0}
h2{font-size:22px;margin:10px 0 8px;letter-spacing:-.02em}
p{color:var(--muted);line-height:1.55}
.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
button{appearance:none;border:1px solid var(--line);background:#0a1511;color:var(--text);padding:11px 13px;border-radius:9px;font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;cursor:pointer;transition:.15s ease}
button:hover{border-color:var(--cyan);transform:translateY(-1px)}
button:disabled{opacity:.35;cursor:not-allowed;transform:none}
button.primary{background:var(--hot);color:#09110e;border-color:var(--hot);font-weight:900}
.primary-actions{margin:20px 0 4px}
.run-meta{display:grid;grid-template-columns:auto 1fr;gap:5px 14px;margin-top:20px;font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
.run-meta span{color:var(--muted)}
.run-meta strong{overflow-wrap:anywhere}
.state-rail{display:grid;grid-template-columns:1fr;gap:7px;margin-top:14px}
.state-rail div{border:1px solid var(--line);border-radius:8px;padding:9px 11px;color:#678076;font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;transition:.2s}
.state-rail div.active{border-color:var(--hot);color:var(--hot);background:rgba(183,255,74,.07)}
.state-rail div.past{color:var(--cyan);border-color:rgba(92,242,207,.35)}
.state-rail div[data-state="rejected"].active{color:var(--red);border-color:var(--red)}
.metric-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:18px}
.metric-grid div{background:#08120e;border:1px solid #1b3028;border-radius:9px;padding:10px}
.metric-grid span{display:block;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em}
.metric-grid strong{display:block;font:700 14px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;margin-top:5px}
.topology{overflow:hidden}
.topology-row{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr auto 1fr;gap:10px;align-items:center;margin-top:16px}
.node{min-height:106px;border:1px solid var(--line);background:#09130f;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:7px;justify-content:center}
.node small{font:700 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted);letter-spacing:.12em}
.node b{font-size:14px}
.node span{font-size:11px;color:var(--muted)}
.node.hot{border-color:var(--hot);box-shadow:inset 0 0 30px rgba(183,255,74,.04)}
.node.ghost{border-style:dashed}
.topology-row i{font-style:normal;color:var(--hot);font-size:22px}
.boundary-note{font-size:11px;margin:14px 0 0}
.timeline{list-style:none;padding:0;margin:14px 0 0;max-height:420px;overflow:auto}
.timeline li{position:relative;padding:12px 12px 12px 40px;border-bottom:1px solid #193028;font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}
.timeline li:before{content:"";position:absolute;left:12px;top:17px;width:9px;height:9px;border-radius:50%;background:var(--cyan);box-shadow:0 0 14px rgba(92,242,207,.35)}
.timeline li b{display:block;color:var(--text);margin-bottom:3px}
.timeline li span{color:var(--muted);font-size:10px}
.timeline li.empty:before{background:#3a5148;box-shadow:none}
pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#06100c;border:1px solid #1d342a;border-radius:12px;padding:16px;min-height:240px;max-height:420px;overflow:auto;color:#b9d9cc;font:11px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace}
.failure{border-color:#49342b}
.falsifier-result{margin-top:14px;padding:12px;border-radius:10px;background:#0a130f;border:1px solid #253a31;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted)}
.falsifier-result.good{color:var(--hot);border-color:rgba(183,255,74,.4)}
.falsifier-result.bad{color:var(--red);border-color:rgba(255,107,107,.5)}
.constellation-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}
.constellation-grid span{border:1px solid var(--line);border-radius:10px;padding:12px;font-size:12px}
.constellation-grid b{display:block;margin-top:5px;color:var(--muted);font:700 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace}
.constellation-grid .current{border-color:var(--hot);color:var(--hot)}
footer{display:flex;justify-content:space-between;gap:20px;color:var(--muted);font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;border-top:1px solid var(--line);padding-top:20px;margin-top:22px}
footer b{color:var(--hot)}
@media(max-width:900px){
  .hero{align-items:flex-start;flex-direction:column}.truth-stack{justify-content:flex-start}
  .control-grid,.two-col{grid-template-columns:1fr}
  .topology-row{grid-template-columns:1fr}.topology-row i{transform:rotate(90deg);justify-self:center}
  .constellation-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:520px){
  .shell{width:min(100% - 18px,1500px);padding-top:20px}
  .panel{padding:16px;border-radius:14px}
  .constellation-grid{grid-template-columns:1fr}
  footer{flex-direction:column}
}`;

export const playJs = `(function () {
  "use strict";

  var token = document.body.dataset.playToken;
  var run = null;
  var stepIndex = 0;
  var states = ["requested","admitted","resting","ready","departed"];
  var stepNames = ["request","admit","rest","ready","handoff","depart"];

  function id(x) { return document.getElementById(x); }
  function iso(offset) { return new Date(Date.now() + (offset || 0)).toISOString(); }
  function pretty(value) { return JSON.stringify(value, null, 2); }
  function uid(prefix) {
    return prefix + ":" + Date.now().toString(36) + ":" + Math.random().toString(36).slice(2, 8);
  }

  function freshRun(identitySuffix) {
    var seed = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    run = {
      id: seed,
      residenceId: "residence:demo:" + seed,
      requestId: "request:demo:" + seed,
      identityRef: "agent:demo:" + (identitySuffix || seed),
      actorRef: "operator:playable-bun",
      habitatId: "habitat:play",
      events: {
        admit: "event:admit:" + seed,
        rest: "event:rest:" + seed,
        ready: "event:ready:" + seed,
        depart: "event:depart:" + seed
      }
    };
    stepIndex = 0;
    id("runId").textContent = run.id;
    id("residenceId").textContent = run.residenceId;
    return run;
  }

  async function callTool(name, argumentsValue, includeToken) {
    var headers = { "content-type": "application/json" };
    if (includeToken !== false) headers["x-swarm-play-token"] = token;
    var response = await fetch("/swarm-home/tools/" + encodeURIComponent(name), {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ arguments: argumentsValue })
    });
    var value = await response.json();
    return { status: response.status, body: value };
  }

  async function inspect() {
    var response = await fetch("/swarm-home/tools/swarm.home.inspect", {
      method: "POST",
      headers: { "content-type":"application/json" },
      body: JSON.stringify({ arguments:{} })
    });
    var value = await response.json();
    if (!value.ok) throw new Error(value.error || "inspection failed");
    var inspection = value.value;
    var habitat = inspection.habitats && inspection.habitats[0];
    id("habitatStatus").textContent = habitat ? habitat.status : "unknown";
    id("occupancy").textContent = habitat ? String(habitat.occupied) + "/" + String(habitat.capacity) : "0";
    if (run) {
      var residence = inspection.residences.find(function (x) { return x.residenceId === run.residenceId; });
      renderState(residence ? residence.status : null);
      if (residence) await recover();
    }
    return inspection;
  }

  async function recover() {
    if (!run) return;
    var result = await callTool("swarm.home.recover", {
      residenceId: run.residenceId,
      observedAt: iso()
    }, false);
    if (!result.body.ok) return;
    var recovery = result.body.value;
    var events = recovery.events || recovery.timeline || [];
    if (!Array.isArray(events) && recovery.eventHistory) events = recovery.eventHistory;
    if (!Array.isArray(events)) events = [];
    id("eventCount").textContent = String(events.length);
    var list = id("timeline");
    list.innerHTML = "";
    if (!events.length) {
      list.innerHTML = '<li class="empty">No residence events yet.</li>';
      return;
    }
    events.forEach(function (event) {
      var li = document.createElement("li");
      var title = document.createElement("b");
      title.textContent = event.type || "event";
      var meta = document.createElement("span");
      meta.textContent = (event.occurredAt || "") + " · " + (event.eventId || "");
      li.appendChild(title);
      li.appendChild(meta);
      list.appendChild(li);
    });
  }

  function renderState(state) {
    document.querySelectorAll("#stateRail [data-state]").forEach(function (el) {
      el.classList.remove("active","past");
      var s = el.getAttribute("data-state");
      if (s === state) el.classList.add("active");
      var currentIndex = states.indexOf(state);
      var elIndex = states.indexOf(s);
      if (currentIndex > -1 && elIndex > -1 && elIndex < currentIndex) el.classList.add("past");
    });
  }

  function showResult(label, result) {
    id("lastResult").textContent = label;
    id("evidence").textContent = pretty(result);
  }

  async function executeStep(name) {
    if (!run) freshRun();
    var result;
    if (name === "request") {
      result = await callTool("swarm.home.request", {
        command: {
          requestId: run.requestId,
          residenceId: run.residenceId,
          agentIdentityRef: run.identityRef,
          habitatId: run.habitatId,
          requestedAt: iso(1),
          actorRef: run.actorRef,
          evidenceReceiptIds: []
        },
        observedAt: iso(2)
      });
    } else if (name === "admit") {
      result = await callTool("swarm.home.admit", {
        residenceId: run.residenceId,
        eventId: run.events.admit,
        observedAt: iso(3),
        actorRef: run.actorRef
      });
    } else if (name === "rest") {
      result = await callTool("swarm.home.rest", {
        residenceId: run.residenceId,
        eventId: run.events.rest,
        at: iso(4),
        actorRef: run.actorRef
      });
    } else if (name === "ready") {
      result = await callTool("swarm.home.ready", {
        residenceId: run.residenceId,
        eventId: run.events.ready,
        at: iso(5),
        actorRef: run.actorRef
      });
    } else if (name === "handoff") {
      result = await callTool("swarm.home.handoff", {
        residenceId: run.residenceId,
        agent: {
          identityRef: run.identityRef,
          capabilityRefs: ["capability:demo:bounded-reasoning"],
          offeringRefs: ["offering:demo:next-task"]
        },
        generatedAt: iso(6)
      }, false);
    } else if (name === "depart") {
      result = await callTool("swarm.home.depart", {
        residenceId: run.residenceId,
        eventId: run.events.depart,
        at: iso(7),
        actorRef: run.actorRef,
        reason: "playable Bun demonstration complete"
      });
    } else {
      throw new Error("unknown play step: " + name);
    }
    showResult(name, result);
    if (result.body && result.body.ok) {
      var index = stepNames.indexOf(name);
      if (index >= stepIndex) stepIndex = index + 1;
    }
    await inspect();
    return result;
  }

  async function runFull() {
    freshRun();
    setBusy(true);
    try {
      for (var i = 0; i < stepNames.length; i += 1) {
        var result = await executeStep(stepNames[i]);
        if (!result.body.ok) throw new Error(result.body.error || "step failed: " + stepNames[i]);
        await new Promise(function (resolve) { setTimeout(resolve, 150); });
      }
      id("lastResult").textContent = "complete";
    } catch (error) {
      id("evidence").textContent = pretty({ ok:false, error:String(error) });
      id("lastResult").textContent = "failed";
    } finally {
      setBusy(false);
    }
  }

  function setBusy(busy) {
    document.querySelectorAll("button").forEach(function (button) {
      button.disabled = busy;
    });
  }

  async function reset() {
    var response = await fetch("/play/reset", {
      method:"POST",
      headers:{ "x-swarm-play-token":token }
    });
    var value = await response.json();
    run = null;
    stepIndex = 0;
    id("runId").textContent = "not started";
    id("residenceId").textContent = "none";
    id("eventCount").textContent = "0";
    id("timeline").innerHTML = '<li class="empty">No residence events yet.</li>';
    renderState(null);
    showResult("reset", value);
    await inspect();
  }

  async function denyAtAuthority() {
    await reset();
    freshRun("denied");
    var request = await executeStep("request");
    if (!request.body.ok) return falsifier(false, "request itself failed unexpectedly");
    var admission = await executeStep("admit");
    var value = admission.body && admission.body.value;
    var passed = admission.body.ok && value && value.outcome === "rejected";
    falsifier(passed, passed
      ? "PASS: Atlas denial became a rejected residence, not an admission."
      : "FAIL: denied authority did not produce the expected rejected state.");
  }

  async function illegalTransition() {
    await reset();
    freshRun();
    var request = await executeStep("request");
    if (!request.body.ok) return falsifier(false, "request failed unexpectedly");
    var illegal = await executeStep("ready");
    var passed = !illegal.body.ok;
    falsifier(passed, passed
      ? "PASS: requested → ready was refused. Transition policy held."
      : "FAIL: runtime accepted an illegal transition.");
  }

  async function unauthorizedMutation() {
    await reset();
    freshRun();
    var result = await callTool("swarm.home.request", {
      command: {
        requestId: run.requestId,
        residenceId: run.residenceId,
        agentIdentityRef: run.identityRef,
        habitatId: run.habitatId,
        requestedAt: iso(1),
        actorRef: run.actorRef,
        evidenceReceiptIds: []
      },
      observedAt: iso(2)
    }, false);
    var passed = result.status === 403 && !result.body.ok;
    showResult("unauthorized", result);
    falsifier(passed, passed
      ? "PASS: mutation without the local play token was refused before the router."
      : "FAIL: unauthorised mutation was not refused.");
  }

  function falsifier(passed, message) {
    var el = id("falsifierResult");
    el.className = "falsifier-result " + (passed ? "good" : "bad");
    el.textContent = message;
  }

  document.querySelectorAll("[data-step]").forEach(function (button) {
    button.addEventListener("click", function () {
      executeStep(button.getAttribute("data-step")).catch(function (error) {
        showResult("error", { ok:false, error:String(error) });
      });
    });
  });
  id("runFull").addEventListener("click", runFull);
  id("reset").addEventListener("click", reset);
  id("deny").addEventListener("click", denyAtAuthority);
  id("illegal").addEventListener("click", illegalTransition);
  id("unauthorized").addEventListener("click", unauthorizedMutation);

  inspect().catch(function (error) {
    showResult("boot-error", { ok:false, error:String(error) });
  });
}());`;
