// One-shot diagnostic: light-theme gaps + animation inventory across all pages.
const fs = require("fs");
const path = require("path");

const files = fs.readdirSync("src").filter((f) => f.endsWith(".jsx")).sort();
const report = { whiteText: {}, hardcodedDark: {}, whiteBorder: {}, animSx: {} };

for (const f of files) {
    const lines = fs.readFileSync(path.join("src", f), "utf8").split(/\r?\n/);
    lines.forEach((ln, i) => {
        const L = i + 1;
        if (/color:\s*["']#(f{3}|F{3}|fff{3}|FFF{3})\b/i.test(ln)) (report.whiteText[f] ||= []).push(L);
        if (/background(?!Image)/i.test(ln) && /rgba\(255,\s*255,\s*255,\s*0\.[0-4]\d?\)/i.test(ln)) (report.hardcodedDark[f] ||= []).push(L);
        if (/border(?!Color)/i.test(ln) && /rgba\(255,\s*255,\s*255/i.test(ln)) (report.whiteBorder[f] ||= []).push(L);
        if (/animation:/.test(ln)) (report.animSx[f] ||= []).push(L);
    });
}

const show = (label, obj) => {
    console.log(`\n=== ${label} ===`);
    const keys = Object.keys(obj);
    if (!keys.length) return console.log("  (none)");
    keys.forEach((k) => console.log(`  ${k}: ${obj[k].length} @ ${obj[k].slice(0, 12).join(",")}`));
};

show("WHITE TEXT (invisible on light)", report.whiteText);
show("HARDCODED white-alpha SURFACES", report.hardcodedDark);
show("WHITE BORDERS", report.whiteBorder);
show("Existing sx animations", report.animSx);
