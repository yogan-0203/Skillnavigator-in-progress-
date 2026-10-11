// Detect module-scope `t.` references that crash at import time.
// A `t.` reference is safe ONLY if it appears AFTER a `const t = getTokens(...)`
// (or `const { darkMode } = useTheme()` + `const t = getTokens(...)`) inside a
// component/function body. Anything before the first such definition — at the
// top level (outside any function) — is a crash waiting to happen.
const fs = require("fs");
const path = require("path");
const dir = "src";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jsx"));

for (const f of files) {
    const lines = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/);
    let firstTDef = -1; // line index (0-based) where `const t = getTokens` first appears
    let inComponent = false;
    const problems = [];
    lines.forEach((ln, i) => {
        // find where t gets defined
        if (firstTDef === -1 && /const\s+t\s*=\s*getTokens/.test(ln)) {
            firstTDef = i;
            inComponent = true;
        }
        // detect start of a component/function body
        if (/export default function|^const\s+\w+\s*=\s*\(|^function\s+\w+/.test(ln)) {
            inComponent = true;
        }
    });
    // Now: any `t.` ref BEFORE firstTDef that is outside a function = crash.
    // Simple heuristic: if firstTDef === -1 but `t.` used => whole file unsafe.
    // If firstTDef >= 0, check module-level (top-level) object literals before it.
    if (firstTDef === -1) {
        const usesT = lines.some((ln) => /\bt\.(text|glass|border|bg|shadow|blur|chart|dark)\b/.test(ln));
        if (usesT) console.log(`[NO-T-DEF] ${f} uses t.* but never defines const t = getTokens`);
        continue;
    }
    // Check lines before firstTDef for `t.` (module scope)
    for (let i = 0; i < firstTDef; i++) {
        if (/\bt\.(text|glass|border|bg|shadow|blur|chart|dark)\b/.test(lines[i])) {
            // Make sure this line isn't inside a function that defines its own t.
            // Heuristic: flag it; human review.
            problems.push(`${f}:${i + 1}: ${lines[i].trim().slice(0, 100)}`);
        }
    }
    problems.forEach((p) => console.log("[MODULE-SCOPE] " + p));
}
