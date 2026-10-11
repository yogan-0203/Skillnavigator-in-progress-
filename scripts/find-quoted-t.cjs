const fs = require("fs");
const path = require("path");
const SRC = path.join(__dirname, "..", "src");
const RE = /(^|[^A-Za-z0-9_])['"]t\.(text|glass|border|shadow|bg)\./gm;
for (const f of fs.readdirSync(SRC).filter((x) => x.endsWith(".jsx"))) {
    const s = fs.readFileSync(path.join(SRC, f), "utf8");
    let m;
    while ((m = RE.exec(s)) !== null) {
        const line = s.substring(0, m.index).split("\n").length;
        console.log(`${f}:${line}: ${s.split("\n")[line - 1].trim().slice(0, 90)}`);
    }
}
