// Detect module-scope references to `t` / `tx` (runtime crash: "t is not defined").
// Heuristic: a top-level `const NAME = {` ... object block that appears BEFORE the
// first component function AND contains `t.` / `tx.` references is a crash waiting
// to happen, because `t` is only defined inside the component via getTokens(darkMode).
const fs = require("fs");
const files = fs.readdirSync("src").filter((f) => f.endsWith(".jsx"));

let issues = 0;
for (const f of files) {
    const lines = fs.readFileSync(`src/${f}`, "utf8").split(/\r?\n/);
    // Find first component function line (const Name = (...) =>  or  function Name()
    let firstComp = lines.findIndex((l) => /^(export default )?function \w+\(/.test(l) || /^const \w+ = \(/.test(l) && /\{$|\) =>/.test(l));
    // Find where `const t = getTokens` is defined
    const tDef = lines.findIndex((l) => /const t = getTokens|const \{ darkMode \} = useTheme/.test(l));

    // Scan module-scope const object blocks (before firstComp) for t./tx. refs
    for (let i = 0; i < firstComp; i++) {
        if (/\bt\.\w+|\btx\.\w+/.test(lines[i])) {
            console.log(`${f}:${i + 1}  MODULE-SCOPE token ref (crash risk): ${lines[i].trim().slice(0, 90)}`);
            issues++;
        }
    }
    if (tDef === -1 && /\bt\./.test(fs.readFileSync(`src/${f}`, "utf8"))) {
        console.log(`${f}  WARNING: uses t. but no 'const t = getTokens' found`);
    }
}
console.log(issues ? `\n${issues} module-scope token reference(s) found` : "\nNo module-scope token references (good)");
