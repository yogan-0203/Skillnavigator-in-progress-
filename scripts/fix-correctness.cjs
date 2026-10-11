// Comprehensive correctness fix:
//  (A) Leaderboard.jsx module-scope crash: TIER.standard.color references t (undefined).
//  (B) Leaderboard.jsx shadowing: local `const t = TIER[...]` hides theme token t,
//      breaking t.text.muted on the podium card. Rename local to `tier`.
//  (C) Global: bare `t.muted` -> `t.text.muted` (t.muted is not a real token).
//  (D) Global: hardcoded near-invisible white surfaces -> theme-aware t.glass.inset.
// Idempotent.
const fs = require("fs");

let edits = 0;
const edit = (file, pairs) => {
    const p = "src/" + file;
    let s = fs.readFileSync(p, "utf8");
    for (const [from, to] of pairs) {
        if (s.includes(from)) { s = s.split(from).join(to); edits++; }
    }
    fs.writeFileSync(p, s);
};

// (A) + (B) Leaderboard
edit("Leaderboard.jsx", [
    // module-scope crash
    ['standard: { color: t.text.secondary,', 'standard: { color: "#8a92a6",'],
    // shadowing: rename local t -> tier and fix its references (theme t stays intact for t.text.muted)
    ['const t = TIER[e.tier] || TIER.standard;', 'const tier = TIER[e.tier] || TIER.standard;'],
    ['border: `1px solid ${t.border}`,', 'border: `1px solid ${tier.border}`,'],
    ['background: `linear-gradient(145deg, ${t.bg}, rgba(255,255,255,0.012))`,',
     'background: `linear-gradient(145deg, ${tier.bg}, rgba(255,255,255,0.012))`,'],
    ['<Typography sx={{ fontSize: 30, fontWeight: 800, color: t.color, lineHeight: 1 }}>',
     '<Typography sx={{ fontSize: 30, fontWeight: 800, color: tier.color, lineHeight: 1 }}>'],
    ['{t.medal}', '{tier.medal}'],
    ['<Typography sx={{ fontSize: 15, fontWeight: 800, color: t.color }}>{e.xp}</Typography>',
     '<Typography sx={{ fontSize: 15, fontWeight: 800, color: tier.color }}>{e.xp}</Typography>'],
]);

// (C) bare t.muted -> t.text.muted  (skip t.text.muted already correct)
for (const f of fs.readdirSync("src").filter((x) => x.endsWith(".jsx"))) {
    let s = fs.readFileSync("src/" + f, "utf8");
    const next = s.replace(/(?<!text\.)\bt\.muted\b/g, "t.text.muted");
    if (next !== s) { fs.writeFileSync("src/" + f, next); edits++; }
}

// (D) invisible-on-light white surfaces -> t.glass.inset (only exact known spots)
edit("Practice.jsx", [
    ['background: "rgba(255,255,255,0.07)",', 'background: t.glass.inset,'],
    ['"&.Mui-disabled": { opacity: 0.4, background: "rgba(255,255,255,0.08)" } }}>',
     '"&.Mui-disabled": { opacity: 0.4, background: t.glass.inset } }}>'],
]);
edit("Progress.jsx", [
    ['backgroundColor:"rgba(255,255,255,0.025)",', 'backgroundColor: t.glass.inset,'],
]);
edit("SkillProfile.jsx", [
    ['backgroundColor:"rgba(255,255,255,0.025)",', 'backgroundColor: t.glass.inset,'],
]);

console.log("edits applied:", edits);
