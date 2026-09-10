// ============================================================
// ORCA — Offline Storage & Data Synchronization Adapter (Phase 12)
// Local storage persistence & stale data management
// ============================================================

import { MarineConditions } from '@/types/marine';

const OFFLINE_MARINE_CACHE_KEY = 'orca_offline_marine_conditions_v1';

/**
 * Saves live marine conditions to local storage for offline retrieval at sea.
 */
export function saveOfflineMarineData(conditions: MarineConditions): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      conditions,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(OFFLINE_MARINE_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota errors
  }
}

/**
 * Retrieves cached marine conditions when offline.
 */
export function getOfflineMarineData(): { conditions: MarineConditions; cachedAt: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(OFFLINE_MARINE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Checks if saved data is older than maxAgeMinutes (default: 120 mins).
 */
export function isDataStale(savedTimestamp: string, maxAgeMinutes = 120): boolean {
  try {
    const savedTime = new Date(savedTimestamp).getTime();
    const now = Date.now();
    const diffMins = (now - savedTime) / (1000 * 60);
    return diffMins > maxAgeMinutes;
  } catch {
    return true;
  }
}

/**
 * Formats a human-readable data age label (e.g. "Synced 15 mins ago").
 */
export function getOfflineDataFreshnessLabel(savedTimestamp: string): string {
  try {
    const savedTime = new Date(savedTimestamp).getTime();
    const now = Date.now();
    const diffMins = Math.floor((now - savedTime) / (1000 * 60));

    if (diffMins < 1) return 'Synced just now';
    if (diffMins < 60) return `Synced ${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `Synced ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } catch {
    return 'Synced recently';
  }
}

/**
 * Registers the ORCA Service Worker in client browser.
 */
export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Quiet fail in unsupported environments
      });
    });
  }
}
