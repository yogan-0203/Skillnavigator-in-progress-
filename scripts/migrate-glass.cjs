// One-shot codemod: migrate legacy dark-only pages to the glass token system.
// Usage: node scripts/migrate-glass.cjs  (idempotent — skips already-migrated files)
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");
const FILES = [
    "SkillProfile.jsx",
    "CareerExplorer.jsx",
    "GapAnalysis.jsx",
    "Roadmap.jsx",
    "Courses.jsx",
    "Practice.jsx",
    "Leaderboard.jsx",
    "Progress.jsx",
    "AIChatbot.jsx",
];

const DARK_CARD_RE = /const card = \{[\s\S]*?\n\};\n/;
const THEME_IMPORT = `import { useTheme } from "./ThemeContext";
import { getTokens, ACCENTS } from "./theme/tokens";
import { ClayCard, GlassPanel, ClayButton, PageHeader, StatTile, SegmentTabs, EmptyState, LoadingState, ChartTooltip } from "./theme/Clay";`;

const HOOK_SNIPPET = `    const { darkMode } = useTheme();
    const t = getTokens(darkMode);
    const tx = t.text;
    const card = { border: \`1px solid \${t.border.subtle}\`, borderRadius: "20px", background: t.glass.face };`;

let changed = 0;
for (const file of FILES) {
    const p = path.join(SRC, file);
    if (!fs.existsSync(p)) { console.log(`SKIP (missing): ${file}`); continue; }
    let s = fs.readFileSync(p, "utf8");
    if (s.includes("theme/tokens")) { console.log(`SKIP (already migrated): ${file}`); continue; }

    // 1. Drop the hardcoded dark card literal
    s = s.replace(DARK_CARD_RE, "");
    // 2. Add theme imports after the last import line
    const lines = s.split("\n");
    let lastImport = -1;
    lines.forEach((ln, i) => { if (/^import |^} from|^from /.test(ln.trim())) lastImport = i; });
    lines.splice(lastImport + 1, 0, THEME_IMPORT);
    s = lines.join("\n");
    // 3. Inject hook after component arrow opening: `const X = () => {`
    s = s.replace(/(const \w+ = \(\) => \{\n)/, `$1${HOOK_SNIPPET}\n`);
    // 4. Remap hardcoded whites/ink to tokens (only safe text/border/background patterns)
    const reps = [
        [/color:\s*"#fff"/g, "color: tx.primary"],
        [/color:\s*'#fff'/g, "color: tx.primary"],
        [/color:\s*"#f0f0f8"/g, "color: tx.primary"],
        [/color:\s*"rgba\(255,255,255,0\.([2-6])\)"/g, "color: tx.secondary"],
        [/color:\s*"rgba\(255,255,255,0\.[0-2][0-9]?\)"/g, "color: tx.muted"],
        [/color:\s*"rgba\(255,255,255,0\.7\)"/g, "color: tx.primary"],
        [/color:\s*"rgba\(255,255,255,0\.8\)"/g, "color: tx.primary"],
        [/backgroundColor:\s*"#0c0c12"/g, "backgroundColor: t.glass.panel"],
        [/background:\s*"#030306"/g, "background: t.bg.page"],
        [/backgroundColor:\s*"#030306"/g, "backgroundColor: t.bg.page"],
    ];
    for (const [re, to] of reps) s = s.replace(re, to);
    fs.writeFileSync(p, s);
    changed++;
    console.log(`MIGRATED: ${file}`);
}
console.log(`Done. Migrated ${changed} file(s).`);
