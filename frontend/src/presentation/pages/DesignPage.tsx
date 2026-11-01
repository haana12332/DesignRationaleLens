import { useRef } from "react"
import type { ChangeEvent } from "react"

import type { CanvasUseCases } from "@/application/canvas"
import type { GuiElementUseCases } from "@/application/guiElement"
import Canvas from "@/presentation/features/Canvas"
import useEditor from "@/presentation/hooks/useEditor"

type Props = {
    canvasUseCases: CanvasUseCases
    guiElementUseCases: GuiElementUseCases
}

/** 設計ページ（/design/:verification_id）。インポートした GUI 成果物を配置する無限キャンバス */
export function DesignPage({ canvasUseCases, guiElementUseCases }: Props) {
    const editor = useEditor(canvasUseCases, guiElementUseCases)
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
            if (typeof text === "string") {
                editor.importSvg(text)
            }
        }
        reader.readAsText(file)

        // 同じファイルを再インポートできるようリセット
        event.target.value = ""
    }

    return (
        <div style={{ position: "relative", height: "100%" }}>
            <Canvas
                viewport={editor.viewport}
                elements={editor.elements}
                selectedId={editor.selectedId}
                onPan={editor.pan}
                onZoom={editor.zoomAt}
                onSelectAt={editor.selectAt}
                onMoveElement={editor.moveElement}
            />

            {/* Import ボタン（左上に固定表示） */}
            <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10 }}>
                <button
                    onClick={handleImportClick}
                    style={{
                        padding: "6px 16px",
                        borderRadius: 6,
                        border: "1px solid #3d5a80",
                        background: "#1e3a5f",
                        color: "#fff",
                        fontSize: 13,
                        cursor: "pointer",
                    }}
                >
                    Import SVG
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,image/svg+xml"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
            </div>

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
    )
}
