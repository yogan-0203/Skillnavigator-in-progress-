// AIChatbot.jsx: module-scope `t.` references (FAB, Drawer PaperProps).
const fs = require("fs");
const p = "c:\\Users\\Yoga parwezh A\\sih-hack-demo\\src\\AIChatbot.jsx";
let s = fs.readFileSync(p, "utf8");
const before = s;
s = s.replace(/color:\s*t\.primary, width:\s*56, height:\s*56,/,
    "color: \"#fff\", width: 56, height: 56,");
s = s.replace(/PaperProps=\{sx:\s*\{width:\s*400, maxWidth:\s*\"90vw\",\s*\n\s*background:\s*t\.glass\.panel,/,
    "PaperProps={{sx: {width: 400, maxWidth: \"90vw\",\n                    background: \"rgba(255,255,255,0.55)\", backdropFilter: \"blur(24px) saturate(1.3)\",");
fs.writeFileSync(p, s);
console.log("AIChatbot fixed:", s !== before ? "yes" : "no");
