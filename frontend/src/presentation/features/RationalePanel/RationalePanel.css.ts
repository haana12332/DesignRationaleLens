import { style } from "@vanilla-extract/css"
import { vars } from "@/style/theme.css"

export const panel = style({
    width: 260,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    background: vars.color.panelBg,
    borderLeft: `1px solid ${vars.color.border}`,
    overflow: "hidden",
})

export const header = style({
    padding: "12px 14px 10px",
    borderBottom: `1px solid ${vars.color.border}`,
})

export const layerLabel = style({
    fontSize: 11,
    color: vars.color.textMuted,
    marginBottom: 2,
})

export const layerName = style({
    fontSize: 14,
    fontWeight: 600,
    color: vars.color.text,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
})

export const addSection = style({
    padding: "12px 14px",
    borderBottom: `1px solid ${vars.color.border}`,
})

export const addLabel = style({
    fontSize: 12,
    color: vars.color.textMuted,
    marginBottom: 6,
})

export const textarea = style({
    width: "100%",
    boxSizing: "border-box",
    minHeight: 72,
    padding: "6px 8px",
    border: `1px solid ${vars.color.border}`,
    borderRadius: 6,
    background: vars.color.canvasBg,
    color: vars.color.text,
    fontSize: 13,
    resize: "vertical",
    fontFamily: "inherit",
    ":focus": {
        outline: "none",
        borderColor: vars.color.accent,
    },
})

export const addButton = style({
    marginTop: 8,
    width: "100%",
    padding: "6px 0",
    borderRadius: 6,
    border: "none",
    background: vars.color.accent,
    color: "#fff",
    fontSize: 13,
    cursor: "pointer",
    ":hover": { opacity: 0.85 },
    ":disabled": { opacity: 0.4, cursor: "default" },
})

export const commentList = style({
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
})

export const commentItem = style({
    padding: "10px 14px",
    borderBottom: `1px solid ${vars.color.border}`,
})

export const commentContent = style({
    fontSize: 13,
    color: vars.color.text,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    marginBottom: 4,
})

export const commentMeta = style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
})

export const commentDate = style({
    fontSize: 11,
    color: vars.color.textMuted,
})

export const deleteButton = style({
    fontSize: 11,
    color: vars.color.textMuted,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px 4px",
    borderRadius: 4,
    ":hover": { color: "#c62828", background: vars.color.hoverBg },
})

export const loadingText = style({
    padding: "12px 14px",
    fontSize: 12,
    color: vars.color.textMuted,
})

export const emptyText = style({
    padding: "12px 14px",
    fontSize: 12,
    color: vars.color.textMuted,
})
