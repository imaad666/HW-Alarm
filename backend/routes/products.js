import express from 'express';
import { allQuery, getQuery } from '../database/db.js';

const router = express.Router();

// Get all tracked products
router.get('/', async (req, res) => {
  try {
    const products = await allQuery('SELECT * FROM tracked_products ORDER BY created_at DESC');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await getQuery('SELECT * FROM tracked_products WHERE id = ?', [req.params.id]);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get price history
    const history = await allQuery(
      'SELECT * FROM price_history WHERE product_id = ? ORDER BY recorded_at DESC LIMIT 30',
      [req.params.id]
    );

    res.json({ ...product, history });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get price history for a product
router.get('/:id/history', async (req, res) => {
  try {
    const history = await allQuery(
      'SELECT * FROM price_history WHERE product_id = ? ORDER BY recorded_at DESC',
      [req.params.id]
    );
    res.json(history);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

export default router;

