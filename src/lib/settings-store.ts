// ============================================================
// ORCA Settings Store — Centralized User Preferences & Unit System
// Persisted in localStorage and synchronized across all pages/components
// ============================================================

'use client';

import { useState, useEffect } from 'react';

export type SupportedLanguage =
  | 'English'
  | 'Hindi'
  | 'Marathi'
  | 'Gujarati'
  | 'Tamil'
  | 'Telugu'
  | 'Kannada'
  | 'Malayalam'
  | 'Bengali';

export type SpeedUnit = 'km/h' | 'knots' | 'mph';
export type DistanceUnit = 'km' | 'nm' | 'miles';
export type TemperatureUnit = '°C' | '°F';

export interface AppSettings {
  language: SupportedLanguage;
  speedUnit: SpeedUnit;
  distanceUnit: DistanceUnit;
  tempUnit: TemperatureUnit;
  demoMode: boolean;
  notifications: boolean;
  riskSensitivity: 'low' | 'medium' | 'high';
  layers: {
    weather: boolean;
    waves: boolean;
    currents: boolean;
    fishingActivity: boolean;
    vessels: boolean;
    routes: boolean;
    depth: boolean;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'English',
  speedUnit: 'km/h',
  distanceUnit: 'km',
  tempUnit: '°C',
  demoMode: false,
  notifications: true,
  riskSensitivity: 'medium',
  layers: {
    weather: true,
    waves: true,
    currents: true,
    fishingActivity: true,
    vessels: true,
    routes: true,
    depth: false,
  },
};

const STORAGE_KEY = 'orca_user_settings';

/**
 * Retrieve current settings from localStorage (safe for SSR).
 */
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      layers: { ...DEFAULT_SETTINGS.layers, ...(parsed.layers || {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update one or more settings, persist to localStorage, and notify all subscribers.
 */
export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const current = getSettings();
  const next: AppSettings = {
    ...current,
    ...partial,
    layers: partial.layers ? { ...current.layers, ...partial.layers } : current.layers,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota/write errors
  }

  // Broadcast to current window and other components
  window.dispatchEvent(new CustomEvent('orca-settings-changed', { detail: next }));
  return next;
}

/**
 * React hook to read and update global settings reactively.
 */
export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettingsState(getSettings());

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<AppSettings>;
      if (customEvent.detail) {
        setSettingsState(customEvent.detail);
      } else {
        setSettingsState(getSettings());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSettingsState(getSettings());
      }
    };

    window.addEventListener('orca-settings-changed', handleCustomEvent);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('orca-settings-changed', handleCustomEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = updateSettings({ [key]: value });
    setSettingsState(updated);
    return updated;
  };

  return { settings, updateSettings, setSetting };
}

// ============================================================
// Unit Conversion Helpers
// ============================================================

/** Convert km/h to selected speed unit */
export function convertSpeed(kmh: number, targetUnit: SpeedUnit = 'km/h'): number {
  if (targetUnit === 'knots') return kmh * 0.539957;
  if (targetUnit === 'mph') return kmh * 0.621371;
  return kmh;
}

/** Format speed with unit label */
export function formatSpeed(kmh: number, unit?: SpeedUnit): string {
  const selectedUnit = unit ?? getSettings().speedUnit;
  const val = convertSpeed(kmh, selectedUnit);
  return `${val.toFixed(1)} ${selectedUnit}`;
}

/** Convert km to selected distance unit */
export function convertDistance(km: number, targetUnit: DistanceUnit = 'km'): number {
  if (targetUnit === 'nm') return km * 0.539957;
  if (targetUnit === 'miles') return km * 0.621371;
  return km;
}

/** Format distance with unit label */
export function formatDistance(km: number, unit?: DistanceUnit): string {
  const selectedUnit = unit ?? getSettings().distanceUnit;
  const val = convertDistance(km, selectedUnit);
  return `${val.toFixed(1)} ${selectedUnit}`;
}

/** Convert Celsius to selected temperature unit */
export function convertTemperature(celsius: number, targetUnit: TemperatureUnit = '°C'): number {
  if (targetUnit === '°F') return (celsius * 9) / 5 + 32;
  return celsius;
}

/** Format temperature with unit label */
export function formatTemperature(celsius: number, unit?: TemperatureUnit): string {
  const selectedUnit = unit ?? getSettings().tempUnit;
  const val = convertTemperature(celsius, selectedUnit);
  return `${val.toFixed(1)} ${selectedUnit}`;
}
