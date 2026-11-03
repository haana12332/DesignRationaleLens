import type { Point } from "@/domain/canvas"
import type { GuiElement } from "@/domain/guiElement"
import { findElementAt, parseSvg, sanitizeSvg } from "@/domain/guiElement"

/*
 * キャンバス上の要素に関するユースケース。外部には依存しない。
 */

/** キャンバス座標の point にある要素の id を返す（なければ null） */
export function selectElementAt(elements: readonly GuiElement[], point: Point): string | null {
    return findElementAt(elements, point)?.id ?? null
}

export type PasteResult = { ok: true; element: GuiElement } | { ok: false; error: string }

/**
 * クリップボードから貼り付けられた SVG 文字列を受け取り、GuiElement を生成する。
 * 検証 → サニタイズ → 要素生成の順に処理する。
 */
export function pasteGuiArtifact(rawSvg: string, existingCount: number): PasteResult {
    const parseResult = parseSvg(rawSvg)
    if (!parseResult.ok) return { ok: false, error: parseResult.error }

    const { width, height } = parseResult.parsed
    const svgContent = sanitizeSvg(rawSvg)

    // 複数貼り付けたとき重ならないよう、少しずつずらす
    const offset = existingCount * 20

    const element: GuiElement = {
        id: crypto.randomUUID(),
        name: extractName(rawSvg),
        x: offset,
        y: offset,
        width,
        height,
        svgContent,
        rawSvgContent: rawSvg,
    }

    return { ok: true, element }
}

/** SVG 内の最初の P_ id をページ名として使う。なければデフォルト名 */
function extractName(svgString: string): string {
    const match = svgString.match(/\bid="(P_[^"]+)"/)
    return match?.[1] ?? "GUI成果物"
}

/** 要素のユースケース一覧 **/
export const guiElementUseCases = {
    selectElementAt,
    pasteGuiArtifact,
}

/** presentation 層はこの型だけに依存する */
export type GuiElementUseCases = typeof guiElementUseCases
