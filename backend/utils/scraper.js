/**
 * Web Scraper Utilities
 * Scrapes publicly available product data from Blinkit, Zepto, and Swiggy
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');

// Get random user agent to avoid detection
function getRandomUserAgent() {
  const userAgent = new UserAgent({ deviceCategory: 'desktop' });
  return userAgent.toString();
}

// Launch browser with stealth settings
async function getBrowser() {
  return await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled'
    ]
  });
}

// Create a page with stealth settings
async function createStealthPage(browser) {
  const page = await browser.newPage();
  
  // Set random user agent
  await page.setUserAgent(getRandomUserAgent());
  
  // Override webdriver property
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    });
  });

  // Override permissions
  await page.evaluateOnNewDocument(() => {
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  });

  // Override plugins
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5]
    });
  });

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  return page;
}

// Get location coordinates from location name (using Nominatim/OpenStreetMap)
async function getLocationCoordinates(locationName) {
  try {
    const axios = require('axios');
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: `${locationName}, India`,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'HotWheelsAlertBot/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon),
        display_name: response.data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error.message);
    return null;
  }
}

// Scrape Blinkit products
async function scrapeBlinkit(query, location) {
  let browser;
  try {
    console.log(`   🔵 Scraping Blinkit for: "${query}" in ${location}`);
    
    // Get coordinates
    const coords = await getLocationCoordinates(location);
    if (!coords) {
      console.error('   ❌ Could not get coordinates for location');
      return [];
    }

    browser = await getBrowser();
    const page = await createStealthPage(browser);

    // Navigate to Blinkit with location
    const url = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    // Set location if needed (some platforms require location selection)
    // This may need adjustment based on actual site behavior
    
    // Wait for products to load
    await page.waitForTimeout(3000);
    
    // Try to find product containers (adjust selectors based on actual site structure)
    const products = await page.evaluate((query) => {
      const results = [];
      const searchQuery = query.toLowerCase();
      
      // Common selectors for e-commerce sites - adjust as needed
      const productSelectors = [
        '.product-card',
        '.ProductCard',
        '[data-testid*="product"]',
        '.Product',
        'article',
        '[class*="ProductCard"]'
      ];

      let productElements = [];
      for (const selector of productSelectors) {
        productElements = document.querySelectorAll(selector);
        if (productElements.length > 0) break;
      }

      productElements.forEach((element, index) => {
        try {
          // Extract product name
          const nameElement = element.querySelector('h3, h4, [class*="name"], [class*="title"], .product-name');
          const name = nameElement?.textContent?.trim() || '';

          // Check if it's a Hot Wheels product
          if (!name.toLowerCase().includes(searchQuery) && 
              !name.toLowerCase().includes('hotwheels') &&
              !name.toLowerCase().includes('hot wheels')) {
            return;
          }

          // Extract price
          const priceElement = element.querySelector('[class*="price"], [class*="Price"], .price, .amount');
          const priceText = priceElement?.textContent?.replace(/[^\d]/g, '') || '0';
          const price = parseInt(priceText) || 0;

          // Extract image
          const imgElement = element.querySelector('img');
          const image = imgElement?.src || imgElement?.getAttribute('data-src') || '';

          // Extract link
          const linkElement = element.querySelector('a');
          const url = linkElement?.href || '';

          // Check availability
          const unavailableElements = element.querySelectorAll('[class*="unavailable"], [class*="out-of-stock"], [class*="sold-out"]');
          const available = unavailableElements.length === 0 && price > 0;

          if (name && available) {
            results.push({
              id: `blinkit-${index}-${Date.now()}`,
              name: name,
              price: price,
              image: image,
              url: url.startsWith('http') ? url : `https://blinkit.com${url}`,
              available: available
            });
          }
        } catch (err) {
          console.error('Error extracting product:', err);
        }
      });

      return results;
    }, query);

    await browser.close();
    
    console.log(`   ✅ Found ${products.length} products on Blinkit`);
    return products;

  } catch (error) {
    if (browser) await browser.close();
    console.error(`   ❌ Blinkit scraping error: ${error.message}`);
    return [];
  }
}

// Scrape Zepto products
async function scrapeZepto(query, location) {
  let browser;
  try {
    console.log(`   🟢 Scraping Zepto for: "${query}" in ${location}`);
    
    const coords = await getLocationCoordinates(location);
    if (!coords) {
      console.error('   ❌ Could not get coordinates for location');
      return [];
    }

    browser = await getBrowser();
    const page = await createStealthPage(browser);

    const url = `https://www.zepto.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    await page.waitForTimeout(3000);
    
    const products = await page.evaluate((query) => {
      const results = [];
      const searchQuery = query.toLowerCase();
      
      const productSelectors = [
        '.ProductCard',
        '.product-card',
        '[data-testid*="product"]',
        'article',
        '[class*="ProductCard"]',
        '[class*="product-item"]'
      ];

      let productElements = [];
      for (const selector of productSelectors) {
        productElements = document.querySelectorAll(selector);
        if (productElements.length > 0) break;
      }

      productElements.forEach((element, index) => {
        try {
          const nameElement = element.querySelector('h3, h4, [class*="name"], [class*="title"], .product-name, [data-testid*="name"]');
          const name = nameElement?.textContent?.trim() || '';

          if (!name.toLowerCase().includes(searchQuery) && 
              !name.toLowerCase().includes('hotwheels') &&
              !name.toLowerCase().includes('hot wheels')) {
            return;
          }

          const priceElement = element.querySelector('[class*="price"], [class*="Price"], .price, .amount, [data-testid*="price"]');
          const priceText = priceElement?.textContent?.replace(/[^\d]/g, '') || '0';
          const price = parseInt(priceText) || 0;

          const imgElement = element.querySelector('img');
          const image = imgElement?.src || imgElement?.getAttribute('data-src') || imgElement?.getAttribute('srcset')?.split(',')[0]?.trim() || '';

          const linkElement = element.querySelector('a');
          const url = linkElement?.href || '';

          const unavailableElements = element.querySelectorAll('[class*="unavailable"], [class*="out-of-stock"], [class*="sold-out"], [class*="disabled"]');
          const available = unavailableElements.length === 0 && price > 0;

          if (name && available) {
            results.push({
              id: `zepto-${index}-${Date.now()}`,
              name: name,
              price: price,
              image: image,
              url: url.startsWith('http') ? url : `https://www.zepto.com${url}`,
              available: available
            });
          }
        } catch (err) {
          console.error('Error extracting product:', err);
        }
      });

      return results;
    }, query);

    await browser.close();
    
    console.log(`   ✅ Found ${products.length} products on Zepto`);
    return products;

  } catch (error) {
    if (browser) await browser.close();
    console.error(`   ❌ Zepto scraping error: ${error.message}`);
    return [];
  }
}

// Scrape Swiggy Instamart products
async function scrapeSwiggy(query, location) {
  let browser;
  try {
    console.log(`   🟡 Scraping Swiggy Instamart for: "${query}" in ${location}`);
    
    const coords = await getLocationCoordinates(location);
    if (!coords) {
      console.error('   ❌ Could not get coordinates for location');
      return [];
    }

    browser = await getBrowser();
    const page = await createStealthPage(browser);

    const url = `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(query)}`;
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    await page.waitForTimeout(3000);
    
    const products = await page.evaluate((query) => {
      const results = [];
      const searchQuery = query.toLowerCase();
      
      const productSelectors = [
        '.ProductCard',
        '.product-card',
        '[data-testid*="product"]',
        'article',
        '[class*="ProductCard"]',
        '[class*="product-item"]',
        '[class*="ItemCard"]'
      ];

      let productElements = [];
      for (const selector of productSelectors) {
        productElements = document.querySelectorAll(selector);
        if (productElements.length > 0) break;
      }

      productElements.forEach((element, index) => {
        try {
          const nameElement = element.querySelector('h3, h4, [class*="name"], [class*="title"], .product-name, [data-testid*="name"]');
          const name = nameElement?.textContent?.trim() || '';

          if (!name.toLowerCase().includes(searchQuery) && 
              !name.toLowerCase().includes('hotwheels') &&
              !name.toLowerCase().includes('hot wheels')) {
            return;
          }

          const priceElement = element.querySelector('[class*="price"], [class*="Price"], .price, .amount, [data-testid*="price"]');
          const priceText = priceElement?.textContent?.replace(/[^\d]/g, '') || '0';
          const price = parseInt(priceText) || 0;

          const imgElement = element.querySelector('img');
          const image = imgElement?.src || imgElement?.getAttribute('data-src') || imgElement?.getAttribute('srcset')?.split(',')[0]?.trim() || '';

          const linkElement = element.querySelector('a');
          const url = linkElement?.href || '';

          const unavailableElements = element.querySelectorAll('[class*="unavailable"], [class*="out-of-stock"], [class*="sold-out"], [class*="disabled"]');
          const available = unavailableElements.length === 0 && price > 0;

          if (name && available) {
            results.push({
              id: `swiggy-${index}-${Date.now()}`,
              name: name,
              price: price,
              image: image,
              url: url.startsWith('http') ? url : `https://www.swiggy.com${url}`,
              available: available
            });
          }
        } catch (err) {
          console.error('Error extracting product:', err);
        }
      });

      return results;
    }, query);

    await browser.close();
    
    console.log(`   ✅ Found ${products.length} products on Swiggy`);
    return products;

  } catch (error) {
    if (browser) await browser.close();
    console.error(`   ❌ Swiggy scraping error: ${error.message}`);
    return [];
  }
}

module.exports = {
  scrapeBlinkit,
  scrapeZepto,
  scrapeSwiggy,
  getLocationCoordinates
};

