import type { LayerTreeUseCases } from '@/application/layerTree'
import useImport from '@/presentation/hooks/useImport'

type Props = {
    layerTreeUseCases: LayerTreeUseCases
}

/** SVG インポートページ（/import/:verification_id）。結果はブラウザコンソールに出力する */
export function ImportPage({ layerTreeUseCases }: Props) {
    const { svgText, setSvgText, result, handleImport } = useImport(layerTreeUseCases)

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>SVG インポート</h2>
            <textarea
                value={svgText}
                onChange={(e) => setSvgText(e.target.value)}
                placeholder="Figma からコピーした SVG を貼り付けてください"
                rows={10}
                style={{ fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
            />
            <button
                onClick={handleImport}
                disabled={!svgText.trim()}
                style={{ alignSelf: 'flex-start', padding: '6px 16px', cursor: 'pointer' }}
            >
                インポート
            </button>
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
