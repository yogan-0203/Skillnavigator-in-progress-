// Print every hardcoded white-text line with surrounding context so we can
// decide which are legit (on gradient) vs broken (on light glass).
const fs = require("fs");
const files = ["AIChatbot", "FocusTimer", "Home", "Layout", "Login", "Register", "Settings", "ThemeContext"];
const out = [];
for (const f of files) {
    const s = fs.readFileSync("src/" + f + ".jsx", "utf8").split("\n");
    s.forEach((ln, i) => {
        if (/color:\s*['"]?#(?:fff|ffffff|FFF)\b/i.test(ln)) {
            out.push(f + ":" + (i + 1) + ": " + ln.trim().slice(0, 160));
        }
    });
}
fs.writeFileSync("white-text-report.txt", out.join("\n"));
console.log("wrote " + out.length + " lines to white-text-report.txt");
