// ============================================================
// ORCA Phase 3 — Risk Engine Unit Test Suite
// ============================================================

import assert from 'node:assert/strict';
import { calculateMarineRisk } from '../lib/risk-engine';

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

console.log('\n🎉 ALL 4 RISK ENGINE UNIT TESTS PASSED SUCCESSFULLY!');
