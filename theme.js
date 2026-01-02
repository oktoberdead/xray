window.XTHEME = (function(){
const LS_KEY = "xray_theme_store_v1";
let presets = [];
let current = { mode:"preset", presetId:"dark_default", custom:{ bg:"#010101", fg:"#7ca376", accent:"#7ca376", panel:"#0b0b0b" } };

function setVars(v){
const r = document.documentElement.style;
r.setProperty("--bg", v.bg);
r.setProperty("--fg", v.fg);
r.setProperty("--accent", v.accent);
r.setProperty("--panel", v.panel);
r.setProperty("--panel2", v.panel);
}

function applyPreset(p){
document.documentElement.dataset.theme = (p.id === "light_soft") ? "light" : "dark";
// даже в light мы всё равно выставим vars (чтобы пики совпадали)
setVars(p.vars);
}

function applyCustom(c){
document.documentElement.dataset.theme = "custom";
setVars(c);
}

function syncPickersToComputed(){
const cs = getComputedStyle(document.documentElement);
const v = {
bg: cs.getPropertyValue("--bg").trim(),
fg: cs.getPropertyValue("--fg").trim(),
accent: cs.getPropertyValue("--accent").trim(),
panel: cs.getPropertyValue("--panel").trim()
};

document.getElementById("c-bg").value = v.bg || "#000000";
document.getElementById("c-fg").value = v.fg || "#ffffff";
document.getElementById("c-accent").value = v.accent || "#00ff66";
document.getElementById("c-panel").value = v.panel || "#0b0b0b";

updateHexLabels();
}

function updateHexLabels(){
const map = [
["c-bg","t-bg","--bg"],
["c-fg","t-fg","--fg"],
["c-accent","t-accent","--accent"],
["c-panel","t-panel","--panel"]
];
map.forEach(([cid,tid,key])=>{
const val = document.getElementById(cid).value;
document.getElementById(tid).textContent = `${key}: ${val}`;
});
}

function loadStore(){
try{
const s = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
if (s && s.mode) current = s;
}catch(e){}
}

function saveStore(){
localStorage.setItem(LS_KEY, JSON.stringify(current));
}

function findPreset(id){
return presets.find(p=>p.id===id) || presets[0];
}

async function loadPresets(){
const data = await fetch("/xray/themes.json").then(r=>r.json());
presets = (data.presets || []);
}

function applyFromStore(){
if (!presets.length) return;
if (current.mode === "custom"){
applyCustom(current.custom);
} else {
const p = findPreset(current.presetId);
applyPreset(p);
}
}

function fillPresetSelect(){
const sel = document.getElementById("theme-preset");
sel.innerHTML = "";
presets.forEach(p=>{
const opt = document.createElement("option");
opt.value = p.id;
opt.textContent = p.name;
sel.appendChild(opt);
});
sel.value = current.presetId;
}

function openModal(){
fillPresetSelect();
document.getElementById("theme-mode").value = current.mode || "preset";
syncPickersToComputed();

document.getElementById("theme-backdrop").style.display="block";
document.getElementById("theme-modal").style.display="flex";
}

function closeModal(){
document.getElementById("theme-backdrop").style.display="none";
document.getElementById("theme-modal").style.display="none";
}

function bindUI(){
// live hex update (и input, и change)
const ids = new Set(["c-bg","c-fg","c-accent","c-panel"]);
document.addEventListener("input", (e)=>{ if(ids.has(e.target.id)) updateHexLabels(); }, true);
document.addEventListener("change", (e)=>{ if(ids.has(e.target.id)) updateHexLabels(); }, true);

document.getElementById("theme-preset").addEventListener("change", ()=>{
current.mode = "preset";
current.presetId = document.getElementById("theme-preset").value;
const p = findPreset(current.presetId);
applyPreset(p);
saveStore();
syncPickersToComputed();
document.getElementById("theme-mode").value = "preset";
});

document.getElementById("theme-mode").addEventListener("change", ()=>{
current.mode = document.getElementById("theme-mode").value;
if (current.mode === "preset"){
const p = findPreset(current.presetId);
applyPreset(p);
saveStore();
syncPickersToComputed();
} else {
// перейти в custom: берём текущие computed как старт
const cs = getComputedStyle(document.documentElement);
current.custom = {
bg: cs.getPropertyValue("--bg").trim(),
fg: cs.getPropertyValue("--fg").trim(),
accent: cs.getPropertyValue("--accent").trim(),
panel: cs.getPropertyValue("--panel").trim()
};
applyCustom(current.custom);
saveStore();
syncPickersToComputed();
}
});

document.getElementById("theme-save").addEventListener("click", ()=>{
current.mode = document.getElementById("theme-mode").value;
if (current.mode === "custom"){
current.custom = {
bg: document.getElementById("c-bg").value,
fg: document.getElementById("c-fg").value,
accent: document.getElementById("c-accent").value,
panel: document.getElementById("c-panel").value
};
applyCustom(current.custom);
} else {
current.presetId = document.getElementById("theme-preset").value;
applyPreset(findPreset(current.presetId));
}
saveStore();
closeModal();
});

document.getElementById("theme-cancel").addEventListener("click", closeModal);
document.getElementById("theme-backdrop").addEventListener("click", closeModal);

// When in custom, apply live on picker changes (real-time)
["c-bg","c-fg","c-accent","c-panel"].forEach(id=>{
document.getElementById(id).addEventListener("input", ()=>{
if (document.getElementById("theme-mode").value !== "custom") return;
current.mode = "custom";
current.custom = {
bg: document.getElementById("c-bg").value,
fg: document.getElementById("c-fg").value,
accent: document.getElementById("c-accent").value,
panel: document.getElementById("c-panel").value
};
applyCustom(current.custom);
saveStore();
updateHexLabels();
});
});
}

async function init(){
loadStore();
await loadPresets();
applyFromStore();
// sync custom to current computed if empty
const cs = getComputedStyle(document.documentElement);
current.custom = current.custom || {
bg: cs.getPropertyValue("--bg").trim(),
fg: cs.getPropertyValue("--fg").trim(),
accent: cs.getPropertyValue("--accent").trim(),
panel: cs.getPropertyValue("--panel").trim()
};
saveStore();
bindUI();
}

return { init, openModal, closeModal, updateHexLabels, syncPickersToComputed };
})();
