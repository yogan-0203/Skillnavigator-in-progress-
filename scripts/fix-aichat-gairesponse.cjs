// Remove unused token block from module-level getAIResponse (t is only in scope inside the component).
const fs = require("fs");
const p = "c:\\Users\\Yoga parwezh A\\sih-hack-demo\\src\\AIChatbot.jsx";
let s = fs.readFileSync(p, "utf8");
const idx = s.indexOf("const getAIResponse = (message) => {");
const tgt = "const getAIResponse = (message) => {\n    const { darkMode } = useTheme();\n    const t = getTokens(darkMode);\n    const tx = t.text;\n    const card = { border: `1px solid ${t.border.subtle}`, borderRadius: \"20px\", background: t.glass.face };\n    const lowerMsg = message.toLowerCase().trim();";
if (s.indexOf(tgt) < 0) { console.log("target not found"); process.exit(1); }
s = s.replace(tgt, "const getAIResponse = (message) => {\n    const lowerMsg = message.toLowerCase().trim();");
fs.writeFileSync(p, s);
console.log("trimmed getAIResponse block.");
