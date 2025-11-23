import { searchBlinkit } from './blinkit.js';
import { searchZepto } from './zepto.js';
// import { searchSwiggy } from './swiggy.js';

/**
 * Search for products across all platforms
 * @param {string} query - Product search query
 * @param {string} location - Location for delivery
 * @returns {Promise<Object>} Results from all platforms
 */
export async function searchProducts(query, location = '') {
  const results = {
    blinkit: [],
    zepto: [],
    // swiggy: [],
    timestamp: new Date().toISOString()
  };

  // Search all platforms in parallel
  const promises = [
    searchBlinkit(query, location).catch(err => {
      console.error('Blinkit search error:', err);
      return [];
    }),
    searchZepto(query, location).catch(err => {
      console.error('Zepto search error:', err);
      return [];
    }),
    // searchSwiggy(query, location).catch(err => {
    //   console.error('Swiggy search error:', err);
    //   return [];
    // })
  ];

  const [blinkitResults, zeptoResults] = await Promise.all(promises);
  
  results.blinkit = blinkitResults;
  results.zepto = zeptoResults;
  // results.swiggy = swiggyResults;

  return results;
}

