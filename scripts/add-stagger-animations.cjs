// Add staggered entrance animations to mapped card lists.
// Idempotent: skips if the animation string is already present on the target.
const fs = require("fs");

function patch(file, edits) {
    let s = fs.readFileSync(file, "utf8");
    const before = s;
    for (const { find, repl } of edits) {
        if (!s.includes(find)) {
            console.log(`SKIP: ${file} :: ${find.slice(0, 40)}...`);
            continue;
        }
        s = s.replace(find, repl);
        console.log(`OK: ${file}`);
    }
    if (s !== before) fs.writeFileSync(file, s);
}

// --- CareerOnboarding: 3 lists ---
patch("src/CareerOnboarding.jsx", [
    {
        find: `CAREER_PATHS.map((career) => (`,
        repl: `CAREER_PATHS.map((career, idx) => (`,
    },
    {
        find: `transition: "all 0.2s ease", "&:hover": { borderColor: \`\${career.color}50\`, transform: "translateY(-2px)" } }}>`,
        repl: `transition: "all 0.2s ease", animation: \`clayPop 0.4s \${Math.min(idx * 0.05, 0.4)}s cubic-bezier(0.22, 1, 0.36, 1) both\`, "&:hover": { borderColor: \`\${career.color}50\`, transform: "translateY(-2px)" } }}>`,
    },
    {
        find: `EXPERIENCE_LEVELS.map((level) => (`,
        repl: `EXPERIENCE_LEVELS.map((level, idx) => (`,
    },
    {
        find: `: cardBg, border: experience === level.id ? "2px solid #4f8ef7" : \`1px solid \${borderColor}\`, transition: "all 0.2s ease" }}>`,
        repl: `: cardBg, border: experience === level.id ? "2px solid #4f8ef7" : \`1px solid \${borderColor}\`, transition: "all 0.2s ease", animation: \`clayPop 0.35s \${Math.min(idx * 0.05, 0.3)}s cubic-bezier(0.22, 1, 0.36, 1) both\` }}>`,
    },
    {
        find: `selectedCareer?.skills.map((skill) => (`,
        repl: `selectedCareer?.skills.map((skill, idx) => (`,
    },
]);

console.log("done");
