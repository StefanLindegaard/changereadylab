const STORAGE_KEY = "gm2_module_v3_state";

const INDICATORS = [
  { key:"disagreement", label:"Handling disagreement", desc:"How well your team explores different views before moving toward alignment." },
  { key:"mistakes", label:"Working with mistakes", desc:"How well the team learns from setbacks without blame or avoidance." },
  { key:"crossfunctional", label:"Cross-functional collaboration", desc:"How well leaders move beyond their own function and work from shared ownership." },
  { key:"uncertainty", label:"Dealing with uncertainty", desc:"How well the team stays open long enough to understand what is really changing." },
  { key:"feedback", label:"Feedback and challenge", desc:"How directly and constructively leaders challenge each other when it matters." },
  { key:"translation", label:"Turning reflection into action", desc:"How well insight becomes practical direction, habits, and follow-through." }
];

const FEEDBACK = {
  intro_q: {
    a: "<strong>Your team probably already has the language, but not yet the consistency.</strong><p>This is often where the real work starts. The challenge is not more awareness. The challenge is making the desired behavior visible when pressure is high and time feels short.</p>",
    b: "<strong>Your team is likely uneven rather than weak.</strong><p>That usually means there are good elements already in place, but too much still depends on the situation, the topic, or the people involved. The opportunity is to make stronger patterns more repeatable.</p>",
    c: "<strong>Your team has useful maturity to build on.</strong><p>The challenge is to avoid assuming that what works now will continue to work as the context changes. Strong teams still need to examine where they drift under pressure.</p>"
  },
  zone_q: {
    comfort: "<strong>Your team may be staying within patterns that feel familiar.</strong><p>That can support stability, but it can also limit learning. The key question is whether the team is stretching enough to adapt when the context demands something different.</p>",
    fear: "<strong>Your team is probably closer to the real edge of the work.</strong><p>The fear zone is not failure. It is where defensiveness, silence, control, or hesitation start to show up. The opportunity is to notice it early and shift the team into learning rather than letting fear define the conversation.</p>",
    learning: "<strong>Your team is likely doing the most important work here.</strong><p>The learning zone is where uncertainty is still present, but the team is able to stay open, ask better questions, and adjust. The challenge is to remain there long enough to generate useful movement.</p>",
    growth: "<strong>Your team may already be integrating new capability.</strong><p>The question now is whether this is visible only in a few situations or whether it is starting to become part of normal leadership practice.</p>"
  },
  sit1_q: {
    a: "<strong>This optimizes for speed, but often at the cost of shared understanding.</strong><p>The risk is that the team appears aligned while different people leave with different interpretations of the issue and the way forward.</p>",
    b: "<strong>This protects the atmosphere, but can leave real tension under the surface.</strong><p>The risk is that the team avoids the exact discussion that would create stronger clarity and ownership.</p>",
    c: "<strong>This is closer to a learning-oriented response.</strong><p>The challenge is whether your team can keep doing this when pressure becomes even stronger and patience becomes shorter.</p>"
  },
  sit2_q: {
    a: "<strong>This may create fast recovery, but weaker learning.</strong><p>When the team moves too quickly to solutions, it often misses what the situation reveals about its assumptions, habits, and decision patterns.</p>",
    b: "<strong>This creates some space for reflection, but may still be too safe.</strong><p>The question is whether the team is really examining itself or mainly talking around the issue.</p>",
    c: "<strong>This is a stronger learning discipline.</strong><p>The key is whether the team can keep this quality of reflection even when the mistake is politically sensitive or personally uncomfortable.</p>"
  }
};

function defaultState(){
  return {
    completed: { part1:false, part2:false, part3:false, part4:false, part5:false, part6:false },
    notes: {},
    answers: {},
    ranges: {},
    indicatorScores: {}
  };
}
function loadState(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState(); }
  catch(e){ return defaultState(); }
}
let state = loadState();

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateStatus();
}

function updateStatus(){
  const completed = Object.values(state.completed).filter(Boolean).length;
  const actionCount = Object.values(state.notes).filter(v => (v || "").trim().length > 0).length;
  document.getElementById("completedCount").textContent = `${completed} / 6`;
  document.getElementById("actionCount").textContent = String(actionCount);
}

function renderIndicatorTable(){
  const root = document.getElementById("indicatorTable");
  let html = `
    <div class="indicator-row header">
      <div>Indicator</div>
      <div>Current</div>
      <div>Desired</div>
    </div>
  `;
  INDICATORS.forEach(ind => {
    const current = state.indicatorScores[ind.key]?.current || "3";
    const desired = state.indicatorScores[ind.key]?.desired || "4";
    html += `
      <div class="indicator-row">
        <div class="indicator-label">
          <strong>${ind.label}</strong>
          <small>${ind.desc}</small>
        </div>
        <div class="select-wrap">
          <select data-indicator="${ind.key}" data-type="current">
            ${[1,2,3,4,5].map(n => `<option value="${n}" ${String(n)===String(current)?"selected":""}>${n}</option>`).join("")}
          </select>
        </div>
        <div class="select-wrap">
          <select data-indicator="${ind.key}" data-type="desired">
            ${[1,2,3,4,5].map(n => `<option value="${n}" ${String(n)===String(desired)?"selected":""}>${n}</option>`).join("")}
          </select>
        </div>
      </div>
    `;
  });
  root.innerHTML = html;

  document.querySelectorAll("[data-indicator]").forEach(sel => {
    sel.addEventListener("change", () => {
      const key = sel.dataset.indicator;
      const type = sel.dataset.type;
      state.indicatorScores[key] = state.indicatorScores[key] || {};
      state.indicatorScores[key][type] = sel.value;
      saveState();
    });
  });
}

function gapInterpretation(avgGap, topGapLabel){
  if(avgGap >= 1.6){
    return `<strong>Your team is signalling significant ambition and real tension.</strong><p>The biggest gap appears around <strong>${topGapLabel}</strong>. This often means the team can already see what stronger change readiness would look like, but is not yet experiencing it consistently in practice. That can be productive if it leads to honest conversation and focused action. It becomes frustrating if the gap remains visible but untouched.</p>`;
  }
  if(avgGap >= 1.0){
    return `<strong>Your team shows moderate but meaningful gaps.</strong><p>The pattern suggests that your team is not starting from scratch, but there are still clear areas where current behavior and desired behavior do not match. The most useful move now is to identify where improving one or two behaviors would have the strongest effect on the whole team.</p>`;
  }
  return `<strong>Your team shows relatively smaller gaps overall.</strong><p>That may reflect a stronger current reality, but it can also mean your ambition is set too cautiously. The useful question is whether your desired state is truly stretching the team or simply describing what already feels manageable.</p>`;
}

document.getElementById("analyzeGapBtn").addEventListener("click", () => {
  const gaps = INDICATORS.map(ind => {
    const current = Number(state.indicatorScores[ind.key]?.current || 3);
    const desired = Number(state.indicatorScores[ind.key]?.desired || 4);
    return { label: ind.label, gap: desired - current, current, desired };
  });
  const avgGap = gaps.reduce((a,b) => a + b.gap, 0) / gaps.length;
  const top = gaps.sort((a,b) => b.gap - a.gap)[0];
  const summary = document.getElementById("gapSummary");
  summary.innerHTML = `
    ${gapInterpretation(avgGap, top.label)}
    <p><strong>Largest gap:</strong> ${top.label} (${top.current} → ${top.desired})</p>
    <p><strong>Working question:</strong> If your team improved only one of these areas in the next 30 to 60 days, which would create the most positive effect on how you handle change, pressure, and cross-functional work?</p>
  `;
  summary.classList.add("active");
});

document.querySelectorAll("[data-complete]").forEach(box => {
  const key = box.dataset.complete;
  box.checked = !!state.completed[key];
  box.addEventListener("change", () => {
    state.completed[key] = box.checked;
    saveState();
  });
});

document.querySelectorAll("[data-note]").forEach(area => {
  const key = area.dataset.note;
  area.value = state.notes[key] || "";
  area.addEventListener("input", () => {
    state.notes[key] = area.value;
    saveState();
  });
});

document.querySelectorAll(".option-group").forEach(group => {
  const q = group.dataset.question;
  if(!q) return;
  const saved = state.answers[q];
  if(saved){
    const input = group.querySelector(`input[value="${saved}"]`);
    if(input) input.checked = true;
  }
  group.querySelectorAll("input[type='radio']").forEach(input => {
    input.addEventListener("change", () => {
      state.answers[q] = input.value;
      saveState();
    });
  });
});

document.querySelectorAll("[data-range]").forEach(r => {
  const key = r.dataset.range;
  if(state.ranges[key]) r.value = state.ranges[key];
  r.addEventListener("input", () => {
    state.ranges[key] = r.value;
    saveState();
  });
});

document.querySelectorAll(".feedback-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const q = btn.dataset.question;
    const target = document.getElementById(btn.dataset.target);
    const answer = state.answers[q];
    if(!answer){
      target.innerHTML = "<p>Please choose the option that feels closest to your reality first.</p>";
      target.classList.add("active");
      return;
    }
    target.innerHTML = FEEDBACK[q][answer] || "<p>No feedback available yet.</p>";
    target.classList.add("active");
  });
});

document.getElementById("miniMapBtn").addEventListener("click", () => {
  const a = Number(state.ranges.m1 || 3);
  const b = Number(state.ranges.m2 || 3);
  const c = Number(state.ranges.m3 || 3);
  const avg = (a+b+c)/3;
  let text = "";
  if(avg < 2.5){
    text = "<strong>This specific situation suggests your team had limited room for open learning.</strong><p>The likely pattern is that pressure, uncertainty, or tension narrowed the conversation before the team had really understood what was going on. That is not unusual, but it is useful to name it clearly.</p>";
  } else if(avg < 4){
    text = "<strong>This situation suggests a mixed response.</strong><p>Your team created some space for discussion and direction, but probably not enough to say you worked through the situation fully. This is often where useful progress is possible if the team becomes more deliberate.</p>";
  } else {
    text = "<strong>This situation suggests a stronger response.</strong><p>Your team appears to have handled the discussion with a reasonable balance of openness and direction. The question now is whether that quality is consistent across situations or only visible when conditions are more favorable.</p>";
  }
  const target = document.getElementById("miniMapFeedback");
  target.innerHTML = text;
  target.classList.add("active");
});

document.querySelectorAll("[data-priority]").forEach(cb => {
  cb.checked = !!state.answers[`priority_${cb.dataset.priority}`];
  cb.addEventListener("change", () => {
    state.answers[`priority_${cb.dataset.priority}`] = cb.checked;
    saveState();
  });
});

document.getElementById("summaryBtn").addEventListener("click", () => {
  const priorities = [
    state.notes.priority_1,
    state.notes.priority_2,
    state.notes.priority_3
  ].filter(v => (v || "").trim().length > 0);

  let selectedAreas = Object.keys(state.answers)
    .filter(k => k.startsWith("priority_") && state.answers[k] === true)
    .map(k => k.replace("priority_", "").replace("_", " "));

  const output = document.getElementById("summaryOutput");
  let html = "<h3>Your team action summary</h3>";

  if(selectedAreas.length){
    html += `<p><strong>Priority areas:</strong> ${selectedAreas.join(", ")}</p>`;
  }

  if(priorities.length){
    html += "<p><strong>Next 30 days priorities:</strong></p><ol>";
    priorities.forEach(p => { html += `<li>${p.replace(/\n/g,"<br>")}</li>`; });
    html += "</ol>";
  }

  if((state.notes.habit_note || "").trim()){
    html += `<p><strong>Team habit:</strong><br>${state.notes.habit_note.replace(/\n/g,"<br>")}</p>`;
  }
  if((state.notes.apply_note || "").trim()){
    html += `<p><strong>Real situation to apply this in:</strong><br>${state.notes.apply_note.replace(/\n/g,"<br>")}</p>`;
  }
  if((state.notes.trickle_note || "").trim()){
    html += `<p><strong>How teams below us should notice the change:</strong><br>${state.notes.trickle_note.replace(/\n/g,"<br>")}</p>`;
  }
  if((state.notes.ownership_note || "").trim()){
    html += `<p><strong>Ownership:</strong><br>${state.notes.ownership_note.replace(/\n/g,"<br>")}</p>`;
  }

  output.innerHTML = html;
  output.classList.add("active");
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gm2-tool-driven-module-v3-notes.json";
  a.click();
});

renderIndicatorTable();
updateStatus();
