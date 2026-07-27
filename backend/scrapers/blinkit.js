import puppeteer from 'puppeteer';

const BLINKIT_URL = 'https://blinkit.com/s/?q=';
const TIMEOUT = 20_000;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Search Blinkit for products.
 *
 * Blinkit renders a React SPA. The product grid uses these stable selectors:
 *   - Product container : div[data-testid="product-atom"]   (each product card)
 *   - Product name      : div[class^="Product__Name"]  (or innerText of .plp-product__title)
 *   - Price             : span.Price-originalPrice  or  div[class^="Product__Price"]
 *   - Image             : img  (first inside the card)
 *   - Weight/qty        : div[class^="Product__Weight"]
 *
 * Blinkit does NOT require login or location for search — it serves results
 * based on the default city hub. We navigate directly to the search URL.
 */
export async function searchBlinkit(query, _location = '') {
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

    const url = `${BLINKIT_URL}${encodeURIComponent(query)}`;
    console.log(`[blinkit] fetching: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });

    // Wait for product cards to appear — try multiple selector patterns
    const cardSelector = [
      'div[data-testid="product-atom"]',
      '.Product__UpdatedPlpProductContainer-sc',
      '.plp-product__container',
    ].join(', ');

    try {
      await page.waitForSelector(cardSelector, { timeout: 10_000 });
    } catch {
      // Page may have loaded without products (empty results or geo-block)
      console.warn('[blinkit] no product cards found — returning []');
      return [];
    }

    // Small pause for lazy images
    await sleep(1000);

    const products = await page.evaluate(() => {
      // Blinkit uses hashed class names — look for data-testid first, then fall back
      const cards = [
        ...document.querySelectorAll('div[data-testid="product-atom"]'),
      ];

      // Fallback: any div whose class starts with "Product__UpdatedPlpProduct"
      const fallbackCards = cards.length === 0
        ? [...document.querySelectorAll('div[class*="Product__Updated"]')]
        : [];

      const all = cards.length > 0 ? cards : fallbackCards;

      return all.slice(0, 12).map(card => {
        // Name — try several patterns
        const name =
          card.querySelector('[class*="Product__Name"]')?.textContent?.trim() ||
          card.querySelector('[class*="plp-product__title"]')?.textContent?.trim() ||
          card.querySelector('h5, h4, h3')?.textContent?.trim() ||
          '';

        // Price — Blinkit shows price in a styled span
        const priceRaw =
          card.querySelector('[class*="Price__StyledPrice"]')?.textContent?.trim() ||
          card.querySelector('[class*="Product__Price"]')?.textContent?.trim() ||
          card.querySelector('[class*="price"]')?.textContent?.trim() ||
          '';
        const price = parseFloat(priceRaw.replace(/[^0-9.]/g, '')) || 0;

        // Image
        const img = card.querySelector('img');
        const image = img?.src || img?.dataset?.src || '';

        // Weight
        const weight =
          card.querySelector('[class*="Product__Weight"]')?.textContent?.trim() ||
          card.querySelector('[class*="weight"]')?.textContent?.trim() ||
          '';

        return name && price > 0 ? { name, price, image, weight, platform: 'blinkit', url: window.location.href } : null;
      }).filter(Boolean);
    });

    console.log(`[blinkit] found ${products.length} products`);
    return products;
  } catch (err) {
    console.error('[blinkit] scrape error:', err.message);
    return [];
  } finally {
    await browser?.close();
  }
}
