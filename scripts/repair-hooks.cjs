// Repair: CRLF-tolerant hook/import/card-cleanup for codemod targets.
const fs = require("fs");
const path = require("path");
const SRC = path.join(__dirname, "..", "src");

const FILES = ["SkillProfile.jsx", "CareerExplorer.jsx", "GapAnalysis.jsx", "Roadmap.jsx",
    "Courses.jsx", "Practice.jsx", "Leaderboard.jsx", "Progress.jsx", "AIChatbot.jsx"];

const THEME_IMPORTS = [
    `import { useTheme } from "./ThemeContext";`,
    `import { getTokens, ACCENTS } from "./theme/tokens";`,
];
const HOOK = [
    `    const { darkMode } = useTheme();`,
    `    const t = getTokens(darkMode);`,
    `    const tx = t.text;`,
    `    const card = { border: \`1px solid \${t.border.subtle}\`, borderRadius: "20px", background: t.glass.face };`,
];

for (const file of FILES) {
    const p = path.join(SRC, file);
    let s = fs.readFileSync(p, "utf8");
    const nl = s.includes("\r\n") ? "\r\n" : "\n";
    let changed = false;

    // 1. Ensure ThemeContext + tokens imports exist
    if (!s.includes('from "./theme/tokens"')) {
        const lines = s.split(/\r?\n/);
        let lastImport = 0;
        lines.forEach((ln, i) => { if (/^\s*import\s/.test(ln)) lastImport = i; });
        lines.splice(lastImport + 1, 0, ...THEME_IMPORTS);
        s = lines.join(nl);
        changed = true;
    }

    // 2. Remove leftover hardcoded dark card literal (CRLF-safe)
    const cardRe = /const card = \{[\s\S]*?\r?\n\};\r?\n?/;
    if (cardRe.test(s) && s.includes("const t = ")) { /* keep only token card — handled below */ }
    if (/const card = \{[^}]*rgba\(255,255,255/.test(s)) {
        s = s.replace(cardRe, "");
        changed = true;
    }

    // 3. Inject hook after first component arrow function (CRLF-safe)
    if (!s.includes("const t = getTokens")) {
        s = s.replace(/(const \w+ = \([^)]*\) => \{\r?\n)/, `$1${HOOK.join(nl)}${nl}`);
        changed = true;
    }

    if (changed) { fs.writeFileSync(p, s); console.log(`REPAIRED: ${file}`); }
    else console.log(`OK: ${file}`);
}
console.log("Repair pass done.");
