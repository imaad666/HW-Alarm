/**
 * Detect which platform a URL belongs to.
 */
export function detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes('blinkit.com'))                          return 'blinkit';
  if (u.includes('zeptonow.com') || u.includes('zepto.com')) return 'zepto';
  if (u.includes('swiggy.com'))                           return 'swiggy';
  if (u.includes('bigbasket.com'))                        return 'bigbasket';
  return 'unknown';
}

/**
 * Result shape returned by every checker:
 * {
 *   available: boolean,
 *   statusText: string,   // e.g. "Add to cart", "Out of stock", "Sold out"
 *   productName: string,  // best-effort extracted name
 *   price: number|null,
 * }
 */
export function makeResult(available, statusText, productName = '', price = null) {
  return { available, statusText, productName, price };
}
