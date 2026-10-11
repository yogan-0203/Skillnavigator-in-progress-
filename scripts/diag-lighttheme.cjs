// Diagnostic: find hardcoded dark-only colors that break light theme, and
// report animation-class usage per page.
const fs = require("fs");
const path = require("path");
const dir = "src";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jsx"));

// patterns that assume a dark background
const checks = [
    { label: "white text color:#fff/#ffffff", re: /color:\s*['"]?#(?:fff|ffffff|FFF)\b/i },
    { label: "rgba white text (alpha>=0.5)", re: /color:\s*['"]?rgba\(\s*255,\s*255,\s*255,\s*(?:0\.[5-9]|1)/i },
    { label: "gradient-text (white gradient)", re: /gradient-text/i },
    { label: "glass-card class", re: /glass-card/i },
];

const results = {};
for (const f of files) {
    const s = fs.readFileSync(path.join(dir, f), "utf8");
    const hits = {};
    for (const c of checks) {
        const m = s.match(new RegExp(c.re, "gi"));
        if (m) hits[c.label] = m.length;
    }
    if (Object.keys(hits).length) results[f] = hits;
}
console.log("=== DARK-ONLY COLOR HITS PER PAGE ===");
console.log(JSON.stringify(results, null, 2));

// animation classes used
const anim = {};
for (const f of files) {
    const s = fs.readFileSync(path.join(dir, f), "utf8");
    const m = s.match(/className=["'][^"']*(fade-in|slide-in|float|clay-enter|pulse-glow)[^"']*["']/gi);
    if (m) anim[f] = m.length;
}
console.log("=== ANIMATION CLASSES IN USE ===");
console.log(JSON.stringify(anim, null, 2));
