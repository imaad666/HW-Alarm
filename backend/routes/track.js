import express from 'express';
import { run, get, all } from '../database/db.js';

const router = express.Router();

// POST /api/track — add or update a tracked product
router.post('/', async (req, res) => {
  const { name, platform, price, image, url, weight } = req.body;

  if (!name || !platform || price == null) {
    return res.status(400).json({ error: 'name, platform, and price are required' });
  }

  try {
    const existing = await get(
      'SELECT * FROM tracked_products WHERE name = ? AND platform = ?',
      [name, platform]
    );

    if (existing) {
      await run(
        'UPDATE tracked_products SET price=?, image=?, url=?, weight=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
        [price, image ?? existing.image, url ?? existing.url, weight ?? existing.weight, existing.id]
      );
      // Only record history if price actually changed
      if (existing.price !== price) {
        await run(
          'INSERT INTO price_history (product_id, price) VALUES (?,?)',
          [existing.id, price]
        );
      }
      const updated = await get('SELECT * FROM tracked_products WHERE id=?', [existing.id]);
      return res.json(updated);
    }

    const { lastID } = await run(
      'INSERT INTO tracked_products (name, platform, price, image, url, weight) VALUES (?,?,?,?,?,?)',
      [name, platform, price, image ?? null, url ?? null, weight ?? null]
    );
    await run(
      'INSERT INTO price_history (product_id, price) VALUES (?,?)',
      [lastID, price]
    );
    const created = await get('SELECT * FROM tracked_products WHERE id=?', [lastID]);
    res.status(201).json(created);
  } catch (err) {
    console.error('Track error:', err);
    res.status(500).json({ error: 'Failed to track product' });
  }
});

// GET /api/track — all tracked products
router.get('/', async (_req, res) => {
  try {
    const products = await all(
      'SELECT * FROM tracked_products ORDER BY updated_at DESC'
    );
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tracked products' });
  }
});

// DELETE /api/track/:id
router.delete('/:id', async (req, res) => {
  try {
    // FK cascade handles price_history & alerts
    await run('DELETE FROM tracked_products WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove product' });
  }
});

// POST /api/track/:id/alert
router.post('/:id/alert', async (req, res) => {
  const { target_price } = req.body;
  if (!target_price) return res.status(400).json({ error: 'target_price required' });

  try {
    const product = await get('SELECT id FROM tracked_products WHERE id=?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = await get('SELECT id FROM alerts WHERE product_id=?', [req.params.id]);
    if (existing) {
      await run('UPDATE alerts SET target_price=?, is_active=1 WHERE id=?', [target_price, existing.id]);
    } else {
      await run('INSERT INTO alerts (product_id, target_price) VALUES (?,?)', [req.params.id, target_price]);
    }

    const alert = await get('SELECT * FROM alerts WHERE product_id=?', [req.params.id]);
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to set alert' });
  }
});

export default router;
