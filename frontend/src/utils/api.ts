const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Product {
  name: string;
  price: number;
  image?: string;
  weight?: string;
  platform: string;
  url?: string;
}

export interface SearchResults {
  blinkit: Product[];
  zepto: Product[];
  timestamp: string;
}

export async function searchProducts(query: string, location: string = ''): Promise<SearchResults> {
  const response = await fetch(`${API_URL}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, location }),
  });

  if (!response.ok) {
    throw new Error('Failed to search products');
  }

  return response.json();
}

export async function trackProduct(product: Product): Promise<Product> {
  const response = await fetch(`${API_URL}/api/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error('Failed to track product');
  }

  return response.json();
}

export async function getTrackedProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/api/track`);

  if (!response.ok) {
    throw new Error('Failed to fetch tracked products');
  }

  return response.json();
}

