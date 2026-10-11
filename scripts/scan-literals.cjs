// Comprehensive scan for light-theme + literal-token breakage.
const fs = require("fs");
const dir = "src";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jsx"));
const lines = [];
const add = (s) => lines.push(s);

for (const f of files) {
    const src = fs.readFileSync(dir + "/" + f, "utf8").split("\n");
    // 1) backtick-literal token refs: `t.something` or `tx.something` (invalid CSS)
    src.forEach((ln, i) => {
        if (/`t[x]?\.[a-zA-Z.]+`/.test(ln)) {
            add(`${f}:${i + 1} LITERAL-TOKEN: ${ln.trim().slice(0, 140)}`);
        }
    });
    // 2) module-scope object literals referencing t. (outside component) — approximate by
    //    matching `color: t.` inside a const X = { ... } before any `=> {` component.
    //    We just flag lines where a plain (non-template) t. appears in a module const object.
    // 3) hardcoded white-ish backgrounds used as surfaces (rgba(255,255,255,0.0x)) — ok in dark, near-invisible borders in light but not text
}
fs.writeFileSync("literal-tokens.txt", lines.join("\n"));
console.log("wrote " + lines.length + " literal-token findings");
