// Helper functions for API requests
const axios = require('axios');

/**
 * Make a generic API request with proper headers
 */
async function makeAPIRequest(url, params = {}, headers = {}) {
  try {
    const defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Referer': 'https://www.blinkit.com/',
      ...headers
    };

    const response = await axios.get(url, {
      params,
      headers: defaultHeaders,
      timeout: 10000 // 10 second timeout
    });

    return response.data;
  } catch (error) {
    console.error(`API request error for ${url}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Extract location code from location name
 * This is a placeholder - you'll need to map actual location codes
 */
function getLocationCode(locationName) {
  // This is a simplified mapping - you'll need actual location codes
  const locationMap = {
    'Mumbai': 'mumbai',
    'Delhi': 'delhi',
    'Bangalore': 'bangalore',
    'Hyderabad': 'hyderabad',
    'Chennai': 'chennai',
    'Pune': 'pune',
    'Kolkata': 'kolkata',
    'Ahmedabad': 'ahmedabad'
  };

  return locationMap[locationName] || locationName.toLowerCase();
}

/**
 * Normalize product data from different platforms
 */
function normalizeProduct(product, platform) {
  return {
    id: product.id || product.product_id || product.sku_id || `hw-${Math.random().toString(36).substr(2, 9)}`,
    name: product.name || product.title || product.product_name || 'Unknown Product',
    price: product.price || product.selling_price || product.final_price || product.mrp || 0,
    originalPrice: product.original_price || product.mrp || null,
    image: product.image || product.image_url || product.images?.[0] || product.thumbnail,
    platform: platform,
    available: product.available !== false && product.in_stock !== false && (product.stock || 0) > 0,
    url: product.url || product.product_url || product.deep_link,
    location: product.location,
    discount: product.discount || (product.original_price && product.price ? 
      Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0),
    rating: product.rating || product.avg_rating || null
  };
}

module.exports = {
  makeAPIRequest,
  getLocationCode,
  normalizeProduct
};

