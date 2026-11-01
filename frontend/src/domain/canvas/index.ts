/** canvas の窓口。キャンバスそのもの（表示範囲・座標系）に関するもの */
export type { Matrix } from "./entities/Matrix"
export type { Offset } from "./entities/Offset"
export type { Point } from "./entities/Point"
export type { Viewport } from "./entities/Viewport"
export { screenToWorld, worldToScreen, zoomAtPoint } from "./services/coordinate"
export {
    IDENTITY_MATRIX,
    applyMatrix,
    applyMatrixToOffset,
    decomposeMatrix,
    invertMatrix,
    multiplyMatrix,
    rotateMatrix,
    scaleMatrix,
    skewXMatrix,
    skewYMatrix,
    translateMatrix,
} from "./services/matrix"
