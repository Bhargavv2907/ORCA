// ============================================================
// JalSaathi Phase 12 — Offline Storage Unit Test Suite
// ============================================================

import assert from 'node:assert/strict';
import { isDataStale, getOfflineDataFreshnessLabel } from '../lib/offline-storage';

console.log('🧪 Running Phase 12 Offline Storage Unit Tests...\n');

// 1. Data Staleness Calculation
{
  const recentTimestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 mins ago
  const oldTimestamp = new Date(Date.now() - 180 * 60 * 1000).toISOString();   // 3 hours ago

  assert.equal(isDataStale(recentTimestamp, 120), false, '10-minute old data should NOT be marked stale (max 120m)');
  assert.equal(isDataStale(oldTimestamp, 120), true, '3-hour old data SHOULD be marked stale (max 120m)');

  console.log('✅ PASS: 1. Data staleness calculation test passed');
}

// 2. Freshness Label Formatting
{
  const justNow = new Date(Date.now() - 20 * 1000).toISOString(); // 20s ago
  const minsAgo = new Date(Date.now() - 25 * 60 * 1000).toISOString(); // 25m ago
  const hoursAgo = new Date(Date.now() - 150 * 60 * 1000).toISOString(); // 2.5h ago

  assert.equal(getOfflineDataFreshnessLabel(justNow), 'Synced just now');
  assert.equal(getOfflineDataFreshnessLabel(minsAgo), 'Synced 25 mins ago');
  assert.equal(getOfflineDataFreshnessLabel(hoursAgo), 'Synced 2 hours ago');

  console.log('✅ PASS: 2. Freshness label formatting test passed');
}

console.log('\n🎉 ALL 2 OFFLINE STORAGE UNIT TESTS PASSED SUCCESSFULLY!');
