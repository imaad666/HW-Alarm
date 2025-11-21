const browserManager = require('../../utils/browserManager');

class ZeptoService {
    async setLocation(sessionId, location) {
        const page = await browserManager.getPage(sessionId, 'zepto');
        console.log(`[Zepto] Setting location to: ${location}`);

        try {
            if (!page.url().includes("zepto.com")) {
                await page.goto("https://zepto.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
            }

            // Click location header
            try {
                const locHeader = await page.$('[data-testid="location-header"], [class*="location-header"], .max-w-\\[170px\\] > span');
                if (locHeader) await locHeader.click();
            } catch (e) { }

            await page.waitForTimeout(2000);

            // Click "Search a new address" or similar input
            try {
                const input = await page.waitForSelector('input[placeholder*="Search"], input[placeholder*="address"]', { timeout: 5000 });
                await input.click();
                await input.type(location, { delay: 100 });
            } catch (e) {
                console.log('[Zepto] Could not find location input');
            }

            await page.waitForTimeout(3000);

            // Click first suggestion
            try {
                const suggestion = await page.$('[data-testid="location-search-result-item"], .flex:nth-child(1) > .ml-4 > div > .font-heading');
                if (suggestion) await suggestion.click();
            } catch (e) {
                console.log('[Zepto] Could not click suggestion');
            }

            await page.waitForTimeout(3000);

            // Confirm
            try {
                const confirmBtn = await page.$('button:contains("Confirm"), .bg-skin-primary > .flex');
                if (confirmBtn) await confirmBtn.click();
            } catch (e) { }

            return true;
        } catch (error) {
            console.error('[Zepto] Error setting location:', error);
            return false;
        }
    }

    async search(sessionId, query) {
        const page = await browserManager.getPage(sessionId, 'zepto');
        console.log(`[Zepto] Searching for: ${query}`);

        try {
            const searchUrl = `https://zepto.com/search?q=${encodeURIComponent(query)}`;
            await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

            const products = await page.evaluate(() => {
                const results = [];
                const items = document.querySelectorAll('[data-testid="product-card"], .product-card, [class*="ProductCard"]');

                items.forEach(item => {
                    try {
                        const nameEl = item.querySelector('[data-testid="product-card-name"], h4, h3, [class*="name"]');
                        const priceEl = item.querySelector('[data-testid="product-card-price"], [class*="price"]');
                        const imgEl = item.querySelector('img');

                        if (nameEl && priceEl) {
                            const price = parseInt(priceEl.textContent.replace(/[^\d]/g, ''));
                            const isAvailable = !item.textContent.toLowerCase().includes('out of stock');

                            results.push({
                                name: nameEl.textContent.trim(),
                                price: price,
                                image: imgEl ? imgEl.src : '',
                                available: isAvailable,
                                platform: 'Zepto',
                                url: window.location.href
                            });
                        }
                    } catch (e) { }
                });
                return results;
            });

            return products;
        } catch (error) {
            console.error('[Zepto] Search error:', error);
            return [];
        }
    }
}

module.exports = new ZeptoService();
