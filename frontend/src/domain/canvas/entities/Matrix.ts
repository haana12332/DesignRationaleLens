/**
 * 2D の変換行列（アフィン変換）。SVG の matrix(a b c d e f) と同じ並び。
 *
 *   x' = a * x + c * y + e
 *   y' = b * x + d * y + f
 *
 * 移動・回転・拡大縮小・傾きを1つの値で表せる。
 * 要素の中の座標をキャンバス上の座標に直すときや、SVG の transform を読むときに使う。
 */
export type Matrix = {
    a: number
    b: number
    c: number
    d: number
    e: number
    f: number
}
