// ============================================================
// JalSaathi Phase 3 — Risk Engine Unit Test Suite
// ============================================================

import assert from 'node:assert/strict';
import { calculateMarineRisk } from '../lib/risk-engine';
import { checkGeofenceProximity } from '../lib/geofence-engine';

console.log('🧪 Running Phase 3 Marine Risk Engine Unit Tests...\n');

// 1. Normal safe conditions
{
  const result = calculateMarineRisk({
    waveHeight: 1.0,
    windSpeed: 12,
    currentSpeed: 0.8,
    visibility: 10,
    pressure: 1012,
    rainfall: 0,
    vesselCount: 5,
    isRestrictedZone: false,
  });

  assert.equal(result.status, 'SAFE', 'Should be SAFE under calm normal conditions');
  assert.ok(result.score >= 75, `Expected score >= 75, got ${result.score}`);
  assert.equal(result.confidence, 100, `Expected 100% confidence for complete data, got ${result.confidence}`);
  console.log('✅ PASS: 1. Normal safe conditions test passed');
}

// 2. Individual Hazard Triggers
{
  // 2a. Extreme Waves
  const waveHazard = calculateMarineRisk({
    waveHeight: 6.0, // extreme
    windSpeed: 15,
    currentSpeed: 0.5,
  });
  assert.equal(waveHazard.status, 'AVOID', 'Extreme waves (>= 5.5m) must force status to AVOID');

  // 2b. Cyclone Alert
  const cycloneHazard = calculateMarineRisk({
    waveHeight: 1.2,
    windSpeed: 10,
    hasCycloneAlert: true,
  });
  assert.equal(cycloneHazard.status, 'AVOID', 'Active cyclone alert must force status to AVOID');

  // 2c. Restricted Zone Violation
  const restrictedHazard = calculateMarineRisk({
    waveHeight: 1.0,
    windSpeed: 10,
    isRestrictedZone: true,
  });
  assert.ok(
    restrictedHazard.status === 'HIGH_RISK' || restrictedHazard.status === 'AVOID',
    'Restricted zone must force status to HIGH_RISK or AVOID',
  );

  console.log('✅ PASS: 2. Hazard override triggers test passed');
}

// 3. Missing Data Handling
{
  const missingDataResult = calculateMarineRisk({
    // waveHeight missing
    windSpeed: 15,
  });

  assert.ok(
    missingDataResult.confidence < 100,
    `Confidence should drop when core metrics are missing, got ${missingDataResult.confidence}`,
  );
  assert.notEqual(
    missingDataResult.status,
    'SAFE',
    'Incomplete data should lower confidence and not default to plain SAFE without checks',
  );

  console.log('✅ PASS: 3. Missing data handling & confidence penalty test passed');
}

// 4. Conflicting Signals (Low Wind but High Wave Swell)
{
  const conflictingResult = calculateMarineRisk({
    waveHeight: 4.8, // dangerous waves
    windSpeed: 8,   // light wind
    currentSpeed: 1.0,
    visibility: 10,
    pressure: 1012,
  });

  assert.ok(
    conflictingResult.status === 'HIGH_RISK' || conflictingResult.status === 'AVOID',
    `High swell waves must drive high risk even if wind is calm. Status: ${conflictingResult.status}`,
  );

  console.log('✅ PASS: 4. Conflicting signals test passed');
}

// 5. Geofence Boundary Proximity Test (Sir Creek IMBL Coordinates)
{
  const insideGeofence = checkGeofenceProximity({ lat: 23.63, lon: 68.12 });
  assert.equal(insideGeofence.status, 'INSIDE', 'Position inside Sir Creek IMBL radius must return INSIDE');
  assert.equal(insideGeofence.isRestricted, true, 'isRestricted must be true inside boundary');

  const nearGeofence = checkGeofenceProximity({ lat: 23.90, lon: 68.12 });
  assert.equal(nearGeofence.status, 'WARNING', 'Position within warning buffer of IMBL must return WARNING');

  const openSea = checkGeofenceProximity({ lat: 18.95, lon: 72.82 });
  assert.equal(openSea.status, 'CLEAR', 'Mumbai harbour coordinates clear of IMBL must return CLEAR');

  console.log('✅ PASS: 5. Geofence boundary proximity calculation test passed');
}

// 6. Integrated Risk Engine Geofence Penalty
{
  const riskWithGeofenceInside = calculateMarineRisk({
    location: { lat: 23.63, lon: 68.12 }, // Sir Creek IMBL
    waveHeight: 1.0,
    windSpeed: 10,
  });

  assert.ok(
    riskWithGeofenceInside.status === 'HIGH_RISK' || riskWithGeofenceInside.status === 'AVOID',
    `Coordinates inside IMBL must trigger HIGH_RISK or AVOID status, got ${riskWithGeofenceInside.status}`,
  );

  console.log('✅ PASS: 6. Integrated risk engine geofence penalty test passed');
}

console.log('\n🎉 ALL 6 RISK ENGINE & GEOFENCE UNIT TESTS PASSED SUCCESSFULLY!');
