const puppeteer = require('puppeteer');

async function analyzeNetwork() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Log all XHR/Fetch requests
    page.on('request', request => {
        if (['xhr', 'fetch'].includes(request.resourceType())) {
            if (request.url().includes('search') || request.url().includes('products') || request.url().includes('algo')) {
                console.log('------------------------------------------------');
                console.log('URL:', request.url());
                console.log('Method:', request.method());
                console.log('Headers:', JSON.stringify(request.headers(), null, 2));
                if (request.postData()) {
                    console.log('Body:', request.postData());
                }
            }
        }
    });

    try {
        console.log('Navigating to Blinkit...');
        await page.goto('https://blinkit.com', { waitUntil: 'networkidle2', timeout: 60000 });

        // Try to set location cookie manually if possible, or just rely on default
        // Often Blinkit defaults to a location or asks.

        console.log('Typing search query...');
        // Wait for search bar
        const searchSelector = 'input[placeholder*="search"], input[placeholder*="Search"]';
        await page.waitForSelector(searchSelector, { timeout: 10000 });
        await page.type(searchSelector, 'hot wheels');
        await page.keyboard.press('Enter');

        console.log('Waiting for results...');
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

analyzeNetwork();
