-- DesignRationaleLens: 初期テーブル定義
-- Supabase の SQL Editor、または psql で実行してください。

-- ----------------------------------------------------------------
-- gui_artifacts: SVG インポートの単位
--   1回のファイル選択 = 1レコード。キャンバス上の位置も持つ。
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gui_artifacts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,                     -- P_ ページ名（例: P_ProductDetail）
    raw_svg     TEXT NOT NULL,                     -- インポート時のオリジナル SVG 文字列
    canvas_x    DOUBLE PRECISION NOT NULL DEFAULT 0,
    canvas_y    DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- layer_nodes: Atomic Design の層ノード
--   parseLayerTree の出力を 1 行 1 ノードで保存する。
--   id はフロントエンドで生成した UUID をそのまま使うため DEFAULT なし。
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS layer_nodes (
    id                UUID PRIMARY KEY,            -- フロントで crypto.randomUUID() した値
    gui_artifact_id   UUID NOT NULL REFERENCES gui_artifacts(id) ON DELETE CASCADE,
    figma_id          TEXT NOT NULL,               -- SVG の id 属性（例: O_Header）
    layer             TEXT NOT NULL
        CHECK (layer IN ('page', 'template', 'organism', 'molecule', 'atom')),
    parent_id         UUID REFERENCES layer_nodes(id),
    "order"           INT NOT NULL DEFAULT 0,      -- 同じ親の中での順番（0始まり）
    absorbed_ids      TEXT[] NOT NULL DEFAULT '{}',-- 接頭辞なし子孫の id 一覧
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS layer_nodes_gui_artifact_id_idx ON layer_nodes(gui_artifact_id);
CREATE INDEX IF NOT EXISTS layer_nodes_parent_id_idx       ON layer_nodes(parent_id);

-- ----------------------------------------------------------------
-- rationale_comments: 設計根拠コメント
--   1 つの layer_node に複数のコメントが付く。
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rationale_comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layer_node_id   UUID NOT NULL REFERENCES layer_nodes(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rationale_comments_layer_node_id_idx ON rationale_comments(layer_node_id);

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rationale_comments_updated_at ON rationale_comments;
CREATE TRIGGER rationale_comments_updated_at
    BEFORE UPDATE ON rationale_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
