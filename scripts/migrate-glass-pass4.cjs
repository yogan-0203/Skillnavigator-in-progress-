// Pass 4: DomainSelector — plain <Box> panel with white-on-white text.
const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "src", "DomainSelector.jsx");
let s = fs.readFileSync(p, "utf8");
let n = 0;
const rep = (re, to) => {
    const c = (s.match(re) || []).length;
    s = s.replace(re, to);
    n += c;
};
// glass panel base
rep(/(animation: "fadeInScale 0\.4s ease" \{\}\s*)$/m, "$1, background: t.glass.inset");
rep(/borderRadius:\s*"16px"/, `borderRadius: "16px", border: \`1px solid \${t.border.subtle}\``);
rep(/background:\s*"rgba\(255,255,255,0\.02\)"/g, "background: t.glass.inset");
rep(/border:\s*"1px solid rgba\(255,255,255,0\.04\)/, `border: \`1px solid \${t.border.subtle}`);
rep(/color:\s*"rgba\(255,255,255,0\.5\)/, 'color: t.text.primary');
rep(/color:\s*"rgba\(255,255,255,0\.4\)/, 'color: t.text.primary');
rep(/color:\s*"rgba\(255,255,255,0\.3\)/g, 'color: t.text.secondary');
rep(/backgroundColor:\s*"rgba\(255,255,255,0\.05\)/, "backgroundColor: t.glass.inset");

fs.writeFileSync(p, s);
console.log(`DomainSelector patched: ${n} replacements.`);
