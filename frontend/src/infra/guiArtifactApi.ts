import type { LayerNode } from "@/domain/layerTree"
import type { GuiElement } from "@/domain/guiElement"
import { apiClient } from "./apiClient"

/** POST /api/gui-artifacts のリクエスト */
type CreateGuiArtifactRequest = {
    id: string
    name: string
    rawSvg: string
    canvasX: number
    canvasY: number
    layerNodes: Pick<LayerNode, "id" | "figmaId" | "layer" | "parentId" | "order" | "absorbedIds">[]
}

/**
 * SVG インポート時に gui_artifact と layer_nodes を一括保存する。
 * 失敗しても画面表示には影響させないため、呼び出し元でエラーを握りつぶして構わない。
 */
export async function saveGuiArtifact(element: GuiElement, nodes: LayerNode[]): Promise<void> {
    const body: CreateGuiArtifactRequest = {
        id: element.id,
        name: element.name,
        rawSvg: element.rawSvgContent ?? "",
        canvasX: element.x,
        canvasY: element.y,
        layerNodes: nodes.map((n) => ({
            id: n.id,
            figmaId: n.figmaId,
            layer: n.layer,
            parentId: n.parentId,
            order: n.order,
            absorbedIds: n.absorbedIds,
        })),
    }
    await apiClient.post("/gui-artifacts", body)
}

/**
 * ドラッグ移動後にキャンバス上の位置を DB に反映する。
 * 失敗時は握りつぶす（次のインポートで上書きされるため）。
 */
export async function updateArtifactPosition(
    id: string,
    canvasX: number,
    canvasY: number,
): Promise<void> {
    await apiClient.patch(`/gui-artifacts/${id}`, { canvasX, canvasY })
}
