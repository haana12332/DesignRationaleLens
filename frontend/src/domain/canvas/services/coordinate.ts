/**
 * Point と Viewport という「データ」を受け取り、別の Point や Viewport を返す純粋関数の集まり。
 *
 * - worldToScreen / screenToWorld：ワールド座標とスクリーン座標を相互変換する
 * - zoomAtPoint：スクリーン上の指定した点を中心にズームした、新しい Viewport を計算する
 */
import type { Point } from "../entities/Point";
import type { Viewport } from "@/domain/canvas/entities/Viewport";

/** ワールド座標をスクリーン座標に変換する */
export function worldToScreen(
    point: Point, // 変換したいワールド座標上の点（例：ノードの位置）
    viewport: Viewport // 現在のカメラ状態（オフセットとズーム）
): Point {
    return {
        x: point.x * viewport.zoom + viewport.x,
        y: point.y * viewport.zoom + viewport.y,
    }
}

/** スクリーン座標をワールド座標に変換する（worldToScreenの逆関数） */
export function screenToWorld(
    point: Point, // 変換したいスクリーン座標上の点（例：マウス位置）
    viewport: Viewport // 現在のカメラ状態（オフセットとズーム）
): Point {
    return {
        x: (point.x - viewport.x) / viewport.zoom,
        y: (point.y - viewport.y) / viewport.zoom
    }
}

/** screenPointが指すワールド座標を固定したまま、ズームだけ変化させた新しいViewportを返す */
export function zoomAtPoint(
    screenPoint: Point, // ズームの中心にしたいスクリーン座標上の点（マウス位置など）
    viewport: Viewport, // ズーム前のカメラ状態
    factor: number // 1より大きければズームイン、小さければズームアウト
): Viewport {
    const worldPoint: Point = screenToWorld(screenPoint, viewport);
    const newZoom = viewport.zoom * factor;

    return {
        // screenPointの位置が指すワールド座標が変わらないよう、新しいオフセットを逆算する
        x: screenPoint.x - worldPoint.x * newZoom,
        y: screenPoint.y - worldPoint.y * newZoom,
        zoom: newZoom
    }
}