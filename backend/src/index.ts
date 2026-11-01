import 'dotenv/config';
import express from 'express';
import { supabase } from './lib/supabase';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
