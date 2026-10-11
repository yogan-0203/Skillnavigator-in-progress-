// Fix DomainSelector string repairs made by pass4 (missing quotes).
const fs = require("fs");
const p = "c:\\Users\\Yoga parwezh A\\sih-hack-demo\\src\\DomainSelector.jsx";
let s = fs.readFileSync(p, "utf8");
let n = 0;
const rep = (o, nw) => {
    let c = 0;
    let i = s.indexOf(o);
    while (i >= 0) {
        s = s.slice(0, i) + nw + s.slice(i + o.length);
        c++;
        const j = s.indexOf(o, i + nw.length);
        i = j;
    }
    n += c;
    if (c > 0) console.log(`  fixed x${c}: ${o.slice(0, 55)}...`);
};
rep('color: t.text.primary", fontSize: 14 }}>Your', 'color: "t.text.primary", fontSize: 14 }}>Your');
rep('backgroundColor: t.glass.inset", "', 'backgroundColor: "t.glass.inset", "');
rep(': "rgba(255,255,255,0.02)",', ': "t.glass.inset",');
rep(': "1px solid rgba(255,255,255,0.06)",', ': "1px solid t.border.subtle",');
rep(': "rgba(255,255,255,0.2)",', ': "t.text.secondary",');
rep('"&.Mui-disabled": { background: "rgba(255,255,255,0.05)" }', '"&.Mui-disabled": { background: "t.glass.inset" }');
fs.writeFileSync(p, s);
console.log(`DomainSelector fixed: ${n} replacements.`);
