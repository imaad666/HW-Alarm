import express from 'express';
import cors from 'cors';
import { searchProducts } from './scrapers/index.js';
import { initDatabase } from './database/db.js';
import productRoutes from './routes/products.js';
import trackRoutes from './routes/track.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
await initDatabase();

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hot Wheels Tracker API is running' });
});

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query, location } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await searchProducts(query, location || '');
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search products', message: error.message });
  }
});

// Product routes
app.use('/api/products', productRoutes);
app.use('/api/track', trackRoutes);

app.listen(PORT, () => {
  console.log(`🚗 Hot Wheels Tracker API running on http://localhost:${PORT}`);
});

