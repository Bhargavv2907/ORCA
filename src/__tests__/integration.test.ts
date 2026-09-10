// ============================================================
// ORCA Phase 13 — End-to-End Multi-Agent Integration Test Suite
// ============================================================

import assert from 'node:assert/strict';
import { orchestrate } from '../lib/orchestrator';
import { calculateMarineRisk } from '../lib/risk-engine';
import { checkGeofenceProximity } from '../lib/geofence-engine';
import { translateAdvisory, getLanguageBCP47 } from '../lib/i18n-engine';
import { evaluateProactiveAlerts, deduplicateAlerts } from '../lib/alert-engine';
import { getMarineConditions } from '../services/marine/unified';

console.log('🧪 Running Phase 13 End-to-End System Integration Tests...\n');

async function runIntegrationTests() {
  // 1. Fishing Mission Planner Orchestration
  {
    const question = 'I want to go fishing tomorrow morning from Mumbai. Find the best nearby fishing zone and safest route.';
    const response = await orchestrate(question);

    assert.equal(response.query, question);
    assert.ok(response.agentsUsed.length >= 3, `Expected at least 3 agents in trace, got ${response.agentsUsed.length}`);
    assert.ok(response.safetyStatus, 'Must return deterministic SafetyStatus');
    assert.ok(response.evidence, 'Must include satellite evidence trail payload');
    assert.ok(response.evidence.measurements.length > 0, 'Evidence must contain live satellite metrics');
    assert.ok(response.executionTrace && response.executionTrace.length > 0, 'Trace log must record step execution');
    assert.ok(response.missionPlan, 'Fishing query must populate flagship MissionPlannerPayload');
    assert.equal(response.missionPlan.recommendedRoute, 'Route B (Coastal Path)');

    console.log('✅ PASS: 1. End-to-End Fishing Mission Planner orchestration test passed');
  }

  // 2. Geofence & Safeguard Proximity Query
  {
    const question = 'Are there any restricted zones or geofences nearby?';
    const response = await orchestrate(question);

    assert.ok(response.geofenceResult, 'Geofence query must populate GeofenceResult payload');
    assert.equal(response.geofenceResult.status, 'CLEAR', 'Mumbai harbour coordinates should return CLEAR geofence status');
    assert.ok(response.geofenceResult.nearestZone, 'Must identify nearest restricted boundary zone');

    console.log('✅ PASS: 2. Geofence & safeguard query test passed');
  }

  // 3. What-If Scenario Calculation Loop
  {
    const question = 'What if I leave at 5 AM tomorrow morning?';
    const response = await orchestrate(question);

    assert.ok(response.whatIfComparison, 'What-if query must produce scenario comparison payload');
    assert.equal(response.whatIfComparison.alternativeTime, '05:00 AM');
    assert.ok(
      response.whatIfComparison.alternativeScore >= response.whatIfComparison.baselineScore,
      'Early departure should yield equal or higher safety score'
    );

    console.log('✅ PASS: 3. What-If scenario calculation loop test passed');
  }

  // 4. Vernacular Voice & Audio Synthesis Integration
  {
    const text = 'Fishing is safe with standard caution. Return before evening as wind speeds may increase.';
    const marathi = translateAdvisory(text, 'Marathi');
    const bcp47 = getLanguageBCP47('Marathi');

    assert.ok(marathi.includes('मासेमारी सुरक्षित आहे'), 'Marathi translation must match localized advisory text');
    assert.equal(bcp47, 'mr-IN', 'Marathi BCP 47 code must be mr-IN');

    console.log('✅ PASS: 4. Vernacular voice & audio synthesis integration test passed');
  }

  // 5. Proactive Alerting & Fingerprint De-duplication Loop
  {
    const conditions = await getMarineConditions(18.95, 72.82);
    // Simulate high swell conditions
    conditions.waves.height = 3.5;
    conditions.weather.windSpeed = 45;

    const geo = checkGeofenceProximity({ lat: 23.63, lon: 68.12 }); // Sir Creek IMBL
    const rawAlerts = evaluateProactiveAlerts(conditions, geo);
    const deduped = deduplicateAlerts([...rawAlerts, ...rawAlerts]);

    assert.ok(rawAlerts.length >= 3, `Expected at least 3 active alerts under high swell & IMBL violation, got ${rawAlerts.length}`);
    assert.equal(deduped.length, rawAlerts.length, 'De-duplication loop must filter duplicate alert hashes');

    console.log('✅ PASS: 5. Proactive alerting & de-duplication loop test passed');
  }

  console.log('\n🎉 ALL 5 SYSTEM INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

runIntegrationTests().catch(err => {
  console.error('❌ Integration test failed:', err);
  process.exit(1);
});
