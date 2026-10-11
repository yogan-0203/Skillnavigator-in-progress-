// Light-theme completion: fix hardcoded rgba(255,255,255,0.0X) values that
// vanish on the light theme. Two categories:
//   (1) Chart grid strokes -> t.chart.grid (already theme-aware)
//   (2) Ternary else-branches -> wrap the white value in `darkMode ?` with a
//       dark-subtle light-theme fallback.
// Idempotent: each replacement removes its own `old` marker, so re-runs are no-ops.
const fs = require("fs");

// Each entry: [file, exactOld, exactNew]
const edits = [
    // ── Chart grids -> t.chart.grid ──────────────────────────────────────
    ["src/GapAnalysis.jsx",
        '<CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />',
        '<CartesianGrid stroke={t.chart.grid} vertical={false} />'],
    ["src/GapAnalysis.jsx",
        '<PolarGrid stroke="rgba(255,255,255,0.08)" />',
        '<PolarGrid stroke={t.chart.grid} />'],
    ["src/Progress.jsx",
        '<CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />',
        '<CartesianGrid stroke={t.chart.grid} vertical={false} />'],
    ["src/SkillProfile.jsx",
        '<PolarGrid stroke="rgba(255,255,255,0.07)" />',
        '<PolarGrid stroke={t.chart.grid} />'],

    // ── Ternary else-branches -> darkMode ? white : dark-subtle ──────────
    ["src/CareerExplorer.jsx",
        'met ? "#3ecf8e30" : "rgba(255,255,255,0.04)"',
        'met ? "#3ecf8e30" : (darkMode ? "rgba(255,255,255,0.04)" : "rgba(22,22,42,0.05)")'],
    ["src/Leaderboard.jsx",
        'e.isMe ? "rgba(155,109,255,0.25)" : "rgba(255,255,255,0.06)"',
        'e.isMe ? "rgba(155,109,255,0.25)" : (darkMode ? "rgba(255,255,255,0.06)" : "rgba(22,22,42,0.05)")'],
    ["src/Practice.jsx",
        'q.due ? "rgba(247,147,76,0.07)" : "rgba(255,255,255,0.03)"',
        'q.due ? "rgba(247,147,76,0.07)" : (darkMode ? "rgba(255,255,255,0.03)" : "rgba(22,22,42,0.04)")'],
    ["src/Practice.jsx",
        '                                                : "rgba(255,255,255,0.035)",',
        '                                                : (darkMode ? "rgba(255,255,255,0.035)" : "rgba(22,22,42,0.04)"),'],
    ["src/Practice.jsx",
        '                                                : "1px solid rgba(255,255,255,0.08)",',
        '                                                : (darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(22,22,42,0.1)"),'],
    ["src/Practice.jsx",
        'background: chosen ? "rgba(155,109,255,0.3)" : "rgba(255,255,255,0.07)"',
        'background: chosen ? "rgba(155,109,255,0.3)" : (darkMode ? "rgba(255,255,255,0.07)" : "rgba(22,22,42,0.05)")'],
    ["src/Roadmap.jsx",
        '                                        ? "1px solid rgba(255,255,255,0.05)" : "none",',
        '                                        ? (darkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(22,22,42,0.08)") : "none",'],
];

let changed = 0;
for (const [file, oldStr, newStr] of edits) {
    let s = fs.readFileSync(file, "utf8");
    if (s.includes(oldStr)) {
        s = s.split(oldStr).join(newStr);
        fs.writeFileSync(file, s);
        changed++;
        console.log("fixed:", file, "::", oldStr.slice(0, 42));
    } else if (s.includes(newStr)) {
        // already applied
    } else {
        console.log("NOT FOUND:", file, "::", oldStr.slice(0, 60));
    }
}
console.log(changed ? `${changed} edit(s) applied` : "no edits needed");
