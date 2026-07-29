import puppeteer from 'puppeteer';
import { config } from '../config/config.js';
import { makeResult } from './utils.js';

const { lat, lng } = config.location;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function launchBrowser() {
  return puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
}

/**
 * Check a Blinkit product URL for availability.
 *
 * Strategy:
 * 1. Intercept the Blinkit internal location API call and inject our lat/lng
 *    so the page thinks we are at the configured location.
 * 2. Navigate to the product page.
 * 3. Look for "Add to cart" vs out-of-stock indicators in the DOM.
 */
export async function checkBlinkit(url) {
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 900 });

    // Inject location via localStorage before any page load
    await page.evaluateOnNewDocument((lt, ln) => {
      // Blinkit stores location in localStorage
      localStorage.setItem('userLat', String(lt));
      localStorage.setItem('userLng', String(ln));
      localStorage.setItem('gr_1', JSON.stringify({ lat: lt, lng: ln }));
    }, lat, lng);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await sleep(3000);

    const result = await page.evaluate(() => {
      const body = document.body?.innerText ?? '';

      // Product name — try structured selectors first
      const nameEl =
        document.querySelector('[class*="Product__Name"]') ||
        document.querySelector('h1') ||
        document.querySelector('h2');
      const productName = nameEl?.textContent?.trim() ?? '';

      // Price
      const priceEl = document.querySelector('[class*="Price"]');
      const priceText = priceEl?.textContent?.trim() ?? '';
      const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || null;

      // Availability signals
      const pageTextLower = body.toLowerCase();

      // "Add to cart" button present and not disabled = available
      const addBtn = document.querySelector('button[class*="AddToCart"], button[class*="add-to-cart"]');
      const addBtnText = addBtn?.textContent?.trim().toLowerCase() ?? '';
      const hasAddBtn = !!addBtn && !addBtn.disabled && (addBtnText.includes('add') || addBtnText.includes('cart'));

      // Out-of-stock signals
      const outOfStock =
        pageTextLower.includes('out of stock') ||
        pageTextLower.includes('currently unavailable') ||
        pageTextLower.includes('notify me') ||
        pageTextLower.includes('sold out');

      // "Add" button in the DOM (Blinkit uses a simple "Add" label)
      const genericAdd = [...document.querySelectorAll('button')].some(btn => {
        const t = btn.textContent?.trim().toLowerCase();
        return (t === 'add' || t === 'add to cart') && !btn.disabled;
      });

      if (outOfStock) return { available: false, statusText: 'Out of stock', productName, price };
      if (hasAddBtn || genericAdd) return { available: true, statusText: 'Add to cart', productName, price };

      // Fallback — if the page has a price it's likely available
      if (price) return { available: true, statusText: 'Product page loaded', productName, price };

      return { available: false, statusText: 'Could not determine', productName, price };
    });

    return makeResult(result.available, result.statusText, result.productName, result.price);
  } catch (err) {
    console.error('[blinkit] check error:', err.message);
    return makeResult(false, `Error: ${err.message}`);
  } finally {
    await browser?.close();
  }
}
