// Roadmap.jsx used an undefined `tx` — map to the existing `t` token object.
const fs = require("fs");
const p = "c:\\Users\\Yoga parwezh A\\sih-hack-demo\\src\\Roadmap.jsx";
let s = fs.readFileSync(p, "utf8");
const before = s;
const re = /\btx\.(muted|secondary|alert|highlight|primary)/g;
let c = 0;
s = s.replace(re, (m, k) => `t.${k}`);
fs.writeFileSync(p, s);
console.log("Roadmap tx->t fixed:", s !== before ? c : 0);
