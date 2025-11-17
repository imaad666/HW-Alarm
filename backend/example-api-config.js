/**
 * EXAMPLE API CONFIGURATION
 * 
 * This file shows examples of how to configure the API endpoints
 * Copy the patterns from this file to backend/server.js
 * 
 * WARNING: These are examples only - you need to capture actual API endpoints
 * from browser DevTools for your specific location and account
 */

// Example: Blinkit API Configuration
async function searchBlinkitExample(query, location) {
  try {
    // Replace with actual endpoint from DevTools
    const response = await axios.get('https://blinkit.com/api/v1/search', {
      params: {
        q: query,                    // Search query
        lat: 19.0760,                // Latitude (from your location)
        lng: 72.8777,                // Longitude (from your location)
        location_id: 'mumbai_001',   // Location ID (capture from DevTools)
        // Add other params you see in the actual request
      },
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',  // From DevTools
        'Cookie': 'session_id=xxx; user_id=yyy',    // From DevTools → Application → Cookies
        'User-Agent': 'Mozilla/5.0 ...',
        'Accept': 'application/json',
        // Add other headers you see in the actual request
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://blinkit.com/',
      }
    });

    // Adjust based on actual response structure
    // Common patterns:
    // - response.data.products
    // - response.data.data.products
    // - response.data.items
    return response.data?.data?.products || response.data?.products || [];
  } catch (error) {
    console.error('Blinkit API error:', error.message);
    return [];
  }
}

// Example: Zepto API Configuration
async function searchZeptoExample(query, location) {
  try {
    // Replace with actual endpoint
    const response = await axios.post('https://www.zepto.com/api/v2/search', {
      // POST request body
      query: query,
      location: {
        lat: 19.0760,
        lng: 72.8777,
        city: location
      },
      // Add other body params
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Cookie': 'session=xxx',
        'Content-Type': 'application/json',
        // Add other headers
      }
    });

    return response.data?.products || response.data?.items || [];
  } catch (error) {
    console.error('Zepto API error:', error.message);
    return [];
  }
}

// Example: Swiggy Instamart API Configuration
async function searchSwiggyExample(query, location) {
  try {
    // Replace with actual endpoint
    const response = await axios.get('https://www.swiggy.com/dapi/instamart/search', {
      params: {
        query: query,
        lat: 19.0760,
        lng: 72.8777,
        // Add other params
      },
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Cookie': 'session=xxx',
        'x-swiggy-device-id': 'xxx',  // Device ID (from DevTools)
        // Add other headers
      }
    });

    // Adjust based on actual response
    return response.data?.data?.catalog || response.data?.products || [];
  } catch (error) {
    console.error('Swiggy API error:', error.message);
    return [];
  }
}

/**
 * How to extract location coordinates:
 * 1. Open Google Maps
 * 2. Right-click on your location
 * 3. Copy coordinates (lat, lng)
 * 
 * Or use an API:
 * const response = await axios.get('https://nominatim.openstreetmap.org/search', {
 *   params: { q: 'Mumbai', format: 'json' }
 * });
 * const { lat, lon } = response.data[0];
 */

/**
 * How to get authentication tokens/cookies:
 * 1. Log in to the platform in your browser
 * 2. Open DevTools (F12)
 * 3. Go to Application tab → Cookies
 * 4. Copy relevant cookies
 * 
 * Or check Network tab:
 * 1. Filter by "Fetch/XHR"
 * 2. Find an API request
 * 3. Click on it
 * 4. Go to "Headers" tab
 * 5. Copy Authorization header or Cookie header
 */

/**
 * Common response structures to expect:
 * 
 * Pattern 1:
 * {
 *   "data": {
 *     "products": [...]
 *   }
 * }
 * 
 * Pattern 2:
 * {
 *   "products": [...]
 * }
 * 
 * Pattern 3:
 * {
 *   "items": [...]
 * }
 * 
 * Pattern 4:
 * {
 *   "catalog": {
 *     "products": [...]
 *   }
 * }
 * 
 * Adjust the response parsing in backend/server.js accordingly
 */

module.exports = {
  searchBlinkitExample,
  searchZeptoExample,
  searchSwiggyExample
};

