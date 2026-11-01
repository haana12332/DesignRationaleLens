import type { Offset, Point, Viewport } from "@/domain/canvas"
import { zoomAtPoint } from "@/domain/canvas"
import { MAX_ZOOM, MIN_ZOOM } from "./constants"

/*
 * キャンバスの見え方（表示範囲）を変えるユースケース。
 * どれも「今の Viewport を受け取って新しい Viewport を返す」だけの関数で、外部には依存しない。
 */

/** 表示位置を offset だけずらす */
export function panViewport(viewport: Viewport, offset: Offset): Viewport {
    return { x: viewport.x + offset.x, y: viewport.y + offset.y, zoom: viewport.zoom }
}

/** screenPoint を中心に拡大・縮小する。倍率は MIN_ZOOM〜MAX_ZOOM に収める */
export function zoomViewportAtPoint(screenPoint: Point, viewport: Viewport, factor: number): Viewport {
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, factor * viewport.zoom))
    const clampedFactor = newZoom / viewport.zoom

    return zoomAtPoint(screenPoint, viewport, clampedFactor)
}

/** キャンバスの操作のユースケース一覧。外部への依存がないので、そのまま渡せる */
export const canvasUseCases = {
    panViewport,
    zoomViewportAtPoint,
}

/** presentation 層はこの型だけに依存する */
export type CanvasUseCases = typeof canvasUseCases
