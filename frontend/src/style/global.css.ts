import { globalStyle } from "@vanilla-extract/css"

import { vars } from "./theme.css"

globalStyle(':root', {
    font: "14px/1.4 system-ui, 'Segoe UI', Roboto, sans-serif",
    colorScheme: 'dark',
    color: vars.color.text,
})

globalStyle('html, body, #root', {
    height: '100%',
    margin: 0,
})

globalStyle('body', {
    // トラックパッドのスワイプで「戻る」が発動しないようにする
    overscrollBehavior: 'none',
})
