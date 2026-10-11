// Add className="stagger" to each page's root content Box so its direct
// children (section blocks, grids, cards) pop in sequence on mount.
// Purely additive CSS class -> zero syntax risk. Idempotent.
const fs = require("fs");
const path = require("path");

const files = fs.readdirSync("src").filter((f) => f.endsWith(".jsx")).map((f) => path.join("src", f));
// Page roots look like: <Box sx={{ width: "100%", minHeight: "100%", ... }}>
const ROOT = /<Box\s+sx=\{\{\s*width:\s*"100%",\s*minHeight:\s*"100%"/;
let touched = 0;

for (const f of files) {
    let s = fs.readFileSync(f, "utf8");
    if (!ROOT.test(s)) continue;
    const before = s;
    s = s.replace(ROOT, '<Box className="stagger" sx={{ width: "100%", minHeight: "100%"');
    if (s !== before) {
        fs.writeFileSync(f, s);
        touched++;
        console.log("stagger added:", path.basename(f));
    }
}
console.log(touched ? `${touched} page root(s) staggered` : "no roots matched");
