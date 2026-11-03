import 'dotenv/config';
import express from 'express';
import { supabase } from './lib/supabase';
import { guiArtifactsRouter } from './routes/guiArtifacts';
import { rationaleCommentsRouter } from './routes/rationaleComments';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' })); // SVG 文字列が大きいため上限を引き上げる

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/db', async (req, res) => {
  const { error } = await supabase.from('_health').select('*').limit(1);
  if (error) {
    res.status(500).json({ status: 'error', message: error.message });
  } else {
    res.json({ status: 'ok' });
  }
});

// ----------------------------------------------------------------
// API ルート
// ----------------------------------------------------------------
app.use('/api/gui-artifacts', guiArtifactsRouter);
app.use('/api', rationaleCommentsRouter); // /api/layer-nodes/:id/comments など

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
