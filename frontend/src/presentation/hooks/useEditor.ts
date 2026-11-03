import { useEffect, useState } from "react"

import type { CanvasUseCases } from "@/application/canvas"
import type { GuiElementUseCases } from "@/application/guiElement"
import type { LayerTreeUseCases } from "@/application/layerTree"
import type { Offset, Point, Viewport } from "@/domain/canvas"
import type { GuiElement } from "@/domain/guiElement"
import type { LayerNode } from "@/domain/layerTree"

const INITIAL_VIEWPORT: Viewport = { x: 80, y: 80, zoom: 1 }
const ERROR_DISMISS_MS = 4000

/**
 * 設計キャンバスの状態（表示範囲・要素・レイヤーツリー・選択）と操作をまとめたフック。
 * 計算はユースケースに任せ、ここでは状態の持ち方だけを担当する。
 */
function useEditor(
    canvasUseCases: CanvasUseCases,
    guiElementUseCases: GuiElementUseCases,
    layerTreeUseCases: LayerTreeUseCases,
) {
    const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT)
    const [elements, setElements] = useState<GuiElement[]>([])
    const [layerNodes, setLayerNodes] = useState<LayerNode[]>([])
    const [selectedLayerNodeId, setSelectedLayerNodeId] = useState<string | null>(null)
    const [importError, setImportError] = useState<string | null>(null)

    function pan(offset: Offset) {
        setViewport((v) => canvasUseCases.panViewport(v, offset))
    }

    function zoomAt(screenPoint: Point, factor: number) {
        setViewport((v) => canvasUseCases.zoomViewportAtPoint(screenPoint, v, factor))
    }

    /**
     * SVG ファイルを読み込んでキャンバスに追加する。
     * - GuiElement.id を layerNode.svgId として使うことで両者を紐付ける
     * - 作成した GuiElement と nodes を返す（DB 保存のために呼び出し元が使う）
     */
    function importSvg(rawSvg: string): { element: GuiElement; nodes: LayerNode[] } | null {
        const elementResult = guiElementUseCases.pasteGuiArtifact(rawSvg, elements.length)
        if (!elementResult.ok) {
            setImportError(elementResult.error)
            return null
        }

        // GuiElement.id を svgId として渡すことで LayerNode と GuiElement を接続する
        const treeResult = layerTreeUseCases.importLayerTree(rawSvg, elementResult.element.id)
        const nodes = treeResult.ok ? treeResult.nodes : []

        setElements((prev) => [...prev, elementResult.element])
        setLayerNodes((prev) => [...prev, ...nodes])
        setImportError(null)

        return { element: elementResult.element, nodes }
    }

    /**
     * 指定した GUI 成果物をワールド座標で (dx, dy) だけ移動する。
     * P_ 要素全体（SVG ひとまとまり）が動く。
     */
    function moveElement(id: string, dx: number, dy: number) {
        setElements((prev) =>
            prev.map((el) => (el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el)),
        )
    }

    /**
     * レイヤーノードを選択する。
     * - 異なる id → 選択切り替え
     * - 同じ id / null → 選択解除
     */
    function selectLayerNode(id: string | null) {
        setSelectedLayerNodeId((prev) => (prev === id ? null : id))
    }

    useEffect(() => {
        if (!importError) return
        const timerId = setTimeout(() => setImportError(null), ERROR_DISMISS_MS)
        return () => clearTimeout(timerId)
    }, [importError])

    return {
        viewport, elements, layerNodes, selectedLayerNodeId, importError,
        pan, zoomAt, importSvg, moveElement, selectLayerNode,
    }
}
export default useEditor
