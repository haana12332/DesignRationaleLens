import { describe, expect, test } from "vitest"

import { panViewport, zoomViewportAtPoint } from "./canvas.usecase"
import { MAX_ZOOM, MIN_ZOOM } from "./constants"

describe('panViewport', () => {
    test('表示位置だけがずれ、拡大率は変わらない', () => {
        expect(panViewport({ x: 10, y: 20, zoom: 2 }, { x: 5, y: -3 })).toEqual({ x: 15, y: 17, zoom: 2 })
    })
})

describe('zoomViewportAtPoint', () => {
    test('ズームが上限・下限を超えない', () => {
        const viewport = { x: 0, y: 0, zoom: 1 }
        const point = { x: 100, y: 100 }

        expect(zoomViewportAtPoint(point, viewport, 1000).zoom).toBeCloseTo(MAX_ZOOM)
        expect(zoomViewportAtPoint(point, viewport, 0.0001).zoom).toBeCloseTo(MIN_ZOOM)
        expect(zoomViewportAtPoint(point, viewport, 2).zoom).toBeCloseTo(2)
    })
})
