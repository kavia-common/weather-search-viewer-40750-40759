import sample from '../__mocks__/weatherSample.json';
import { getEnv, getFeatureFlag } from '../utils/env';

/**
 * Map Open-Meteo weather codes to simple text and emoji icon.
 */
const WEATHER_CODE_MAP = {
  0: { text: 'Clear sky', iconId: '☀️' },
  1: { text: 'Mainly clear', iconId: '🌤️' },
  2: { text: 'Partly cloudy', iconId: '⛅' },
  3: { text: 'Overcast', iconId: '☁️' },
  45: { text: 'Fog', iconId: '🌫️' },
  48: { text: 'Depositing rime fog', iconId: '🌫️' },
  51: { text: 'Light drizzle', iconId: '🌦️' },
  53: { text: 'Drizzle', iconId: '🌦️' },
  55: { text: 'Dense drizzle', iconId: '🌧️' },
  61: { text: 'Slight rain', iconId: '🌦️' },
  63: { text: 'Rain', iconId: '🌧️' },
  65: { text: 'Heavy rain', iconId: '🌧️' },
  71: { text: 'Slight snow', iconId: '🌨️' },
  73: { text: 'Snow', iconId: '🌨️' },
  75: { text: 'Heavy snow', iconId: '❄️' },
  80: { text: 'Rain showers', iconId: '🌦️' },
  81: { text: 'Heavy showers', iconId: '🌧️' },
  82: { text: 'Violent showers', iconId: '⛈️' },
  95: { text: 'Thunderstorm', iconId: '⛈️' },
  96: { text: 'Thunderstorm w/ hail', iconId: '⛈️' },
  99: { text: 'Severe thunderstorm', iconId: '⛈️' },
};

function mapCode(code) {
  return WEATHER_CODE_MAP[code] || { text: 'Unknown', iconId: '❔' };
}

function toKph(ms) {
  // Convert m/s to kph
  return ms * 3.6;
}

function normalizeResult({ name, latitude, longitude, current }) {
  const { temperature_2m, relative_humidity_2m, apparent_temperature, weather_code, wind_speed_10m } = current || {};
  const { text, iconId } = mapCode(weather_code);
  return {
    locationName: name,
    lat: latitude,
    lon: longitude,
    temperatureC: temperature_2m,
    apparentTemperatureC: apparent_temperature,
    humidity: relative_humidity_2m,
    windKph: toKph(wind_speed_10m),
    conditionCode: weather_code,
    conditionText: text,
    iconId,
  };
}

/**
 * PUBLIC_INTERFACE
 * fetchWeatherByQuery fetches weather using an optional API base override or Open-Meteo.
 */
export async function fetchWeatherByQuery(query, { useMock } = {}) {
  const q = String(query || '').trim();
  if (!q) {
    const err = new Error('Please enter a city name to search.');
    err.code = 'VALIDATION';
    throw err;
  }

  const mockFlag = typeof useMock === 'boolean' ? useMock : getFeatureFlag('USE_MOCK_WEATHER', false);
  if (mockFlag) {
    await new Promise((res) => setTimeout(res, 400));
    return sample;
  }

  const API_BASE = getEnv('REACT_APP_API_BASE', null);

  if (API_BASE) {
    const url = `${API_BASE.replace(/\/+$/, '')}/weather?query=${encodeURIComponent(q)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err = new Error(`Backend error (${res.status}): ${text || res.statusText}`);
      err.code = 'HTTP';
      throw err;
    }
    const payload = await res.json();
    // Expect normalized result already
    if (!payload || !payload.locationName) {
      const err = new Error('Received invalid data from backend.');
      err.code = 'INVALID_DATA';
      throw err;
    }
    return payload;
  }

  // Open-Meteo flow
  // 1. Geocode
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) {
    const err = new Error(`Geocoding failed (${geoRes.status}).`);
    err.code = 'HTTP';
    throw err;
  }
  const geo = await geoRes.json();
  const first = geo?.results?.[0];
  if (!first) {
    const err = new Error('No results found for that city. Try another query.');
    err.code = 'EMPTY';
    throw err;
  }

  const { name, latitude, longitude } = first;

  // 2. Forecast current
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`;
  const forecastRes = await fetch(forecastUrl);
  if (!forecastRes.ok) {
    const err = new Error(`Forecast fetch failed (${forecastRes.status}).`);
    err.code = 'HTTP';
    throw err;
  }
  const forecast = await forecastRes.json();
  if (!forecast?.current) {
    const err = new Error('Invalid forecast data.');
    err.code = 'INVALID_DATA';
    throw err;
  }

  return normalizeResult({
    name,
    latitude,
    longitude,
    current: forecast.current,
  });
}
