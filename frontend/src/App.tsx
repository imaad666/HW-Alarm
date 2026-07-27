import { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import ProductGrid from './components/ProductGrid';
import TrackedList from './components/TrackedList';
import {
  type Product,
  type SearchResults,
  searchProducts,
  trackProduct,
  getTrackedProducts,
  untrackProduct,
} from './utils/api';

type Tab = 'search' | 'tracked';

export default function App() {
  const [tab, setTab] = useState<Tab>('search');

  // Search state
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Tracked state
  const [tracked, setTracked] = useState<Product[]>([]);
  const [trackedLoading, setTrackedLoading] = useState(false);

  const loadTracked = useCallback(async () => {
    setTrackedLoading(true);
    try {
      const data = await getTrackedProducts();
      setTracked(data);
    } catch {
      // Non-critical — silently fail
    } finally {
      setTrackedLoading(false);
    }
  }, []);

  // Load tracked products on mount and when switching to that tab
  useEffect(() => {
    loadTracked();
  }, [loadTracked]);

  const handleSearch = async (query: string, location: string) => {
    setSearching(true);
    setSearchError(null);
    setResults(null);
    try {
      const data = await searchProducts(query, location);
      setResults(data);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleTrack = async (product: Product) => {
    try {
      await trackProduct(product);
      await loadTracked();
      // Brief visual confirmation
      const el = document.createElement('div');
      el.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50';
      el.textContent = `✓ "${product.name}" added to tracking`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to track product');
    }
  };

  const handleUntrack = async (id: number) => {
    await untrackProduct(id);
    setTracked(prev => prev.filter(p => p.id !== id));
  };

  const totalResults = results ? results.blinkit.length + results.zepto.length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              🚗 Hot Wheels Tracker
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Track prices across Blinkit &amp; Zepto
            </p>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
            {(['search', 'tracked'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); if (t === 'tracked') loadTracked(); }}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  tab === t
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
                {t === 'tracked' && tracked.length > 0 && (
                  <span className="ml-1.5 bg-yellow-400 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {tracked.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* ── SEARCH TAB ── */}
        {tab === 'search' && (
          <div className="space-y-8">
            <SearchBar onSearch={handleSearch} isLoading={searching} />

            {searchError && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {searchError}
              </div>
            )}

            {searching && (
              <div className="text-center py-20">
                <div className="inline-block w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-gray-500 text-sm">Scraping Blinkit &amp; Zepto…</p>
              </div>
            )}

            {results && !searching && (
              <>
                <p className="text-sm text-gray-500">
                  Found <strong>{totalResults}</strong> product{totalResults !== 1 ? 's' : ''} —&nbsp;
                  <span className="text-gray-400">{new Date(results.timestamp).toLocaleTimeString()}</span>
                </p>

                <div className="space-y-10">
                  {results.blinkit.length > 0 && (
                    <ProductGrid
                      title="Blinkit"
                      products={results.blinkit}
                      onTrack={handleTrack}
                    />
                  )}
                  {results.zepto.length > 0 && (
                    <ProductGrid
                      title="Zepto"
                      products={results.zepto}
                      onTrack={handleTrack}
                    />
                  )}
                  {totalResults === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <p className="text-4xl mb-3">🔍</p>
                      <p className="text-sm">No products found. Try a different search query.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {!results && !searching && !searchError && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">🚗</p>
                <p className="text-sm">Enter a search query above to find products</p>
              </div>
            )}
          </div>
        )}

        {/* ── TRACKED TAB ── */}
        {tab === 'tracked' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Tracked Products
              </h2>
              <button
                onClick={loadTracked}
                disabled={trackedLoading}
                className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-40 transition-opacity"
              >
                {trackedLoading ? 'Refreshing…' : '↻ Refresh'}
              </button>
            </div>
            <TrackedList products={tracked} onUntrack={handleUntrack} />
          </div>
        )}
      </main>
    </div>
  );
}
