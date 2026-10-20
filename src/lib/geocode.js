import { COLLEGES, DEFAULT_COLLEGE } from '../data/colleges';

// Module-level in-memory cache to strictly obey Nominatim 1-req-per-session usage policy
const geocodeCache = new Map();

/**
 * Resolves coordinates for a college name.
 * 1. Exact or case-insensitive match against pre-configured COLLEGES
 * 2. Nominatim single request with 6s timeout, cached in memory
 * 3. Fallback to IIT Bombay with isFallback: true flag
 */
export async function resolveCollegeLocation(rawCollegeName) {
  const collegeName = (rawCollegeName || '').trim();
  if (!collegeName) {
    return {
      lat: DEFAULT_COLLEGE.lat,
      lng: DEFAULT_COLLEGE.lng,
      isFallback: true,
      collegeName: DEFAULT_COLLEGE.name,
    };
  }

  // 1. Check local static database
  const normalizedQuery = collegeName.toLowerCase();
  const matched = COLLEGES.find(
    (c) => c.name.toLowerCase() === normalizedQuery
  );

  if (matched && typeof matched.lat === 'number' && typeof matched.lng === 'number') {
    return {
      lat: matched.lat,
      lng: matched.lng,
      isFallback: false,
      collegeName: matched.name,
    };
  }

  // Check in-memory cache
  if (geocodeCache.has(normalizedQuery)) {
    return geocodeCache.get(normalizedQuery);
  }

  // 2. Query Nominatim sparingly with 6-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const encoded = encodeURIComponent(collegeName);
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encoded}`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        if (!isNaN(lat) && !isNaN(lng)) {
          const result = {
            lat,
            lng,
            isFallback: false,
            collegeName,
          };
          geocodeCache.set(normalizedQuery, result);
          return result;
        }
      }
    }
  } catch {
    // Network error, timeout or parse error handled gracefully
  } finally {
    clearTimeout(timeoutId);
  }

  // 3. Fallback to IIT Bombay
  const fallbackResult = {
    lat: DEFAULT_COLLEGE.lat,
    lng: DEFAULT_COLLEGE.lng,
    isFallback: true,
    collegeName,
  };
  geocodeCache.set(normalizedQuery, fallbackResult);
  return fallbackResult;
}
