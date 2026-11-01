import { useEffect, useState } from "react"

import type { CanvasUseCases } from "@/application/canvas"
import type { GuiElementUseCases } from "@/application/guiElement"
import type { Offset, Point, Viewport } from "@/domain/canvas"
import type { GuiElement } from "@/domain/guiElement"

const INITIAL_VIEWPORT: Viewport = { x: 80, y: 80, zoom: 1 }
/** エラーメッセージを自動消去するまでの時間（ms） */
const ERROR_DISMISS_MS = 4000

/**
 * 設計キャンバスの状態（表示範囲・要素・選択）と、それを変える操作をまとめたフック。
 * 計算はユースケースに任せ、ここでは状態の持ち方だけを担当する。
 */
function useEditor(canvasUseCases: CanvasUseCases, guiElementUseCases: GuiElementUseCases) {
    const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT)
    const [elements, setElements] = useState<GuiElement[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [importError, setImportError] = useState<string | null>(null)

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

    /** ファイルから読み込んだ SVG 文字列をキャンバスに追加する */
    function importSvg(rawSvg: string) {
        const result = guiElementUseCases.pasteGuiArtifact(rawSvg, elements.length)
        if (!result.ok) {
            setImportError(result.error)
            return
        }
        setElements((prev) => [...prev, result.element])
        setImportError(null)
    }

    /**
     * 指定した要素をワールド座標で (dx, dy) だけ移動する。
     * 現時点では P_ 要素全体（SVG ひとまとまり）が動く。
     * 子階層の個別移動は Atomic Design 分割の Issue で対応予定。
     */
    function moveElement(id: string, dx: number, dy: number) {
        setElements((prev) =>
            prev.map((el) => (el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el)),
        )
    }

    // エラーを一定時間後に自動消去する
    useEffect(() => {
        if (!importError) return
        const id = setTimeout(() => setImportError(null), ERROR_DISMISS_MS)
        return () => clearTimeout(id)
    }, [importError])

    return { viewport, elements, selectedId, importError, pan, zoomAt, selectAt, importSvg, moveElement }
}
export default useEditor
