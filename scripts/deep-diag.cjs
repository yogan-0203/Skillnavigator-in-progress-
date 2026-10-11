// Deep diagnostic: find hardcoded colors that break light theme.
const fs = require("fs");
const path = require("path");
const dir = "src";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jsx"));

const lines = [];
const add = (s) => lines.push(s);

for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8").split("\n");
    src.forEach((ln, i) => {
        const L = i + 1;
        // solid dark bg like #0a0a0a, #111, #1a1a1a (not in gradient)
        if (/background(?:Color)?:\s*['"]#[0-1][0-9a-fA-F]{2,5}/.test(ln) && !/linear-gradient/.test(ln)) {
            add(`${f}:${L} SOLID-DARK-BG: ${ln.trim().slice(0, 120)}`);
        }
        // Chart axis/grid hardcoded white
        if (/(stroke|tick).*(rgba\(255|#fff)/i.test(ln)) {
            add(`${f}:${L} CHART-WHITE: ${ln.trim().slice(0, 120)}`);
        }
        // placeholder color hardcoded white (invisible on light)
        if (/::placeholder/.test(ln) && /rgba\(255/.test(ln)) {
            add(`${f}:${L} PLACEHOLDER-WHITE: ${ln.trim().slice(0, 120)}`);
        }
    });
}
fs.writeFileSync("deep-diag.txt", lines.join("\n"));
console.log("wrote " + lines.length + " findings");
