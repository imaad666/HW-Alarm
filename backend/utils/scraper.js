/**
 * Web Scraper Utilities
 * Scrapes publicly available product data from Blinkit, Zepto, and Swiggy
 */

const puppeteer = require('puppeteer');
const UserAgent = require('user-agents');

// Get random user agent to avoid detection
function getRandomUserAgent() {
  const userAgent = new UserAgent({ deviceCategory: 'desktop' });
  return userAgent.toString();
}

// Launch browser with stealth settings
async function getBrowser() {
  return await puppeteer.launch({
    headless: true, // Use standard headless mode to avoid crashes
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080',
      '--ignore-certificate-errors'
    ]
  });
}

// Create a page with stealth settings
async function createStealthPage(browser) {
  const page = await browser.newPage();

  // Set random user agent
  await page.setUserAgent(getRandomUserAgent());

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

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

  return page;
}

// Helper to handle location selection
async function handleLocation(page, location, platform) {
  console.log(`   📍 Setting location to "${location}" on ${platform}...`);

  try {
    if (platform === 'Blinkit') {
      // Wait for potential location modal
      try {
        // Check for "Detect my location" or similar buttons which indicate we need to set location
        const needsLocation = await page.evaluate(() => {
          return document.body.innerText.includes('Delivery in') ||
            document.body.innerText.includes('Select Location') ||
            document.querySelector('.location-box') !== null;
        });

        if (needsLocation) {
          // Click on location header/button if it exists
          const locationBtn = await page.$('.location-box, [data-test-id="location-header"]');
          if (locationBtn) await locationBtn.click();

          // Wait for input
          await page.waitForSelector('input[placeholder*="search"], input[placeholder*="Search"]', { timeout: 5000 });
          const input = await page.$('input[placeholder*="search"], input[placeholder*="Search"]');

          if (input) {
            await input.type(location, { delay: 100 });
            await page.waitForTimeout(2000);
            // Click first suggestion
            const firstSuggestion = await page.$('.pac-item, [class*="LocationSearchList"] div, [class*="suggestion"]');
            if (firstSuggestion) {
              await firstSuggestion.click();
              await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => { });
            }
          }
        }
      } catch (e) {
        console.log(`   ⚠️  Could not set location on Blinkit (might already be set or different UI): ${e.message}`);
      }
    } else if (platform === 'Zepto') {
      // Zepto location logic
      try {
        const locationBtn = await page.$('[data-testid="location-header"], [class*="location-header"]');
        if (locationBtn) await locationBtn.click();

        const input = await page.$('input[placeholder*="Search a new location"]');
        if (input) {
          await input.type(location, { delay: 100 });
          await page.waitForTimeout(2000);
          const firstSuggestion = await page.$('[data-testid="location-search-result-item"]');
          if (firstSuggestion) {
            await firstSuggestion.click();
            await page.waitForTimeout(2000);
            // Confirm location if needed
            const confirmBtn = await page.$('button:contains("Confirm")');
            if (confirmBtn) await confirmBtn.click();
          }
        }
      } catch (e) {
        console.log(`   ⚠️  Could not set location on Zepto: ${e.message}`);
      }
    }
    // Swiggy logic would go here
  } catch (error) {
    console.error(`   ❌ Error setting location: ${error.message}`);
  }
}

// Generic product extractor using heuristics
async function extractProducts(page, platform) {
  return await page.evaluate((platform) => {
    const results = [];

    // Helper to find price
    const findPrice = (el) => {
      const text = el.textContent;
      const match = text.match(/₹\s*(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    // Helper to find image
    const findImage = (el) => {
      const img = el.querySelector('img');
      return img ? (img.src || img.getAttribute('data-src') || '') : '';
    };

    // Helper to find name
    const findName = (el) => {
      // Look for standard heading tags or classes
      const nameEl = el.querySelector('h2, h3, h4, [class*="name"], [class*="title"]');
      if (nameEl) return nameEl.textContent.trim();

      // Fallback: find text node that isn't price or button
      return el.textContent.split('₹')[0].trim().substring(0, 100);
    };

    // Find all potential product cards
    // Heuristic: Elements that have an image and a price symbol
    const allElements = document.querySelectorAll('div, article, a');

    allElements.forEach((el) => {
      // Optimization: Skip small elements or huge containers
      if (el.offsetHeight < 100 || el.offsetHeight > 600) return;

      const text = el.textContent;
      if (!text.includes('₹')) return;

      const price = findPrice(el);
      if (price === 0) return;

      const image = findImage(el);
      if (!image) return;

      const name = findName(el);
      if (!name || name.length < 3) return;

      // Avoid duplicates (nested divs often match the same product)
      // We'll filter them out later or rely on unique IDs if possible

      // Check availability
      const isUnavailable = text.toLowerCase().includes('out of stock') ||
        text.toLowerCase().includes('sold out') ||
        el.querySelector('[disabled]');

      results.push({
        name,
        price,
        image,
        platform,
        available: !isUnavailable,
        url: window.location.href // We are on the search page, individual links might be hard to extract generically
      });
    });

    // Deduplicate based on name and price
    const unique = [];
    const seen = new Set();

    results.forEach(r => {
      const key = `${r.name}-${r.price}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
      }
    });

    return unique;
  }, platform);
}

// Scrape Blinkit products
async function scrapeBlinkit(query, location) {
  let browser;
  try {
    console.log(`   🔵 Scraping Blinkit for: "${query}"...`);
    browser = await getBrowser();
    const page = await createStealthPage(browser);

    // 1. Go to home page to set location first
    await page.goto('https://blinkit.com', { waitUntil: 'networkidle2', timeout: 30000 });
    await handleLocation(page, location, 'Blinkit');

    // 2. Perform search
    const searchUrl = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // 3. Extract products
    await page.waitForTimeout(2000); // Wait for hydration
    const products = await extractProducts(page, 'Blinkit');

    console.log(`   ✅ Found ${products.length} products on Blinkit`);
    await browser.close();
    return products.map((p, i) => ({ ...p, id: `blinkit-${i}` }));

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
    console.log(`   🟢 Scraping Zepto for: "${query}"...`);
    browser = await getBrowser();
    const page = await createStealthPage(browser);

    await page.goto('https://zepto.com', { waitUntil: 'networkidle2', timeout: 30000 });
    await handleLocation(page, location, 'Zepto');

    const searchUrl = `https://zepto.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForTimeout(2000);
    const products = await extractProducts(page, 'Zepto');

    console.log(`   ✅ Found ${products.length} products on Zepto`);
    await browser.close();
    return products.map((p, i) => ({ ...p, id: `zepto-${i}` }));

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
    console.log(`   🟡 Scraping Swiggy for: "${query}"...`);
    browser = await getBrowser();
    const page = await createStealthPage(browser);

    // Swiggy is harder to automate location without login, but we'll try search directly
    // Often Swiggy uses the last location or defaults
    const searchUrl = `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForTimeout(2000);
    const products = await extractProducts(page, 'Swiggy Instamart');

    console.log(`   ✅ Found ${products.length} products on Swiggy`);
    await browser.close();
    return products.map((p, i) => ({ ...p, id: `swiggy-${i}` }));

  } catch (error) {
    if (browser) await browser.close();
    console.error(`   ❌ Swiggy scraping error: ${error.message}`);
    return [];
  }
}

module.exports = {
  scrapeBlinkit,
  scrapeZepto,
  scrapeSwiggy
};
