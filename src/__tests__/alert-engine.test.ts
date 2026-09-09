// ============================================================
// ORCA Phase 11 — Proactive Alert Engine Unit Test Suite
// ============================================================

import assert from 'node:assert/strict';
import { generateAlertHash, evaluateProactiveAlerts, deduplicateAlerts } from '../lib/alert-engine';
import { MarineConditions } from '../types/marine';
import { GeofenceResult } from '../lib/geofence-engine';

console.log('🧪 Running Phase 11 Proactive Alert Engine Unit Tests...\n');

// Mock baseline marine conditions
const baseConditions: MarineConditions = {
  location: { coordinates: { lat: 18.95, lon: 72.82 }, name: 'Mumbai Offshore', region: 'Konkan' },
  weather: {
    windSpeed: 42, // Strong gale (>35 km/h)
    windDirection: 'SW',
    windDegrees: 220,
    temperature: 28,
    humidity: 85,
    pressure: 1008,
    visibility: 2.0, // Low visibility (<3 km)
    cloudCover: 80,
    rainfall: 15,
    uvIndex: 4,
    description: 'Heavy rain & gale winds',
    icon: 'cloud-lightning',
  },
  waves: {
    height: 3.2, // High swell (>2.5m)
    period: 9,
    direction: 'SW',
    directionDegrees: 225,
    swellHeight: 3.0,
    swellDirection: 'SW',
    swellPeriod: 9,
  },
  ocean: {
    sst: 28.5,
    salinity: 35,
    currentSpeed: 1.5,
    currentDirection: 'NW',
    currentDegrees: 315,
    chlorophyll: 2.8,
    mixedLayerDepth: 30,
    seaLevel: 0,
    waterTempAtDepth: 25,
    bathymetry: 45,
  },
  safety: {
    overall: 48,
    status: 'DANGEROUS',
    label: 'High Risk Conditions',
    components: [],
  },
  timestamp: new Date().toISOString(),
  source: 'Open-Meteo & ISRO MOSDAC',
  dataStatus: 'LIVE',
};

// 1. Alert Hash Fingerprinting
{
  const hash1 = generateAlertHash('high_waves', 'Mumbai Offshore', 'HIGH');
  const hash2 = generateAlertHash('high_waves', 'mumbai offshore', 'HIGH');
  const hash3 = generateAlertHash('strong_wind', 'Mumbai Offshore', 'HIGH');

  assert.equal(hash1, hash2, 'Hash should be case and format insensitive for same parameters');
  assert.notEqual(hash1, hash3, 'Different alert types must produce distinct hashes');

  console.log('✅ PASS: 1. Alert hash fingerprinting test passed');
}

// 2. Proactive Alert Generation Rules
{
  const mockGeo: GeofenceResult = {
    status: 'INSIDE',
    nearestZone: 'IMBL — Sir Creek',
    distanceKm: 0,
    zoneType: 'IMBL',
    severity: 'CRITICAL',
    advisory: 'Violating International Boundary Line',
    isRestricted: true,
  };

  const alerts = evaluateProactiveAlerts(baseConditions, mockGeo);

  assert.ok(alerts.length >= 3, `Expected at least 3 active hazard alerts, got ${alerts.length}`);
  const hasGeofenceAlert = alerts.some(a => a.type === 'geofence' && a.severity === 'CRITICAL');
  const hasWaveAlert = alerts.some(a => a.type === 'high_waves');
  const hasWindAlert = alerts.some(a => a.type === 'strong_wind');

  assert.ok(hasGeofenceAlert, 'Must generate CRITICAL geofence alert when inside restricted zone');
  assert.ok(hasWaveAlert, 'Must generate high wave swell alert when wave >= 2.5m');
  assert.ok(hasWindAlert, 'Must generate strong wind alert when wind >= 35 km/h');

  console.log('✅ PASS: 2. Proactive hazard evaluation rules test passed');
}

// 3. Alert De-duplication
{
  const mockAlerts = evaluateProactiveAlerts(baseConditions);
  const duplicateList = [...mockAlerts, ...mockAlerts]; // Duplicate identical alerts

  const deduplicated = deduplicateAlerts(duplicateList);
  assert.equal(deduplicated.length, mockAlerts.length, 'De-duplication must remove duplicate alert hashes');

  console.log('✅ PASS: 3. Alert de-duplication test passed');
}

console.log('\n🎉 ALL 3 PROACTIVE ALERT ENGINE UNIT TESTS PASSED SUCCESSFULLY!');
