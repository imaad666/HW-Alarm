const browserManager = require('../../utils/browserManager');

class BlinkitService {
    async setLocation(sessionId, location) {
        const page = await browserManager.getPage(sessionId, 'blinkit');
        console.log(`[Blinkit] Setting location to: ${location}`);

        try {
            if (!page.url().includes("blinkit.com")) {
                await page.goto("https://blinkit.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
            }

            // Check if location is already set (heuristic)
            const isSet = await page.evaluate(() => {
                const eta = document.querySelector('[class^="LocationBar__EtaContainer"]');
                return !!eta;
            });

            // If we want to force update, or if not set
            // For now, let's try to set it always to ensure correctness

            try {
                await page.waitForSelector('[name="select-locality"]', { timeout: 5000 });
                await page.click('[name="select-locality"]');
            } catch (e) {
                // Maybe already clicked or different UI
                console.log('[Blinkit] Location input not found or already active');
            }

            // Type location
            await page.type('[name="select-locality"]', location, { delay: 100 });
            await page.waitForTimeout(2000);

            // Select first suggestion
            try {
                await page.waitForSelector('.LocationSearchList__LocationListContainer-sc-93rfr7-0:nth-child(1), [class*="LocationSearchList"] div:first-child', { timeout: 5000 });
                const suggestion = await page.$('.LocationSearchList__LocationListContainer-sc-93rfr7-0:nth-child(1), [class*="LocationSearchList"] div:first-child');
                if (suggestion) await suggestion.click();
            } catch (e) {
                console.log('[Blinkit] Could not click suggestion');
            }

            await page.waitForTimeout(3000);
            return true;
        } catch (error) {
            console.error('[Blinkit] Error setting location:', error);
            return false;
        }
    }

    async search(sessionId, query) {
        const page = await browserManager.getPage(sessionId, 'blinkit');
        console.log(`[Blinkit] Searching for: ${query}`);

        try {
            const searchUrl = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
            await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

            // Extract products
            const products = await page.evaluate(() => {
                const results = [];
                const items = document.querySelectorAll('[data-test-id="product-card-wrapper"], .Product__UpdatedProductContainer-sc-11dk8zk-0, article, div[class*="Product"]');

                items.forEach(item => {
                    try {
                        const nameEl = item.querySelector('div[class*="Product__UpdatedTitle"], div[class*="title"], h3, .product-name');
                        const priceEl = item.querySelector('div[class*="Product__UpdatedPrice"], div[class*="price"], span[class*="price"]');
                        const imgEl = item.querySelector('img');
                        const btnEl = item.querySelector('button');

                        if (nameEl && priceEl) {
                            const priceText = priceEl.textContent;
                            const price = parseInt(priceText.replace(/[^\d]/g, ''));

                            // Check availability
                            const isAvailable = !item.textContent.toLowerCase().includes('out of stock') &&
                                !item.textContent.toLowerCase().includes('sold out') &&
                                btnEl && !btnEl.disabled;

                            results.push({
                                name: nameEl.textContent.trim(),
                                price: price,
                                image: imgEl ? imgEl.src : '',
                                available: isAvailable,
                                platform: 'Blinkit',
                                url: window.location.href
                            });
                        }
                    } catch (e) { }
                });
                return results;
            });

            return products;
        } catch (error) {
            console.error('[Blinkit] Search error:', error);
            return [];
        }
    }
}

module.exports = new BlinkitService();
