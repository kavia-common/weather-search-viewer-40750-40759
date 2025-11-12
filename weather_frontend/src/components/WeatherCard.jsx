import React, { useMemo, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * WeatherCard displays current weather with unit toggle and responsive layout.
 */
function WeatherCard({ data }) {
  const [unit, setUnit] = useState('C'); // C | F

  const {
    locationName,
    lat,
    lon,
    temperatureC,
    apparentTemperatureC,
    humidity,
    windKph,
    conditionCode,
    conditionText,
    iconId
  } = data || {};

  const temperature = useMemo(() => {
    if (unit === 'C') return `${Math.round(temperatureC)}°C`;
    const f = temperatureC * 9/5 + 32;
    return `${Math.round(f)}°F`;
  }, [temperatureC, unit]);

  const apparent = useMemo(() => {
    if (unit === 'C') return `${Math.round(apparentTemperatureC)}°C`;
    const f = apparentTemperatureC * 9/5 + 32;
    return `${Math.round(f)}°F`;
  }, [apparentTemperatureC, unit]);

  const icon = iconId ?? '🌤️';

  return (
    <article className="weather-card" aria-label={`Weather for ${locationName}`}>
      <div className="weather-header">
        <div className="location">
          <span aria-hidden="true">📍</span>
          <div>
            <div className="name">{locationName}</div>
            <div className="coords">{lat?.toFixed(2)}, {lon?.toFixed(2)}</div>
          </div>
        </div>
        <button
          className="unit-toggle"
          onClick={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
          aria-label={`Switch temperature unit to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
        >
          {unit === 'C' ? 'Show °F' : 'Show °C'}
        </button>
      </div>

      <div className="weather-body">
        <div className="temp-row">
          <div className="temp-value" aria-label={`Temperature ${temperature}`}>
            {temperature}
          </div>
          <div className="condition">
            <span aria-hidden="true">{icon}</span>
            <span>{conditionText}</span>
          </div>
        </div>

        <div className="metrics" role="list">
          <div className="metric" role="listitem">
            <div className="label">Feels like</div>
            <div className="value">{apparent}</div>
          </div>
          <div className="metric" role="listitem">
            <div className="label">Humidity</div>
            <div className="value">{Math.round(humidity)}%</div>
          </div>
          <div className="metric" role="listitem">
            <div className="label">Wind</div>
            <div className="value">{Math.round(windKph)} kph</div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default WeatherCard;
