# Configuration Guide

## How to Capture API Endpoints

To make this Hot Wheels alert system work, you need to capture the actual API endpoints used by Blinkit, Zepto, and Swiggy Instamart.

### Step 1: Open Browser DevTools

1. Open your browser (Chrome, Firefox, or Edge)
2. Press `F12` or right-click and select "Inspect"
3. Go to the **Network** tab

### Step 2: Capture Blinkit API Calls

1. Visit [Blinkit.com](https://blinkit.com)
2. Set your location (important!)
3. Search for "hot wheels" or "hotwheels"
4. In the Network tab, filter by "Fetch/XHR" or "WS"
5. Look for API calls that return product data
6. Right-click on the request → Copy → Copy as cURL
7. Note down:
   - **URL**: The endpoint (e.g., `https://blinkit.com/api/v1/search`)
   - **Headers**: Especially `Authorization`, `Cookie`, `X-*` headers
   - **Query Parameters**: `q`, `lat`, `lng`, `location`, etc.
   - **Request Method**: Usually GET or POST

### Step 3: Capture Zepto API Calls

1. Visit [Zepto.com](https://www.zepto.com)
2. Set your location
3. Search for "hot wheels"
4. Capture the API request similar to Blinkit
5. Note the structure of the response

### Step 4: Capture Swiggy Instamart API Calls

1. Visit [Swiggy Instamart](https://www.swiggy.com/instamart)
2. Set your location
3. Search for "hot wheels"
4. Capture the API request

### Step 5: Update the Code

Update the following functions in `backend/server.js`:

#### For Blinkit:

```javascript
async function searchBlinkit(query, location) {
  try {
    const response = await axios.get('YOUR_ACTUAL_BLINKIT_ENDPOINT', {
      params: {
        // Add actual parameters you captured
        q: query,
        lat: YOUR_LAT,
        lng: YOUR_LNG,
        // ... other params
      },
      headers: {
        // Add actual headers you captured
        'Authorization': 'Bearer YOUR_TOKEN',
        'Cookie': 'YOUR_COOKIE',
        // ... other headers
      }
    });
    return response.data?.products || response.data?.data?.products || [];
  } catch (error) {
    console.error('Blinkit API error:', error.message);
    return [];
  }
}
```

#### For Zepto:

Similar structure - update `searchZepto()` function with actual endpoint and headers.

#### For Swiggy:

Similar structure - update `searchSwiggy()` function with actual endpoint and headers.

### Step 6: Update Response Parsing

Different platforms may have different response structures. Update the `filterHotWheels()` function to match:

- Blinkit: `response.data.products` or `response.data.data.products`
- Zepto: `response.data.products` or `response.data.items`
- Swiggy: `response.data.catalog` or `response.data.items`

### Example Response Structure

You might see something like:

```json
{
  "data": {
    "products": [
      {
        "id": "12345",
        "name": "Hot Wheels Car",
        "price": 299,
        "image": "https://...",
        "available": true,
        "in_stock": true
      }
    ]
  }
}
```

Or:

```json
{
  "products": [
    {
      "product_id": "12345",
      "title": "Hot Wheels Car",
      "selling_price": 299,
      "image_url": "https://...",
      "stock": 10
    }
  ]
}
```

Adjust the parsing logic accordingly.

## Location Codes

Different platforms may use different location formats:
- Coordinates: `lat`, `lng`
- Location IDs: `location_id`, `city_id`
- Area codes: `pincode`, `area`
- String names: `city`, `location`

You may need to maintain a mapping:

```javascript
const locationMap = {
  'Mumbai': { lat: 19.0760, lng: 72.8777, location_id: 'xxx' },
  // ... other locations
};
```

## Authentication

Some platforms may require:
- **Tokens**: Bearer tokens in Authorization header
- **Cookies**: Session cookies for authentication
- **API Keys**: Public API keys (less likely)

### Getting Tokens/Cookies

1. Log in to the platform in your browser
2. In DevTools → Application → Cookies, copy relevant cookies
3. Or in Network tab, find auth requests and copy tokens
4. Note: Tokens may expire, so you might need to refresh them periodically

## Rate Limiting

Be mindful of rate limiting:
- Don't make requests too frequently (5-10 minute intervals are reasonable)
- The auto-refresh is set to 5 minutes by default
- Consider implementing request queuing if needed

## Testing

1. Test each API function individually:
   ```javascript
   // In backend/server.js, temporarily add:
   searchBlinkit('hot wheels', 'Mumbai').then(products => {
     console.log('Blinkit products:', products);
   });
   ```

2. Use Postman or curl to test API endpoints first
3. Verify the response structure matches what the code expects

## Troubleshooting

### CORS Errors
- The backend acts as a proxy to bypass CORS
- Make sure backend is running before frontend

### 401/403 Errors
- Check if authentication headers are correct
- Tokens may have expired - refresh them
- Cookies may need to be updated

### Empty Results
- Verify location is set correctly
- Check if products actually exist on the platform
- Verify query parameter name (might be `query`, `q`, `search`, etc.)

### Rate Limiting Errors (429)
- Reduce polling frequency
- Implement exponential backoff
- Use multiple accounts/IPs if needed (be careful with ToS)

## Important Reminders

⚠️ **Always respect the platform's Terms of Service**
⚠️ **Don't share your tokens/credentials publicly**
⚠️ **Use responsibly and for personal use only**

