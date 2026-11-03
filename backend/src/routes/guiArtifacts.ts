import { Router } from 'express';
import { supabase } from '../lib/supabase';

export const guiArtifactsRouter = Router();

// ----------------------------------------------------------------
// POST /api/gui-artifacts
// SVG インポート時に gui_artifact と layer_nodes を一括保存する。
// Body: {
//   id?: string,           // クライアントが UUID を指定する場合
//   name: string,          // P_xxx ページ名
//   rawSvg: string,        // オリジナル SVG 文字列
//   canvasX: number,
//   canvasY: number,
//   layerNodes: Array<{
//     id: string,          // クライアント生成 UUID
//     figmaId: string,
//     layer: string,
//     parentId: string | null,
//     order: number,
//     absorbedIds: string[],
//   }>
// }
// ----------------------------------------------------------------
guiArtifactsRouter.post('/', async (req, res) => {
  const { id, name, rawSvg, canvasX, canvasY, layerNodes } = req.body as {
    id?: string;
    name: string;
    rawSvg: string;
    canvasX: number;
    canvasY: number;
    layerNodes: {
      id: string;
      figmaId: string;
      layer: string;
      parentId: string | null;
      order: number;
      absorbedIds: string[];
    }[];
  };

  if (!name || !rawSvg || canvasX == null || canvasY == null) {
    res.status(400).json({ error: 'name, rawSvg, canvasX, canvasY は必須です' });
    return;
  }

  // gui_artifacts を INSERT
  const artifactData: Record<string, unknown> = { name, raw_svg: rawSvg, canvas_x: canvasX, canvas_y: canvasY };
  if (id) artifactData.id = id;

  const { data: artifact, error: artifactError } = await supabase
    .from('gui_artifacts')
    .insert(artifactData)
    .select('id, name, canvas_x, canvas_y, created_at')
    .single();

  if (artifactError || !artifact) {
    res.status(500).json({ error: artifactError?.message ?? 'gui_artifact の保存に失敗しました' });
    return;
  }

  // layer_nodes を一括 INSERT（0件でも OK）
  if (layerNodes && layerNodes.length > 0) {
    const rows = layerNodes.map((n) => ({
      id: n.id,
      gui_artifact_id: artifact.id,
      figma_id: n.figmaId,
      layer: n.layer,
      parent_id: n.parentId ?? null,
      order: n.order,
      absorbed_ids: n.absorbedIds,
    }));

    const { error: nodesError } = await supabase.from('layer_nodes').insert(rows);
    if (nodesError) {
      res.status(500).json({ error: nodesError.message });
      return;
    }
  }

  res.status(201).json({
    id: artifact.id,
    name: artifact.name,
    canvasX: artifact.canvas_x,
    canvasY: artifact.canvas_y,
    createdAt: artifact.created_at,
  });
});

// ----------------------------------------------------------------
// PATCH /api/gui-artifacts/:id
// キャンバス上の位置（x, y）を更新する（ドラッグ移動後に呼ぶ）。
// Body: { canvasX: number, canvasY: number }
// ----------------------------------------------------------------
guiArtifactsRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { canvasX, canvasY } = req.body as { canvasX: number; canvasY: number };

  if (canvasX == null || canvasY == null) {
    res.status(400).json({ error: 'canvasX と canvasY は必須です' });
    return;
  }

  const { error } = await supabase
    .from('gui_artifacts')
    .update({ canvas_x: canvasX, canvas_y: canvasY })
    .eq('id', id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ id, canvasX, canvasY });
});
