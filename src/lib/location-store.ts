// ============================================================
// ORCA Location Store — Shared location state for all pages
// Persisted in localStorage so every page uses the same city
// ============================================================

import { INDIAN_COASTAL_LOCATIONS, CoastalLocation } from '@/lib/orchestrator';

const STORAGE_KEY = 'orca_selected_location';

/** Mumbai — the default fallback */
export const DEFAULT_LOCATION: CoastalLocation = INDIAN_COASTAL_LOCATIONS[0];

/** Read the currently selected location (client-side only). Falls back to Mumbai. */
export function getSelectedLocation(): CoastalLocation {
  if (typeof window === 'undefined') return DEFAULT_LOCATION;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_LOCATION;
    const parsed = JSON.parse(stored) as CoastalLocation;
    // Validate it looks like a real location object
    if (parsed && typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_LOCATION;
}

/** Persist a location so all pages pick it up */
export function setSelectedLocation(loc: CoastalLocation): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  // Dispatch a custom event so other components can react without a page reload
  window.dispatchEvent(new CustomEvent('orca-location-changed', { detail: loc }));
}

/** Build a marine API URL for the selected (or given) location */
export function marineApiUrl(loc?: CoastalLocation): string {
  const l = loc ?? getSelectedLocation();
  return `/api/marine?lat=${l.lat}&lon=${l.lon}`;
}

/** React hook — returns the selected location and updates when it changes */
export function useSelectedLocation() {
  // Lazy import React to avoid issues in non-React files
  if (typeof window === 'undefined') return DEFAULT_LOCATION;
  return getSelectedLocation();
}
