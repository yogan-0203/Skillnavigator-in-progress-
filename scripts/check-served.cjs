const http = require("http");
const fs = require("fs");
const url = "http://localhost:5173/src/AIChatbot.jsx";
http.get(url, (res) => {
    let body = "";
    res.on("data", (c) => (body += c));
    res.on("end", () => {
        fs.writeFileSync("c:/Users/Yoga parwezh A/sih-hack-demo/src/aichat_served.js", body);
        console.log("status", res.statusCode, "len", body.length);
        if (body.includes("t.glass.panel")) console.log("SERVED: t.glass.panel STILL PRESENT");
        if (body.includes('color: "#fff"')) console.log("SERVED: FAB color #fff present");
        if (body.includes("const AIChatbot")) console.log("SERVED: AIChatbot definition present");
        if (!body.includes("t.glass.panel") && body.includes('color: "#fff"')) console.log("SERVED: fixed file confirmed");
    });
}).on("error", (e) => console.log("ERR", e.message));
