// Definitive fix for AIChatbot.jsx: the component never declared `t`,
// so every token reference threw "t is not defined". Inject the standard
// token setup and clean up the symptom-patches (typeof guard, string literals,
// and t.primary/t.secondary which are not real tokens).
const fs = require("fs");
const p = "src/AIChatbot.jsx";
let s = fs.readFileSync(p, "utf8");
const orig = s;
const notes = [];

// 1) Inject theme-token setup right after the messagesEndRef useRef hook.
const anchor = "    const messagesEndRef = useRef(null);";
if (!s.includes(anchor)) throw new Error("anchor (useRef) not found");
if (!s.includes("const t = getTokens(darkMode)")) {
    s = s.replace(
        anchor,
        anchor + "\n\n    const { darkMode } = useTheme();\n    const t = getTokens(darkMode);\n    const tx = t.text;"
    );
    notes.push("injected token setup (useTheme + getTokens)");
}

// 2) Remove the leftover typeof guard -> clean token.
s = s.replace(
    'background: (typeof t !== "undefined" && t.glass?.panel) ?? "rgba(255,255,255,0.55)"',
    "background: t.glass.panel"
);

// 3) Fix backtick-wrapped literals that render the string "t.xxx" verbatim.
const beforeGlass = (s.match(/`t\.glass\.inset`/g) || []).length;
s = s.replace(/`t\.glass\.inset`/g, "${t.glass.inset}");
if (beforeGlass) notes.push(`fixed ${beforeGlass} literal(s) \`t.glass.inset\``);

const beforeBorder = (s.match(/`t\.border\.subtle`/g) || []).length;
s = s.replace(/`t\.border\.subtle`/g, "${t.border.subtle}");
if (beforeBorder) notes.push(`fixed ${beforeBorder} literal(s) \`t.border.subtle\``);

// 4) t.primary / t.secondary are not tokens; real path is t.text.*
const beforePrim = (s.match(/\bt\.primary\b/g) || []).length;
s = s.replace(/\bt\.primary\b/g, "t.text.primary");
if (beforePrim) notes.push(`fixed ${beforePrim} t.primary -> t.text.primary`);

const beforeSec = (s.match(/\bt\.secondary\b/g) || []).length;
s = s.replace(/\bt\.secondary\b/g, "t.text.secondary");
if (beforeSec) notes.push(`fixed ${beforeSec} t.secondary -> t.text.secondary`);

if (s !== orig) fs.writeFileSync(p, s);
console.log(notes.length ? "OK: " + notes.join("; ") : "no changes needed");
