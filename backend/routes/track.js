import express from 'express';
import { runQuery, allQuery, getQuery } from '../database/db.js';

const router = express.Router();

// Add product to tracking
router.post('/', async (req, res) => {
  try {
    const { name, platform, price, image, url, weight } = req.body;

    if (!name || !platform || !price) {
      return res.status(400).json({ error: 'Name, platform, and price are required' });
    }

    // Check if product already exists
    const existing = await getQuery(
      'SELECT * FROM tracked_products WHERE name = ? AND platform = ?',
      [name, platform]
    );

    if (existing) {
      // Update existing product
      await runQuery(
        'UPDATE tracked_products SET price = ?, image = ?, url = ?, weight = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [price, image, url, weight, existing.id]
      );

      // Add to price history if price changed
      if (existing.price !== price) {
        await runQuery(
          'INSERT INTO price_history (product_id, price, platform) VALUES (?, ?, ?)',
          [existing.id, price, platform]
        );
      }

      const updated = await getQuery('SELECT * FROM tracked_products WHERE id = ?', [existing.id]);
      return res.json(updated);
    }

    // Insert new product
    const result = await runQuery(
      'INSERT INTO tracked_products (name, platform, price, image, url, weight) VALUES (?, ?, ?, ?, ?, ?)',
      [name, platform, price, image, url, weight]
    );

    // Add initial price to history
    await runQuery(
      'INSERT INTO price_history (product_id, price, platform) VALUES (?, ?, ?)',
      [result.lastID, price, platform]
    );

    const product = await getQuery('SELECT * FROM tracked_products WHERE id = ?', [result.lastID]);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error tracking product:', error);
    res.status(500).json({ error: 'Failed to track product' });
  }
});

// Get all tracked products
router.get('/', async (req, res) => {
  try {
    const products = await allQuery('SELECT * FROM tracked_products ORDER BY created_at DESC');
    res.json(products);
  } catch (error) {
    console.error('Error fetching tracked products:', error);
    res.status(500).json({ error: 'Failed to fetch tracked products' });
  }
});

// Delete tracked product
router.delete('/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM price_history WHERE product_id = ?', [req.params.id]);
    await runQuery('DELETE FROM alerts WHERE product_id = ?', [req.params.id]);
    await runQuery('DELETE FROM tracked_products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product removed from tracking' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Create price alert
router.post('/:id/alert', async (req, res) => {
  try {
    const { target_price } = req.body;
    const productId = req.params.id;

    if (!target_price) {
      return res.status(400).json({ error: 'Target price is required' });
    }

    // Check if product exists
    const product = await getQuery('SELECT * FROM tracked_products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create or update alert
    const existingAlert = await getQuery('SELECT * FROM alerts WHERE product_id = ?', [productId]);
    
    if (existingAlert) {
      await runQuery(
        'UPDATE alerts SET target_price = ?, is_active = 1 WHERE id = ?',
        [target_price, existingAlert.id]
      );
    } else {
      await runQuery(
        'INSERT INTO alerts (product_id, target_price) VALUES (?, ?)',
        [productId, target_price]
      );
    }

    const alert = await getQuery('SELECT * FROM alerts WHERE product_id = ?', [productId]);
    res.json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

export default router;

