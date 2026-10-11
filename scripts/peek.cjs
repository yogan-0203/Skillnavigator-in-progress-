// Print specific line numbers (with a little context) from a file.
// Usage: node scripts/peek.cjs <file> <line> [line2 line3 ...]
const fs = require("fs");
const [file, ...nums] = process.argv.slice(2);
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
for (const n of nums) {
    const i = Number(n);
    console.log(`--- ${file}:${i} ---`);
    for (let j = i - 1; j <= i + 1; j++) {
        if (lines[j - 1] !== undefined) console.log(`${String(j).padStart(4)}| ${lines[j - 1]}`);
    }
}
