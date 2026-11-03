import { useEffect, useMemo, useState } from "react"

import type { GuiElement } from "@/domain/guiElement"
import type { LayerNode } from "@/domain/layerTree"

/** SVG ローカル座標でのバウンディングボックス（element.x/y は含まない） */
export type LocalBbox = { x: number; y: number; width: number; height: number }
/** nodeId → ローカル座標 bbox */
export type LocalBboxMap = ReadonlyMap<string, LocalBbox>

/**
 * 各 LayerNode の getBBox() をローカル（SVG 内部）座標で返す。
 *
 * 【設計の注意点】
 * - 隠しコンテナを document.body に追加して getBBox() を呼び出す。
 *   getBBox() はレンダリングされた要素にしか使えないため、DOM 挿入が必要。
 * - element.x/y は含まない（ローカル座標）ため、要素移動のたびに再計算しない。
 *   呼び出し元（Canvas）で element.x + bbox.x として世界座標に変換する。
 * - viewBox が "0 0 W H" 形式（Figma のデフォルト）を前提にしている。
 *   非ゼロ原点の viewBox は現時点では対応外。
 */
export function useLayerBBoxes(
    elements: readonly GuiElement[],
    layerNodes: readonly LayerNode[],
): LocalBboxMap {
    const [bboxMap, setBboxMap] = useState<Map<string, LocalBbox>>(new Map())

    // svgContent の追加・削除のときだけ再計測するためのキー
    // element.x/y の変化は無視（ローカル座標は位置に依存しないため）
    const contentKey = useMemo(
        () => elements.map((e) => `${e.id}:${e.svgContent ? "1" : "0"}`).join("|"),
        [elements],
    )

    useEffect(() => {
        const map = new Map<string, LocalBbox>()

        for (const element of elements) {
            if (!element.svgContent) continue

            const nodesForElement = layerNodes.filter((n) => n.svgId === element.id)
            if (nodesForElement.length === 0) continue

            // 隠しコンテナを DOM に追加して getBBox() を可能にする
            const container = document.createElement("div")
            container.style.cssText =
                "position:fixed;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;width:0;height:0;overflow:visible"
            container.innerHTML = element.svgContent
            document.body.appendChild(container)

            const svg = container.querySelector("svg") as SVGSVGElement | null
            if (svg) {
                for (const node of nodesForElement) {
                    const g = svg.querySelector(
                        `[id="${node.figmaId}"]`,
                    ) as SVGGraphicsElement | null
                    if (!g) continue
                    try {
                        const b = g.getBBox()
                        // 幅・高さが 0 の要素（非表示レイヤーなど）はスキップ
                        if (b.width > 0 || b.height > 0) {
                            map.set(node.id, { x: b.x, y: b.y, width: b.width, height: b.height })
                        }
                    } catch {
                        // getBBox() はジオメトリのない要素で例外を投げることがある
                    }
                }
            }

            document.body.removeChild(container)
        }

        setBboxMap(map)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentKey, layerNodes])

    return bboxMap
}
