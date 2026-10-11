import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { RADIUS, ACCENTS } from "./tokens";

// ── GlassCard: frosted glass surface (glassmorphism only) ───────────────────
export const ClayCard = ({ t, children, sx = {}, hover = true, className = "", ...rest }) => (
    <Box
        {...rest}
        className={`clay-enter card-hover ${className}`.trim()}
        sx={{
            border: `1px solid ${t.border.subtle}`,
            borderRadius: `${RADIUS.lg}px`,
            background: t.glass.face,
            backdropFilter: `blur(${t.blur.card}px) saturate(1.25)`,
            WebkitBackdropFilter: `blur(${t.blur.card}px) saturate(1.25)`,
            boxShadow: t.shadow.glass,
            transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
            ...(hover && {
                "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: t.border.medium,
                    boxShadow: t.shadow.floating,
                },
            }),
            ...sx,
        }}
    >
        {children}
    </Box>
);

// ── GlassPanel: lighter frosted panel ───────────────────────────────────────
export const GlassPanel = ({ t, children, sx = {}, blur = 16, ...rest }) => (
    <Box
        {...rest}
        sx={{
            border: `1px solid ${t.border.subtle}`,
            borderRadius: `${RADIUS.lg}px`,
            background: t.glass.panel,
            backdropFilter: `blur(${blur}px) saturate(1.2)`,
            WebkitBackdropFilter: `blur(${blur}px) saturate(1.2)`,
            boxShadow: t.shadow.glassSm,
            ...sx,
        }}
    >
        {children}
    </Box>
);

// ── GlassInset: recessed frosted well (progress tracks, wells) ─────────────
export const ClayInset = ({ t, children, sx = {}, ...rest }) => (
    <Box
        {...rest}
        sx={{
            border: `1px solid ${t.border.subtle}`,
            borderRadius: `${RADIUS.md}px`,
            background: t.glass.inset,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: t.shadow.glassSm,
            ...sx,
        }}
    >
        {children}
    </Box>
);

// ── GlassButton: frosted glass CTA ──────────────────────────────────────────
export const ClayButton = ({ t, children, accent = ACCENTS.blue, variant = "filled", sx = {}, ...rest }) => {
    const styles =
        variant === "outline"
            ? {
                  color: accent,
                  border: `1.5px solid ${accent}66`,
                  background: t.dark ? `${accent}1a` : `${accent}12`,
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  boxShadow: t.shadow.glassSm,
                  "&:hover": { borderColor: accent, background: `${accent}22`, transform: "translateY(-1px)" },
              }
            : variant === "ghost"
              ? {
                    color: t.text.secondary,
                    border: `1px solid ${t.border.subtle}`,
                    background: "transparent",
                    "&:hover": { color: t.text.primary, borderColor: t.border.medium, background: t.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
                }
              : {
                    color: t.text.onAccent,
                    border: `1px solid ${accent}`,
                    background: `linear-gradient(135deg, ${accent}e6, ${accent}b8)`,
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    boxShadow: `0 8px 24px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
                    "&:hover": { filter: "brightness(1.08)", transform: "translateY(-1px)" },
                    "&:disabled": { opacity: 0.5, transform: "none" },
                };
    return (
        <Button
            {...rest}
            sx={{
                borderRadius: `${RADIUS.md}px`,
                textTransform: "none",
                fontWeight: 700,
                transition: "all 0.2s ease",
                ...styles,
                ...sx,
            }}
        >
            {children}
        </Button>
    );
};

// ── PageHeader: eyebrow + gradient title + subtitle ─────────────────────────
export const PageHeader = ({ t, eyebrow, title, subtitle, titleAccent = ACCENTS.blue, action = null }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3.5, flexWrap: "wrap", gap: 2 }}>
        <Box>
            <Typography sx={{ fontSize: 10, letterSpacing: 2.5, color: t.text.muted, mb: 1, fontWeight: 700 }}>
                {eyebrow}
            </Typography>
            <Typography
                sx={{
                    fontSize: 32,
                    fontWeight: 800,
                    background: t.dark
                        ? `linear-gradient(135deg, #fff, ${titleAccent})`
                        : `linear-gradient(135deg, ${t.text.primary}, ${titleAccent})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                {title}
            </Typography>
            {subtitle && (
                <Typography sx={{ fontSize: 13, color: t.text.secondary, mt: 1 }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
        {action}
    </Box>
);


// ── StatTile: clay KPI tile with icon bubble ────────────────────────────────
export const StatTile = ({ t, icon, value, label, sub = null, accent = ACCENTS.blue, sx = {} }) => (
    <ClayCard t={t} sx={{ p: 2.5, ...sx }}>
        <Box
            sx={{
                width: 42,
                height: 42,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                color: accent,
                background: t.dark ? `${accent}1c` : `${accent}14`,
                border: `1px solid ${accent}40`,
                boxShadow: t.shadow.glassSm,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
            }}
        >
            {icon}
        </Box>
        <Typography sx={{ fontSize: 30, fontWeight: 800, color: accent, lineHeight: 1 }}>
            {value}
        </Typography>
        <Typography sx={{ fontSize: 11, color: t.text.secondary, mt: 0.75 }}>{label}</Typography>
        {sub && (
            <Typography sx={{ fontSize: 10, color: t.text.muted, mt: 0.5 }}>{sub}</Typography>
        )}
    </ClayCard>
);

// ── SegmentTabs: clay segmented control ─────────────────────────────────────
export const SegmentTabs = ({ t, options, value, onChange, accent = ACCENTS.blue, sx = {} }) => (
    <ClayInset t={t} sx={{ display: "inline-flex", gap: 0.5, p: 0.5, borderRadius: "14px", ...sx }}>
        {options.map((opt) => {
            const v = typeof opt === "string" ? opt : opt.value;
            const label = typeof opt === "string" ? opt : opt.label;
            const active = value === v;
            return (
                <Box
                    key={v}
                    onClick={() => onChange(v)}
                    sx={{
                        px: 2.25,
                        py: 0.75,
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "capitalize",
                        transition: "all 0.2s ease",
                        color: active ? "#fff" : t.text.secondary,
                        background: active ? `linear-gradient(135deg, ${accent}e6, ${accent}b8)` : "transparent",
                        border: `1px solid ${active ? accent : "transparent"}`,
                        boxShadow: active ? `0 4px 14px ${accent}66, inset 0 1px 1px rgba(255,255,255,0.3)` : "none",
                        "&:hover": { color: active ? "#fff" : t.text.primary },
                    }}
                >
                    {label}
                </Box>
            );
        })}
    </ClayInset>
);

// ── ChartTooltip: glass tooltip for recharts ────────────────────────────────
export const ChartTooltip = ({ t, active, payload, label, suffix = "" }) => {
    if (!(active && payload && payload.length)) return null;
    return (
        <Box
            sx={{
                background: t.dark ? "rgba(14,14,22,0.94)" : "rgba(255,255,255,0.94)",
                border: `1px solid ${t.border.medium}`,
                borderRadius: "12px",
                p: 1.5,
                minWidth: 150,
                boxShadow: t.shadow.floating,
            }}
        >
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75, color: t.text.primary }}>{label}</Typography>
            {payload.map((p) => (
                <Box key={p.name} sx={{ display: "flex", justifyContent: "space-between", gap: 3, mb: 0.4 }}>
                    <Typography sx={{ fontSize: 11, color: p.color || ACCENTS.blue }}>{p.name}</Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: t.text.primary }}>
                        {Math.round(p.value)}
                        {suffix}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

// ── EmptyState / LoadingState ───────────────────────────────────────────────
export const EmptyState = ({ t, icon, title, subtitle = null, action = null }) => (
    <ClayCard t={t} hover={false} sx={{ textAlign: "center", py: 7, px: 3 }}>
        <Box
            sx={{
                width: 64,
                height: 64,
                borderRadius: "20px",
                mx: "auto",
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: t.glass.panel,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${t.border.subtle}`,
                color: t.text.muted,
                boxShadow: t.shadow.glassSm,
            }}
        >
            {icon}
        </Box>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: t.text.primary, mb: 0.75 }}>{title}</Typography>
        {subtitle && (
            <Typography sx={{ fontSize: 12, color: t.text.secondary, mb: action ? 2.5 : 0, maxWidth: 420, mx: "auto" }}>
                {subtitle}
            </Typography>
        )}
        {action}
    </ClayCard>
);

export const LoadingState = ({ t }) => (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh" }}>
        <Box
            sx={{
                width: 56,
                height: 56,
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: t.glass.panel,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${t.border.subtle}`,
                boxShadow: t.shadow.glass,
            }}
        >
            <CircularProgress size={26} sx={{ color: ACCENTS.blue }} />
        </Box>
    </Box>
);
