/** SVG 文字列の検証と寸法取得。ブラウザの DOMParser を使う */

export type ParsedSvg = {
    /** SVG の viewBox 属性値（例: "0 0 375 640"） */
    viewBox: string
    /** キャンバスに配置するときの初期幅（px） */
    width: number
    /** キャンバスに配置するときの初期高さ（px） */
    height: number
}

export type SvgParseResult = { ok: true; parsed: ParsedSvg } | { ok: false; error: string }

/**
 * SVG 文字列を検証し、寸法情報を返す。
 * 失敗した場合は日本語のエラーメッセージを返す。
 */
export function parseSvg(text: string): SvgParseResult {
    const trimmed = text.trim()

    if (!trimmed.startsWith("<svg")) {
        return { ok: false, error: "SVG ではありません（<svg で始まりません）" }
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(trimmed, "image/svg+xml")

    // DOMParser はエラーでも例外を投げず <parsererror> 要素を返す
    if (doc.querySelector("parsererror")) {
        return { ok: false, error: "SVG を解析できません（タグが壊れている可能性があります）" }
    }

    const svgEl = doc.documentElement
    if (svgEl.tagName.toLowerCase() !== "svg") {
        return { ok: false, error: "ルート要素が <svg> ではありません" }
    }

    const viewBox = svgEl.getAttribute("viewBox") ?? ""
    let width: number
    let height: number

    if (viewBox) {
        // viewBox="minX minY width height"
        const parts = viewBox.trim().split(/[\s,]+/)
        width = parseFloat(parts[2] ?? "")
        height = parseFloat(parts[3] ?? "")
    } else {
        width = parseFloat(svgEl.getAttribute("width") ?? "")
        height = parseFloat(svgEl.getAttribute("height") ?? "")
    }

    if (!isFinite(width) || !isFinite(height) || width <= 0 || height <= 0) {
        return { ok: false, error: "SVG の幅または高さが取得できません" }
    }

    return {
        ok: true,
        parsed: { viewBox: viewBox || `0 0 ${width} ${height}`, width, height },
    }
}
