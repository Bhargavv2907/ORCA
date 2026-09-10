// ============================================================
// JalSaathi Potential Fishing Zone (PFZ) Service
// Provides INCOIS PFZ forecasts, fish density predictions,
// and confidence scores for target fishing destinations.
// ============================================================

import { Coordinates } from '@/types/marine';

export interface PFZMetadata {
  id: string;
  name: string;
  center: Coordinates;
  radiusKm: number;
  confidenceScore: number;       // 0..100%
  predictedFishDensity: 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  targetSpecies: string[];
  sstCelsius: number;
  chlorophyllMgM3: number;
  depthMeters: number;
  distanceNM: number;
  source: string;
  timestamp: string;
}

export const MOCK_INCOIS_PFZ_LIST: PFZMetadata[] = [
  {
    id: 'pfz_zone_a',
    name: 'PFZ Zone A — Mumbai High Shelf',
    center: { lat: 19.12, lon: 72.48 },
    radiusKm: 18,
    confidenceScore: 94,
    predictedFishDensity: 'VERY HIGH',
    targetSpecies: ['Mackerel (Rastrelliger)', 'Ribbonfish', 'Seerfish (Surmai)'],
    sstCelsius: 28.4,
    chlorophyllMgM3: 3.2,
    depthMeters: 45,
    distanceNM: 24.5,
    source: 'INCOIS INSAT-3D & OceanSat SST',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'pfz_zone_b',
    name: 'PFZ Zone B — Alibag Coastal Contour',
    center: { lat: 18.52, lon: 72.55 },
    radiusKm: 15,
    confidenceScore: 88,
    predictedFishDensity: 'HIGH',
    targetSpecies: ['Sardines', 'Pomfret', 'Prawns (Penaeus)'],
    sstCelsius: 28.1,
    chlorophyllMgM3: 2.8,
    depthMeters: 38,
    distanceNM: 31.2,
    source: 'INCOIS OCM Chlorophyll Bulletin',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'pfz_zone_c',
    name: 'PFZ Zone C — Ratnagiri Deep Water',
    center: { lat: 16.95, lon: 72.80 },
    radiusKm: 22,
    confidenceScore: 91,
    predictedFishDensity: 'VERY HIGH',
    targetSpecies: ['Yellowfin Tuna', 'Skipjack Tuna', 'Marlin'],
    sstCelsius: 28.6,
    chlorophyllMgM3: 3.5,
    depthMeters: 75,
    distanceNM: 42.0,
    source: 'INCOIS Offshore Thermal Front',
    timestamp: new Date().toISOString(),
  },
];

/**
 * Finds the highest-value reachable PFZ based on density, confidence, and distance
 */
export function getRecommendedPFZ(
  userPos: Coordinates,
  pfzList: PFZMetadata[] = MOCK_INCOIS_PFZ_LIST
): PFZMetadata {
  let bestPFZ = pfzList[0];
  let bestScore = -1;

  pfzList.forEach((pfz) => {
    // Score = Confidence * 0.5 + DensityWeight * 0.3 - DistancePenalty * 0.2
    const densityBonus = pfz.predictedFishDensity === 'VERY HIGH' ? 40 : 25;
    const score = pfz.confidenceScore * 0.5 + densityBonus - pfz.distanceNM * 0.2;
    if (score > bestScore) {
      bestScore = score;
      bestPFZ = pfz;
    }
  });

  return bestPFZ;
}
