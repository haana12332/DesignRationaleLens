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

    return (
        <div style={{ position: "relative", height: "100%" }}>
            <Canvas
                viewport={editor.viewport}
                elements={editor.elements}
                selectedId={editor.selectedId}
                onPan={editor.pan}
                onZoom={editor.zoomAt}
                onSelectAt={editor.selectAt}
            />
        </div>
    )
}
