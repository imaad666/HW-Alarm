import puppeteer from 'puppeteer';
import { config } from '../config/config.js';
import { makeResult } from './utils.js';

const { lat, lng } = config.location;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function launchBrowser() {
  return puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
}

/**
 * Check a Zepto product URL for availability.
 *
 * Zepto redirects to zepto.com and requires login for search, but individual
 * product pages are accessible. We inject geolocation permission + coords so
 * Zepto resolves to our location without manual interaction.
 */
export async function checkZepto(url) {
  let browser;
  try {
    browser = await launchBrowser();
    const context = browser.defaultBrowserContext();

    // Grant geolocation permission
    await context.overridePermissions('https://www.zepto.com', ['geolocation']);
    await context.overridePermissions('https://zepto.com', ['geolocation']);

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 900 });

    // Override geolocation
    await page.setGeolocation({ latitude: lat, longitude: lng });

    // Pre-set location in localStorage
    await page.evaluateOnNewDocument((lt, ln) => {
      localStorage.setItem('userLat', String(lt));
      localStorage.setItem('userLng', String(ln));
    }, lat, lng);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await sleep(3000);

    const result = await page.evaluate(() => {
      const body = document.body?.innerText ?? '';
      const pageTextLower = body.toLowerCase();

      // Product name
      const nameEl = document.querySelector('[data-testid="product-name"]') ||
                     document.querySelector('h1') || document.querySelector('h2');
      const productName = nameEl?.textContent?.trim() ?? '';

      // Price
      const priceEl = document.querySelector('[data-testid="product-price"]') ||
                      document.querySelector('[class*="price"]');
      const price = parseFloat(priceEl?.textContent?.replace(/[^0-9.]/g, '') ?? '') || null;

      // Availability
      const outOfStock =
        pageTextLower.includes('out of stock') ||
        pageTextLower.includes('notify me') ||
        pageTextLower.includes('sold out') ||
        pageTextLower.includes('currently unavailable');

      const addBtn = [...document.querySelectorAll('button')].find(btn => {
        const t = btn.textContent?.trim().toLowerCase();
        return (t === 'add' || t === 'add to cart') && !btn.disabled;
      });

      if (outOfStock) return { available: false, statusText: 'Out of stock', productName, price };
      if (addBtn) return { available: true, statusText: 'Add to cart', productName, price };
      if (price) return { available: true, statusText: 'Product page loaded', productName, price };
      return { available: false, statusText: 'Could not determine', productName, price };
    });

    return makeResult(result.available, result.statusText, result.productName, result.price);
  } catch (err) {
    console.error('[zepto] check error:', err.message);
    return makeResult(false, `Error: ${err.message}`);
  } finally {
    await browser?.close();
  }
}
