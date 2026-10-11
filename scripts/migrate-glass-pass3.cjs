// Pass 3: chart ticks, ternary leftovers, and border* dividers.
const fs = require("fs");
const path = require("path");
const SRC = path.join(__dirname, "..", "src");

let total = 0;
const fixFile = (file, rules) => {
    const p = path.join(SRC, file);
    if (!fs.existsSync(p)) return;
    let s = fs.readFileSync(p, "utf8");
    const before = s;
    for (const [re, to] of rules) s = s.replace(re, to);
    if (s !== before) {
        fs.writeFileSync(p, s);
        console.log(`PASS3: ${file}`);
        total++;
    }
};

// A) Recharts axis ticks (white → theme tick colors)
for (const f of ["Progress.jsx", "GapAnalysis.jsx", "SkillProfile.jsx", "Home.jsx", "Leaderboard.jsx", "Practice.jsx"]) {
    fixFile(f, [
        [/tick=\{\{\s*fill:\s*"rgba\(255,\s*255,\s*255,\s*0?\.(\d+)\)"/g,
            (m, a) => `tick={{ fill: ${parseFloat("0." + a) >= 0.4 ? "t.chart.tick" : "t.chart.tickFaint"}`],
        [/fill:\s*"rgba\(255,\s*255,\s*255,\s*0?\.(\d+)"/g,
            (m, a) => `fill: ${parseFloat("0." + a) >= 0.4 ? "t.chart.tick" : "t.chart.tickFaint"}`],
    ]);
}

// B) Specific ternary leftovers (safe: these sit on card surfaces, not accents)
fixFile("AIChatbot.jsx", [
    // ai message bubble bg / border / text
    [/background: msg\.role === "user" \? "linear-gradient\(135deg, #4f8ef7, #9b6dff\)" : "rgba\(255,255,255,0\.05\)"/g,
     `background: msg.role === "user" ? "linear-gradient(135deg, #4f8ef7, #9b6dff)" : t.glass.inset`],
    [/border: msg\.role === "ai" \? "1px solid rgba\(255,255,255,0\.08\)" : "none"/g,
     `border: msg.role === "ai" ? \`1px solid \${t.border.subtle}\` : "none"`],
    [/color: msg\.role === "user" \? "#fff" : "rgba\(255,255,255,0\.8\)"/g,
     `color: msg.role === "user" ? "#fff" : t.text.primary`],
    // user avatar bg + drawer header divider
    [/background: msg\.role === "ai" \? "linear-gradient\(135deg, #9b6dff, #4f8ef7\)" : "rgba\(255,255,255,0\.1\)"/g,
     `background: msg.role === "ai" ? "linear-gradient(135deg, #9b6dff, #4f8ef7)" : t.glass.chip`],
    [/borderBottom: "1px solid rgba\(255,255,255,0\.06\)"/g, "borderBottom: `1px solid ${t.border.subtle}`"],
    [/background: input\.trim\(\) \? "linear-gradient\(135deg, #9b6dff, #4f8ef7\)" : "rgba\(255,255,255,0\.05\)"/g,
     `background: input.trim() ? "linear-gradient(135deg, #9b6dff, #4f8ef7)" : t.glass.inset`],
    [/color: input\.trim\(\) \? "#fff" : "rgba\(255,255,255,0\.2\)"/g,
     `color: input.trim() ? "#fff" : t.text.faint`],
]);

fixFile("CareerExplorer.jsx", [
    [/color: met \? "#fff" : "rgba\(255,255,255,0\.5\)"/g, `color: met ? "#fff" : t.text.secondary`],
    [/color: met \? "#3ecf8e" : "rgba\(255,255,255,0\.35\)"/g, `color: met ? "#3ecf8e" : t.text.muted`],
    [/color:"rgba\(255,255,255,0\.55\)"/g, `color:t.text.secondary`],
]);

fixFile("Courses.jsx", [
    [/color: filter === lvl \? cfg\.color : "rgba\(255,255,255,0\.4\)"/g,
     `color: filter === lvl ? cfg.color : t.text.secondary`],
]);

fixFile("GapAnalysis.jsx", [
    [/color: chartType === type \? "#4f8ef7" : "rgba\(255,255,255,0\.4\)"/g,
     `color: chartType === type ? "#4f8ef7" : t.text.secondary`],
]);

fixFile("Practice.jsx", [
    [/color: chosen \? "#fff" : "rgba\(255,255,255,0\.8\)"/g, `color: chosen ? "#fff" : t.text.primary`],
]);

// C) border* divider variants (files with t)
for (const f of ["AIChatbot.jsx", "CareerExplorer.jsx", "Courses.jsx", "GapAnalysis.jsx",
                 "Leaderboard.jsx", "Practice.jsx", "Progress.jsx", "Roadmap.jsx", "SkillProfile.jsx", "Home.jsx"]) {
    fixFile(f, [
        [/border(Top|Bottom|Left|Right):\s*"1px solid rgba\(255,\s*255,\s*255,\s*0?\.0\d*\)"/g,
         (m, side) => `border${side}: \`1px solid \${t.border.subtle}\``],
    ]);
}

console.log(`Pass3 done — ${total} file(s) changed.`);
