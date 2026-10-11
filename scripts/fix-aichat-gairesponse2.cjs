// getAIResponse() is module-level but used t/tx/card (component-scoped).
// Drop the unused block with a line-ending-agnostic regex.
const fs = require("fs");
const p = "c:\\Users\\Yoga parwezh A\\sih-hack-demo\\src\\AIChatbot.jsx";
let s = fs.readFileSync(p, "utf8");
const tgt = /^    const \{ darkMode \} = useTheme\(\);\s*const t = getTokens\(darkMode\);\s*const tx = t\.text;\s*const card = \{[^;]*\};\s*/m;
const c = s.match(tgt);
if (!c) { console.log("target not found"); process.exit(1); }
s = s.replace(tgt, "");
fs.writeFileSync(p, s);
console.log("trimmed getAIResponse block.");
