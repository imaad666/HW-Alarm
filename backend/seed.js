import { initDatabase, run, all } from './database/db.js';

await initDatabase();

// Check actual schema
const cols = await all('PRAGMA table_info(price_history)');
const colNames = cols.map(c => c.name);
console.log('price_history columns:', colNames);

const hasPlatform = colNames.includes('platform');

const products = [
  { name: 'Hot Wheels Batmobile Die Cast Car',           platform: 'blinkit', price: 179, weight: '1 unit' },
  { name: 'Hot Wheels 1:64 Scale Toy Car (Multicolour)', platform: 'blinkit', price: 705, weight: '5 pcs'  },
  { name: 'Hot Wheels 88 Mitsubishi Starion',            platform: 'blinkit', price: 179, weight: '1 pc'   },
  { name: 'Hot Wheels Classic TV Series Batmobile',      platform: 'blinkit', price: 167, weight: '1 pc'   },
  { name: 'Hot Wheels Monster Truck',                    platform: 'zepto',   price: 249, weight: '1 unit' },
  { name: 'Hot Wheels 5 Car Gift Pack',                  platform: 'zepto',   price: 599, weight: '5 pcs'  },
];

for (const p of products) {
  const { lastID } = await run(
    'INSERT OR IGNORE INTO tracked_products (name, platform, price, weight) VALUES (?,?,?,?)',
    [p.name, p.platform, p.price, p.weight]
  );
  if (lastID) {
    const histPrices = [p.price, p.price + 20, p.price - 10];
    for (const hp of histPrices) {
      if (hasPlatform) {
        await run('INSERT INTO price_history (product_id, price, platform) VALUES (?,?,?)', [lastID, hp, p.platform]);
      } else {
        await run('INSERT INTO price_history (product_id, price) VALUES (?,?)', [lastID, hp]);
      }
    }
  }
}

console.log('Seeded', products.length, 'products');
process.exit(0);
