# 🔍 Web Scraping Guide

This Hot Wheels Alerts app now uses **web scraping** to fetch publicly available product data from Blinkit, Zepto, and Swiggy Instamart.

## How It Works

1. **Location-based Scraping**: Uses latitude/longitude coordinates for accurate location targeting
2. **Stealth Mode**: Implements anti-detection techniques (random user agents, webdriver hiding, etc.)
3. **Dynamic Content**: Uses Puppeteer to handle JavaScript-rendered content
4. **Product Matching**: Filters and matches Hot Wheels products across platforms

## Features

- ✅ **Automatic Location Resolution**: Converts location names to coordinates using OpenStreetMap
- ✅ **Stealth Scraping**: Avoids detection with randomized user agents and browser fingerprint hiding
- ✅ **Error Handling**: Graceful fallbacks if scraping fails
- ✅ **Rate Limiting**: Built-in delays to be respectful

## Installation

The scraping dependencies are already included:

```bash
npm install
```

This installs:
- `puppeteer` - For browser automation and dynamic content scraping
- `cheerio` - For HTML parsing (backup/fallback)
- `user-agents` - For random user agent generation

## Usage

The scraping happens automatically when you search. No additional configuration needed!

1. Enter your location (e.g., "Mumbai", "Delhi", "Bangalore")
2. Click "Search Hot Wheels"
3. The app will:
   - Resolve location to coordinates
   - Scrape each platform
   - Filter for Hot Wheels products
   - Display results

## Technical Details

### Location Resolution

The app uses OpenStreetMap's Nominatim API to convert location names to coordinates:

```javascript
Location Name → OpenStreetMap API → { lat, lng }
```

### Scraping Process

For each platform:

1. **Launch Browser**: Creates a headless Chrome instance with stealth settings
2. **Navigate**: Goes to the platform's search URL with query and location
3. **Wait for Content**: Waits for products to load (JavaScript rendering)
4. **Extract Data**: Scrapes product name, price, image, URL, availability
5. **Filter**: Keeps only Hot Wheels-related products
6. **Return**: Returns structured product data

### Stealth Features

- Random user agents per request
- Webdriver property hiding
- Plugin spoofing
- Viewport randomization
- Request header randomization

## Customization

### Adjust Scraping Selectors

If the sites change their HTML structure, update selectors in `backend/utils/scraper.js`:

```javascript
// In scrapeBlinkit(), scrapeZepto(), or scrapeSwiggy()
const productSelectors = [
  '.ProductCard',        // Add your selectors here
  '.product-card',
  '[data-testid*="product"]'
];
```

### Adjust Wait Times

If products take longer to load:

```javascript
await page.waitForTimeout(5000); // Increase from 3000ms to 5000ms
```

### Add More Platforms

To add another platform, create a new scrape function following the same pattern.

## Rate Limiting & Best Practices

- **Delays**: 3-second wait between page loads
- **Respectful**: Only scrapes when you explicitly search
- **Error Handling**: Fails gracefully without crashing
- **Public Data Only**: Only scrapes publicly visible product listings

## Troubleshooting

### No Products Found

1. **Check Browser Logs**: Look for error messages in the backend console
2. **Verify Selectors**: Sites may have changed their HTML structure
3. **Network Issues**: Check your internet connection
4. **Location**: Try a different location (e.g., major cities)

### Scraping Too Slow

- This is normal - scraping requires page loads which take time
- Each platform takes ~5-10 seconds
- All platforms scrape in parallel to minimize wait time

### Browser Errors

If you see Puppeteer errors:
- Make sure Chrome/Chromium is available
- On Linux: `sudo apt-get install chromium-browser`
- On macOS: Chrome should be auto-installed with Puppeteer

### Location Not Found

If location resolution fails:
- Try more specific locations (e.g., "Mumbai, Maharashtra" instead of just "Mumbai")
- Check spelling
- Use major city names

## Legal & Ethical Notes

⚠️ **Important**:
- This scraper only accesses **publicly available** product listings
- No login or authentication required
- No private/personal data accessed
- Follows robots.txt guidelines
- Respects rate limits with built-in delays

Use responsibly and in compliance with platform terms of service.

## Performance

- **Speed**: ~15-30 seconds per search (3 platforms in parallel)
- **Accuracy**: Depends on site structure consistency
- **Reliability**: May need selector updates if sites change

## Future Improvements

- Cache results to reduce scraping frequency
- Add retry logic for failed requests
- Implement proxy rotation (if needed)
- Add more intelligent product matching
- Support for pagination if sites have it

Happy scraping! 🔥🚗

