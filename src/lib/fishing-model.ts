// ============================================================
// JalSaathi Fishing Suitability Model — Prototype Scoring Engine
// ============================================================

import { FishingZone, FishingFactor } from '@/types/marine';

interface FishingModelInput {
  sst: number;           // °C
  chlorophyll: number;   // mg/m³
  currentSpeed: number;  // knots
  salinity: number;      // PSU
  depth: number;         // meters
  historicalActivity: number; // 0-100
  season: string;
}

// Optimal ranges for tropical fishing (Arabian Sea)
const OPTIMAL = {
  sst: { min: 26, max: 29, ideal: 27.5 },
  chlorophyll: { min: 1.5, max: 5.0, ideal: 3.0 },
  current: { min: 0.3, max: 1.5, ideal: 0.8 },
  salinity: { min: 34.0, max: 36.0, ideal: 35.0 },
  depth: { min: 30, max: 150, ideal: 80 },
};

const SEASON_MULTIPLIERS: Record<string, number> = {
  'Pre-monsoon': 0.85,
  'Monsoon': 0.55,
  'Post-monsoon': 1.0,
  'Winter': 0.90,
};

function gaussianScore(value: number, ideal: number, sigma: number): number {
  const exponent = -Math.pow(value - ideal, 2) / (2 * Math.pow(sigma, 2));
  return Math.round(Math.max(5, Math.min(100, Math.exp(exponent) * 100)));
}

function rangeScore(value: number, min: number, max: number, ideal: number): number {
  if (value < min || value > max) {
    const distance = value < min ? min - value : value - max;
    const range = max - min;
    return Math.round(Math.max(5, 100 - (distance / range) * 100));
  }
  const sigma = (max - min) / 3;
  return gaussianScore(value, ideal, sigma);
}

export function calculateFishingSuitability(input: FishingModelInput): {
  score: number;
  factors: FishingFactor[];
  confidence: number;
} {
  const sstScore = rangeScore(input.sst, OPTIMAL.sst.min, OPTIMAL.sst.max, OPTIMAL.sst.ideal);
  const chlorophyllScore = rangeScore(input.chlorophyll, OPTIMAL.chlorophyll.min, OPTIMAL.chlorophyll.max, OPTIMAL.chlorophyll.ideal);
  const currentScore = rangeScore(input.currentSpeed, OPTIMAL.current.min, OPTIMAL.current.max, OPTIMAL.current.ideal);
  const salinityScore = rangeScore(input.salinity, OPTIMAL.salinity.min, OPTIMAL.salinity.max, OPTIMAL.salinity.ideal);
  const depthScore = rangeScore(input.depth, OPTIMAL.depth.min, OPTIMAL.depth.max, OPTIMAL.depth.ideal);
  const activityScore = Math.round(input.historicalActivity * 0.9 + 10);

  const factors: FishingFactor[] = [
    { name: 'SST Suitability', value: input.sst, score: sstScore, unit: '°C' },
    { name: 'Chlorophyll-a', value: input.chlorophyll, score: chlorophyllScore, unit: 'mg/m³' },
    { name: 'Current', value: input.currentSpeed, score: currentScore, unit: 'knots' },
    { name: 'Salinity', value: input.salinity, score: salinityScore, unit: 'PSU' },
    { name: 'Depth', value: input.depth, score: depthScore, unit: 'm' },
    { name: 'Historical Activity', value: input.historicalActivity, score: activityScore, unit: '%' },
  ];

  const weights = [0.20, 0.20, 0.15, 0.10, 0.15, 0.20];
  const seasonMultiplier = SEASON_MULTIPLIERS[input.season] || 0.85;

  const rawScore = factors.reduce((sum, f, i) => sum + f.score * weights[i], 0);
  const score = Math.round(Math.min(100, rawScore * seasonMultiplier));
  const confidence = Math.round(65 + Math.random() * 20);

  return { score, factors, confidence };
}

export function getSeason(month?: number): string {
  const m = month ?? new Date().getMonth();
  if (m >= 2 && m <= 4) return 'Pre-monsoon';
  if (m >= 5 && m <= 8) return 'Monsoon';
  if (m >= 9 && m <= 11) return 'Post-monsoon';
  return 'Winter';
}
