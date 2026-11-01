import { assignVars, createGlobalTheme, createThemeContract, globalStyle } from "@vanilla-extract/css"

/**
 * デザイントークン。コンポーネントの .css.ts からは vars.color.text のように参照する。
 * 実体は CSS 変数（var(--color-text) など）なので、ライト/ダークの切り替えは値の差し替えだけで済む。
 */
export const vars = createThemeContract({
    color: {
        text: 'color-text',
        textMuted: 'color-text-muted',
        border: 'color-border',
        accent: 'color-accent',
        canvasBg: 'color-canvas-bg',
        canvasDot: 'color-canvas-dot',
        panelBg: 'color-panel-bg',
        hoverBg: 'color-hover-bg',
        selectedBg: 'color-selected-bg',
        warningBg: 'color-warning-bg',
    },
})

const light = {
    color: {
        text: '#1e1e1e',
        textMuted: '#6b6b6b',
        border: '#e5e4e7',
        accent: '#0d99ff',
        canvasBg: '#f5f5f5',
        canvasDot: '#cfcfcf',
        panelBg: '#ffffff',
        hoverBg: 'rgba(0, 0, 0, 0.06)',
        selectedBg: 'rgba(13, 153, 255, 0.14)',
        warningBg: '#fff6e0',
    },
}

const dark = {
    color: {
        text: '#f0f0f0',
        textMuted: '#a0a0a0',
        border: '#3a3a3a',
        accent: '#0d99ff',
        canvasBg: '#1e1e1e',
        canvasDot: '#3a3a3a',
        panelBg: '#2c2c2c',
        hoverBg: 'rgba(255, 255, 255, 0.08)',
        selectedBg: 'rgba(13, 153, 255, 0.28)',
        warningBg: '#4a3b16',
    },
}

createGlobalTheme(':root', vars, light)

globalStyle(':root', {
    '@media': {
        '(prefers-color-scheme: dark)': {
            vars: assignVars(vars, dark),
        },
    },
})
