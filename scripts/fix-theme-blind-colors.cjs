// Convert theme-blind rgba(255,255,255,...) values (fine on dark, invisible on
// light) into theme tokens so both themes render correctly. Exact-match only.
const fs = require("fs");

const edits = {
    // Chart grid strokes -> theme grid token
    "src/GapAnalysis.jsx": [
        ['<CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />', "<CartesianGrid stroke={t.chart.grid} vertical={false} />"],
        ['<PolarGrid stroke="rgba(255,255,255,0.08)" />', "<PolarGrid stroke={t.chart.grid} />"],
    ],
    "src/Progress.jsx": [
        ['<CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />', "<CartesianGrid stroke={t.chart.grid} vertical={false} />"],
        ['backgroundColor:"rgba(255,255,255,0.025)",', "backgroundColor: t.glass.inset,"],
    ],
    "src/SkillProfile.jsx": [
        ['<PolarGrid stroke="rgba(255,255,255,0.07)" />', "<PolarGrid stroke={t.chart.grid} />"],
        ['backgroundColor:"rgba(255,255,255,0.025)",', "backgroundColor: t.glass.inset,"],
        ['"& .MuiLinearProgress-bar": { backgroundColor:"rgba(255,255,255,0.4)", borderRadius: 10 }', '"& .MuiLinearProgress-bar": { backgroundColor: ACCENTS.blue, borderRadius: 10 }'],
        ['"&:hover fieldset": { borderColor:"rgba(255,255,255,0.25)" },', '"&:hover fieldset": { borderColor: t.border.medium } },'],
    ],
    "src/Practice.jsx": [
        ['background: "rgba(255,255,255,0.07)",', "background: t.glass.chip,"],
        ['"&.Mui-disabled": { opacity: 0.4, background: "rgba(255,255,255,0.08)" }', '"&.Mui-disabled": { opacity: 0.4, background: t.glass.chip }'],
        ['"&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.12)", borderRadius: 10 }', '"&::-webkit-scrollbar-thumb": { background: t.border.medium, borderRadius: 10 }'],
    ],
    "src/Leaderboard.jsx": [
        ['standard: { color: t.text.secondary, bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", medal: "" },', "standard: { color: t.text.secondary, bg: t.glass.chip, border: t.border.subtle, medal: \"\" },"],
    ],
    "src/Courses.jsx": [
        ['const cfg = LEVEL_COLOR[lvl] || { color: t.text.secondary, bg:"rgba(255,255,255,0.05)", border:"rgba(255,255,255,0.1)" };', "const cfg = LEVEL_COLOR[lvl] || { color: t.text.secondary, bg: t.glass.chip, border: t.border.subtle };"],
    ],
};

let total = 0;
for (const [file, pairs] of Object.entries(edits)) {
    let s = fs.readFileSync(file, "utf8");
    for (const [from, to] of pairs) {
        if (s.includes(from)) {
            s = s.split(from).join(to);
            total++;
        } else {
            console.log(`  [skip] not found in ${file}: ${from.slice(0, 50)}...`);
        }
    }
    fs.writeFileSync(file, s);
}
console.log(`applied ${total} token conversion(s)`);
