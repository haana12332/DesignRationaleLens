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
}
