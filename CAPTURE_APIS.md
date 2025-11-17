# Step-by-Step Guide: Capturing API Endpoints

This guide will walk you through capturing the actual API endpoints from Blinkit, Zepto, and Swiggy.

## Prerequisites

- Google Chrome or Firefox browser
- Basic knowledge of browser DevTools

## Step 1: Open Browser DevTools

1. Open Chrome or Firefox
2. Press `F12` or right-click → "Inspect"
3. Go to the **Network** tab
4. Make sure **"Fetch/XHR"** filter is selected (to see only API calls)

## Step 2: Capture Blinkit API

### 2.1 Navigate to Blinkit

1. Visit [https://blinkit.com](https://blinkit.com)
2. **Set your location** (important - use your actual location)
3. Click on the search box

### 2.2 Search for Hot Wheels

1. Type "hot wheels" in the search box
2. **Before pressing Enter**, make sure DevTools Network tab is open
3. Press Enter to search
4. You'll see multiple API calls appear in the Network tab

### 2.3 Find the Search API Call

1. Look for API calls that might be named:
   - `search`
   - `products`
   - `catalog`
   - Something with your search query "hot wheels"
2. Click on one of these API calls
3. Check the **Response** tab to see if it contains product data

### 2.4 Copy the Request Details

Once you find the correct API call:

**A. Copy the URL:**
- Look at the **Headers** tab → **General** section
- Copy the **Request URL** (something like `https://blinkit.com/api/v1/search`)

**B. Copy the Headers:**
- Go to **Headers** tab → **Request Headers** section
- Copy these important headers:
  - `authorization` or `Authorization`
  - `cookie` or `Cookie`
  - `x-*` headers (like `x-location-id`, `x-device-id`, etc.)
  - `user-agent` (optional - we have a default one)

**C. Copy the Query Parameters:**
- In the **Headers** tab, look at the **Query String Parameters** section
- Or check the **Payload** tab if it's a POST request
- Note down parameters like:
  - `q` or `query` (the search term)
  - `lat` and `lng` (coordinates)
  - `location_id` or `city_id`
  - `pincode`

**D. Copy the Response Structure:**
- Go to **Response** tab or **Preview** tab
- Note the structure (e.g., `data.products` or `products` array)

### 2.5 Save the Information

Save this information - you'll need it to update the code!

## Step 3: Capture Zepto API

Repeat the same process for Zepto:

1. Visit [https://www.zepto.com](https://www.zepto.com)
2. Set your location
3. Search for "hot wheels"
4. Capture the API call details (URL, headers, params)
5. Note the response structure

## Step 4: Capture Swiggy Instamart API

1. Visit [https://www.swiggy.com/instamart](https://www.swiggy.com/instamart)
2. Set your location
3. Search for "hot wheels"
4. Capture the API call details
5. Note the response structure

## Step 5: Update backend/server.js

Now update the three functions in `backend/server.js`:

### For Blinkit:

```javascript
async function searchBlinkit(query, location) {
  try {
    const response = await axios.get('PASTE_YOUR_BLINKIT_URL_HERE', {
      params: {
        // Add the actual parameters you captured
        q: query,
        lat: YOUR_LATITUDE,  // From your location
        lng: YOUR_LONGITUDE, // From your location
        // ... other params
      },
      headers: {
        // Paste the actual headers you captured
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Cookie': 'YOUR_COOKIE_STRING_HERE',
        // ... other headers
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });
    
    // Adjust this based on actual response structure
    return response.data?.data?.products || response.data?.products || [];
  } catch (error) {
    console.error('Blinkit API error:', error.message);
    return [];
  }
}
```

### For Zepto and Swiggy:

Follow the same pattern with your captured URLs and headers.

## Step 6: Test Each API

1. Restart the backend server
2. Try searching from the frontend
3. Check backend console for errors
4. Adjust the code based on actual response structure

## Quick Tips

### Getting Location Coordinates:

1. Open Google Maps
2. Right-click on your location
3. Click on the coordinates (e.g., 19.0760, 72.8777)
4. Copy them

Or use this website: https://www.latlong.net/

### Finding Cookies:

1. In DevTools, go to **Application** tab (Chrome) or **Storage** tab (Firefox)
2. Click on **Cookies** → your domain (blinkit.com, etc.)
3. Copy the entire cookie string
4. Or copy specific cookies like `session_id`, `auth_token`, etc.

### Headers to Look For:

Important headers usually include:
- `Authorization` (Bearer token)
- `Cookie` (session cookies)
- `X-Location-Id` or similar
- `X-Device-Id`
- `Referer`
- `Origin`

### Response Structure Examples:

Different platforms use different structures:

**Blinkit might return:**
```json
{
  "data": {
    "products": [...]
  }
}
```

**Zepto might return:**
```json
{
  "products": [...]
}
```

**Swiggy might return:**
```json
{
  "data": {
    "catalog": {
      "products": [...]
    }
  }
}
```

Adjust the return statement in each function accordingly!

## Need Help?

If you're stuck:
1. Share a screenshot of the Network tab
2. Check the backend console for error messages
3. Make sure all headers are copied correctly
4. Verify the response structure matches what you're parsing

Good luck! 🔥🚗

