const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
const { scrapeBlinkit, scrapeZepto, scrapeSwiggy } = require('./utils/scraper');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Store for tracking products
let productCache = {
  blinkit: [],
  zepto: [],
  swiggy: []
};

let subscribers = []; // Store notification subscribers

// Demo mode - set to true to show sample data when APIs aren't configured
const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Sample Hot Wheels products for demo
const sampleProducts = {
  blinkit: [
    {
      id: 'hw-demo-1',
      name: 'Hot Wheels Premium Car - Lamborghini',
      price: 299,
      image: 'https://via.placeholder.com/300x300?text=Hot+Wheels',
      platform: 'Blinkit',
      available: true,
      url: 'https://blinkit.com',
      location: 'Mumbai'
    },
    {
      id: 'hw-demo-2',
      name: 'Hot Wheels Monster Trucks Set',
      price: 499,
      image: 'https://via.placeholder.com/300x300?text=Hot+Wheels',
      platform: 'Blinkit',
      available: true,
      url: 'https://blinkit.com',
      location: 'Mumbai'
    }
  ],
  zepto: [
    {
      id: 'hw-demo-3',
      name: 'Hot Wheels Basic Car Pack - 5 Pack',
      price: 349,
      image: 'https://via.placeholder.com/300x300?text=Hot+Wheels',
      platform: 'Zepto',
      available: true,
      url: 'https://zepto.com',
      location: 'Mumbai'
    }
  ],
  swiggy: [
    {
      id: 'hw-demo-4',
      name: 'Hot Wheels Color Shifters',
      price: 399,
      image: 'https://via.placeholder.com/300x300?text=Hot+Wheels',
      platform: 'Swiggy Instamart',
      available: true,
      url: 'https://swiggy.com',
      location: 'Mumbai'
    },
    {
      id: 'hw-demo-5',
      name: 'Hot Wheels Racing Circuit Set',
      price: 799,
      image: 'https://via.placeholder.com/300x300?text=Hot+Wheels',
      platform: 'Swiggy Instamart',
      available: true,
      url: 'https://swiggy.com',
      location: 'Mumbai'
    }
  ]
};

// Helper function to search for Hot Wheels products using scraping
async function searchBlinkit(query, location) {
  try {
    const products = await scrapeBlinkit(query, location);
    return products;
  } catch (error) {
    console.error(`   ❌ Blinkit scraping error: ${error.message}`);
    return [];
  }
}

async function searchZepto(query, location) {
  try {
    const products = await scrapeZepto(query, location);
    return products;
  } catch (error) {
    console.error(`   ❌ Zepto scraping error: ${error.message}`);
    return [];
  }
}

async function searchSwiggy(query, location) {
  try {
    const products = await scrapeSwiggy(query, location);
    return products;
  } catch (error) {
    console.error(`   ❌ Swiggy scraping error: ${error.message}`);
    return [];
  }
}

// Filter Hot Wheels products
function filterHotWheels(products) {
  if (!Array.isArray(products)) return [];

  return products.filter(product => {
    const name = (product.name || product.title || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const searchTerms = ['hotwheels', 'hot wheels', 'hotwheels car', 'mattel'];

    return searchTerms.some(term => name.includes(term) || description.includes(term));
  }).map(product => ({
    id: product.id || product.product_id || Math.random().toString(36),
    name: product.name || product.title,
    price: product.price || product.selling_price || product.final_price,
    image: product.image || product.image_url || product.images?.[0],
    platform: product.platform,
    available: product.available !== false && product.in_stock !== false,
    url: product.url || product.product_url,
    location: product.location
  }));
}

// Check all platforms for Hot Wheels
async function checkAllPlatforms(location) {
  const query = 'hot wheels';
  const results = {
    blinkit: [],
    zepto: [],
    swiggy: [],
    timestamp: new Date().toISOString()
  };

  try {
    const [blinkitProducts, zeptoProducts, swiggyProducts] = await Promise.all([
      searchBlinkit(query, location).then(filterHotWheels).then(products =>
        products.map(p => ({ ...p, platform: 'Blinkit' }))
      ),
      searchZepto(query, location).then(filterHotWheels).then(products =>
        products.map(p => ({ ...p, platform: 'Zepto' }))
      ),
      searchSwiggy(query, location).then(filterHotWheels).then(products =>
        products.map(p => ({ ...p, platform: 'Swiggy Instamart' }))
      )
    ]);

    results.blinkit = blinkitProducts;
    results.zepto = zeptoProducts;
    results.swiggy = swiggyProducts;

    // Check for new products
    checkForNewProducts(results);

    // Update cache
    productCache = results;

    return results;
  } catch (error) {
    console.error('Error checking platforms:', error);
    return results;
  }
}

// Check for newly added products
function checkForNewProducts(newResults) {
  const newProducts = [];

  ['blinkit', 'zepto', 'swiggy'].forEach(platform => {
    const oldProducts = productCache[platform] || [];
    const currentProducts = newResults[platform] || [];

    const oldIds = new Set(oldProducts.map(p => p.id));
    const newOnes = currentProducts.filter(p => !oldIds.has(p.id) && p.available);

    if (newOnes.length > 0) {
      newProducts.push(...newOnes.map(p => ({ ...p, platform })));
    }
  });

  // Notify subscribers about new products
  if (newProducts.length > 0 && subscribers.length > 0) {
    notifySubscribers(newProducts);
  }

  return newProducts;
}

// Notify subscribers
function notifySubscribers(newProducts) {
  subscribers.forEach(subscriber => {
    // In a real implementation, you'd send email, SMS, or push notification
    console.log(`Notification to ${subscriber.email || subscriber.id}:`, newProducts);

    // Emit to connected clients via WebSocket or SSE if implemented
    if (subscriber.callback) {
      subscriber.callback(newProducts);
    }
  });
}

// API Routes

// Search for Hot Wheels products
app.post('/api/search', async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    console.log(`\n🔍 Searching for Hot Wheels in: ${location}`);

    let results;

    // Check if demo mode is enabled
    if (DEMO_MODE) {
      console.log('🎭 DEMO MODE: Using sample data');
      results = {
        blinkit: sampleProducts.blinkit.map(p => ({ ...p, location })),
        zepto: sampleProducts.zepto.map(p => ({ ...p, location })),
        swiggy: sampleProducts.swiggy.map(p => ({ ...p, location })),
        timestamp: new Date().toISOString(),
        demo: true
      };
    } else {
      results = await checkAllPlatforms(location);

      // Log results for debugging
      const totalProducts = results.blinkit.length + results.zepto.length + results.swiggy.length;
      console.log(`📦 Results: Blinkit=${results.blinkit.length}, Zepto=${results.zepto.length}, Swiggy=${results.swiggy.length} (Total: ${totalProducts})`);

      if (totalProducts === 0) {
        console.log('⚠️  No products found. This could mean:');
        console.log('   1. APIs are not configured with real endpoints');
        console.log('   2. Products are actually out of stock');
        console.log('   3. API requests are failing (check console for errors above)');
        console.log('💡 Tip: Set DEMO_MODE=true to see sample data');
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search products', details: error.message });
  }
});

// Get cached products
app.get('/api/products', (req, res) => {
  res.json(productCache);
});

// Subscribe for notifications
app.post('/api/subscribe', (req, res) => {
  const { email, location } = req.body;

  if (!email || !location) {
    return res.status(400).json({ error: 'Email and location are required' });
  }

  const subscriber = {
    id: Math.random().toString(36),
    email,
    location,
    subscribedAt: new Date().toISOString()
  };

  subscribers.push(subscriber);

  res.json({
    success: true,
    subscriberId: subscriber.id,
    message: 'Subscribed successfully'
  });
});

// Unsubscribe
app.delete('/api/unsubscribe/:id', (req, res) => {
  const { id } = req.params;
  subscribers = subscribers.filter(s => s.id !== id);
  res.json({ success: true, message: 'Unsubscribed successfully' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Note: You need to update the API endpoints with actual URLs from browser DevTools');
});

// Scheduled job to check for products every 5 minutes
// You can adjust the cron schedule as needed
if (process.env.ENABLE_POLLING === 'true') {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running scheduled check for Hot Wheels...');
    const defaultLocation = process.env.DEFAULT_LOCATION || 'Mumbai';
    await checkAllPlatforms(defaultLocation);
  });
}

