import type { Point } from "@/domain/canvas"
import type { GuiElement } from "../entities/GuiElement"

/** キャンバス座標の点が要素の範囲内にあるか */
export function containsPoint(element: GuiElement, point: Point): boolean {
    return (
        point.x >= element.x &&
        point.x <= element.x + element.width &&
        point.y >= element.y &&
        point.y <= element.y + element.height
    )
}

/** 点にある一番手前（配列の後ろほど手前）の要素。なければ null */
export function findElementAt(elements: readonly GuiElement[], point: Point): GuiElement | null {
    for (let i = elements.length - 1; i >= 0; i--) {
        if (containsPoint(elements[i], point)) return elements[i]
    }
    return null
}
