import React, { useCallback } from 'react';

/**
 * PUBLIC_INTERFACE
 * SearchBar allows searching by city name with Enter key and button click.
 */
function SearchBar({ value, onChange, onSearch, disabled }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch?.();
      }
    },
    [onSearch]
  );

  return (
    <form
      className="searchbar"
      role="search"
      aria-label="Weather search"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch?.();
      }}
    >
      <label htmlFor="city-search" className="sr-only">
        Search city
      </label>
      <input
        id="city-search"
        className="search-input"
        type="search"
        placeholder="Search city (e.g., London)"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-disabled={disabled ? 'true' : 'false'}
        disabled={disabled}
        aria-label="Search city"
      />
      <button
        type="submit"
        className="search-btn"
        onClick={(e) => {
          e.preventDefault();
          onSearch?.();
        }}
        disabled={disabled}
        aria-label="Search"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;
