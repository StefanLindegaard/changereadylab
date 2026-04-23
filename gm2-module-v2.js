const STORAGE_KEY = "gm2_module_v2_state";
const FEEDBACK = {
q1:{a:"<strong>Your team is probably stronger on intention than on practice.</strong><p>The risk here is that the language of growth mindset remains in place while the real interaction becomes narrower. This often creates the impression that the team is learning oriented, while the actual behavior under pressure becomes more cautious and less exploratory.</p><p>A useful next step is to identify one behavior that changes first when priorities shift. That behavior often tells you more than the language does.</p>",b:"<strong>Your team is probably stronger on reflection than on conversion to action.</strong><p>This can be a strength because it means you are willing to pause and make sense of what is changing. The challenge is that too much processing without enough commitment can make the team feel thoughtful but not decisive.</p><p>The next step is not to talk less. It is to tighten the link between reflection and a clear team level response.</p>",c:"<strong>Your team seems closer to a mature change ready pattern.</strong><p>The main challenge now is consistency. Even strong teams drift when the pressure becomes high enough. The question is whether this quality of conversation remains visible when stakes, deadlines, and political tension all increase at the same time.</p>"},
q2:{a:"<strong>This suggests the collective dynamic is lagging behind the quality of the individuals.</strong><p>That is common. It usually means the team has not yet become deliberate enough about its own habits. The quality of the room is being driven by personalities and circumstances rather than by agreed ways of working together.</p>",b:"<strong>This suggests there is a useful base to build from.</strong><p>Your team already experiences some value from strong discussion. The opportunity is to make that less dependent on mood, chemistry, or the topic and more visible as a team practice.</p>",c:"<strong>This suggests a higher level of team maturity.</strong><p>The challenge now is to keep the team from becoming complacent. Strong collective habits still need refreshing, especially when the context changes and the team itself evolves.</p>"},
q3:{a:"<strong>Your team is likely optimizing for speed.</strong><p>That can create momentum, but in complex situations it often produces only partial alignment. People leave with different readings of the same conversation, which weakens execution later.</p>",b:"<strong>Your team is likely optimizing for cohesion.</strong><p>This protects the atmosphere in the room, but often at the expense of clarity. The risk is that tension stays hidden and shows up later through slower execution, side conversations, or quiet frustration.</p>",c:"<strong>Your team is closer to a learning oriented response.</strong><p>The challenge is to maintain this discipline when the stakes are high. Strong teams still need to guard against drifting into speed or harmony at the wrong time.</p>"},
q4:{a:"<strong>Your team may be strong on recovery but weaker on learning.</strong><p>Moving quickly can feel responsible, but it often skips the deeper value of understanding how the issue emerged. This weakens the feedback loop and increases the chance of repeating the same pattern.</p>",b:"<strong>Your team is willing to look at mistakes, but perhaps not deeply enough yet.</strong><p>The challenge is usually not whether the topic is raised. It is whether the team is willing to examine how its own assumptions, habits, and decision patterns contributed.</p>",c:"<strong>This suggests a stronger learning loop.</strong><p>The real question is whether this quality of examination also happens when the mistake is politically sensitive or reflects badly on the team itself.</p>"},
q5:{a:"<strong>Your collaboration may still be shaped more by negotiation than by joint sense making.</strong><p>Compromise can be useful, but if it becomes the dominant mode the team may never really build a shared view of the wider problem.</p>",b:"<strong>Your team is somewhere in the middle.</strong><p>There is enough openness to understand other perspectives, but perhaps not enough structure to turn that into stronger shared ownership. This is often where deliberate leadership team habits make a difference.</p>",c:"<strong>This suggests a stronger cross-functional mindset.</strong><p>The challenge is to keep it alive when pressure increases and each leader feels pulled back toward protecting their own area.</p>"},
q6:{a:"<strong>Your team may be learning more than it is translating.</strong><p>This is common. It means the reflective work has value, but too little of it becomes visible in routines, expectations, and leadership behavior that others can feel.</p>",b:"<strong>Your team is taking some action, but the signal may still be too weak downstream.</strong><p>The next step is to ask what the people you lead would notice if they had no access to your internal discussions.</p>",c:"<strong>This suggests a stronger scaling discipline.</strong><p>The challenge is to keep it practical and visible. Teams below the leadership level do not experience strategy statements. They experience behavior, routines, clarity, and follow-through.</p>"}
};
function defaultState(){return {completed:{class1:false,class2:false,class3:false,class4:false,class5:false,class6:false},notes:{},answers:{}};}
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();}catch(e){return defaultState();}}
let state = loadState();
function saveState(){localStorage.setItem(STORAGE_KEY, JSON.stringify(state));updateStatus();}
function updateStatus(){
 const completed = Object.values(state.completed).filter(Boolean).length;
 const actionKeys = Object.keys(state.notes).filter(k => k.includes("_action") || k.startsWith("priority_") || k === "progress_signs" || k === "ownership");
 const actionCount = actionKeys.filter(k => (state.notes[k] || "").trim().length > 0).length;
 document.getElementById("completedCount").textContent = `${completed} / 6`;
 document.getElementById("actionCount").textContent = String(actionCount);
}
document.querySelectorAll("[data-complete]").forEach(box => {
 const key = box.dataset.complete;
 box.checked = !!state.completed[key];
 box.addEventListener("change", () => {state.completed[key] = box.checked; saveState();});
});
document.querySelectorAll("[data-note]").forEach(area => {
 const key = area.dataset.note;
 area.value = state.notes[key] || "";
 area.addEventListener("input", () => {state.notes[key] = area.value; saveState();});
});
document.querySelectorAll(".option-group").forEach(group => {
 const q = group.dataset.question;
 const saved = state.answers[q];
 if(saved){ const input = group.querySelector(`input[value="${saved}"]`); if(input) input.checked = true; }
 group.querySelectorAll("input").forEach(input => {
   input.addEventListener("change", () => { state.answers[q] = input.value; saveState(); });
 });
});
document.querySelectorAll(".feedback-btn").forEach(btn => {
 btn.addEventListener("click", () => {
   const q = btn.dataset.question;
   const target = document.getElementById(btn.dataset.target);
   const answer = state.answers[q];
   if(!answer){ target.innerHTML = "<p>Please choose the option that feels closest to your reality first.</p>"; target.classList.add("active"); return; }
   target.innerHTML = FEEDBACK[q][answer] || "<p>No feedback available yet.</p>";
   target.classList.add("active");
 });
});
document.getElementById("exportBtn").addEventListener("click", () => {
 const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
 const a = document.createElement("a");
 a.href = URL.createObjectURL(blob);
 a.download = "growth-mindset-2.0-leadership-teams-notes.json";
 a.click();
});
document.getElementById("summaryBtn").addEventListener("click", () => {
 const actions = [["Class 1",state.notes.c1_action],["Class 2",state.notes.c2_action],["Class 3",state.notes.c3_action],["Class 4",state.notes.c4_action],["Class 5",state.notes.c5_action],["Class 6",state.notes.c6_action]].filter(([,v]) => (v || "").trim().length > 0);
 const priorities = [state.notes.priority_1,state.notes.priority_2,state.notes.priority_3].filter(v => (v || "").trim().length > 0);
 let html = "<h4>Your team action summary</h4>";
 if(actions.length){ html += "<p><strong>Actions captured across the classes:</strong></p><ul>"; actions.forEach(([label,val]) => { html += `<li><strong>${label}:</strong> ${val.replace(/\n/g,"<br>")}</li>`;}); html += "</ul>"; } else { html += "<p>No class actions have been written yet.</p>"; }
 if(priorities.length){ html += "<p><strong>Next 30 days priorities:</strong></p><ol>"; priorities.forEach(val => { html += `<li>${val.replace(/\n/g,"<br>")}</li>`;}); html += "</ol>"; }
 if((state.notes.progress_signs || "").trim()){ html += `<p><strong>Signs of progress:</strong><br>${state.notes.progress_signs.replace(/\n/g,"<br>")}</p>`; }
 if((state.notes.ownership || "").trim()){ html += `<p><strong>Ownership:</strong><br>${state.notes.ownership.replace(/\n/g,"<br>")}</p>`; }
 const output = document.getElementById("summaryOutput");
 output.innerHTML = html;
 output.classList.add("active");
});
updateStatus();
