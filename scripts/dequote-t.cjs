// De-quote stray '"t.text.primary"' style values in sx objects.
const fs = require("fs");
const p = "c:\\Users\\Yoga parwezh A\\sih-hack-demo\\src\\DomainSelector.jsx";
let s = fs.readFileSync(p, "utf8");
const before = s;
const pairs = [
    ["\"t.text.primary\"", "t.text.primary"],
    ["\"t.text.secondary\"", "t.text.secondary"],
    ["\"t.glass.inset\"", "t.glass.inset"],
    ["\"t.border.subtle\"", "t.border.subtle"],
];
for (const [q, bare] of pairs) {
    const c = (s.match(new RegExp(q.replace(/"/g, "\\\""))) || []).length;
    s = s.split(q).join(bare);
}
fs.writeFileSync(p, s);
console.log("de-quoted:", s !== before ? "yes" : "no");
