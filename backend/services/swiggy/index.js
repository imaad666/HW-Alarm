const browserManager = require('../../utils/browserManager');

class SwiggyService {
    async setLocation(sessionId, location) {
        const page = await browserManager.getPage(sessionId, 'swiggy');
        console.log(`[Swiggy] Setting location to: ${location}`);

        try {
            if (!page.url().includes("swiggy.com")) {
                await page.goto("https://www.swiggy.com/instamart", { waitUntil: "domcontentloaded", timeout: 60000 });
            }

            // Swiggy often asks for location on landing
            try {
                const locInput = await page.$('input[placeholder*="Enter your delivery location"], input[class*="_381fS"]');
                if (locInput) {
                    await locInput.type(location, { delay: 100 });
                    await page.waitForTimeout(2000);
                    const suggestion = await page.$('div[class*="_2W-T9"]'); // Selector from old swiggy, might need update
                    if (suggestion) await suggestion.click();
                } else {
                    // Try clicking header location
                    const headerLoc = await page.$('[title="Change Location"]');
                    if (headerLoc) {
                        await headerLoc.click();
                        await page.waitForTimeout(1000);
                        const input = await page.$('input[placeholder*="Search"]');
                        if (input) {
                            await input.type(location, { delay: 100 });
                            await page.waitForTimeout(2000);
                            const first = await page.$('div[class*="SearchResult"] button');
                            if (first) await first.click();
                        }
                    }
                }
            } catch (e) {
                console.log('[Swiggy] Error interacting with location UI');
            }

            await page.waitForTimeout(3000);
            return true;
        } catch (error) {
            console.error('[Swiggy] Error setting location:', error);
            return false;
        }
    }

    async search(sessionId, query) {
        const page = await browserManager.getPage(sessionId, 'swiggy');
        console.log(`[Swiggy] Searching for: ${query}`);

        try {
            const searchUrl = `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(query)}`;
            await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

            const products = await page.evaluate(() => {
                const results = [];
                // Instamart selectors
                const items = document.querySelectorAll('[data-testid="product-card"], div[class*="ProductCard"]');

                items.forEach(item => {
                    try {
                        const nameEl = item.querySelector('div[class*="name"], h3, h4');
                        const priceEl = item.querySelector('div[class*="price"]');
                        const imgEl = item.querySelector('img');

                        if (nameEl && priceEl) {
                            const price = parseInt(priceEl.textContent.replace(/[^\d]/g, ''));
                            const isAvailable = !item.textContent.toLowerCase().includes('out of stock');

                            results.push({
                                name: nameEl.textContent.trim(),
                                price: price,
                                image: imgEl ? imgEl.src : '',
                                available: isAvailable,
                                platform: 'Swiggy Instamart',
                                url: window.location.href
                            });
                        }
                    } catch (e) { }
                });
                return results;
            });

            return products;
        } catch (error) {
            console.error('[Swiggy] Search error:', error);
            return [];
        }
    }
}

module.exports = new SwiggyService();
