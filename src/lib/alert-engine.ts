// ============================================================
// JalSaathi — Proactive Hazard Alerting & De-duplication Engine (Phase 11)
// Real-time hazard detection, fingerprinting & alert de-duplication
// ============================================================

import { MarineConditions } from '@/types/marine';
import { GeofenceResult } from '@/lib/geofence-engine';

export type ProactiveAlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ProactiveAlertType =
  | 'cyclone'
  | 'high_waves'
  | 'strong_wind'
  | 'geofence'
  | 'low_visibility'
  | 'lightning';

export interface ProactiveAlert {
  id: string;
  hash: string;
  type: ProactiveAlertType;
  severity: ProactiveAlertSeverity;
  title: string;
  description: string;
  location: string;
  recommendation: string;
  timestamp: string;
  acknowledged?: boolean;
}

/**
 * Generates a unique fingerprint hash for an alert type, location, and severity
 * to prevent duplicate notification popups.
 */
export function generateAlertHash(
  type: ProactiveAlertType,
  location: string,
  severity: ProactiveAlertSeverity
): string {
  const normalizedLoc = location.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `orca_alert_${type}_${normalizedLoc}_${severity}`;
}

const ACKNOWLEDGED_CACHE_KEY = 'orca_acknowledged_alerts_v1';
const RECENT_ALERTS_KEY = 'orca_recent_alerts_v1';

/**
 * Evaluates live marine conditions and geofence state to generate proactive hazard alerts.
 */
export function evaluateProactiveAlerts(
  conditions: MarineConditions,
  geofence?: GeofenceResult
): ProactiveAlert[] {
  const alerts: ProactiveAlert[] = [];
  const now = new Date().toISOString();
  const locName = conditions.location?.name || 'Mumbai Offshore';

  // 1. Geofence Boundary Alert
  if (geofence && geofence.status !== 'CLEAR') {
    const isInside = geofence.status === 'INSIDE';
    const severity: ProactiveAlertSeverity = isInside ? 'CRITICAL' : 'HIGH';
    const type: ProactiveAlertType = 'geofence';
    const hash = generateAlertHash(type, locName, severity);

    alerts.push({
      id: `alert-geo-${Date.now()}`,
      hash,
      type,
      severity,
      title: isInside ? '⛔ Restricted Boundary Violation' : '⚠️ Approaching Restricted Zone',
      description: geofence.advisory,
      location: locName,
      recommendation: isInside
        ? 'Steer vessel immediately back into authorized Indian territorial waters.'
        : `Nearest restricted boundary (${geofence.nearestZone}) is ${geofence.distanceKm} km away. Adjust heading.`,
      timestamp: now,
    });
  }

  // 2. High Waves / Swell Hazard (> 2.5m)
  if (conditions.waves && conditions.waves.height >= 2.5) {
    const isExtreme = conditions.waves.height >= 4.0;
    const severity: ProactiveAlertSeverity = isExtreme ? 'CRITICAL' : 'HIGH';
    const type: ProactiveAlertType = 'high_waves';
    const hash = generateAlertHash(type, locName, severity);

    alerts.push({
      id: `alert-wave-${Date.now()}`,
      hash,
      type,
      severity,
      title: isExtreme ? '🌊 Dangerous High Wave Swell' : '🌊 Rough Wave Warning',
      description: `Wave height reached ${conditions.waves.height.toFixed(1)} meters (${conditions.waves.direction || 'SW'} swell).`,
      location: locName,
      recommendation: 'Small craft and fishing vessels advised to seek sheltered waters immediately.',
      timestamp: now,
    });
  }

  // 3. Strong Gale Wind Hazard (> 35 km/h)
  if (conditions.weather && conditions.weather.windSpeed >= 35) {
    const isGale = conditions.weather.windSpeed >= 50;
    const severity: ProactiveAlertSeverity = isGale ? 'CRITICAL' : 'HIGH';
    const type: ProactiveAlertType = 'strong_wind';
    const hash = generateAlertHash(type, locName, severity);

    alerts.push({
      id: `alert-wind-${Date.now()}`,
      hash,
      type,
      severity,
      title: isGale ? '💨 Gale Force Wind Warning' : '💨 Strong Wind Advisory',
      description: `Wind speed recorded at ${Math.round(conditions.weather.windSpeed)} km/h from ${conditions.weather.windDirection || 'W'}.`,
      location: locName,
      recommendation: 'Secure loose gear and reduce speed. Heavy sea spray may impair steering.',
      timestamp: now,
    });
  }

  // 4. Low Visibility Hazard (< 3 km)
  if (conditions.weather && typeof conditions.weather.visibility === 'number' && conditions.weather.visibility <= 3) {
    const severity: ProactiveAlertSeverity = 'MEDIUM';
    const type: ProactiveAlertType = 'low_visibility';
    const hash = generateAlertHash(type, locName, severity);

    alerts.push({
      id: `alert-vis-${Date.now()}`,
      hash,
      type,
      severity,
      title: '🌁 Low Visibility Fog / Mist',
      description: `Surface visibility dropped to ${conditions.weather.visibility.toFixed(1)} km.`,
      location: locName,
      recommendation: 'Enable navigation lights, maintain foghorn warnings, and monitor radar targets.',
      timestamp: now,
    });
  }

  return alerts;
}

/**
 * Filters out duplicate alerts that have been acknowledged or fired recently.
 */
export function deduplicateAlerts(alerts: ProactiveAlert[]): ProactiveAlert[] {
  let ackSet = new Set<string>();
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const acknowledged: string[] = JSON.parse(localStorage.getItem(ACKNOWLEDGED_CACHE_KEY) || '[]');
      ackSet = new Set(acknowledged);
    } catch {
      // Ignore storage errors
    }
  }

  // Keep unique non-acknowledged alerts by alert.hash
  const uniqueMap = new Map<string, ProactiveAlert>();
  for (const alert of alerts) {
    if (!ackSet.has(alert.hash) && !uniqueMap.has(alert.hash)) {
      uniqueMap.set(alert.hash, alert);
    }
  }

  return Array.from(uniqueMap.values());
}

/**
 * Marks an alert hash as acknowledged to suppress duplicate notifications.
 */
export function acknowledgeAlert(hash: string): void {
  if (typeof window === 'undefined') return;
  try {
    const acknowledged: string[] = JSON.parse(localStorage.getItem(ACKNOWLEDGED_CACHE_KEY) || '[]');
    if (!acknowledged.includes(hash)) {
      acknowledged.push(hash);
      localStorage.setItem(ACKNOWLEDGED_CACHE_KEY, JSON.stringify(acknowledged));
    }
  } catch {
    // Ignore storage quota errors
  }
}
