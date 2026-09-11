/**
 * Formatting Utilities for Coordinates, Speed, Bearing, and Relative Time
 */

export function formatCoords(lat, lon) {
  if (lat === undefined || lon === undefined || lat === null || lon === null) return 'N/A';
  const latCard = lat >= 0 ? 'N' : 'S';
  const lonCard = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latCard}, ${Math.abs(lon).toFixed(4)}° ${lonCard}`;
}

export function formatKnots(sog) {
  if (sog === undefined || sog === null) return '0.0 kn';
  return `${Number(sog).toFixed(1)} kn`;
}

export function formatCourse(cog) {
  if (cog === undefined || cog === null) return '0°';
  return `${Math.round(Number(cog))}°`;
}

export function formatRelativeTime(isoString) {
  if (!isoString) return 'Just now';
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
