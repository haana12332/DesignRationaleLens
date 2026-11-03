import { Router } from 'express';
import { supabase } from '../lib/supabase';

export const rationaleCommentsRouter = Router();

// ----------------------------------------------------------------
// GET /api/layer-nodes/:id/comments
// 指定レイヤーノードのコメント一覧を取得する（createdAt 昇順）。
// ----------------------------------------------------------------
rationaleCommentsRouter.get('/layer-nodes/:id/comments', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('rationale_comments')
    .select('id, content, created_at, updated_at')
    .eq('layer_node_id', id)
    .order('created_at', { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(
    (data ?? []).map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  );
});

// ----------------------------------------------------------------
// POST /api/layer-nodes/:id/comments
// 指定レイヤーノードにコメントを追加する。
// Body: { content: string }
// ----------------------------------------------------------------
rationaleCommentsRouter.post('/layer-nodes/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body as { content: string };

  if (!content || content.trim() === '') {
    res.status(400).json({ error: 'content は必須です' });
    return;
  }

  const { data, error } = await supabase
    .from('rationale_comments')
    .insert({ layer_node_id: id, content: content.trim() })
    .select('id, content, created_at, updated_at')
    .single();

  if (error || !data) {
    res.status(500).json({ error: error?.message ?? 'コメントの保存に失敗しました' });
    return;
  }

  res.status(201).json({
    id: data.id,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });
});

// ----------------------------------------------------------------
// DELETE /api/rationale-comments/:id
// コメントを削除する。
// ----------------------------------------------------------------
rationaleCommentsRouter.delete('/rationale-comments/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('rationale_comments')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(204).send();
});
