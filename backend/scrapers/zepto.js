import puppeteer from 'puppeteer';

/**
 * Search for products on Zepto
 * @param {string} query - Product search query
 * @param {string} location - Location for delivery
 * @returns {Promise<Array>} Array of product objects
 */
export async function searchZepto(query, location = '') {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to Zepto
    await page.goto('https://www.zeptonow.com', { waitUntil: 'networkidle2' });

    // Handle location if provided
    if (location) {
      try {
        const locationSelector = 'input[placeholder*="location"], input[placeholder*="Location"], input[placeholder*="area"]';
        const locationInput = await page.$(locationSelector);
        
        if (locationInput) {
          await locationInput.type(location, { delay: 100 });
          await page.waitForTimeout(1000);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(2000);
        }
      } catch (err) {
        console.log('Location setting skipped:', err.message);
      }
    }

    // Search for products
    const searchSelector = 'input[placeholder*="Search"], input[type="search"], input[name*="search"]';
    await page.waitForSelector(searchSelector, { timeout: 5000 });
    await page.type(searchSelector, query, { delay: 100 });
    await page.keyboard.press('Enter');
    
    // Wait for results to load
    await page.waitForTimeout(3000);
    
    // Extract product data
    const products = await page.evaluate(() => {
      const productCards = document.querySelectorAll('[class*="product"], [class*="Product"], [data-testid*="product"]');
      const results = [];

      productCards.forEach((card, index) => {
        if (index >= 10) return; // Limit to 10 products

        try {
          // Try to find product name
          const nameElement = card.querySelector('h3, h4, [class*="name"], [class*="title"]');
          const name = nameElement?.textContent?.trim() || '';

          // Try to find price
          const priceElement = card.querySelector('[class*="price"], [class*="Price"], span[class*="rupee"]');
          const priceText = priceElement?.textContent?.trim() || '';
          const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

          // Try to find image
          const imgElement = card.querySelector('img');
          const image = imgElement?.src || imgElement?.getAttribute('data-src') || '';

          // Try to find weight/quantity
          const weightElement = card.querySelector('[class*="weight"], [class*="quantity"], [class*="size"]');
          const weight = weightElement?.textContent?.trim() || '';

          if (name && price > 0) {
            results.push({
              name,
              price,
              image,
              weight,
              platform: 'zepto',
              url: window.location.href
            });
          }
        } catch (err) {
          console.error('Error extracting product:', err);
        }
      });

      return results;
    });

    return products;
  } catch (error) {
    console.error('Zepto scraping error:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

