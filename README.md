# 🚗 Hot Wheels Tracker

Track Hot Wheels product prices across **Blinkit** and **Zepto**.

## Stack
| Side | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + Puppeteer + SQLite |

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev        # runs on http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:5173
```

Vite proxies `/api/*` → `localhost:3000`, so no CORS config needed in development.

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/search` | Scrape Blinkit + Zepto. Body: `{ query, location? }` |
| `GET` | `/api/track` | All tracked products |
| `POST` | `/api/track` | Add/update a tracked product |
| `DELETE` | `/api/track/:id` | Remove from tracking |
| `POST` | `/api/track/:id/alert` | Set price alert. Body: `{ target_price }` |
| `GET` | `/api/products/:id` | Product + price history |
| `GET` | `/api/products/:id/history` | Price history only |

## Project Structure
```
├── backend/
│   ├── database/db.js       — SQLite (shared connection, WAL mode)
│   ├── routes/
│   │   ├── track.js         — track/untrack/alerts
│   │   └── products.js      — product + history queries
│   ├── scrapers/
│   │   ├── index.js         — parallel orchestrator
│   │   ├── blinkit.js       — Blinkit Puppeteer scraper
│   │   └── zepto.js         — Zepto Puppeteer scraper
│   └── server.js
└── frontend/src/
    ├── App.tsx              — root, two-tab layout (Search / Tracked)
    ├── components/
    │   ├── SearchBar.tsx
    │   ├── ProductGrid.tsx
    │   ├── ProductCard.tsx
    │   └── TrackedList.tsx
    └── utils/api.ts         — typed fetch helpers
```
