const SAFE_ENV = typeof process !== 'undefined' ? (process.env || {}) : {};

/**
 * PUBLIC_INTERFACE
 * getEnv reads string environment variable or returns defaultValue.
 */
export function getEnv(name, defaultValue = '') {
  const v = SAFE_ENV?.[name];
  if (v === undefined || v === null || v === '') return defaultValue;
  return v;
}

/**
 * PUBLIC_INTERFACE
 * getLogLevel returns configured log level string.
 */
export function getLogLevel() {
  return getEnv('REACT_APP_LOG_LEVEL', 'info');
}

function parseFeatureFlags(raw) {
  if (!raw) return {};
  try {
    // Try JSON first
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    // Fallback CSV style: "FLAG,OTHER=true" or "FLAG1,FLAG2"
    const flags = {};
    const parts = String(raw).split(',').map((s) => s.trim()).filter(Boolean);
    parts.forEach((p) => {
      const [k, v] = p.split('=').map((s) => s.trim());
      if (!k) return;
      if (v === undefined) flags[k] = true;
      else if (v.toLowerCase() === 'true') flags[k] = true;
      else if (v.toLowerCase() === 'false') flags[k] = false;
      else flags[k] = v;
    });
    return flags;
  }
}

let cachedFlags;
/**
 * PUBLIC_INTERFACE
 * getFeatureFlag reads from REACT_APP_FEATURE_FLAGS (JSON or CSV).
 */
export function getFeatureFlag(name, defaultValue = false) {
  if (!cachedFlags) {
    const raw = getEnv('REACT_APP_FEATURE_FLAGS', '');
    cachedFlags = parseFeatureFlags(raw);
  }
  const v = cachedFlags?.[name];
  return v === undefined ? defaultValue : v;
}
