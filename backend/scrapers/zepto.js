import puppeteer from 'puppeteer';

const ZEPTO_URL = 'https://www.zeptonow.com/search?query=';
const TIMEOUT = 20_000;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Search Zepto for products.
 *
 * Zepto uses Next.js / React. Key stable selectors:
 *   - Product container : div[data-testid="product-card"]
 *   - Product name      : p[data-testid="product-card-name"]
 *   - Price             : p[data-testid="product-card-price"]   (shows "₹XX")
 *   - Image             : img  inside the card
 *   - Weight/qty        : p[data-testid="product-card-quantity"]
 *
 * Direct search URL works without setting location — Zepto resolves to the
 * nearest available hub for an unset session.
 */
export async function searchZepto(query, _location = '') {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 900 });

    const url = `${ZEPTO_URL}${encodeURIComponent(query)}`;
    console.log(`[zepto] fetching: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });

    // Wait for product cards
    const cardSelector = [
      'div[data-testid="product-card"]',
      'div[class*="ProductCard"]',
      'div[class*="product-card"]',
    ].join(', ');

    try {
      await page.waitForSelector(cardSelector, { timeout: 10_000 });
    } catch {
      console.warn('[zepto] no product cards found — returning []');
      return [];
    }

    await sleep(1000);

    const products = await page.evaluate(() => {
      const cards = [
        ...document.querySelectorAll('div[data-testid="product-card"]'),
      ];

      const fallback = cards.length === 0
        ? [...document.querySelectorAll('div[class*="ProductCard"], div[class*="product-card"]')]
        : [];

      const all = cards.length > 0 ? cards : fallback;

      return all.slice(0, 12).map(card => {
        // Name
        const name =
          card.querySelector('[data-testid="product-card-name"]')?.textContent?.trim() ||
          card.querySelector('[class*="name"], [class*="Name"]')?.textContent?.trim() ||
          card.querySelector('h5, h4, h3, p')?.textContent?.trim() ||
          '';

        // Price
        const priceRaw =
          card.querySelector('[data-testid="product-card-price"]')?.textContent?.trim() ||
          card.querySelector('[class*="price"], [class*="Price"]')?.textContent?.trim() ||
          '';
        const price = parseFloat(priceRaw.replace(/[^0-9.]/g, '')) || 0;

        // Image
        const img = card.querySelector('img');
        const image = img?.src || img?.dataset?.src || '';

        // Weight/qty
        const weight =
          card.querySelector('[data-testid="product-card-quantity"]')?.textContent?.trim() ||
          card.querySelector('[class*="weight"], [class*="Weight"], [class*="quantity"]')?.textContent?.trim() ||
          '';

        return name && price > 0 ? { name, price, image, weight, platform: 'zepto', url: window.location.href } : null;
      }).filter(Boolean);
    });

    console.log(`[zepto] found ${products.length} products`);
    return products;
  } catch (err) {
    console.error('[zepto] scrape error:', err.message);
    return [];
  } finally {
    await browser?.close();
  }
}
