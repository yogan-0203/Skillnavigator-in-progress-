// Second pass: two-digit alpha white text/colors missed by the first codemod.
// Replaces literal rgba(255,255,255,α) TEXT/border/track values with tokens.
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");
const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".jsx"));

let total = 0;
for (const file of files) {
    const p = path.join(SRC, file);
    if (file === "ThemeContext.jsx" || file === "DomainSelector.jsx") continue; // handled separately
    let s = fs.readFileSync(p, "utf8");
    const before = s;
    const hasT = /const t = getTokens|const t = /.test(s);

    // Text colors: rgba(255,255,255,α) used as `color:` values → theme ink
    if (hasT) {
        s = s.replace(/color:\s*(["'])rgba\(255,\s*255,\s*255,\s*0?\.(\d+)\)\1/g, (m, q, a) => {
            const alpha = parseFloat(`0.${a}`);
            if (alpha >= 0.7) return `color: ${q}t.text.primary${q}`;
            if (alpha >= 0.45) return `color: ${q}t.text.secondary${q}`;
            return `color: ${q}t.text.muted${q}`;
        });
    }

    // Progress/well tracks
    s = s.replace(/backgroundColor:\s*(["'])rgba\(255,\s*255,\s*255,\s*0?\.0[0-6]\)\1/g, (m, q) => `backgroundColor: ${q}t.glass.inset${q}`);
    s = s.replace(/background:\s*(["'])rgba\(255,\s*255,\s*255,\s*0?\.0[0-6]\)\1/g, (m, q) => `background: ${q}t.glass.inset${q}`);
    // Chip/well backgrounds 0.07-0.09
    s = s.replace(/backgroundColor:\s*(["'])rgba\(255,\s*255,\s*255,\s*0?\.0[7-9]\)\1/g, (m, q) => `backgroundColor: ${q}t.glass.chip${q}`);
    // Borders on hover/outline states
    s = s.replace(/borderColor:\s*(["'])rgba\(255,\s*255,\s*255,\s*0?\.0[6-9]\)\1/g, (m, q) => `borderColor: ${q}t.border.subtle${q}`);
    s = s.replace(/borderColor:\s*(["'])rgba\(255,\s*255,\s*255,\s*0?\.1[0-9]?\)\1/g, (m, q) => `borderColor: ${q}t.border.subtle${q}`);
    s = s.replace(/borderColor:\s*(["'])rgba\(255,\s*255,\s*255,\s*0?\.2\)\1/g, (m, q) => `borderColor: ${q}t.border.medium${q}`);
    s = s.replace(/border:\s*(["'])1px solid rgba\(255,\s*255,\s*255,\s*0?\.0[0-9]\)\1/g, () => "border: `1px solid ${t.border.subtle}`");
    s = s.replace(/border:\s*(["'])1px solid rgba\(255,\s*255,\s*255,\s*0?\.1[0-9]?\)\1/g, () => "border: `1px solid ${t.border.subtle}`");

    // Dark chart tooltip backgrounds → glass
    s = s.replace(/background:\s*(["'])rgba\(12,\s*12,\s*18,\s*0?\.9\d*\)\1/g, (m, q) => `background: ${q}t.glass.panel${q}`);

    if (s !== before) {
        fs.writeFileSync(p, s);
        const n = (before.match(/rgba\(255,\s*255,\s*255/g) || []).length - (s.match(/rgba\(255,\s*255,\s*255/g) || []).length;
        total += Math.max(n, 1);
        console.log(`FIXED: ${file}`);
    }
}
console.log(`Second pass complete (~${total} values replaced).`);
