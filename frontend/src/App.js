import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function App() {
  const [location, setLocation] = useState('');
  const [products, setProducts] = useState({
    blinkit: [],
    zepto: [],
    swiggy: []
  });
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Common Indian locations for demo
  const commonLocations = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Pune',
    'Kolkata',
    'Ahmedabad'
  ];

  const searchProducts = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/search`, {
        location: location.trim()
      });

      setProducts(response.data);
      setDemoMode(response.data.demo === true);
      setLastChecked(new Date());
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for products. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const subscribeForAlerts = async () => {
    if (!email.trim() || !location.trim()) {
      setError('Please enter both email and location');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/subscribe`, {
        email: email.trim(),
        location: location.trim()
      });

      if (response.data.success) {
        setSubscribed(true);
        setError(null);
      }
    } catch (err) {
      console.error('Subscribe error:', err);
      setError('Failed to subscribe. Make sure the backend server is running.');
    }
  };

  useEffect(() => {
    // Auto-refresh every 5 minutes if enabled
    if (autoRefresh && location) {
      const interval = setInterval(() => {
        searchProducts();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh, location]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (product) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`New Hot Wheels in stock!`, {
        body: `${product.name} available on ${product.platform} for ₹${product.price}`,
        icon: product.image || '/favicon.ico'
      });
    }
  };

  const allProducts = [
    ...products.blinkit,
    ...products.zepto,
    ...products.swiggy
  ].filter(p => p && p.available);

  const groupedByPlatform = {
    'Blinkit': products.blinkit.filter(p => p && p.available),
    'Zepto': products.zepto.filter(p => p && p.available),
    'Swiggy Instamart': products.swiggy.filter(p => p && p.available)
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔥 Hot Wheels Alerts</h1>
        <p>Track Hot Wheels availability across Blinkit, Zepto & Swiggy</p>
        {demoMode && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 193, 7, 0.2)',
            border: '2px solid rgba(255, 193, 7, 0.5)',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '600'
          }}>
            🎭 DEMO MODE: Showing sample data. Configure real APIs to see actual products.
          </div>
        )}
      </header>

      <main className="main-container">
        <div className="search-section">
          <div className="input-group">
            <label htmlFor="location">Location:</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your city"
              list="locations"
              className="location-input"
            />
            <datalist id="locations">
              {commonLocations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          <button 
            onClick={searchProducts} 
            disabled={loading}
            className="search-button"
          >
            {loading ? 'Searching...' : '🔍 Search Hot Wheels'}
          </button>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh every 5 minutes
          </label>

          {lastChecked && (
            <p className="last-checked">
              Last checked: {new Date(lastChecked).toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="subscribe-section">
          <h3>🔔 Get Notified</h3>
          <div className="subscribe-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="email-input"
            />
            <button 
              onClick={subscribeForAlerts} 
              disabled={subscribed}
              className="subscribe-button"
            >
              {subscribed ? '✓ Subscribed' : 'Subscribe for Alerts'}
            </button>
          </div>
          {subscribed && (
            <p className="success-message">
              You'll be notified when new Hot Wheels are added!
            </p>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="products-section">
          {allProducts.length > 0 ? (
            <>
              <h2 className="section-title">
                Available Hot Wheels ({allProducts.length} products)
              </h2>
              
              {Object.entries(groupedByPlatform).map(([platform, platformProducts]) => {
                if (platformProducts.length === 0) return null;
                
                return (
                  <div key={platform} className="platform-section">
                    <h3 className="platform-title">{platform}</h3>
                    <div className="products-grid">
                      {platformProducts.map((product) => (
                        <div key={product.id} className="product-card">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="product-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="product-info">
                            <h4 className="product-name">{product.name}</h4>
                            <p className="product-price">₹{product.price}</p>
                            {product.url && (
                              <a 
                                href={product.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="product-link"
                              >
                                View on {platform} →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            !loading && (
              <div className="no-products">
                <p>No Hot Wheels products found. Try searching or check back later!</p>
                <p className="hint">💡 Make sure you've entered a valid location and the APIs are properly configured.</p>
              </div>
            )
          )}
        </div>
      </main>

      <footer className="App-footer">
        <p>⚠️ Educational purposes only. Use responsibly and in compliance with platform terms of service.</p>
        <p>You need to configure the actual API endpoints by capturing requests from browser DevTools.</p>
      </footer>
    </div>
  );
}

export default App;

