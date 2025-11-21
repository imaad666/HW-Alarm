const puppeteer = require('puppeteer');

async function debugBlinkit() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log('Navigating to Blinkit...');
    await page.goto('https://blinkit.com', { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('Taking screenshot of homepage...');
    await page.screenshot({ path: 'debug_blinkit_home.png' });

    // Check for location modal
    const locationModal = await page.$('.location-box'); // Hypothetical selector
    console.log('Location modal present:', !!locationModal);

    // Try to search directly via URL
    console.log('Navigating to search URL...');
    await page.goto('https://blinkit.com/s/?q=hot%20wheels', { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('Taking screenshot of search results...');
    await page.screenshot({ path: 'debug_blinkit_search.png' });

    // Dump page content to verify selectors
    const html = await page.content();
    const fs = require('fs');
    fs.writeFileSync('debug_blinkit.html', html);
    console.log('Saved HTML to debug_blinkit.html');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugBlinkit();
