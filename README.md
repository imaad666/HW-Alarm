# Hot Wheels Tracker

A product tracking application that searches for Hot Wheels products across multiple platforms (Blinkit, Zepto) and allows you to track prices over time.

## Features

- 🔍 Search for Hot Wheels products across multiple platforms
- 📊 Track product prices over time
- 🔔 Set price alerts
- 📈 View price history
- 🎯 Compare prices across platforms

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS

**Backend:**
- Node.js + Express
- Puppeteer (web scraping)
- SQLite (database)

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
```

The backend API will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

- `POST /api/search` - Search for products
  - Body: `{ query: string, location?: string }`
  
- `GET /api/products` - Get all tracked products
- `GET /api/products/:id` - Get product details with price history
- `GET /api/products/:id/history` - Get price history for a product

- `POST /api/track` - Add product to tracking
  - Body: `{ name, platform, price, image?, url?, weight? }`
- `GET /api/track` - Get all tracked products
- `DELETE /api/track/:id` - Remove product from tracking
- `POST /api/track/:id/alert` - Create price alert
  - Body: `{ target_price: number }`

## Usage

1. Start both backend and frontend servers
2. Open the frontend in your browser
3. Enter a search query (e.g., "Hot Wheels")
4. Optionally enter your location for better results
5. Click "Search" to find products across platforms
6. Click "Track" on any product to start tracking its price

## Project Structure

```
HW-Alarm/
├── backend/
│   ├── database/
│   │   └── db.js          # Database setup and queries
│   ├── routes/
│   │   ├── products.js    # Product routes
│   │   └── track.js       # Tracking routes
│   ├── scrapers/
│   │   ├── index.js       # Main scraper orchestrator
│   │   ├── blinkit.js     # Blinkit scraper
│   │   └── zepto.js       # Zepto scraper
│   ├── data/              # SQLite database storage
│   └── server.js          # Express server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProductGrid.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── ...
└── README.md
```

## Notes

- Web scraping may be rate-limited by the target platforms
- Location-based searches may require manual location selection on some platforms
- The database is automatically created on first run

