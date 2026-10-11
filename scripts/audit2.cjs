// Show every rgba(255,255,255,0.0X) / rgba(255,255,255,0.X) occurrence,
// flag whether the line already has a darkMode guard, and the surrounding key.
const fs = require("fs");
const path = require("path");
const dir = "src";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jsx"));
const re = /rgba\(\s*255,\s*255,\s*255,\s*0\.\d+\s*\)/gi;

for (const f of files) {
    const lines = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/);
    lines.forEach((ln, i) => {
        if (re.test(ln)) {
            re.lastIndex = 0;
            const guarded = /darkMode\s*\?|data-theme|--bg-|--border-|--text-/.test(ln);
            const m = ln.match(re);
            console.log(`${guarded ? "GUARD" : "BAD  "} ${f}:${i + 1}  [${m.join(" | ")}]  ${ln.trim().slice(0, 95)}`);
        }
    });
}
