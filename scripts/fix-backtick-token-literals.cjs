// Fix backtick-wrapped token literals like `t.text.muted` -> t.text.muted
// These render the literal STRING "t.text.muted" as a CSS value (invalid),
// so the browser ignores it and text falls back to an inherited/default color.
// Safe: only strips backticks when the ENTIRE backtick content is a single
// token path (t.seg.sub). Template strings with other content or ${...} are
// left untouched. Idempotent.
const fs = require("fs");
const path = require("path");

const files = fs
    .readdirSync("src")
    .filter((f) => f.endsWith(".jsx"))
    .map((f) => path.join("src", f));

let total = 0;
for (const f of files) {
    let s = fs.readFileSync(f, "utf8");
    const before = s;

    // `t.a.b`  (whole backtick content is exactly one token path) -> t.a.b
    s = s.replace(/`(t\.[A-Za-z]+(?:\.[A-Za-z]+)+)`/g, "$1");

    if (s !== before) {
        fs.writeFileSync(f, s);
        const n = (before.match(/`t\.[A-Za-z]+(?:\.[A-Za-z]+)+`/g) || []).length;
        total += n;
        console.log(`${f}: fixed ${n} literal(s)`);
    }
}
console.log(total ? `TOTAL ${total} backtick token literal(s) fixed` : "no changes needed");
