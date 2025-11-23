import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ProductGrid from './components/ProductGrid';

interface Product {
  name: string;
  price: number;
  image?: string;
  weight?: string;
  platform: string;
  url?: string;
}

interface SearchResults {
  blinkit: Product[];
  zepto: Product[];
  timestamp: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string, location: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
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

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async (product: Product) => {
    try {
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

      alert('Product added to tracking!');
    } catch (err) {
      alert('Failed to track product. Please try again.');
      console.error('Track error:', err);
    }
  };

  const allProducts = results
    ? [...results.blinkit, ...results.zepto].map((p, i) => ({ ...p, id: `${p.platform}-${i}` }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚗 Hot Wheels Tracker</h1>
          <p className="text-gray-600">Search and track Hot Wheels products across platforms</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Searching for products...</p>
          </div>
        )}

        {results && !isLoading && (
          <div className="space-y-8">
            {results.blinkit.length > 0 && (
              <ProductGrid
                products={results.blinkit}
                onTrack={handleTrack}
                platform="blinkit"
              />
            )}

            {results.zepto.length > 0 && (
              <ProductGrid
                products={results.zepto}
                onTrack={handleTrack}
                platform="zepto"
              />
            )}

            {allProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found. Try a different search query.</p>
              </div>
            )}
          </div>
        )}

        {!results && !isLoading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">Enter a search query to find Hot Wheels products</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

