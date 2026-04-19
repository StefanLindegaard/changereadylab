const STORAGE_KEY = "gm2_leadership_module_v1";

function defaultState(){
  return {
    completed: { class1: false, class2: false, class3: false },
    notes: {},
    scores: {}
  };
}

function loadState(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();
  }catch(e){
    return defaultState();
  }
}

let state = loadState();

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateStatus();
}

function updateStatus(){
  const completed = Object.values(state.completed).filter(Boolean).length;
  const reflectionEntries = Object.values(state.notes).filter(v => (v || "").trim().length > 0).length;
  document.getElementById("completedCount").textContent = `${completed} / 3`;
  document.getElementById("reflectionCount").textContent = reflectionEntries;
}

function insightFromAverage(avg){
  if(avg >= 4.2){
    return "Strong signal. Your current answers suggest a leadership team that already shows several change ready behaviors in practice. The next step is to keep this visible and repeatable.";
  }
  if(avg >= 3.2){
    return "Mixed signal. There is a useful base here, but also clear room to strengthen consistency, especially when real pressure rises.";
  }
  return "Early signal. These answers suggest that the mindset may be present in principle, but it is not yet consistently visible in team behavior and routines.";
}

document.querySelectorAll('[data-score]').forEach(input => {
  const key = input.dataset.score;
  if(state.scores[key] != null) input.value = state.scores[key];
  input.addEventListener('input', () => {
    state.scores[key] = input.value;
    saveState();
  });
});

document.querySelectorAll('.score-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cls = btn.dataset.class;
    const keys = [`c${cls}q1`,`c${cls}q2`,`c${cls}q3`];
    const values = keys.map(k => Number(state.scores[k] || document.querySelector(`[data-score="${k}"]`).value || 3));
    const avg = values.reduce((a,b)=>a+b,0) / values.length;
    document.getElementById(`scoreOutput${cls}`).innerHTML = `
      <strong>Average score: ${avg.toFixed(1)} / 5</strong>
      <p>${insightFromAverage(avg)}</p>
    `;
  });
});

document.querySelectorAll('[data-note]').forEach(area => {
  const key = area.dataset.note;
  area.value = state.notes[key] || "";
  area.addEventListener('input', () => {
    state.notes[key] = area.value;
    saveState();
  });
});

document.querySelectorAll('[data-complete]').forEach(box => {
  const key = box.dataset.complete;
  box.checked = !!state.completed[key];
  box.addEventListener('change', () => {
    state.completed[key] = box.checked;
    saveState();
  });
});

function buildSummary(){
  const completed = Object.entries(state.completed).filter(([k,v]) => v).map(([k]) => k.replace("class","Class "));
  const notes = state.notes;
  return `
    <h4>Your module summary</h4>
    <p><strong>Completed:</strong> ${completed.length ? completed.join(", ") : "No classes marked complete yet."}</p>
    <p><strong>Final action:</strong> ${(notes.finalAction || "No action written yet.").replace(/\n/g,"<br>")}</p>
    <p><strong>Useful next move:</strong> Bring one reflection from each class into a live leadership team conversation and define one practical habit to test in the next 30 days.</p>
  `;
}

document.getElementById('summaryBtn').addEventListener('click', () => {
  document.getElementById('summaryOutput').innerHTML = buildSummary();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gm2-leadership-module-notes.json';
  a.click();
});

updateStatus();
