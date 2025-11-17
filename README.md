# 🔥 Hot Wheels Alerts

A real-time stock monitoring system that tracks Hot Wheels product availability across **Blinkit**, **Zepto**, and **Swiggy Instamart**. Get notified instantly when Hot Wheels products come in stock at your selected location!

## Features

- 🔍 **Real-time Search**: Search for Hot Wheels products across multiple platforms
- 🔔 **Stock Alerts**: Get notified when new Hot Wheels products are added
- 📍 **Location-based**: Select your city to check local availability
- 🔄 **Auto-refresh**: Automatically check for new products every 5 minutes
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies for both frontend and backend**:
   ```bash
   npm run install-all
   ```

   Or install separately:
   ```bash
   # Backend dependencies
   npm install

   # Frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

### Configuration

⚠️ **Important**: The API endpoints in `backend/server.js` are placeholders. You need to:

1. **Capture actual API requests** from Blinkit, Zepto, and Swiggy:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Visit each platform and search for "hot wheels"
   - Find the API calls and copy:
     - Endpoint URLs
     - Request headers
     - Request parameters

2. **Update the API functions** in `backend/server.js`:
   - `searchBlinkit()` - Update with actual Blinkit API endpoint
   - `searchZepto()` - Update with actual Zepto API endpoint  
   - `searchSwiggy()` - Update with actual Swiggy Instamart API endpoint

3. **Create `.env` file** (optional):
   ```env
   PORT=5000
   ENABLE_POLLING=true
   DEFAULT_LOCATION=Mumbai
   ```

### Running the Application

**Option 1: Run both frontend and backend together**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
npm run server
# or
npm start
```

Terminal 2 (Frontend):
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. **Enter your location** (e.g., Mumbai, Delhi, Bangalore)
2. **Click "Search Hot Wheels"** to check current availability
3. **Subscribe for alerts** by entering your email address
4. **Enable auto-refresh** to automatically check every 5 minutes

## Project Structure

```
alerts/
├── backend/
│   └── server.js          # Express server with API endpoints
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── package.json           # Root package.json
├── .gitignore
└── README.md
```

## API Endpoints

- `POST /api/search` - Search for Hot Wheels products
  - Body: `{ "location": "Mumbai" }`
  
- `GET /api/products` - Get cached products
  
- `POST /api/subscribe` - Subscribe for notifications
  - Body: `{ "email": "user@example.com", "location": "Mumbai" }`
  
- `DELETE /api/unsubscribe/:id` - Unsubscribe from alerts
  
- `GET /api/health` - Health check endpoint

## Important Notes

⚠️ **Legal & Ethical Considerations**:
- This project is for **educational purposes only**
- Make sure your usage complies with each platform's Terms of Service
- Unauthorized scraping may violate platform policies
- Use responsibly and at your own risk

## Troubleshooting

### Backend not connecting
- Make sure the backend server is running on port 5000
- Check if any other application is using port 5000
- Verify API endpoints are correctly configured

### No products found
- Verify the API endpoints are updated with actual URLs
- Check if the location is valid
- Ensure request headers match the captured API calls
- Products may genuinely be out of stock

### CORS errors
- The backend has CORS enabled, but ensure frontend is proxying to `http://localhost:5000`
- Check `frontend/package.json` has the proxy configuration

## Roadmap

- [ ] Add WebSocket/SSE for real-time notifications
- [ ] Implement price tracking and alerts
- [ ] Add product image caching
- [ ] Support for more platforms
- [ ] Email notification integration
- [ ] Product comparison features
- [ ] Chrome extension version

## License

MIT

## Disclaimer

This project is meant to be used **offline on your own local machine** to help you search for Hot Wheels products. It's not supposed to be deployed publicly or used to make revenue. Use it safely and responsibly. This project is for **"EDUCATIONAL"** purposes only.
