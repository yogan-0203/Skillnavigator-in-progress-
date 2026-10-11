// Remove a stray double quote left after a template-literal replacement.
const fs = require("fs");
const p = "c:\\Users\\Yoga parwezh A\\sih-hack-demo\\src\\DomainSelector.jsx";
let s = fs.readFileSync(p, "utf8");
const before = s;
s = s.replace(/border:\s*`1px solid \${t.border.subtle}"/g, "border: `1px solid ${t.border.subtle}`");
fs.writeFileSync(p, s);
console.log("fixed:" + (s !== before));
