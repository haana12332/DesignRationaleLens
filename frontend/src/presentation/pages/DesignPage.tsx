import { useRef } from "react"
import type { ChangeEvent } from "react"

import type { CanvasUseCases } from "@/application/canvas"
import type { GuiElementUseCases } from "@/application/guiElement"
import type { LayerTreeUseCases } from "@/application/layerTree"
import { saveGuiArtifact } from "@/infra/guiArtifactApi"
import Canvas from "@/presentation/features/Canvas"
import { LayerTreePanel } from "@/presentation/features/LayerTreePanel"
import { RationalePanel } from "@/presentation/features/RationalePanel"
import useEditor from "@/presentation/hooks/useEditor"
import { useLayerBBoxes } from "@/presentation/hooks/useLayerBBoxes"

type Props = {
    canvasUseCases: CanvasUseCases
    guiElementUseCases: GuiElementUseCases
    layerTreeUseCases: LayerTreeUseCases
}

/** 設計ページ（/design/:verification_id）。インポートした GUI 成果物を配置する無限キャンバス */
export function DesignPage({ canvasUseCases, guiElementUseCases, layerTreeUseCases }: Props) {
    const editor = useEditor(canvasUseCases, guiElementUseCases, layerTreeUseCases)
    const layerBBoxes = useLayerBBoxes(editor.elements, editor.layerNodes)
    const fileInputRef = useRef<HTMLInputElement>(null)

    function handleImportClick() {
        fileInputRef.current?.click()
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result
            if (typeof text !== "string") return

            const result = editor.importSvg(text)
            if (result) {
                // DB への保存は非同期で行う（失敗しても画面表示には影響しない）
                saveGuiArtifact(result.element, result.nodes).catch((err) =>
                    console.error("[DesignPage] DB 保存に失敗:", err),
                )
            }
        }
        reader.readAsText(file)

        // 同じファイルを再インポートできるようリセット
        event.target.value = ""
    }

    // 選択中のレイヤーノードを取得
    const selectedNode = editor.selectedLayerNodeId
        ? editor.layerNodes.find((n) => n.id === editor.selectedLayerNodeId) ?? null
        : null

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            {/* 左: レイヤーツリーパネル */}
            <LayerTreePanel
                layerNodes={editor.layerNodes}
                selectedLayerNodeId={editor.selectedLayerNodeId}
                onSelectLayerNode={editor.selectLayerNode}
                onImportClick={handleImportClick}
            />

            {/* 中央: キャンバス */}
            <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                <Canvas
                    viewport={editor.viewport}
                    elements={editor.elements}
                    layerNodes={editor.layerNodes}
                    layerBBoxes={layerBBoxes}
                    selectedLayerNodeId={editor.selectedLayerNodeId}
                    onPan={editor.pan}
                    onZoom={editor.zoomAt}
                    onMoveElement={editor.moveElement}
                    onSelectLayerNode={editor.selectLayerNode}
                />

                {/* インポートエラートースト（4 秒で自動消去） */}
                {editor.importError && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: 48,
                            left: "50%",
                            transform: "translateX(-50%)",
                            padding: "8px 16px",
                            borderRadius: 6,
                            background: "#c62828",
                            color: "#fff",
                            fontSize: 13,
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {editor.importError}
                    </div>
                )}
            </div>

            {/* 右: 設計根拠パネル（レイヤーが選択されているときだけ表示） */}
            {selectedNode && (
                <RationalePanel node={selectedNode} />
            )}

            {/* 非表示ファイル入力 */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
        </div>
    )
}
