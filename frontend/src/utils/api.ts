// All API calls go through this file.
// Vite proxies /api → http://localhost:3000 so no absolute URL is needed.

export interface Product {
  id?: number;
  name: string;
  price: number;
  image?: string;
  weight?: string;
  platform: string;
  url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SearchResults {
  blinkit: Product[];
  zepto: Product[];
  total: number;
  timestamp: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export function searchProducts(query: string, location = '') {
  return request<SearchResults>('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, location }),
  });
}

export function trackProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  return request<Product>('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
}

export function getTrackedProducts() {
  return request<Product[]>('/api/track');
}

export function untrackProduct(id: number) {
  return request<{ ok: boolean }>(`/api/track/${id}`, { method: 'DELETE' });
}

export function setAlert(productId: number, target_price: number) {
  return request(`/api/track/${productId}/alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_price }),
  });
}
