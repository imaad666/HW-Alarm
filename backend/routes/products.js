import express from 'express';
import { all, get } from '../database/db.js';

const router = express.Router();

// GET /api/products — all tracked products
router.get('/', async (_req, res) => {
  try {
    const products = await all(
      'SELECT * FROM tracked_products ORDER BY updated_at DESC'
    );
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id — single product + price history
router.get('/:id', async (req, res) => {
  try {
    const product = await get(
      'SELECT * FROM tracked_products WHERE id = ?',
      [req.params.id]
    );
    if (!product) return res.status(404).json({ error: 'Not found' });

    const history = await all(
      'SELECT price, recorded_at FROM price_history WHERE product_id = ? ORDER BY recorded_at DESC LIMIT 60',
      [req.params.id]
    );

    res.json({ ...product, history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// GET /api/products/:id/history
router.get('/:id/history', async (req, res) => {
  try {
    const history = await all(
      'SELECT price, recorded_at FROM price_history WHERE product_id = ? ORDER BY recorded_at DESC',
      [req.params.id]
    );
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
