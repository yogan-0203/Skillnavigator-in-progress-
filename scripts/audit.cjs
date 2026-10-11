// Comprehensive audit: white-on-light text, dark-only bg surfaces, animation usage.
const fs = require("fs");
const path = require("path");
const dir = "src";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jsx"));

const reWhiteText = /color:\s*["'`]?\s*(#fff\b|#ffffff\b|white\b|rgba\(\s*255,\s*255,\s*255[^)]*\))/i;
const reDarkBg = /rgba\(\s*255,\s*255,\s*255,\s*0\.0\d/;
const reDarkShadow = /rgba\(\s*(12|17|20|0),\s*(17|20|15|0),\s*(20|25|0),\s*0\.[0-4]\d/;

console.log("=== A. WHITE-ON-LIGHT TEXT (invisible in light theme) ===");
for (const f of files) {
    const lines = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/);
    lines.forEach((ln, i) => { if (reWhiteText.test(ln)) console.log(`${f}:${i + 1}: ${ln.trim().slice(0, 110)}`); });
}

console.log("\n=== B. DARK-ONLY BG rgba(255,255,255,0.0x) (invisible on light) ===");
let total = 0;
for (const f of files) {
    const lines = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/);
    let c = 0;
    lines.forEach((ln) => { if (reDarkBg.test(ln)) c++; });
    if (c) { console.log(`${f}: ${c}`); total += c; }
}
console.log(`TOTAL dark-bg: ${total}`);

console.log("\n=== C. DARK SHADOW rgba(0,0,0,...) usage ===");
for (const f of files) {
    const lines = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/);
    lines.forEach((ln, i) => { if (reDarkShadow.test(ln)) console.log(`${f}:${i + 1}: ${ln.trim().slice(0, 90)}`); });
}

console.log("\n=== D. ANIMATION usage per page (clay-enter/fade/float/pop) ===");
const reAnim = /clay-enter|fade-in|fadeIn|clay-pop|clayFloat|float|slideIn|animation:|transition:/;
for (const f of files) {
    const s = fs.readFileSync(path.join(dir, f), "utf8");
    const hits = (s.match(new RegExp(reAnim, "g")) || []).length;
    console.log(`${f}: ${hits}`);
}
