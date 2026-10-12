/**
 * StudyMarkdown.jsx — lightweight markdown renderer (no new dependencies).
 * Supports: headings, bold/italic/inline code, fenced code blocks with copy
 * button, bullet/numbered lists, tables, links, blockquotes, and $..$ / $$..$$
 * math passthrough (rendered as styled serif — KaTeX lib not installed).
 * Safe: only our own generated elements are rendered, user text is escaped
 * by React (no dangerouslySetInnerHTML anywhere).
 */
import { useState } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

const CodeBlock = ({ lang, code, t }) => {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try { await navigator.clipboard.writeText(code); } catch {
            const ta = document.createElement("textarea");
            ta.value = code; document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); } catch {}
            ta.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <Box sx={{ my: 1, borderRadius: "10px", overflow: "hidden", border: `1px solid ${t.border.subtle}`, background: "rgba(0,0,0,0.35)" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 0.5, background: "rgba(255,255,255,0.04)" }}>
                <Typography sx={{ fontSize: 9, color: t.text.muted, textTransform: "uppercase", letterSpacing: 1 }}>{lang || "code"}</Typography>
                <Tooltip title={copied ? "Copied!" : "Copy code"}>
                    <IconButton size="small" onClick={copy} sx={{ color: copied ? "#3ecf8e" : t.text.muted, p: 0.5 }}>
                        {copied ? <CheckRoundedIcon sx={{ fontSize: 13 }} /> : <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />}
                    </IconButton>
                </Tooltip>
            </Box>
            <Box component="pre" sx={{ m: 0, p: 1.5, overflowX: "auto", fontSize: 11.5, lineHeight: 1.55, color: "#e8ecf4", fontFamily: "ui-monospace, Consolas, monospace", whiteSpace: "pre" }}>{code}</Box>
        </Box>
    );
};

// Inline styles: **bold**, *italic*, `code`, $math$, links.
const renderInline = (text, t, keyPrefix) => {
    const parts = [];
    const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\$[^$]+\$|\[[^\]]+\]\([^)]+\))/g;
    let last = 0, m, k = 0;
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) parts.push(<span key={`${keyPrefix}-${k++}`}>{text.slice(last, m.index)}</span>);
        const tok = m[0];
        if (tok.startsWith("**")) parts.push(<strong key={`${keyPrefix}-${k++}`}>{tok.slice(2, -2)}</strong>);
        else if (tok.startsWith("`")) parts.push(<code key={`${keyPrefix}-${k++}`} style={{ background: "rgba(155,109,255,0.15)", padding: "0 4px", borderRadius: 4, fontSize: "0.92em" }}>{tok.slice(1, -1)}</code>);
        else if (tok.startsWith("$")) parts.push(<code key={`${keyPrefix}-${k++}`} style={{ background: "rgba(79,142,247,0.15)", padding: "0 4px", borderRadius: 4, fontFamily: "serif", fontStyle: "italic" }}>{tok.slice(1, -1)}</code>);
        else if (tok.startsWith("*")) parts.push(<em key={`${keyPrefix}-${k++}`}>{tok.slice(1, -1)}</em>);
        else if (tok.startsWith("[")) {
            const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
            if (lm && /^https?:\/\//.test(lm[2])) parts.push(<a key={`${keyPrefix}-${k++}`} href={lm[2]} target="_blank" rel="noreferrer" style={{ color: "#6ba3ff" }}>{lm[1]}</a>);
            else parts.push(<span key={`${keyPrefix}-${k++}`}>{tok}</span>);
        }
        last = m.index + tok.length;
    }
    if (last < text.length) parts.push(<span key={`${keyPrefix}-${k++}`}>{text.slice(last)}</span>);
    return parts.length === 1 ? parts[0] : parts;
};

const isTableSep = (line) => /^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes("-");
const splitRow = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

const StudyMarkdown = ({ text, t }) => {
    const lines = (text || "").split("\n");
    const blocks = [];
    let i = 0, k = 0;
    while (i < lines.length) {
        const line = lines[i];
        // Fenced code block
        const fence = /^```(\w*)\s*$/.exec(line);
        if (fence) {
            const lang = fence[1];
            const buf = [];
            i++;
            while (i < lines.length && !lines[i].startsWith("```")) { buf.push(lines[i]); i++; }
            i++;
            blocks.push(<CodeBlock key={k++} lang={lang} code={buf.join("\n")} t={t} />);
            continue;
        }
        // $$ math block $$
        if (line.trim() === "$$") {
            const buf = [];
            i++;
            while (i < lines.length && lines[i].trim() !== "$$") { buf.push(lines[i]); i++; }
            i++;
            blocks.push(
                <Box key={k++} sx={{ my: 1, p: 1.5, borderRadius: "10px", background: "rgba(79,142,247,0.1)", border: `1px solid ${t.border.subtle}`, fontFamily: "serif", fontStyle: "italic", fontSize: 13, textAlign: "center" }}>{buf.join("\n")}</Box>
            );
            continue;
        }
        // Table
        if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
            const head = splitRow(line);
            i += 2;
            const rows = [];
            while (i < lines.length && lines[i].includes("|")) { rows.push(splitRow(lines[i])); i++; }
            blocks.push(
                <Box key={k++} component="table" sx={{ my: 1, width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr>{head.map((c, j) => <Box component="th" key={j} sx={{ textAlign: "left", p: 0.75, borderBottom: `1px solid ${t.border.subtle}`, color: t.text.primary }}>{renderInline(c, t, `h${k}-${j}`)}</Box>)}</tr></thead>
                    <tbody>{rows.map((r, ri) => <tr key={ri}>{r.map((c, j) => <Box component="td" key={j} sx={{ p: 0.75, borderBottom: `1px solid ${t.border.subtle}`, color: t.text.secondary }}>{renderInline(c, t, `r${k}-${ri}-${j}`)}</Box>)}</tr>)}</tbody>
                </Box>
            );
            continue;
        }
        // Headings
        const h = /^(#{1,4})\s+(.*)$/.exec(line);
        if (h) {
            const lvl = h[1].length;
            blocks.push(<Typography key={k++} sx={{ fontSize: [15, 14, 13, 12][lvl - 1], fontWeight: 700, color: t.text.primary, mt: 1.2, mb: 0.5 }}>{renderInline(h[2], t, `h${k}`)}</Typography>);
            i++;
            continue;
        }
        // Blockquote
        if (line.trim().startsWith(">")) {
            blocks.push(<Box key={k++} sx={{ my: 0.75, pl: 1.5, borderLeft: "3px solid #9b6dff", color: t.text.secondary, fontSize: 12.5 }}>{renderInline(line.trim().replace(/^>\s?/, ""), t, `q${k}`)}</Box>);
            i++;
            continue;
        }
        // Lists
        if (/^\s*([-*•]|\d+[.)])\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\s*([-*•]|\d+[.)])\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*([-*•]|\d+[.)])\s+/, ""));
                i++;
            }
            const ordered = /^\s*\d+[.)]/.test(line);
            blocks.push(
                <Box key={k++} component={ordered ? "ol" : "ul"} sx={{ my: 0.75, pl: 2.5, fontSize: 12.5, color: t.text.secondary }}>
                    {items.map((it, j) => <li key={j} style={{ marginBottom: 3 }}>{renderInline(it, t, `l${k}-${j}`)}</li>)}
                </Box>
            );
            continue;
        }
        // Paragraph
        if (line.trim()) {
            blocks.push(<Typography key={k++} sx={{ fontSize: 12.5, lineHeight: 1.65, color: t.text.secondary, my: 0.5 }}>{renderInline(line, t, `p${k}`)}</Typography>);
        }
        i++;
    }
    return <Box>{blocks}</Box>;
};

export default StudyMarkdown;