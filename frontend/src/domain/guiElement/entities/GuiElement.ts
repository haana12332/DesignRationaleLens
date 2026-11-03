/**
 * キャンバスに配置する GUI 成果物（インポートしたもの）。
 * 位置と大きさはキャンバス座標（ワールド座標）で持つので、パン・ズームしても値は変わらない。
 */
export type GuiElement = {
    id: string
    name: string
    x: number
    y: number
    width: number
    height: number
    /** サニタイズ済みの SVG 文字列（キャンバス描画用）。SVG 成果物のみ持つ */
    svgContent?: string
    /** 貼り付け時のオリジナル SVG 文字列（将来の Atomic Design 解析用）。SVG 成果物のみ持つ */
    rawSvgContent?: string
}
