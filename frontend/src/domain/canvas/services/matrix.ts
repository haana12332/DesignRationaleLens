import type { Matrix } from "../entities/Matrix"
import type { Offset } from "../entities/Offset"
import type { Point } from "../entities/Point"

/** 何も変えない行列 */
export const IDENTITY_MATRIX: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }

/** 行列の掛け算 m1 × m2（先に m2、次に m1 を当てるのと同じ） */
export function multiplyMatrix(m1: Matrix, m2: Matrix): Matrix {
    return {
        a: m1.a * m2.a + m1.c * m2.b,
        b: m1.b * m2.a + m1.d * m2.b,
        c: m1.a * m2.c + m1.c * m2.d,
        d: m1.b * m2.c + m1.d * m2.d,
        e: m1.a * m2.e + m1.c * m2.f + m1.e,
        f: m1.b * m2.e + m1.d * m2.f + m1.f,
    }
}

/** 点に行列を当てる */
export function applyMatrix(m: Matrix, p: Point): Point {
    return { x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f }
}

/** 移動量に行列を当てる（移動成分 e, f は使わない） */
export function applyMatrixToOffset(m: Matrix, offset: Offset): Offset {
    return { x: m.a * offset.x + m.c * offset.y, y: m.b * offset.x + m.d * offset.y }
}

/** 逆行列。逆にできない（つぶれた）行列なら null */
export function invertMatrix(m: Matrix): Matrix | null {
    const det = m.a * m.d - m.b * m.c
    if (Math.abs(det) < 1e-12) return null
    return {
        a: m.d / det,
        b: -m.b / det,
        c: -m.c / det,
        d: m.a / det,
        e: (m.c * m.f - m.d * m.e) / det,
        f: (m.b * m.e - m.a * m.f) / det,
    }
}

export function translateMatrix(x: number, y: number): Matrix {
    return { a: 1, b: 0, c: 0, d: 1, e: x, f: y }
}

export function scaleMatrix(sx: number, sy: number = sx): Matrix {
    return { a: sx, b: 0, c: 0, d: sy, e: 0, f: 0 }
}

/** 時計回りに degrees 度回す。center を指定すると、その点を軸に回す */
export function rotateMatrix(degrees: number, center: Point = { x: 0, y: 0 }): Matrix {
    const rad = (degrees * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const rotation = { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 }
    if (center.x === 0 && center.y === 0) return rotation
    return multiplyMatrix(translateMatrix(center.x, center.y), multiplyMatrix(rotation, translateMatrix(-center.x, -center.y)))
}

/** x 方向に degrees 度傾ける（SVG の skewX） */
export function skewXMatrix(degrees: number): Matrix {
    return { a: 1, b: 0, c: Math.tan((degrees * Math.PI) / 180), d: 1, e: 0, f: 0 }
}

/** y 方向に degrees 度傾ける（SVG の skewY） */
export function skewYMatrix(degrees: number): Matrix {
    return { a: 1, b: Math.tan((degrees * Math.PI) / 180), c: 0, d: 1, e: 0, f: 0 }
}

/**
 * 行列を「移動 → 回転 → 拡大縮小」に分ける。
 * 傾き（skew）があると正確には分けられないので、skewed を true にして返す。
 * scaleY が負のときは、上下が反転している。
 */
export function decomposeMatrix(m: Matrix): {
    translate: Point
    rotation: number // 度
    scaleX: number
    scaleY: number
    skewed: boolean
} {
    const scaleX = Math.hypot(m.a, m.b)
    if (scaleX < 1e-12) return { translate: { x: m.e, y: m.f }, rotation: 0, scaleX: 0, scaleY: 0, skewed: false }
    const rotation = (Math.atan2(m.b, m.a) * 180) / Math.PI
    const scaleY = (m.a * m.d - m.b * m.c) / scaleX
    // 回転した x 軸と y 軸が直角でなければ傾いている
    const skew = (m.a * m.c + m.b * m.d) / (scaleX * scaleX)
    return { translate: { x: m.e, y: m.f }, rotation, scaleX, scaleY, skewed: Math.abs(skew) > 1e-6 }
}
