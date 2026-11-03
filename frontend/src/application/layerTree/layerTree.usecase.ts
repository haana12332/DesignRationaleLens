import type { ParseResult } from '@/domain/layerTree'
import { parseLayerTree } from '@/domain/layerTree'

/*
 * SVG レイヤーツリーのインポートに関するユースケース。
 * ドメイン層の parseLayerTree に対して、インポート操作ごとの UUID を付与するだけの薄いラッパー。
 */

/**
 * SVG 文字列を受け取り、Atomic Design の層ノードツリーを構築する。
 * svgId には対応する GuiElement.id を渡すことで、ノードと描画要素を紐付ける。
 * 命名規則違反がある場合はエラー一覧を返し、取り込みを中止する。
 */
export function importLayerTree(svgString: string, svgId: string): ParseResult {
    return parseLayerTree(svgString, svgId)
}

/** レイヤーツリーのユースケース一覧 */
export const layerTreeUseCases = {
    importLayerTree,
}

/** presentation 層はこの型だけに依存する */
export type LayerTreeUseCases = typeof layerTreeUseCases
