/**
 * SVG 文字列のサニタイズ。
 * - <script> 要素を除去する
 * - on* イベント属性を除去する
 * - id・<g> の入れ子・clip-path・mask・<defs> はそのまま残す
 */
export function sanitizeSvg(svgString: string): string {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, "image/svg+xml")

    // <script> 要素をすべて削除
    doc.querySelectorAll("script").forEach((el) => el.remove())

    // on* 属性をすべての要素から削除（再帰的に処理）
    removeEventAttributes(doc.documentElement)

    return new XMLSerializer().serializeToString(doc.documentElement)
}

function removeEventAttributes(el: Element): void {
    const toRemove: string[] = []
    for (const attr of Array.from(el.attributes)) {
        if (attr.name.startsWith("on")) toRemove.push(attr.name)
    }
    toRemove.forEach((name) => el.removeAttribute(name))

    for (const child of Array.from(el.children)) {
        removeEventAttributes(child)
    }
}
