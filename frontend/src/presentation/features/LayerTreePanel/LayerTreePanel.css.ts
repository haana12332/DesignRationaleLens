import { style, styleVariants } from "@vanilla-extract/css"
import { vars } from "@/style/theme.css"

export const panel = style({
    width: 220,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    background: vars.color.panelBg,
    borderRight: `1px solid ${vars.color.border}`,
    overflow: "hidden",
})

export const header = style({
    padding: "10px 12px",
    borderBottom: `1px solid ${vars.color.border}`,
})

export const importButton = style({
    width: "100%",
    padding: "6px 0",
    borderRadius: 6,
    border: `1px solid #3d5a80`,
    background: "#1e3a5f",
    color: "#fff",
    fontSize: 13,
    cursor: "pointer",
    ":hover": { opacity: 0.85 },
})

export const tree = style({
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
})

export const emptyHint = style({
    padding: "12px 16px",
    fontSize: 12,
    color: vars.color.textMuted,
})

export const nodeRow = style({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 12px",
    cursor: "pointer",
    userSelect: "none",
    ":hover": { background: vars.color.hoverBg },
})

/** 選択中ノード: 少し濃いめの水色 */
export const nodeRowSelected = style({
    background: "rgba(13, 153, 255, 0.30)",
    ":hover": { background: "rgba(13, 153, 255, 0.30)" },
})

/** 選択中ノードの直下子ノード: 現在の水色（vars.color.selectedBg と同値） */
export const nodeRowChild = style({
    background: vars.color.selectedBg,
    ":hover": { background: vars.color.selectedBg },
})

export const layerBadge = styleVariants({
    page:     { fontSize: 10, fontWeight: "bold", color: "#2563eb", minWidth: 14 },
    template: { fontSize: 10, fontWeight: "bold", color: "#7c3aed", minWidth: 14 },
    organism: { fontSize: 10, fontWeight: "bold", color: "#059669", minWidth: 14 },
    molecule: { fontSize: 10, fontWeight: "bold", color: "#d97706", minWidth: 14 },
    atom:     { fontSize: 10, fontWeight: "bold", color: "#6b7280", minWidth: 14 },
})

export const nodeName = style({
    fontSize: 12,
    color: vars.color.text,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
})
