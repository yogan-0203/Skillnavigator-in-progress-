// Fix corruption from fix-tokens-repowide.cjs: it emitted `${t.xxx}` WITHOUT
// surrounding backticks inside sx={{...}} object literals. Outside a template
// literal, `${...}` is a syntax error -> must become a bare `t.xxx`.
//
// This scanner tracks backtick state so it ONLY rewrites `${t.word.word}`
// that are OUTSIDE backticks. Legit `${t.xxx}` inside real template strings
// (backtick present) are left untouched. Idempotent.
const fs = require("fs");
const path = require("path");

const files = fs.readdirSync("src").filter((f) => f.endsWith(".jsx")).map((f) => path.join("src", f));

// Matches ${t.a.b} (no nested braces/spaces inside).
const TOKEN = /\$\{(t\.[A-Za-z_][\w.]*)\}/;
let totalFiles = 0;
let totalFixes = 0;

for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    let out = "";
    let i = 0;
    let inBacktick = false;
    let inLineComment = false;
    let inBlockComment = false;
    let fixes = 0;
    const n = src.length;

    while (i < n) {
        const c = src[i];
        const next = src[i + 1];

        // ---- comment handling (so we don't rewrite backticks inside comments) ----
        if (!inBacktick && !inLineComment && !inBlockComment) {
            if (c === "/" && next === "/") { inLineComment = true; out += c + next; i += 2; continue; }
            if (c === "/" && next === "*") { inBlockComment = true; out += c + next; i += 2; continue; }
        }
        if (inLineComment) {
            out += c;
            if (c === "\n") inLineComment = false;
            i++; continue;
        }
        if (inBlockComment) {
            out += c;
            if (c === "*" && next === "/") { out += next; i += 2; inBlockComment = false; continue; }
            i++; continue;
        }

        // ---- backtick toggle (ignore escaped \` ) ----
        if (c === "\\" && next === "`") { out += c + next; i += 2; continue; }
        if (c === "`") { inBacktick = !inBacktick; out += c; i++; continue; }

        // ---- when NOT in a template literal, strip ${...} wrappers on tokens ----
        if (!inBacktick && c === "$" && next === "{") {
            const close = src.indexOf("}", i);
            const inner = close === -1 ? "" : src.slice(i + 2, close);
            const m = TOKEN.exec(src.slice(i, close + 1));
            if (m && /^t\.[A-Za-z_][\w.]*$/.test(inner)) {
                out += m[1]; // bare token e.g. t.glass.inset
                i = close + 1;
                fixes++;
                continue;
            }
        }

        out += c;
        i++;
    }

    if (fixes > 0) {
        fs.writeFileSync(f, out);
        totalFiles++;
        totalFixes += fixes;
        console.log(`${f}: fixed ${fixes} bad interpolation(s)`);
    }
}

console.log(totalFixes ? `\nDONE: ${totalFixes} fix(es) across ${totalFiles} file(s)` : "no fixes needed");
