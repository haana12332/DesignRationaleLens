import type { LayerNode, LayerType } from "@/domain/layerTree"
import * as styles from "./LayerTreePanel.css"

type Props = {
    layerNodes: readonly LayerNode[]
    selectedLayerNodeId: string | null
    onSelectLayerNode: (id: string | null) => void
    onImportClick: () => void
}

/** 層タイプの略称（バッジ表示用） */
const LAYER_ABBR: Record<LayerType, string> = {
    page:     "P",
    template: "T",
    organism: "O",
    molecule: "M",
    atom:     "A",
}

type FlatRow = { node: LayerNode; depth: number }

/**
 * LayerNode の flat 配列から、表示順（DFS）とインデント深さを計算する。
 * parentId / order を使って元のツリー構造を再現する。
 */
function buildFlatRows(nodes: readonly LayerNode[]): FlatRow[] {
    const rows: FlatRow[] = []

    function walk(parentId: string | null, depth: number) {
        const children = [...nodes]
            .filter((n) => n.parentId === parentId)
            .sort((a, b) => a.order - b.order)
        for (const child of children) {
            rows.push({ node: child, depth })
            walk(child.id, depth + 1)
        }
    }

    walk(null, 0)
    return rows
}

/**
 * レイヤーツリーパネル（左サイドバー）。
 * インポートしたレイヤーノードを Atomic Design の階層で表示し、クリックで選択する。
 */
export function LayerTreePanel({ layerNodes, selectedLayerNodeId, onSelectLayerNode, onImportClick }: Props) {
    const rows = buildFlatRows(layerNodes)

    return (
        <aside className={styles.panel}>
            <div className={styles.header}>
                <button className={styles.importButton} onClick={onImportClick}>
                    Import SVG
                </button>
            </div>

            <div className={styles.tree}>
                {rows.length === 0 ? (
                    <p className={styles.emptyHint}>
                        SVG をインポートすると<br />レイヤーが表示されます
                    </p>
                ) : (
                    rows.map(({ node, depth }) => {
                        const selected = node.id === selectedLayerNodeId
                        return (
                            <div
                                key={node.id}
                                className={`${styles.nodeRow} ${selected ? styles.nodeRowSelected : ""}`}
                                style={{ paddingLeft: 12 + depth * 14 }}
                                onClick={() => onSelectLayerNode(node.id)}
                                role="button"
                                aria-pressed={selected}
                            >
                                <span className={styles.layerBadge[node.layer]}>
                                    {LAYER_ABBR[node.layer]}
                                </span>
                                <span className={styles.nodeName} title={node.figmaId}>
                                    {node.figmaId}
                                </span>
                            </div>
                        )
                    })
                )}
            </div>
        </aside>
    )
}
