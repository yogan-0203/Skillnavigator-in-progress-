const fs = require("fs");
const path = require("path");
const SRC = path.join(__dirname, "..", "src");
let rta = 0, rtb = 0;
for (const f of fs.readdirSync(SRC).filter((x) => x.endsWith(".jsx"))) {
    const s = fs.readFileSync(path.join(SRC, f), "utf8");
    rta += (s.match(/rgba\(255,255,255/g) || []).length;
    rtb += (s.match(/(^|[^A-Za-z0-9_])['"]t\.(text|glass|border|shadow|bg)\./gm) || []).length;
}
console.log("rgba(255,255,255) count:", rta);
console.log("quoted t. literals:", rtb);
