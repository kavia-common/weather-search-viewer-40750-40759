import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import './index.css';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import { EmptyState, ErrorView, LoadingView } from './components/StateViews';
import { fetchWeatherByQuery } from './services/weatherApi';
import { getFeatureFlag } from './utils/env';

// PUBLIC_INTERFACE
function App() {
  /** App theme handling and main search + view composition */
  const [theme, setTheme] = useState('light');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const errorRef = useRef(null);

  // Apply theme to document element for CSS var switching if needed
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const useMock = getFeatureFlag('USE_MOCK_WEATHER', false);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const canSearch = useMemo(() => query.trim().length > 0, [query]);

  const handleSearch = async () => {
    if (!canSearch || status === 'loading') return;
    setStatus('loading');
    setError('');
    setWeather(null);

    try {
      const data = await fetchWeatherByQuery(query, { useMock });
      setWeather(data);
      setStatus('success');
    } catch (err) {
      setError(err?.message || 'Failed to load weather. Please try again.');
      setStatus('error');
      // focus error for accessibility
      setTimeout(() => {
        errorRef.current?.focus();
      }, 0);
    }
  };

  const handleRetry = () => {
    handleSearch();
  };

  return (
    <div className="App ocean-theme">
      <header className="app-header">
        <div className="header-inner container">
          <div className="brand">
            <span className="brand-logo" aria-hidden="true">⛅</span>
            <h1 className="brand-title">Weather Now</h1>
          </div>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            disabled={status === 'loading'}
          />
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="app-main container">
        {status === 'idle' && <EmptyState />}
        {status === 'loading' && <LoadingView />}
        {status === 'error' && (
          <ErrorView
            message={error}
            onRetry={handleRetry}
            errorRef={errorRef}
          />
        )}
        {status === 'success' && weather && (
          <WeatherCard data={weather} />
        )}
      </main>

      <footer className="app-footer">
        <div className="container footer-inner">
          <span className="muted">Data from Open-Meteo</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
