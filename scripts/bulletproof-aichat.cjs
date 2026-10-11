// Bulletproof: avoid any ReferenceError on `t` at Render time.
const fs = require("fs");
const p = "c:\\Users\\Yoga parwezh A\\sih-hack-demo\\src\\AIChatbot.jsx";
let s = fs.readFileSync(p, "utf8");
let n = 0;
const rep = (o, nw) => {
    const c = (s.match(new RegExp(o, "g")) || []).length;
    s = s.replace(new RegExp(o, "g"), nw);
    n += c;
};
// Guard against an undefined `t` at Render time (stale/edge environments).
rep("background: t.glass.panel,", 'background: (typeof t !== "undefined" && t.glass?.panel) ?? "rgba(255,255,255,0.55)",');
rep("`1px solid ${t.border.subtle}`", '(typeof t !== "undefined" && t.border?.subtle) ?? "rgba(22,22,42,0.12)"');
fs.writeFileSync(p, s);
console.log("guards applied x" + n);
