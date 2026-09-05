// ============================================================
// ORCA Risk Engine — Safety Score Calculator
// ============================================================

import { SafetyScore, RiskComponent, RiskWeights, WeatherData, WaveData, OceanData } from '@/types/marine';

const DEFAULT_WEIGHTS: RiskWeights = {
  wave: 0.30,
  wind: 0.25,
  current: 0.15,
  storm: 0.20,
  traffic: 0.10,
};

// Thresholds for risk scoring
const THRESHOLDS = {
  wave: { safe: 1.5, moderate: 2.5, dangerous: 4.0 },
  wind: { safe: 20, moderate: 35, dangerous: 50 },
  current: { safe: 1.5, moderate: 2.5, dangerous: 4.0 },
  visibility: { safe: 8, moderate: 5, dangerous: 2 },
  pressure: { normal: 1010, low: 1005, veryLow: 998 },
};

function scoreFromThreshold(value: number, safe: number, moderate: number, dangerous: number): number {
  if (value <= safe) return 95 - (value / safe) * 15;
  if (value <= moderate) return 80 - ((value - safe) / (moderate - safe)) * 40;
  if (value <= dangerous) return 40 - ((value - moderate) / (dangerous - moderate)) * 30;
  return Math.max(5, 10 - ((value - dangerous) / dangerous) * 10);
}

function scoreFromInverseThreshold(value: number, safe: number, moderate: number, dangerous: number): number {
  if (value >= safe) return 95;
  if (value >= moderate) return 70 + ((value - moderate) / (safe - moderate)) * 25;
  if (value >= dangerous) return 30 + ((value - dangerous) / (moderate - dangerous)) * 40;
  return Math.max(5, 30 * (value / dangerous));
}

export function calculateWaveRisk(waves: WaveData): RiskComponent {
  const score = Math.round(scoreFromThreshold(waves.height, THRESHOLDS.wave.safe, THRESHOLDS.wave.moderate, THRESHOLDS.wave.dangerous));
  let description = 'Calm seas';
  if (score < 40) description = 'Dangerous wave conditions';
  else if (score < 60) description = 'Rough wave conditions';
  else if (score < 80) description = 'Moderate wave conditions';

  return { name: 'Wave Risk', score, weight: DEFAULT_WEIGHTS.wave * 100, description };
}

export function calculateWindRisk(weather: WeatherData): RiskComponent {
  const score = Math.round(scoreFromThreshold(weather.windSpeed, THRESHOLDS.wind.safe, THRESHOLDS.wind.moderate, THRESHOLDS.wind.dangerous));
  let description = 'Light winds';
  if (score < 40) description = 'Dangerous wind conditions';
  else if (score < 60) description = 'Strong winds';
  else if (score < 80) description = 'Manageable wind speeds';

  return { name: 'Wind Risk', score, weight: DEFAULT_WEIGHTS.wind * 100, description };
}

export function calculateCurrentRisk(ocean: OceanData): RiskComponent {
  const score = Math.round(scoreFromThreshold(ocean.currentSpeed, THRESHOLDS.current.safe, THRESHOLDS.current.moderate, THRESHOLDS.current.dangerous));
  let description = 'Normal current patterns';
  if (score < 40) description = 'Dangerous currents';
  else if (score < 60) description = 'Strong currents';
  else if (score < 80) description = 'Moderate currents';

  return { name: 'Current Risk', score, weight: DEFAULT_WEIGHTS.current * 100, description };
}

export function calculateStormRisk(weather: WeatherData): RiskComponent {
  const pressureScore = scoreFromInverseThreshold(weather.pressure, THRESHOLDS.pressure.normal, THRESHOLDS.pressure.low, THRESHOLDS.pressure.veryLow);
  const visibilityScore = scoreFromInverseThreshold(weather.visibility, THRESHOLDS.visibility.safe, THRESHOLDS.visibility.moderate, THRESHOLDS.visibility.dangerous);
  const rainPenalty = weather.rainfall > 10 ? 20 : weather.rainfall > 5 ? 10 : 0;

  const score = Math.round(Math.max(5, (pressureScore * 0.5 + visibilityScore * 0.5) - rainPenalty));
  let description = 'No storms expected';
  if (score < 40) description = 'Storm conditions likely';
  else if (score < 60) description = 'Unsettled weather';
  else if (score < 80) description = 'Generally stable atmosphere';

  return { name: 'Storm Risk', score, weight: DEFAULT_WEIGHTS.storm * 100, description };
}

export function calculateTrafficRisk(vesselCount: number = 15): RiskComponent {
  const score = Math.round(Math.max(10, 100 - vesselCount * 3));
  let description = 'Low vessel traffic';
  if (score < 40) description = 'Very high vessel traffic';
  else if (score < 60) description = 'High vessel traffic';
  else if (score < 80) description = 'Moderate vessel traffic';

  return { name: 'Traffic Risk', score, weight: DEFAULT_WEIGHTS.traffic * 100, description };
}

export function calculateSafetyScore(
  weather: WeatherData,
  waves: WaveData,
  ocean: OceanData,
  vesselCount: number = 15,
  weights: RiskWeights = DEFAULT_WEIGHTS,
): SafetyScore {
  const components: RiskComponent[] = [
    calculateWaveRisk(waves),
    calculateWindRisk(weather),
    calculateCurrentRisk(ocean),
    calculateStormRisk(weather),
    calculateTrafficRisk(vesselCount),
  ];

  const weightValues = [weights.wave, weights.wind, weights.current, weights.storm, weights.traffic];
  const overall = Math.round(
    components.reduce((sum, comp, i) => sum + comp.score * weightValues[i], 0)
  );

  let status: SafetyScore['status'] = 'SAFE';
  let label = 'Safe to Sail';
  if (overall < 30) { status = 'CRITICAL'; label = 'Extremely Dangerous'; }
  else if (overall < 50) { status = 'DANGEROUS'; label = 'Dangerous Conditions'; }
  else if (overall < 70) { status = 'MODERATE'; label = 'Moderate Risk'; }

  return { overall, status, label, components };
}
