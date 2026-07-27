import { searchBlinkit } from './blinkit.js';
import { searchZepto } from './zepto.js';

/**
 * Search all platforms in parallel.
 * Each platform scraper resolves to an array of product objects.
 */
export async function searchProducts(query, location = '') {
  const [blinkit, zepto] = await Promise.all([
    searchBlinkit(query, location).catch(err => {
      console.error('[blinkit]', err.message);
      return [];
    }),
    searchZepto(query, location).catch(err => {
      console.error('[zepto]', err.message);
      return [];
    }),
  ]);

  return {
    blinkit,
    zepto,
    total: blinkit.length + zepto.length,
    timestamp: new Date().toISOString(),
  };
}
