import { style } from "@vanilla-extract/css"

import { vars } from "@/style/theme.css"

export const container = style({
    padding: 24,
    background: vars.color.panelBg,
})

export const button = style({
    marginLeft: 8,
    padding: "4px 12px",
    border: `1px solid ${vars.color.border}`,
    borderRadius: 6,
    background: vars.color.accent,
    color: "#fff",
    cursor: "pointer",
    ":disabled": {
        opacity: 0.4,
        cursor: "not-allowed",
    },
})
