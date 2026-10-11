// Fix remaining unguarded white surface colors that vanish on light theme.
// Uses ONLY existing theme-aware tokens (t.glass.*, t.border.*) or the
// darkMode ternary convention already used across the codebase.
// Idempotent: each replacement is checked before applying.
const fs = require("fs");

const edits = [
    {
        file: "src/CareerExplorer.jsx",
        find: 'border: isSelected ? `1px solid ${career.color}40` : "1px solid rgba(255,255,255,0.08)",',
        repl: 'border: isSelected ? `1px solid ${career.color}40` : `1px solid ${t.border.subtle}`,',
    },
    {
        file: "src/CareerExplorer.jsx",
        find: '                                    ? `linear-gradient(145deg, ${career.color}10, rgba(255,255,255,0.01))`\n                                    : "linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012))",',
        repl: '                                    ? `linear-gradient(145deg, ${career.color}10, ${t.glass.inset})`\n                                    : t.glass.face,',
    },
    {
        file: "src/Courses.jsx",
        find: 'const cfg = LEVEL_COLOR[lvl] || { color: t.text.secondary, bg:"rgba(255,255,255,0.05)", border:"rgba(255,255,255,0.1)" };',
        repl: 'const cfg = LEVEL_COLOR[lvl] || { color: t.text.secondary, bg: t.glass.chip, border: t.border.medium };',
    },
    {
        file: "src/Courses.jsx",
        find: 'border: filter === lvl ? `1px solid ${cfg.border}` : "1px solid rgba(255,255,255,0.08)",',
        repl: 'border: filter === lvl ? `1px solid ${cfg.border}` : `1px solid ${t.border.subtle}`,',
    },
    {
        file: "src/DomainSelector.jsx",
        find: 'background: selectedDomain ? `linear-gradient(135deg, ${selectedDomain.color}, ${selectedDomain.color}cc)` : "rgba(255,255,255,0.05)",',
        repl: 'background: selectedDomain ? `linear-gradient(135deg, ${selectedDomain.color}, ${selectedDomain.color}cc)` : t.glass.chip,',
    },
    {
        file: "src/Practice.jsx",
        find: 'border: `1px solid ${q.due ? "rgba(247,147,76,0.22)" : "rgba(255,255,255,0.06)"}` }}>',
        repl: 'border: `1px solid ${q.due ? "rgba(247,147,76,0.22)" : t.border.subtle}` }}>',
    },
    {
        file: "src/Roadmap.jsx",
        find: 'background:"linear-gradient(180deg, rgba(62,207,142,0.4), rgba(79,142,247,0.2), rgba(255,255,255,0.05))",',
        repl: 'background:`linear-gradient(180deg, rgba(62,207,142,0.4), rgba(79,142,247,0.2), ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(22,22,42,0.06)"})`,',
    },
];

let applied = 0;
for (const e of edits) {
    let s = fs.readFileSync(e.file, "utf8");
    if (!s.includes(e.find)) {
        console.log(`SKIP (not found): ${e.file} :: ${e.find.slice(0, 50)}...`);
        continue;
    }
    s = s.replace(e.find, e.repl);
    fs.writeFileSync(e.file, s);
    applied++;
    console.log(`OK: ${e.file}`);
}
console.log(`\n${applied}/${edits.length} edits applied`);
