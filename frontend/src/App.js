import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState({ blinkit: [], zepto: [], swiggy: [] });
  const [loading, setLoading] = useState(false);
  const [locationSet, setLocationSet] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Init session on load
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/init-session`);
        setSessionId(res.data.sessionId);
        console.log('Session initialized:', res.data.sessionId);
      } catch (err) {
        console.error('Failed to init session:', err);
      }
    };
    initSession();

    return () => {
      // Cleanup on unmount (optional, might want to keep session alive for refresh)
      // if (sessionId) axios.post(`${API_BASE_URL}/api/close-session`, { sessionId });
    };
  }, []);

  const handleSetLocation = async () => {
    if (!location || !sessionId) return;
    setLoading(true);
    setStatusMsg('Setting location on Blinkit, Zepto, and Swiggy... This may take up to 30s.');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/set-location`, {
        sessionId,
        location
      });

      if (res.data.success) {
        setLocationSet(true);
        setStatusMsg('Location set successfully! You can now search.');
      } else {
        setStatusMsg('Failed to set location on some platforms. Try again.');
      }
    } catch (err) {
      setStatusMsg('Error setting location.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || !sessionId) return;
    if (!locationSet) {
      alert('Please set your location first!');
      return;
    }

    setLoading(true);
    setStatusMsg(`Searching for "${searchQuery}"...`);
    setProducts({ blinkit: [], zepto: [], swiggy: [] }); // Clear previous

    try {
      const res = await axios.post(`${API_BASE_URL}/api/search`, {
        sessionId,
        query: searchQuery
      });

      setProducts(res.data);
      setStatusMsg(`Found ${res.data.blinkit.length + res.data.zepto.length + res.data.swiggy.length} products.`);
    } catch (err) {
      setStatusMsg('Search failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      setStatusMsg('Detecting location...');
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.suburb;
          const area = data.address.suburb || data.address.neighbourhood || '';
          setLocation(area ? `${area}, ${city}` : city);
          setStatusMsg('Location detected. Click "Set Location" to confirm.');
        } catch (error) {
          setStatusMsg('Could not detect location name.');
        }
      }, () => setStatusMsg('Location access denied.'));
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="logo">🔥 QuickCom Tracker</div>
        <div className="status-bar">{statusMsg}</div>
      </header>

      <main className="container">
        <div className="controls-section">
          <div className="control-group">
            <label>1. Set Location</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bandra West, Mumbai"
                disabled={loading || locationSet}
              />
              <button onClick={detectLocation} disabled={loading || locationSet} title="Detect">📍</button>
              <button
                className={`primary-btn ${locationSet ? 'success' : ''}`}
                onClick={handleSetLocation}
                disabled={loading || locationSet}
              >
                {locationSet ? '✓ Set' : 'Set Location'}
              </button>
            </div>
          </div>

          <div className="control-group">
            <label>2. Search Products</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Hot Wheels, Milk, Bread"
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                className="primary-btn"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? '...' : '🔍 Search'}
              </button>
            </div>
          </div>
        </div>

        <div className="results-grid">
          <PlatformColumn title="Blinkit" color="#f8cb46" products={products.blinkit} />
          <PlatformColumn title="Zepto" color="#5d30c1" products={products.zepto} />
          <PlatformColumn title="Swiggy Instamart" color="#fc8019" products={products.swiggy} />
        </div>
      </main>
    </div>
  );
}

function PlatformColumn({ title, color, products }) {
  return (
    <div className="platform-col">
      <h2 style={{ borderBottom: `4px solid ${color}` }}>{title} <span className="count">({products.length})</span></h2>
      <div className="products-list">
        {products.length === 0 ? (
          <div className="empty-state">No results</div>
        ) : (
          products.map((p, i) => (
            <div key={i} className={`product-card ${!p.available ? 'out-of-stock' : ''}`}>
              <div className="img-wrapper">
                <img src={p.image} alt={p.name} onError={(e) => e.target.style.display = 'none'} />
              </div>
              <div className="info">
                <div className="price">₹{p.price}</div>
                <div className="name" title={p.name}>{p.name}</div>
                {!p.available && <div className="tag">Out of Stock</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
