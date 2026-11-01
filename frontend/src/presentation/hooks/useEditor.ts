import { useState } from "react"

import type { CanvasUseCases } from "@/application/canvas"
import type { GuiElementUseCases } from "@/application/guiElement"
import type { Offset, Point, Viewport } from "@/domain/canvas"
import type { GuiElement } from "@/domain/guiElement"
import { SAMPLE_ELEMENTS } from "./sampleElements"

const INITIAL_VIEWPORT: Viewport = { x: 80, y: 80, zoom: 1 }

/**
 * 設計キャンバスの状態（表示範囲・要素・選択）と、それを変える操作をまとめたフック。
 * 計算はユースケースに任せ、ここでは状態の持ち方だけを担当する。
 */
function useEditor(canvasUseCases: CanvasUseCases, guiElementUseCases: GuiElementUseCases) {
    const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT)
    const [elements] = useState<GuiElement[]>(SAMPLE_ELEMENTS)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    function pan(offset: Offset) {
        setViewport((v) => canvasUseCases.panViewport(v, offset))
    }

    function zoomAt(screenPoint: Point, factor: number) {
        setViewport((v) => canvasUseCases.zoomViewportAtPoint(screenPoint, v, factor))
    }

    /** キャンバス座標の point にある要素を選ぶ（何もなければ選択を外す） */
    function selectAt(point: Point) {
        setSelectedId(guiElementUseCases.selectElementAt(elements, point))
    }

    return { viewport, elements, selectedId, pan, zoomAt, selectAt }
}
export default useEditor
