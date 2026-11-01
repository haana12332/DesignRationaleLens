import { style } from "@vanilla-extract/css"

import { vars } from "@/style/theme.css"

export const dotColor = vars.color.canvasDot

export const root = style({
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    backgroundColor: vars.color.canvasBg,
    touchAction: "none",
    userSelect: "none",
    cursor: "default",
})

export const svg = style({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    display: "block",
})

export const element = style({
    fill: vars.color.panelBg,
    stroke: vars.color.border,
    strokeWidth: 1,
})

export const label = style({
    position: "absolute",
    transform: "translateY(-100%)",
    paddingBottom: 4,
    fontSize: 11,
    color: vars.color.textMuted,
    whiteSpace: "nowrap",
    pointerEvents: "none",
})

export const labelSelected = style({ color: vars.color.accent })

export const selection = style({
    position: "absolute",
    boxSizing: "border-box",
    border: `1.5px solid ${vars.color.accent}`,
    pointerEvents: "none",
})

export const zoom = style({
    position: "absolute",
    right: 12,
    bottom: 12,
    padding: "2px 8px",
    borderRadius: 6,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.panelBg,
    color: vars.color.textMuted,
    fontSize: 12,
    fontVariantNumeric: "tabular-nums",
    pointerEvents: "none",
})
