import express from 'express';
import cors from 'cors';
import { initDatabase } from './database/db.js';
import { searchProducts } from './scrapers/index.js';
import productRoutes from './routes/products.js';
import trackRoutes from './routes/track.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

await initDatabase();

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Search across all platforms
app.post('/api/search', async (req, res) => {
  const { query, location = '' } = req.body;
  if (!query?.trim()) {
    return res.status(400).json({ error: 'query is required' });
  }
  try {
    const results = await searchProducts(query.trim(), location.trim());
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed', detail: err.message });
  }
});

app.use('/api/products', productRoutes);
app.use('/api/track', trackRoutes);

app.listen(PORT, () => {
  console.log(`🚗 Hot Wheels Tracker API → http://localhost:${PORT}`);
});
