import type { Point } from "@/domain/canvas"
import type { GuiElement } from "@/domain/guiElement"
import { findElementAt } from "@/domain/guiElement"

/*
 * キャンバス上の要素に関するユースケース。外部には依存しない。
 */

/** キャンバス座標の point にある要素の id を返す（なければ null） */
export function selectElementAt(elements: readonly GuiElement[], point: Point): string | null {
    return findElementAt(elements, point)?.id ?? null
}

/** 要素のユースケース一覧 */
export const guiElementUseCases = {
    selectElementAt,
}

/** presentation 層はこの型だけに依存する */
export type GuiElementUseCases = typeof guiElementUseCases
