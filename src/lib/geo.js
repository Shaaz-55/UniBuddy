/**
 * Converts meters offset { east, north } from a center (lat, lng) to absolute coordinates.
 * 1 degree latitude ~= 111,320 meters
 * 1 degree longitude ~= 111,320 * cos(latitude in radians) meters
 */
export function offsetToCoordinates(centerLat, centerLng, offsetMeters) {
  const { east = 0, north = 0 } = offsetMeters;
  const metersPerDegreeLat = 111320;
  const latRadians = (centerLat * Math.PI) / 180;
  const metersPerDegreeLng = 111320 * Math.cos(latRadians);

  const deltaLat = north / metersPerDegreeLat;
  const deltaLng = metersPerDegreeLng !== 0 ? east / metersPerDegreeLng : 0;

  return {
    lat: centerLat + deltaLat,
    lng: centerLng + deltaLng,
  };
}
