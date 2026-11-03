import { style } from "@vanilla-extract/css"

import { vars } from "@/style/theme.css"

// ---- グリッドドットの色（JS 側で backgroundImage を組み立てるために export） ----
export const dotColor = vars.color.canvasDot

// ---- レイアウト ----

export const root = style({
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    backgroundColor: vars.color.canvasBg,
    touchAction: "none",
    userSelect: "none",
    cursor: "default",
})

/** レイヤーにホバーしているときのカーソル */
export const rootLayerHovered = style({ cursor: "pointer" })

export const svg = style({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    display: "block",
})

// ---- SVG 要素 ----

/** svgContent のない GUI 成果物のフォールバック矩形 */
export const element = style({
    fill: vars.color.panelBg,
    stroke: vars.color.border,
    strokeWidth: 1,
})

/** ホバー中レイヤーのアウトライン（fill なし、枠線のみ） */
export const layerHoverOverlay = style({
    fill: "none",
    stroke: vars.color.accent,
    strokeWidth: 2,
    vectorEffect: "non-scaling-stroke",
    pointerEvents: "none",
})

// ---- ラベル ----

export const label = style({
    position: "absolute",
    transform: "translateY(-100%)",
    paddingBottom: 4,
    fontSize: 11,
    color: vars.color.textMuted,
    whiteSpace: "nowrap",
    pointerEvents: "none",
})

/** 選択中レイヤーのラベル */
export const labelSelected = style({ color: vars.color.accent })

// ---- UI パーツ ----

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
