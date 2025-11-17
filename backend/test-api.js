/**
 * Test API Configuration Script
 * 
 * Use this script to test your API configurations before updating the main server
 * 
 * Usage:
 * 1. Update the testConfig object below with your captured API details
 * 2. Run: node backend/test-api.js
 */

const axios = require('axios');

// TEST CONFIGURATION - Update these with your captured API details
const testConfig = {
  blinkit: {
    url: 'https://blinkit.com/api/v1/search', // Replace with actual URL
    params: {
      q: 'hot wheels',
      lat: 19.0760,  // Replace with your latitude
      lng: 72.8777,  // Replace with your longitude
      // Add other params you captured
    },
    headers: {
      // Paste your captured headers here
      // 'Authorization': 'Bearer YOUR_TOKEN',
      // 'Cookie': 'YOUR_COOKIE_STRING',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'application/json',
      // Add other headers
    }
  },
  zepto: {
    url: 'https://www.zepto.com/api/search', // Replace with actual URL
    params: {
      q: 'hot wheels',
      // Add other params
    },
    headers: {
      // Paste your captured headers here
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'application/json',
    }
  },
  swiggy: {
    url: 'https://www.swiggy.com/api/instamart/search', // Replace with actual URL
    params: {
      q: 'hot wheels',
      // Add other params
    },
    headers: {
      // Paste your captured headers here
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'application/json',
    }
  }
};

// Test function
async function testAPI(platform, config) {
  console.log(`\n🧪 Testing ${platform.toUpperCase()} API...`);
  console.log('URL:', config.url);
  console.log('Params:', JSON.stringify(config.params, null, 2));
  
  try {
    const response = await axios.get(config.url, {
      params: config.params,
      headers: config.headers,
      timeout: 10000
    });

    console.log(`✅ Success! Status: ${response.status}`);
    console.log('\n📦 Response Structure:');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 1000) + '...');
    
    // Try to find products
    const products = response.data?.data?.products || 
                     response.data?.products || 
                     response.data?.items ||
                     response.data?.data?.catalog?.products ||
                     [];
    
    console.log(`\n🔍 Found ${products.length} products`);
    
    if (products.length > 0) {
      console.log('\n📋 First product sample:');
      console.log(JSON.stringify(products[0], null, 2));
      
      // Filter for Hot Wheels
      const hotWheels = products.filter(p => {
        const name = (p.name || p.title || '').toLowerCase();
        return name.includes('hotwheels') || name.includes('hot wheels');
      });
      
      console.log(`\n🔥 Found ${hotWheels.length} Hot Wheels products`);
    }
    
    return { success: true, response: response.data };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Response:`, JSON.stringify(error.response.data, null, 2).substring(0, 500));
    }
    return { success: false, error: error.message };
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('⚠️  Make sure you have updated testConfig with your captured API details!\n');
  
  const results = {};
  
  // Test Blinkit
  if (testConfig.blinkit.url && !testConfig.blinkit.url.includes('blinkit.com/api/')) {
    results.blinkit = await testAPI('Blinkit', testConfig.blinkit);
  } else {
    console.log('⏭️  Skipping Blinkit - Please update testConfig with actual API URL');
  }
  
  // Test Zepto
  if (testConfig.zepto.url && !testConfig.zepto.url.includes('zepto.com/api/')) {
    results.zepto = await testAPI('Zepto', testConfig.zepto);
  } else {
    console.log('⏭️  Skipping Zepto - Please update testConfig with actual API URL');
  }
  
  // Test Swiggy
  if (testConfig.swiggy.url && !testConfig.swiggy.url.includes('swiggy.com/api/')) {
    results.swiggy = await testAPI('Swiggy', testConfig.swiggy);
  } else {
    console.log('⏭️  Skipping Swiggy - Please update testConfig with actual API URL');
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  Object.entries(results).forEach(([platform, result]) => {
    console.log(`${platform}: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
  });
}

// Run if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPI, testConfig };

