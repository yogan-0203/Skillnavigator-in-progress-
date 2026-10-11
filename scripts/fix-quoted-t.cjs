// Fix: pass2 wrote `background: "t.glass.inset"` (quoted literal, invalid CSS).
// Convert those quoted literals into template literals so they interpolate.
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "src");

const RE = /(['"])(t\.(?:text|glass|border|shadow|bg|blur|chart)(?:\.\w+)+)\1/g;
let total = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".jsx"))) {
    const p = path.join(dir, f);
    const s = fs.readFileSync(p, "utf8");
    const matches = s.match(RE);
    if (!matches) continue;
    const out = s.replace(RE, (m, q, v) => "`" + v + "`");
    fs.writeFileSync(p, out);
    total += matches.length;
    console.log(`QUOTED-T FIXED: ${f} x${matches.length}`);
}
console.log(`Total fixed: ${total}`);
