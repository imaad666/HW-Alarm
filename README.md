# 🚗 Hot Wheels Tracker v2

Monitor availability of Hot Wheels products across **Blinkit, Zepto, Swiggy Instamart, and BigBasket**.
Get notified instantly on **Telegram** the moment a product comes back in stock.

## How it works

1. Paste any product URL from Blinkit / Zepto / Swiggy / BigBasket into the UI
2. The backend checks if the product is available at your location
3. Checks run automatically on a schedule (every N minutes + more frequently during restock windows)
4. When a product flips from out-of-stock → in-stock, you get a Telegram message immediately

---

## Quick Start

### 1. Configure

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
TELEGRAM_BOT_TOKEN=your_token    # from @BotFather
TELEGRAM_CHAT_ID=your_chat_id    # your personal chat ID
LOCATION_LAT=28.6139             # your latitude
LOCATION_LNG=77.2090             # your longitude
LOCATION_LABEL=New Delhi         # human-readable label
POLL_INTERVAL_MINUTES=15         # normal polling interval
```

### 2. Run backend

```bash
cd backend
npm install
npm run dev     # → http://localhost:3000
```

### 3. Run frontend

```bash
cd frontend
npm install
npm run dev     # → http://localhost:5173
```

---

## Telegram Setup

1. Open Telegram → search **@BotFather** → `/newbot`
2. Copy the bot token into `TELEGRAM_BOT_TOKEN`
3. Send any message to your new bot
4. Visit `https://api.telegram.org/bot<TOKEN>/getUpdates`
5. Copy the `id` inside `"chat"` → paste into `TELEGRAM_CHAT_ID`
6. Restart the backend

---

## Restock Windows

Blinkit and Zepto typically restock at specific times. During those windows the backend switches to **every-minute** polling. Edit `RESTOCK_WINDOWS` in `.env`:

```
RESTOCK_WINDOWS=06:00-06:30,10:00-10:30,14:00-14:30,18:00-18:30
```

---

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/products` | All monitored products + latest status |
| `POST` | `/api/products` | Add a product. Body: `{ url, label? }` |
| `DELETE` | `/api/products/:id` | Remove a product |
| `PATCH` | `/api/products/:id` | Update label or toggle enabled |
| `POST` | `/api/products/:id/check` | Manual check (single product) |
| `POST` | `/api/products/check-all` | Check all + send Telegram summary |
| `GET` | `/api/products/:id/history` | Check history |

---

## Project Structure

```
backend/
├── checkers/
│   ├── index.js        — routes URL to correct checker
│   ├── blinkit.js      — Blinkit availability checker
│   ├── zepto.js        — Zepto availability checker
│   ├── swiggy.js       — Swiggy availability checker
│   ├── bigbasket.js    — BigBasket availability checker
│   └── utils.js        — detectPlatform, makeResult
├── config/config.js    — reads .env, exposes config object
├── database/db.js      — SQLite (products + check_log tables)
├── notifier/telegram.js — Telegram bot notifications
├── routes/products.js  — Express API routes
├── scheduler/index.js  — cron polling + restock window logic
└── server.js

frontend/src/
├── App.tsx                      — root, stats bar, product list
├── components/
│   ├── AddProductForm.tsx        — paste URL input
│   ├── ProductRow.tsx            — per-product status card
│   └── PlatformBadge.tsx        — coloured platform pill
└── utils/
    ├── api.ts                   — typed fetch helpers
    └── platform.ts              — client-side platform detection
```
