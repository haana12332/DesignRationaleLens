import { useState } from 'react'

import type { LayerTreeUseCases } from '@/application/layerTree'
import type { LayerNode, ParseResult } from '@/domain/layerTree'
import { LAYER_LABEL_MAP } from '@/domain/layerTree'

/**
 * SVG インポートページの状態管理フック。
 * インポート操作の結果はブラウザコンソールに出力する。
 */
function useImport(layerTreeUseCases: LayerTreeUseCases) {
    const [svgText, setSvgText] = useState('')
    const [result, setResult] = useState<ParseResult | null>(null)

    function handleImport() {
        if (!svgText.trim()) return

        const parsed = layerTreeUseCases.importLayerTree(svgText)
        setResult(parsed)

        if (parsed.ok) {
            logSuccess(parsed.nodes)
        } else {
            console.group('[SVG Import] ❌ エラー')
            for (const error of parsed.errors) {
                console.group(`${error.code}`)
                console.log('場所:', error.path)
                console.log('内容:', error.message)
                console.log('直し方:', error.fix)
                console.groupEnd()
            }
            console.groupEnd()
        }
    }

    return { svgText, setSvgText, result, handleImport }
}

function logSuccess(nodes: LayerNode[]): void {
    const count = (layer: LayerNode['layer']) => nodes.filter(n => n.layer === layer).length

    console.group('[SVG Import] ✅ 成功')
    console.log(
        `${LAYER_LABEL_MAP.page}×${count('page')}  ` +
        `${LAYER_LABEL_MAP.template}×${count('template')}  ` +
        `${LAYER_LABEL_MAP.organism}×${count('organism')}  ` +
        `${LAYER_LABEL_MAP.molecule}×${count('molecule')}  ` +
        `${LAYER_LABEL_MAP.atom}×${count('atom')}`,
    )
    console.log('ノード一覧:')
    for (const node of nodes) {
        const depth = getDepth(node.id, nodes)
        const indent = '  '.repeat(depth)
        const absorbed = node.absorbedIds.length > 0
            ? ` [吸収: ${node.absorbedIds.join(', ')}]`
            : ''
        console.log(`${indent}${LAYER_LABEL_MAP[node.layer]} ${node.figmaId}${absorbed}`)
    }
    console.groupEnd()
}

/** ノードのツリー深度を返す（parentId を再帰的に辿る） */
function getDepth(nodeId: string, nodes: LayerNode[]): number {
    let depth = 0
    let current = nodes.find(n => n.id === nodeId)
    while (current?.parentId) {
        depth++
        current = nodes.find(n => n.id === current!.parentId)
    }
    return depth
}

export default useImport
