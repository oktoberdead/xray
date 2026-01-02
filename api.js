window.XAPI = (function(){
const TOKEN = "secret123"; // поменяй, если у тебя другой
function url(q){ return "/cgi-bin/xray-api?" + q + "&token=" + encodeURIComponent(TOKEN); }

async function getState(){ return fetch(url("action=state")).then(r=>r.json()); }
async function getPolicy(){ return fetch(url("action=get_policy")).then(r=>r.json()); }
async function setPolicy(obj){
return fetch(url("action=set_policy"), {
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify(obj)
}).then(r=>r.json());
}
async function hardToggle(){ return fetch(url("action=hard_toggle")).then(r=>r.json()); }
async function hosts(){ return fetch(url("action=hosts")).then(r=>r.json()); }

return { getState, getPolicy, setPolicy, hardToggle, hosts };
