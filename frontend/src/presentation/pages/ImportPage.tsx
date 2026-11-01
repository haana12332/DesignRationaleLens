import type { LayerTreeUseCases } from '@/application/layerTree'
import useImport from '@/presentation/hooks/useImport'

type Props = {
    layerTreeUseCases: LayerTreeUseCases
}

/** SVG インポートページ（/import/:verification_id）。結果はブラウザコンソールに出力する */
export function ImportPage({ layerTreeUseCases }: Props) {
    const { svgText, setSvgText, result } = useImport(layerTreeUseCases)

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>SVG インポート</h2>
            <textarea
                value={svgText}
                onChange={(e) => setSvgText(e.target.value)}
                placeholder="Figma からコピーした SVG を貼り付けてください（貼り付けた瞬間にコンソールへ出力されます）"
                rows={10}
                style={{ fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
            />
            {result && (
                <p style={{ fontSize: 13, color: result.ok ? '#0d7e0d' : '#c62828' }}>
                    {result.ok
                        ? `✅ ${result.nodes.length} ノードを取り込みました（詳細はコンソールを確認）`
                        : `❌ ${result.errors.length} 件のエラーがあります（詳細はコンソールを確認）`}
                </p>
            )}
        </div>
    )
}
