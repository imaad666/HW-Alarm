const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const browserManager = require('./utils/browserManager');
const blinkitService = require('./services/blinkit');
const zeptoService = require('./services/zepto');
const swiggyService = require('./services/swiggy');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize a session
app.post('/api/init-session', async (req, res) => {
  try {
    const sessionId = uuidv4();
    await browserManager.initSession(sessionId);
    res.json({ sessionId });
  } catch (error) {
    console.error('Init session error:', error);
    res.status(500).json({ error: 'Failed to init session' });
  }
});

// Set location
app.post('/api/set-location', async (req, res) => {
  const { sessionId, location } = req.body;
  if (!sessionId || !location) return res.status(400).json({ error: 'Missing sessionId or location' });

  console.log(`Setting location for session ${sessionId}: ${location}`);

  // Run in parallel
  const results = await Promise.all([
    blinkitService.setLocation(sessionId, location),
    zeptoService.setLocation(sessionId, location),
    swiggyService.setLocation(sessionId, location)
  ]);

  res.json({
    success: true,
    results: {
      blinkit: results[0],
      zepto: results[1],
      swiggy: results[2]
    }
  });
});

// Search
app.post('/api/search', async (req, res) => {
  const { sessionId, query } = req.body;
  if (!sessionId || !query) return res.status(400).json({ error: 'Missing sessionId or query' });

  console.log(`Searching for "${query}" in session ${sessionId}`);

  const [blinkitProducts, zeptoProducts, swiggyProducts] = await Promise.all([
    blinkitService.search(sessionId, query),
    zeptoService.search(sessionId, query),
    swiggyService.search(sessionId, query)
  ]);

  res.json({
    blinkit: blinkitProducts,
    zepto: zeptoProducts,
    swiggy: swiggyProducts
  });
});

// Cleanup session
app.post('/api/close-session', async (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) {
    await browserManager.closeSession(sessionId);
  }
  res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
