window.XU = {
nowStamp: function(){
const d = new Date();
const hh = String(d.getHours()).padStart(2,'0');
const mm = String(d.getMinutes()).padStart(2,'0');
const ss = String(d.getSeconds()).padStart(2,'0');
return `${hh}:${mm}:${ss}`;
},
normalizeLines: function(text){
const seen = new Set();
const out = [];
(text || "").split(/\r?\n/).map(s=>s.trim()).filter(s=>s.length>0).forEach(s=>{
if (!seen.has(s)){ seen.add(s); out.push(s); }
});
return out;
}
};
