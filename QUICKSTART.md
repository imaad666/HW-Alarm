# Quick Start Guide

Get your Hot Wheels alert system up and running in minutes!

## Prerequisites

- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)

## Installation & Setup

### 1. Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install-all
```

This will install:
- Backend dependencies (Express, Axios, etc.)
- Frontend dependencies (React, etc.)

### 2. Configure API Endpoints (Required!)

⚠️ **This step is essential** - The API endpoints are placeholders and won't work until you configure them.

**Option A: Quick Test (without real APIs)**
- The app will run but won't find real products
- Good for testing the UI and structure

**Option B: Full Setup (with real APIs)**
1. Open `CONFIGURATION.md` for detailed instructions
2. Capture API requests from Blinkit, Zepto, and Swiggy using browser DevTools
3. Update `backend/server.js` with actual endpoints and headers

### 3. Start the Application

**Option A: Run both together (Recommended)**
```bash
npm run dev
```

**Option B: Run separately**

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run client
```

### 4. Access the Application

- **Frontend**: Open http://localhost:3000 in your browser
- **Backend API**: Running on http://localhost:5000

## First Steps

1. **Enter your location** (e.g., "Mumbai", "Delhi", "Bangalore")
2. **Click "Search Hot Wheels"** to check availability
3. **Subscribe for alerts** by entering your email (optional)
4. **Enable auto-refresh** to check every 5 minutes automatically

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

```bash
# For backend, set custom port:
PORT=5001 npm start

# For frontend, React will prompt to use another port automatically
```

### No Products Found

- ✅ Check that backend server is running
- ✅ Verify location is entered correctly
- ⚠️ API endpoints need to be configured with actual endpoints
- ⚠️ Products may genuinely be out of stock

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules frontend/node_modules
npm run install-all
```

## Next Steps

1. **Configure APIs**: See `CONFIGURATION.md` for detailed API setup
2. **Test notifications**: Enable browser notifications for alerts
3. **Customize**: Adjust polling intervals, add more locations, etc.

## Project Structure

```
alerts/
├── backend/
│   ├── server.js          # Main server file
│   └── utils/             # Helper functions
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   └── App.css        # Styles
│   └── public/
├── package.json           # Root package.json
├── README.md             # Full documentation
├── CONFIGURATION.md       # API setup guide
└── QUICKSTART.md          # This file
```

## Need Help?

- Check `README.md` for full documentation
- See `CONFIGURATION.md` for API setup details
- Review `backend/server.js` for API endpoint configuration

## Important Notes

⚠️ This is for **educational purposes only**
⚠️ Use responsibly and comply with platform Terms of Service
⚠️ Configure API endpoints before expecting real results

Happy hunting for Hot Wheels! 🔥🚗

