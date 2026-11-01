import { describe, expect, test } from "vitest"

import {
    applyMatrix,
    decomposeMatrix,
    invertMatrix,
    multiplyMatrix,
    rotateMatrix,
    scaleMatrix,
    skewXMatrix,
    translateMatrix,
} from "./matrix"

describe('multiplyMatrix・applyMatrix', () => {
    test('右の行列から順に当たる（拡大してから移動）', () => {
        const m = multiplyMatrix(translateMatrix(10, 20), scaleMatrix(2))

        expect(applyMatrix(m, { x: 1, y: 1 })).toEqual({ x: 12, y: 22 })
    })

    test('90度回すと x 軸が下を向く（画面の座標は y が下向き）', () => {
        const p = applyMatrix(rotateMatrix(90), { x: 1, y: 0 })

        expect(p.x).toBeCloseTo(0)
        expect(p.y).toBeCloseTo(1)
    })

    test('中心を指定して回すと、中心は動かない', () => {
        const p = applyMatrix(rotateMatrix(45, { x: 5, y: 5 }), { x: 5, y: 5 })

        expect(p.x).toBeCloseTo(5)
        expect(p.y).toBeCloseTo(5)
    })
})

describe('invertMatrix', () => {
    test('逆行列を当てると元に戻る', () => {
        const m = multiplyMatrix(translateMatrix(3, -4), multiplyMatrix(rotateMatrix(30), scaleMatrix(2, 3)))
        const back = applyMatrix(invertMatrix(m)!, applyMatrix(m, { x: 7, y: 9 }))

        expect(back.x).toBeCloseTo(7)
        expect(back.y).toBeCloseTo(9)
    })

    test('つぶれた行列は逆にできない', () => {
        expect(invertMatrix(scaleMatrix(0, 1))).toBeNull()
    })
})

describe('decomposeMatrix', () => {
    test('移動・回転・拡大縮小に分けられる', () => {
        const m = multiplyMatrix(translateMatrix(10, 20), multiplyMatrix(rotateMatrix(30), scaleMatrix(2, 3)))
        const result = decomposeMatrix(m)

        expect(result.translate).toEqual({ x: 10, y: 20 })
        expect(result.rotation).toBeCloseTo(30)
        expect(result.scaleX).toBeCloseTo(2)
        expect(result.scaleY).toBeCloseTo(3)
        expect(result.skewed).toBe(false)
    })

    test('上下反転は scaleY が負になる', () => {
        expect(decomposeMatrix(scaleMatrix(1, -1)).scaleY).toBeCloseTo(-1)
    })

    test('傾きがあると skewed になる', () => {
        expect(decomposeMatrix(skewXMatrix(20)).skewed).toBe(true)
    })
})
