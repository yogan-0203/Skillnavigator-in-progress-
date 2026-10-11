// Move STATUS_CONFIG inside the Roadmap component where `t` is in scope.
// Matches the "};" that closes the config block that precedes "const Roadmap".
const fs = require("fs");
const p = "c:\\Users\\Yoga parwezh A\\sih-hack-demo\\src\\Roadmap.jsx";
let s = fs.readFileSync(p, "utf8");
const start = s.indexOf("const STATUS_CONFIG = {");
const roadmapIdx = s.indexOf("const Roadmap", start);
if (start < 0 || roadmapIdx < 0) {
    console.log("pattern not found");
    process.exit(1);
}
const end = s.lastIndexOf("}", roadmapIdx - 1);
if (end <= start) {
    console.log("closed block not found");
    process.exit(1);
}
const block = s.slice(start, end + 1);
s = s.slice(0, start) + s.slice(end + 1);

const insertPos = s.indexOf("const tx = t.text;");
const newBlock =
`    const STATUS_CONFIG = {
        Completed:   { color: "#3ecf8e", icon: <CheckCircleRoundedIcon sx={{ color: "#3ecf8e", fontSize: 22 }} />, bg: "rgba(62,207,142,0.1)", border: "rgba(62,207,142,0.2)" },
        "In Progress": { color: "#4f8ef7", icon: <PlayCircleRoundedIcon sx={{ color: "#4f8ef7", fontSize: 22 }} />, bg: "rgba(79,142,247,0.1)", border: "rgba(79,142,247,0.2)" },
        Upcoming: { color: tx.muted, icon: <RadioButtonUncheckedRoundedIcon sx={{ color: tx.secondary, fontSize: 22 }} />, bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)" },
    };
`;
s = s.slice(0, insertPos) + newBlock + s.slice(insertPos);
fs.writeFileSync(p, s);
console.log("Roadmap.jsx restructured.");
