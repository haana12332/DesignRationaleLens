/**
 * Atomic Design の5層と、SVG レイヤーID の接頭辞との対応。
 * id が /^(P|T|O|M|A)_[A-Za-z0-9_]+$/ に一致するものだけを層ノードとして扱う。
 */
export type LayerType = 'page' | 'template' | 'organism' | 'molecule' | 'atom'

/** 接頭辞文字 → 層タイプ のマッピング */
export const LAYER_PREFIX_MAP: Record<string, LayerType> = {
    P: 'page',
    T: 'template',
    O: 'organism',
    M: 'molecule',
    A: 'atom',
}

/** 層タイプ → 日本語ラベル */
export const LAYER_LABEL_MAP: Record<LayerType, string> = {
    page: 'ページ',
    template: 'テンプレート',
    organism: '有機体',
    molecule: '分子',
    atom: '原子',
}

/**
 * 親層が直下に持てる子層の制約。
 * ここにない組み合わせは E03 エラーになる。
 */
export const ALLOWED_CHILDREN: Record<LayerType, LayerType[]> = {
    page: ['template'],
    template: ['organism'],
    organism: ['organism', 'molecule', 'atom'],
    molecule: ['atom'],
    atom: [],
}

/** キャンバスに配置する GUI 成果物の一ノード */
export type LayerNode = {
    /** アプリ側 UUID */
    id: string
    /** SVG の id 属性（Figma のレイヤー名） */
    figmaId: string
    layer: LayerType
    /** 親ノードの UUID。ページ（最上位）は null */
    parentId: string | null
    /** 兄弟内の 0 始まり順番 */
    order: number
    /** 吸収した子孫要素の id 一覧 */
    absorbedIds: string[]
    /** インポート操作の UUID（同じ SVG から来たノードは共通） */
    svgId: string
}

/** SVG パース結果 */
export type ParseResult =
    | { ok: true; nodes: LayerNode[] }
    | { ok: false; errors: ParseError[] }

/** 命名規則違反の1件 */
export type ParseError = {
    /** エラーコード */
    code: 'E01' | 'E02' | 'E03' | 'E04' | 'E05'
    /** 最上位からのパス（例: P_ProductDetail > T_Template > O_Header） */
    path: string
    /** 違反の内容 */
    message: string
    /** Figma での直し方 */
    fix: string
}
