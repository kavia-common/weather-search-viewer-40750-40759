import React from 'react';

/**
 * PUBLIC_INTERFACE
 * LoadingView shows a spinner/skeleton and announces updates politely.
 */
export function LoadingView() {
  return (
    <section className="state-card" aria-live="polite" aria-busy="true">
      <div className="spinner" aria-hidden="true" />
      <h2 className="state-title">Loading weather...</h2>
      <p className="state-desc">Fetching the latest conditions.</p>
    </section>
  );
}

/**
 * PUBLIC_INTERFACE
 * ErrorView shows an error message with a retry action.
 */
export function ErrorView({ message, onRetry, errorRef }) {
  return (
    <section
      className="state-card"
      role="alert"
      aria-live="assertive"
    >
      <h2
        ref={errorRef}
        tabIndex={-1}
        className="state-title error-text"
      >
        Something went wrong
      </h2>
      <p className="state-desc">{message || 'Unexpected error occurred.'}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry} aria-label="Retry loading">
          Retry
        </button>
      )}
    </section>
  );
}

/**
 * PUBLIC_INTERFACE
 * EmptyState prompts the user to search.
 */
export function EmptyState() {
  return (
    <section className="state-card" aria-live="polite">
      <h2 className="state-title">Search for current weather</h2>
      <p className="state-desc">
        Enter a city name in the search bar above to see the current conditions.
      </p>
    </section>
  );
}
