// Central config — reads from .env, falls back to .env.example defaults
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv dependency)
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

export const config = {
  telegram: {
    token:  process.env.TELEGRAM_BOT_TOKEN  ?? '',
    chatId: process.env.TELEGRAM_CHAT_ID    ?? '',
  },
  location: {
    lat:   parseFloat(process.env.LOCATION_LAT   ?? '28.6139'),
    lng:   parseFloat(process.env.LOCATION_LNG   ?? '77.2090'),
    label: process.env.LOCATION_LABEL ?? 'New Delhi',
  },
  poll: {
    intervalMinutes: parseInt(process.env.POLL_INTERVAL_MINUTES ?? '15', 10),
    // Parse "06:00-06:30,10:00-10:30" into [{start:'06:00', end:'06:30'}, ...]
    restockWindows: (process.env.RESTOCK_WINDOWS ?? '06:00-06:30,10:00-10:30,14:00-14:30,18:00-18:30')
      .split(',')
      .map(w => {
        const [start, end] = w.trim().split('-');
        return { start, end };
      }),
  },
};
