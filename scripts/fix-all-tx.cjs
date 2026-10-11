// Roadmap.jsx (and a few others) had undefined `tx` — map to existing `t`.
const fs = require("fs");
const path = require("path");
const SRC = path.join(__dirname, "..", "src");
let total = 0;
for (const f of fs.readdirSync(SRC).filter((x) => x.endsWith(".jsx"))) {
    const p = path.join(SRC, f);
    let s = fs.readFileSync(p, "utf8");
    const before = s;
    s = s.replace(/\btx\./g, "t.");
    if (s !== before) {
        fs.writeFileSync(p, s);
        console.log(`FIXED tx->t in ${f}`);
        total++;
    }
}
console.log(`Total: ${total} file(s) changed.`);
