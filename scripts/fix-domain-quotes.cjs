// Final quote-repair in DomainSelector.jsx (pass4 dropped closing quotes).
const fs = require("fs");
const p = "c:\\Users\\Yoga parwezh A\\sih-hack-demo\\src\\DomainSelector.jsx";
let s = fs.readFileSync(p, "utf8");
let n = 0;
const rep = (o, nw) => {
    const i = s.indexOf(o);
    if (i < 0) { console.log("MISS:", o); return; }
    s = s.slice(0, i) + nw + s.slice(i + o.length);
    n++;
};
rep('color: t.text.secondary", mb: 1 }}>STEP 01',
    'color: "t.text.secondary", mb: 1 }}>STEP 01');
rep('color: "rgba(255,255,255,0.45)", fontSize: 13 }}>Select the field',
    'color: "t.text.secondary", fontSize: 13 }}>Select the field');
fs.writeFileSync(p, s);
console.log(`DomainSelector final fix: ${n} replacements.`);
