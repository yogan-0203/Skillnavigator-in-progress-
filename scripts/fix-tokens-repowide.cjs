// Repo-wide token cleanup. Two systemic bugs from the migration:
//  (1) t.primary / t.secondary are not real tokens -> real path is t.text.*
//  (2) Backtick-wrapped literals like `t.glass.inset` render the STRING
//      "t.glass.inset" instead of interpolating -> must be ${t.glass.inset}
// Idempotent: safe to run repeatedly.
const fs = require("fs");
const path = require("path");

const files = fs.readdirSync("src").filter((f) => f.endsWith(".jsx")).map((f) => path.join("src", f));
let totalChanges = 0;

for (const f of files) {
    let s = fs.readFileSync(f, "utf8");
    const before = s;

    // (1) t.primary / t.secondary -> t.text.primary / t.text.secondary
    // Skip if already t.text.* (the \b guard prevents matching inside t.text.primary).
    s = s.replace(/(?<!text\.)\bt\.primary\b/g, "t.text.primary");
    s = s.replace(/(?<!text\.)\bt\.secondary\b/g, "t.text.secondary");

    // (2) Backtick-wrapped literal token refs -> proper interpolation.
    //     Only touch backtick strings that contain a bare t.<seg> and NOT already ${.
    s = s.replace(/`([^`]*?)\bt\.(glass|border|bg|chart|shadow)\.(\w+)([^`]*?)`/g, (m, pre, grp, seg, post) => {
        // If it already contains ${...} anywhere, leave untouched to be safe.
        if (m.includes("${")) return m;
        return `\`${pre}\${t.${grp}.${seg}}${post}\``;
    });

    if (s !== before) {
        fs.writeFileSync(f, s);
        totalChanges++;
        console.log("updated:", f);
    }
}
console.log(totalChanges ? `${totalChanges} file(s) updated` : "no changes needed");
