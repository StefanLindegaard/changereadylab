const STORAGE_KEY = "gm2_module_v4_state";

const mindsetItems = [
  { key:"challenges", title:"Challenges", text:"Think about the last five serious challenges at work. To what degree did you embrace them rather than avoid them?" },
  { key:"feedback", title:"Feedback and criticism", text:"Think of what you have encountered at work over the last year. To what degree did you take useful feedback in and learn from it?" },
  { key:"obstacles", title:"Obstacles", text:"Consider hard obstacles that you met during the last year. To what degree did you fight through them rather than give up or look for quick escape routes?" },
  { key:"success", title:"Success of others", text:"Consider recent successes by your colleagues. To what degree did you feel inspired and learn from this rather than feel threatened?" },
  { key:"mistakes", title:"Mistakes", text:"Look back at your recent mistakes at work. To what degree did you learn something valuable from them?" }
];

const teamItems = [
  { key:"anticipation", title:"Anticipation and preparation", text:"How adept is your team at anticipating possible changes and preparing strategies or backup plans to manage them?" },
  { key:"adaptability", title:"Adaptability and role flexibility", text:"How well does your team adjust its skills, knowledge, and roles during times of change?" },
  { key:"communication", title:"Communication", text:"How effective, transparent, and consistent is communication within your team during times of change?" },
  { key:"emotional", title:"Emotional readiness", text:"To what extent does your team display emotional readiness and stability, and what is the level of psychological safety during changes?" },
  { key:"leadership", title:"Leadership during change", text:"How effectively does the leadership above or around your team guide, support, and provide clear direction during change processes?" }
];

const FEEDBACK = {
  sit1: {
    a: "<strong>This prioritizes speed, but often leaves hidden misalignment behind.</strong><p>The team may appear aligned on the surface, while different people leave with different interpretations of what the problem really is and what should happen next.</p>",
    b: "<strong>This protects the atmosphere, but may avoid the real issue.</strong><p>The risk is that the team remains constructive without becoming fully honest. That often slows execution later.</p>",
    c: "<strong>This is closer to learning oriented leadership.</strong><p>The challenge is to do this without drifting into endless discussion. Strong leaders slow down just enough to understand before they speed up again.</p>"
  },
  sit2: {
    a: "<strong>This creates fast recovery, but often weak learning.</strong><p>When leaders move too quickly to fixing the issue, they can miss what the situation reveals about assumptions, routines, and their own leadership pattern.</p>",
    b: "<strong>This creates some reflective space, but may still be too safe.</strong><p>The question is whether the conversation really examines leadership behavior or mainly stays at a comfortable distance.</p>",
    c: "<strong>This is a stronger learning discipline.</strong><p>It turns a setback into a leadership mirror rather than just a problem to clean up. That is where real capability can grow.</p>"
  },
  sit3: {
    a: "<strong>This can keep things moving, but compromise is not the same as shared ownership.</strong><p>The risk is that each function protects its own reality and the team never fully works from a broader view of the problem.</p>",
    b: "<strong>This is better, but may still stop short of real integration.</strong><p>Understanding perspectives matters, but the team also needs to build a wider shared interpretation before acting.</p>",
    c: "<strong>This is stronger cross functional leadership.</strong><p>It requires more patience up front, but often creates better alignment, stronger execution, and less friction later.</p>"
  }
};

function defaultState(){
  return {
    completed: {section1:false,section2:false,section3:false,section4:false,section5:false,section6:false},
    notes: {},
    checks: {},
    answers: {},
    mindsetScores: {},
    teamScores: {}
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
  const assessmentCount = [calcMindsetTotal() > 0, calcTeamTotal() > 0, !!state.answers.zone_where].filter(Boolean).length;
  document.getElementById("completedCount").textContent = `${completed} / 6`;
  document.getElementById("assessmentCount").textContent = `${assessmentCount} / 3`;
}
function calcMindsetTotal(){
  return mindsetItems.reduce((sum,item)=>sum + Number(state.mindsetScores[item.key] || 0),0);
}
function calcTeamTotal(){
  return teamItems.reduce((sum,item)=>sum + Number(state.teamScores[item.key] || 0),0);
}
function renderAssessment(rootId, items, stateKey){
  const root = document.getElementById(rootId);
  let html = "";
  items.forEach(item => {
    const current = state[stateKey][item.key] || "";
    html += `
      <div class="score-card">
        <h4>${item.title}</h4>
        <p>${item.text}</p>
        <div class="scale-row">
          ${[1,2,3,4,5,6].map(n => `
            <label>
              <input type="radio" name="${rootId}_${item.key}" value="${n}" ${String(current)===String(n) ? "checked" : ""} />
              <span>${n}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;
  });
  root.innerHTML = html;
  items.forEach(item => {
    root.querySelectorAll(`input[name="${rootId}_${item.key}"]`).forEach(input => {
      input.addEventListener("change", () => {
        state[stateKey][item.key] = input.value;
        saveState();
      });
    });
  });
}
function mindsetInterpretation(total){
  if(total <= 14){
    return "<strong>Your current pattern looks more protective than growth oriented.</strong><p>This does not mean you are a fixed mindset leader in any simplistic sense. It suggests that challenge, criticism, obstacles, or mistakes often pull you toward caution, protection, or self preservation. That is useful to see clearly because Growth Mindset 2.0 starts with realism, not aspiration.</p>";
  }
  if(total <= 22){
    return "<strong>Your pattern looks mixed and situational.</strong><p>This is often the most realistic outcome. You are likely stronger in some areas than others. The opportunity now is to understand what kinds of situations move you toward fear, defensiveness, or retreat, and what helps you stay in learning.</p>";
  }
  return "<strong>Your pattern looks relatively growth oriented.</strong><p>The useful question now is where this remains true under pressure. Strong scores are valuable, but they matter most when challenge, feedback, mistakes, and uncertainty are all present at the same time.</p>";
}
function teamInterpretation(total){
  if(total <= 14){
    return "<strong>Your team currently looks underprepared for change.</strong><p>This usually means the issue is not only skill. It is also anticipation, communication, emotional readiness, and the quality of leadership support around change. The good news is that these are workable areas if you focus on them deliberately.</p>";
  }
  if(total <= 22){
    return "<strong>Your team shows moderate readiness.</strong><p>There are strengths in place, but also clear weak points. This often describes teams that can absorb change up to a point, but struggle when several changes overlap or when communication and psychological safety become strained.</p>";
  }
  return "<strong>Your team appears relatively ready for change.</strong><p>The opportunity now is to examine where that readiness still becomes uneven. Teams can score well overall while still having one or two weak dimensions that create friction when change becomes more complex.</p>";
}
function checked(prefix){
  return Object.keys(state.checks).filter(k => k.startsWith(prefix) && state.checks[k]);
}

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

document.querySelectorAll("[data-check]").forEach(box => {
  const key = box.dataset.check;
  box.checked = !!state.checks[key];
  box.addEventListener("change", () => {
    state.checks[key] = box.checked;
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

document.getElementById("reframeBtn").addEventListener("click", () => {
  const hits = checked("reframe_");
  let html = "";
  if(hits.length === 0){
    html = "<strong>You may be reading this more conceptually than practically.</strong><p>Try selecting the statements that feel uncomfortable because they are at least partly true. This module will be most useful if you let it work on the realities you usually prefer to move past quickly.</p>";
  } else if(hits.length <= 2){
    html = "<strong>You are recognizing some meaningful gaps.</strong><p>This suggests you already sense where the tension sits between intention and behavior. The next step is to make those gaps more specific instead of keeping them at a conceptual level.</p>";
  } else {
    html = "<strong>You are probably dealing with a partial version of growth mindset today.</strong><p>The language is there, but the patterns under pressure still need work. That is exactly what Growth Mindset 2.0 is meant to address.</p>";
  }
  const out = document.getElementById("reframeOutput");
  out.innerHTML = html;
  out.classList.add("active");
});

document.getElementById("zoneBtn").addEventListener("click", () => {
  const zone = state.answers.zone_where;
  const benefits = checked("comfort_");
  const costs = checked("cost_");
  let html = "";
  if(!zone){
    html = "<p>Please choose where you were mostly operating in that real situation first.</p>";
  } else {
    const zoneMap = {
      comfort: "You are likely staying with what feels known, efficient, and in control.",
      fear: "You are likely close to the edge where defensiveness, caution, silence, or control begin to show up.",
      learning: "You are likely staying open long enough to explore, question, and adjust.",
      growth: "You are likely starting to turn learning into a stronger and more repeatable capability."
    };
    html += `<strong>${zoneMap[zone]}</strong>`;
    html += `<p>The important issue is not whether this zone is good or bad. It is whether you understand what keeps you there and what would help you move forward more deliberately.</p>`;
    if(benefits.length){
      html += `<p><strong>Your comfort zone currently gives you:</strong> ${benefits.map(v => v.replace("comfort_","").replace("lowstress","lower stress").replace("reliability","reliable performance")).join(", ")}.</p>`;
    }
    if(costs.length){
      html += `<p><strong>The likely cost of staying too long there:</strong> ${costs.map(v => v.replace("cost_","").replace("growth","reduced growth and learning").replace("missed","missed opportunities").replace("stuck","status quo").replace("lazy","over reliance on routines")).join(", ")}.</p>`;
    }
    html += "<p>The practical question now is what small move would help you stay in learning for longer the next time a similar situation appears.</p>";
  }
  const out = document.getElementById("zoneOutput");
  out.innerHTML = html;
  out.classList.add("active");
});

document.querySelectorAll(".feedback-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const q = btn.dataset.question;
    const target = document.getElementById(btn.dataset.target);
    const answer = state.answers[q];
    if(!answer){
      target.innerHTML = "<p>Please choose the option that feels closest to your likely response first.</p>";
      target.classList.add("active");
      return;
    }
    target.innerHTML = FEEDBACK[q][answer] || "<p>No feedback available yet.</p>";
    target.classList.add("active");
  });
});

document.getElementById("mindsetBtn").addEventListener("click", () => {
  const total = calcMindsetTotal();
  const out = document.getElementById("mindsetOutput");
  if(total === 0){
    out.innerHTML = "<p>Please complete the mindset assessment first.</p>";
  } else {
    out.innerHTML = `${mindsetInterpretation(total)}<p><strong>Your score:</strong> ${total} out of 30.</p><p>A useful next question is where this score would drop fastest under real pressure. That is usually where Growth Mindset 2.0 needs to become more practical.</p>`;
  }
  out.classList.add("active");
});

document.getElementById("teamBtn").addEventListener("click", () => {
  const total = calcTeamTotal();
  const out = document.getElementById("teamOutput");
  if(total === 0){
    out.innerHTML = "<p>Please complete the team readiness assessment first.</p>";
  } else {
    out.innerHTML = `${teamInterpretation(total)}<p><strong>Your score:</strong> ${total} out of 30.</p><p>The useful move now is not just to note the number. It is to identify which dimension is most likely to hold the team back when change becomes faster, more emotional, or more cross functional.</p>`;
  }
  out.classList.add("active");
});

document.getElementById("summaryBtn").addEventListener("click", () => {
  const priorities = checked("priority_").map(v => v.replace("priority_","").replace("team","team readiness").replace("cross","cross functional work"));
  let html = "<h3>Your action summary</h3>";
  if(priorities.length){
    html += `<p><strong>Priority focus:</strong> ${priorities.join(", ")}.</p>`;
  }
  ["action_behavior","action_habit","action_test","action_team","action_progress","action_support"].forEach(key => {
    if((state.notes[key] || "").trim()){
      const labels = {
        action_behavior:"Leadership behavior",
        action_habit:"Habit or routine",
        action_test:"Real situation to test this in",
        action_team:"How your team should experience the change",
        action_progress:"How you will know it is working",
        action_support:"Support or accountability"
      };
      html += `<p><strong>${labels[key]}:</strong><br>${state.notes[key].replace(/\n/g,"<br>")}</p>`;
    }
  });
  const out = document.getElementById("summaryOutput");
  out.innerHTML = html;
  out.classList.add("active");
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gm2-module-v4-notes.json";
  a.click();
});

renderAssessment("mindsetAssessment", mindsetItems, "mindsetScores");
renderAssessment("teamAssessment", teamItems, "teamScores");
updateStatus();
