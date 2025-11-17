# 🚀 Quick Setup Guide - Get Your APIs Working!

You're seeing "No Hot Wheels products found" because the API endpoints are placeholders. Here's how to fix it:

## 📋 Quick Steps

### 1. Open Browser DevTools
- Press `F12` or right-click → "Inspect"
- Go to **Network** tab
- Filter by **"Fetch/XHR"** (to see only API calls)

### 2. Capture API from Blinkit

1. Visit https://blinkit.com
2. Set your location (use your real location)
3. In the Network tab, search for "hot wheels"
4. Look for API calls - click on one that returns product data
5. Copy:
   - **URL** (from Headers → General → Request URL)
   - **Headers** (especially Authorization, Cookie, X-* headers)
   - **Params** (query parameters like q, lat, lng)

### 3. Update backend/server.js

Find this function and update it:

```javascript
async function searchBlinkit(query, location) {
  try {
    // Replace this URL with the one you copied:
    const response = await axios.get('YOUR_COPIED_URL_HERE', {
      params: {
        q: query,
        lat: YOUR_LATITUDE,   // Get from Google Maps
        lng: YOUR_LONGITUDE,  // Get from Google Maps
        // Add other params you saw
      },
      headers: {
        // Paste headers you copied:
        'Authorization': 'Bearer YOUR_TOKEN',
        'Cookie': 'YOUR_COOKIE_STRING',
        // ... other headers
      }
    });
    
    // Adjust based on actual response:
    return response.data?.data?.products || response.data?.products || [];
  } catch (error) {
    console.error('Blinkit API error:', error.message);
    return [];
  }
}
```

### 4. Repeat for Zepto and Swiggy

Do the same for `searchZepto()` and `searchSwiggy()` functions.

### 5. Test

1. Restart backend: Stop it (Ctrl+C) and run `npm start` again
2. Try searching from the frontend
3. Check backend console - you'll see helpful error messages!

## 🎯 Getting Your Location Coordinates

1. Go to https://www.google.com/maps
2. Right-click on your location
3. Click the coordinates (e.g., 19.0760, 72.8777)
4. Copy them

## 📚 Detailed Guide

See `CAPTURE_APIS.md` for a step-by-step walkthrough with screenshots tips.

## 🧪 Test Your APIs

Use the test script before updating the main server:

```bash
node backend/test-api.js
```

Update `backend/test-api.js` with your captured API details first!

## ❓ Common Issues

### "API endpoint not found"
→ The URL is wrong or doesn't exist. Double-check what you copied.

### "Authentication failed"
→ Missing or expired tokens/cookies. Log in again and recapture headers.

### "No products found" but API works
→ The response structure might be different. Check the Response tab in DevTools to see the actual structure.

## 💡 Pro Tips

- **Use incognito mode** to avoid cookie conflicts
- **Copy as cURL** from DevTools - easier to see all headers
- **Check the Response tab** in DevTools to see actual data structure
- **Start with one platform** (e.g., Blinkit) before doing all three

## ✅ When It Works

Once configured, you'll see:
- Products appearing in the UI
- Console logs showing product counts
- No more "No products found" message

Good luck! 🔥🚗

