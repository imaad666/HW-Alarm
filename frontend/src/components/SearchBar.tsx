import { useState } from 'react';

interface Props {
  onSearch: (query: string, location: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: Props) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim(), location.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search Hot Wheels products…"
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
        />
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Location (optional)"
          disabled={isLoading}
          className="w-full sm:w-48 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-7 py-3 rounded-lg bg-yellow-400 font-bold text-gray-900 hover:bg-yellow-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Searching…' : 'Search'}
        </button>
      </div>
    </form>
  );
}
