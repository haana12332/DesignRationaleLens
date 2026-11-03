import {
    ALLOWED_CHILDREN,
    LAYER_LABEL_MAP,
    LAYER_PREFIX_MAP,
    type LayerNode,
    type LayerType,
    type ParseError,
    type ParseResult,
} from '../entities/LayerNode'

/** 有効な層 ID: 接頭辞 + "_" + 英数字/アンダースコア1文字以上 */
const VALID_LAYER_ID_RE = /^(P|T|O|M|A)_[A-Za-z0-9_]+$/

/** 英数字とアンダースコア以外を含む → E04 */
const INVALID_CHAR_RE = /[^A-Za-z0-9_]/

/**
 * 接頭辞が崩れている候補：1文字 + "-" または "_" で始まるが VALID にはマッチしない
 * 例: a_Button（小文字）、A-Button（ハイフン）、A__Logo（二重アンダースコア）
 */
const BROKEN_PREFIX_RE = /^[a-zA-Z][-_]/

/** スキップするタグ名（小文字で比較） */
const SKIP_TAGS = new Set([
    'defs', 'clippath', 'mask', 'lineargradient', 'radialgradient', 'style',
])

// ----------------------------------------------------------------
// 公開 API
// ----------------------------------------------------------------

/**
 * SVG 文字列を受け取り、Atomic Design の層ノードツリーを構築する。
 * 命名規則違反（E01〜E05）が1件でもあれば { ok: false, errors } を返す。
 * 違反がなければ { ok: true, nodes } を返す。
 *
 * @param svgString インポート対象の SVG 文字列
 * @param svgId     インポート操作の UUID（外部から渡す）
 */
export function parseLayerTree(svgString: string, svgId: string): ParseResult {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString.trim(), 'image/svg+xml')

    if (doc.querySelector('parsererror')) {
        return {
            ok: false,
            errors: [{
                code: 'E01',
                path: '(SVG)',
                message: 'SVG の解析に失敗しました。タグの形が壊れている可能性があります。',
                fix: 'Figma から正しくエクスポートし直してください。',
            }],
        }
    }

    const svgEl = doc.documentElement
    if (svgEl.tagName.toLowerCase() !== 'svg') {
        return {
            ok: false,
            errors: [{
                code: 'E01',
                path: '(root)',
                message: 'ルート要素が <svg> ではありません。',
                fix: 'Figma の「コピー as SVG」でコピーした内容を貼り付けてください。',
            }],
        }
    }

    // フェーズ1: 検証（エラーを全件収集）
    const errors = validate(svgEl)

    if (errors.length > 0) return { ok: false, errors }

    // フェーズ2: 構築（エラーゼロのときのみ）
    const nodes = build(svgEl, svgId)
    return { ok: true, nodes }
}

// ----------------------------------------------------------------
// フェーズ1: 検証
// ----------------------------------------------------------------

type LayerStackEntry = { figmaId: string; layer: LayerType }

function validate(svgEl: Element): ParseError[] {
    const errors: ParseError[] = []
    const topLevelPageIds: string[] = []

    /** DFS で全 <g> を走査。ancestorLayers はツリー上位の層ノードスタック */
    function walk(el: Element, ancestorLayers: LayerStackEntry[]): void {
        for (const child of Array.from(el.children)) {
            const tag = child.tagName.toLowerCase()
            if (SKIP_TAGS.has(tag)) continue
            if (tag !== 'g') {
                // <g> 以外（<rect>,<path> 等）は層判定しない
                continue
            }

            const id = child.getAttribute('id') ?? ''
            const path = buildPath(ancestorLayers, id)

            // E04: id に英数字・アンダースコア以外の文字
            if (id && INVALID_CHAR_RE.test(id)) {
                errors.push({
                    code: 'E04',
                    path,
                    message: `id "${id}" に英数字と _ 以外の文字が含まれています。日本語のレイヤー名は文字化けします。`,
                    fix: 'Figma でこのレイヤー名を英語（英数字とアンダースコアのみ）に変えてください。',
                })
                // E04 が出た要素は E05 をスキップし、子も層判定から外れた扱いで続ける
                walk(child, ancestorLayers)
                continue
            }

            // E05: 接頭辞の形が崩れている
            if (id && BROKEN_PREFIX_RE.test(id) && !VALID_LAYER_ID_RE.test(id)) {
                const prefix = id[0]
                let detail: string
                if (prefix === prefix.toLowerCase()) {
                    detail = `接頭辞 "${prefix}_" は小文字です。大文字（P_/T_/O_/M_/A_）を使用してください。`
                } else if (id.includes('-')) {
                    detail = `接頭辞の区切り文字にハイフン "-" が使われています。アンダースコア "_" を使用してください。`
                } else {
                    detail = `接頭辞 "${id.substring(0, 2)}" の後に識別子が必要です（例: A_ComponentName）。`
                }
                errors.push({
                    code: 'E05',
                    path,
                    message: detail,
                    fix: `Figma で "${id}" を A_ComponentName 形式（大文字接頭辞 + _ + 英数字）に変えてください。`,
                })
                walk(child, ancestorLayers)
                continue
            }

            if (VALID_LAYER_ID_RE.test(id)) {
                const prefix = id[0] as keyof typeof LAYER_PREFIX_MAP
                const currentLayer = LAYER_PREFIX_MAP[prefix]

                // E01: 最上位の層ノードが P_ でない
                if (ancestorLayers.length === 0) {
                    if (currentLayer !== 'page') {
                        errors.push({
                            code: 'E01',
                            path: id,
                            message: `最上位の層ノードは P_（ページ）である必要があります。実際の層: ${LAYER_LABEL_MAP[currentLayer]}（${id}）`,
                            fix: `Figma で最上位フレームのレイヤー名を "P_${id.replace(/^[A-Z]_/, '')}" のように P_ で始まる名前にしてください。`,
                        })
                    } else {
                        topLevelPageIds.push(id)
                    }
                }

                // E03: 親子の制約違反
                if (ancestorLayers.length > 0) {
                    const parent = ancestorLayers[ancestorLayers.length - 1]
                    const allowed = ALLOWED_CHILDREN[parent.layer]
                    if (!allowed.includes(currentLayer)) {
                        const allowedLabels = allowed.length > 0
                            ? allowed.map(l => LAYER_LABEL_MAP[l]).join('・')
                            : 'なし'
                        errors.push({
                            code: 'E03',
                            path,
                            message: `${LAYER_LABEL_MAP[parent.layer]}（${parent.figmaId}）の直下に${LAYER_LABEL_MAP[currentLayer]}は置けません。置けるのは: ${allowedLabels}`,
                            fix: `Figma で "${id}" を正しい親の下に移動するか、層の接頭辞を変えてください。`,
                        })
                    }
                }

                walk(child, [...ancestorLayers, { figmaId: id, layer: currentLayer }])
            } else {
                // 接頭辞なし: 吸収対象。子に層ノードがあれば検証する
                walk(child, ancestorLayers)
            }
        }
    }

    walk(svgEl, [])

    // E02: P_ ルートが2件以上
    if (topLevelPageIds.length >= 2) {
        errors.push({
            code: 'E02',
            path: topLevelPageIds.join(', '),
            message: `P_（ページ）ノードは1つだけ許可されていますが、${topLevelPageIds.length}件見つかりました。2画面を同時にコピーした可能性があります。`,
            fix: '1つの P_ フレームだけをコピーして貼り付けてください。',
        })
    }

    return errors
}

/** エラー表示用のパス文字列を生成する */
function buildPath(ancestors: LayerStackEntry[], currentId: string): string {
    const parts = ancestors.map(e => e.figmaId)
    if (currentId) parts.push(currentId)
    return parts.join(' > ') || '(root)'
}

// ----------------------------------------------------------------
// フェーズ2: 構築
// ----------------------------------------------------------------

type BuildStackEntry = { uuid: string; figmaId: string }

function build(svgEl: Element, svgId: string): LayerNode[] {
    const nodes: LayerNode[] = []

    function walk(el: Element, ancestorStack: BuildStackEntry[]): void {
        for (const child of Array.from(el.children)) {
            const tag = child.tagName.toLowerCase()
            if (SKIP_TAGS.has(tag)) continue
            if (tag !== 'g') continue

            const id = child.getAttribute('id') ?? ''

            if (VALID_LAYER_ID_RE.test(id)) {
                const prefix = id[0] as keyof typeof LAYER_PREFIX_MAP
                const layer = LAYER_PREFIX_MAP[prefix]
                const parentId = ancestorStack.at(-1)?.uuid ?? null
                const order = nodes.filter(n => n.parentId === parentId).length
                const uuid = crypto.randomUUID()

                const node: LayerNode = {
                    id: uuid,
                    figmaId: id,
                    layer,
                    parentId,
                    order,
                    absorbedIds: [],
                    svgId,
                }
                nodes.push(node)

                walk(child, [...ancestorStack, { uuid, figmaId: id }])
            } else {
                // 接頭辞なし: 最近祖先ノードに吸収
                if (id) {
                    const nearestNode = ancestorStack.length > 0
                        ? nodes.find(n => n.id === ancestorStack.at(-1)!.uuid)
                        : undefined
                    if (nearestNode) nearestNode.absorbedIds.push(id)
                }
                // 子を引き続き走査（中に層ノードがある可能性）
                walk(child, ancestorStack)
            }
        }
    }

    walk(svgEl, [])
    return nodes
}
