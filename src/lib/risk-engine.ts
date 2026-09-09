// ============================================================
// ORCA Deterministic Marine Risk Engine (Phase 3)
// ============================================================

import { SafetyScore, RiskComponent, RiskWeights, WeatherData, WaveData, OceanData } from '@/types/marine';

export interface RiskConfig {
  weights: {
    wave: number;
    wind: number;
    current: number;
    storm: number;
    traffic: number;
    geofence: number;
  };
  thresholds: {
    wave: { safe: number; moderate: number; dangerous: number; extreme: number };
    wind: { safe: number; moderate: number; dangerous: number; extreme: number };
    current: { safe: number; moderate: number; dangerous: number };
    visibility: { safe: number; moderate: number; dangerous: number };
    pressure: { normal: number; low: number; veryLow: number };
  };
}

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  weights: {
    wave: 0.30,
    wind: 0.25,
    current: 0.15,
    storm: 0.15,
    traffic: 0.05,
    geofence: 0.10,
  },
  thresholds: {
    wave: { safe: 1.5, moderate: 2.5, dangerous: 4.0, extreme: 5.5 },
    wind: { safe: 20, moderate: 35, dangerous: 50, extreme: 65 },
    current: { safe: 1.5, moderate: 2.5, dangerous: 4.0 },
    visibility: { safe: 8, moderate: 5, dangerous: 2 },
    pressure: { normal: 1010, low: 1005, veryLow: 998 },
  },
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

// Contract Input / Output Interfaces
export interface MarineRiskInput {
  location?: { lat: number; lon: number };
  waveHeight?: number;
  windSpeed?: number;
  rainfall?: number;
  visibility?: number;
  pressure?: number;
  currentSpeed?: number;
  vesselCount?: number;
  hasCycloneAlert?: boolean;
  hasLightningAlert?: boolean;
  isRestrictedZone?: boolean;
}

export type RiskStatus = 'SAFE' | 'CAUTION' | 'HIGH_RISK' | 'AVOID';

export interface MarineRiskOutput {
  score: number;
  status: RiskStatus;
  factors: Array<{ name: string; score: number; weight: number; description: string }>;
  confidence: number;
}

export function calculateWaveRisk(waves: Pick<WaveData, 'height'>, config: RiskConfig = DEFAULT_RISK_CONFIG): RiskComponent {
  const score = Math.round(scoreFromThreshold(waves.height, config.thresholds.wave.safe, config.thresholds.wave.moderate, config.thresholds.wave.dangerous));
  let description = 'Calm seas';
  if (score < 40) description = 'Dangerous wave conditions';
  else if (score < 60) description = 'Rough wave conditions';
  else if (score < 80) description = 'Moderate wave conditions';

  return { name: 'Wave Risk', score, weight: config.weights.wave * 100, description };
}

export function calculateWindRisk(weather: Pick<WeatherData, 'windSpeed'>, config: RiskConfig = DEFAULT_RISK_CONFIG): RiskComponent {
  const score = Math.round(scoreFromThreshold(weather.windSpeed, config.thresholds.wind.safe, config.thresholds.wind.moderate, config.thresholds.wind.dangerous));
  let description = 'Light winds';
  if (score < 40) description = 'Dangerous wind conditions';
  else if (score < 60) description = 'Strong winds';
  else if (score < 80) description = 'Manageable wind speeds';

  return { name: 'Wind Risk', score, weight: config.weights.wind * 100, description };
}

export function calculateCurrentRisk(ocean: Pick<OceanData, 'currentSpeed'>, config: RiskConfig = DEFAULT_RISK_CONFIG): RiskComponent {
  const score = Math.round(scoreFromThreshold(ocean.currentSpeed, config.thresholds.current.safe, config.thresholds.current.moderate, config.thresholds.current.dangerous));
  let description = 'Normal current patterns';
  if (score < 40) description = 'Dangerous currents';
  else if (score < 60) description = 'Strong currents';
  else if (score < 80) description = 'Moderate currents';

  return { name: 'Current Risk', score, weight: config.weights.current * 100, description };
}

export function calculateStormRisk(weather: Pick<WeatherData, 'pressure' | 'visibility' | 'rainfall'>, config: RiskConfig = DEFAULT_RISK_CONFIG): RiskComponent {
  const pressureScore = scoreFromInverseThreshold(weather.pressure, config.thresholds.pressure.normal, config.thresholds.pressure.low, config.thresholds.pressure.veryLow);
  const visibilityScore = scoreFromInverseThreshold(weather.visibility, config.thresholds.visibility.safe, config.thresholds.visibility.moderate, config.thresholds.visibility.dangerous);
  const rainPenalty = weather.rainfall > 10 ? 20 : weather.rainfall > 5 ? 10 : 0;

  const score = Math.round(Math.max(5, (pressureScore * 0.5 + visibilityScore * 0.5) - rainPenalty));
  let description = 'No storms expected';
  if (score < 40) description = 'Storm conditions likely';
  else if (score < 60) description = 'Unsettled weather';
  else if (score < 80) description = 'Generally stable atmosphere';

  return { name: 'Storm Risk', score, weight: config.weights.storm * 100, description };
}

export function calculateTrafficRisk(vesselCount: number = 15, config: RiskConfig = DEFAULT_RISK_CONFIG): RiskComponent {
  const score = Math.round(Math.max(10, 100 - vesselCount * 3));
  let description = 'Low vessel traffic';
  if (score < 40) description = 'Very high vessel traffic';
  else if (score < 60) description = 'High vessel traffic';
  else if (score < 80) description = 'Moderate vessel traffic';

  return { name: 'Traffic Risk', score, weight: config.weights.traffic * 100, description };
}

// Contract-aligned deterministic marine risk calculation
export function calculateMarineRisk(input: MarineRiskInput, config: RiskConfig = DEFAULT_RISK_CONFIG): MarineRiskOutput {
  const factors: MarineRiskOutput['factors'] = [];
  let confidence = 100;
  let totalWeight = 0;
  let weightedScore = 0;

  // Wave Risk
  if (typeof input.waveHeight === 'number') {
    const wave = calculateWaveRisk({ height: input.waveHeight }, config);
    factors.push(wave);
    weightedScore += wave.score * config.weights.wave;
    totalWeight += config.weights.wave;
  } else {
    confidence -= 25;
  }

  // Wind Risk
  if (typeof input.windSpeed === 'number') {
    const wind = calculateWindRisk({ windSpeed: input.windSpeed }, config);
    factors.push(wind);
    weightedScore += wind.score * config.weights.wind;
    totalWeight += config.weights.wind;
  } else {
    confidence -= 25;
  }

  // Current Risk
  if (typeof input.currentSpeed === 'number') {
    const current = calculateCurrentRisk({ currentSpeed: input.currentSpeed }, config);
    factors.push(current);
    weightedScore += current.score * config.weights.current;
    totalWeight += config.weights.current;
  } else {
    confidence -= 20;
  }

  // Storm / Weather Risk
  if (typeof input.pressure === 'number' || typeof input.visibility === 'number' || typeof input.rainfall === 'number') {
    const storm = calculateStormRisk({
      pressure: input.pressure ?? 1010,
      visibility: input.visibility ?? 10,
      rainfall: input.rainfall ?? 0,
    }, config);
    factors.push(storm);
    weightedScore += storm.score * config.weights.storm;
    totalWeight += config.weights.storm;
  } else {
    confidence -= 15;
  }

  // Traffic Risk
  if (typeof input.vesselCount === 'number') {
    const traffic = calculateTrafficRisk(input.vesselCount, config);
    factors.push(traffic);
    weightedScore += traffic.score * config.weights.traffic;
    totalWeight += config.weights.traffic;
  } else {
    confidence -= 15;
  }

  // Geofence / Boundary Risk
  const isRestricted = Boolean(input.isRestrictedZone);
  const geofenceScore = isRestricted ? 0 : 95;
  factors.push({
    name: 'Geofence Status',
    score: geofenceScore,
    weight: config.weights.geofence * 100,
    description: isRestricted ? 'Inside restricted/prohibited waters' : 'Clear of restricted waters',
  });
  weightedScore += geofenceScore * config.weights.geofence;
  totalWeight += config.weights.geofence;

  // Final score calculation
  const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;
  confidence = Math.max(10, Math.min(100, confidence));

  // Determine base status
  let status: RiskStatus = 'SAFE';
  if (score < 35) status = 'AVOID';
  else if (score < 55) status = 'HIGH_RISK';
  else if (score < 75) status = 'CAUTION';

  // Low confidence penalty (incomplete inputs must not pass as plain SAFE)
  if (confidence < 60 && status === 'SAFE') {
    status = 'CAUTION';
  }

  // Override triggers for critical hazards
  const isDangerousWaves = typeof input.waveHeight === 'number' && input.waveHeight >= config.thresholds.wave.dangerous;
  const isDangerousWind = typeof input.windSpeed === 'number' && input.windSpeed >= config.thresholds.wind.dangerous;

  if (input.hasCycloneAlert || (typeof input.waveHeight === 'number' && input.waveHeight >= config.thresholds.wave.extreme)) {
    status = 'AVOID';
  } else if (isRestricted || input.hasLightningAlert || isDangerousWaves || isDangerousWind || (typeof input.windSpeed === 'number' && input.windSpeed >= config.thresholds.wind.extreme)) {
    if (status !== 'AVOID') status = 'HIGH_RISK';
  }

  return { score, status, factors, confidence };
}

// Backward compatibility function
export function calculateSafetyScore(
  weather: Pick<WeatherData, 'windSpeed' | 'pressure' | 'visibility' | 'rainfall'>,
  waves: Pick<WaveData, 'height'>,
  ocean: Pick<OceanData, 'currentSpeed'>,
  vesselCount: number = 15,
  weights: RiskWeights = { wave: 0.30, wind: 0.25, current: 0.15, storm: 0.20, traffic: 0.10 },
): SafetyScore {
  const result = calculateMarineRisk({
    waveHeight: waves.height,
    windSpeed: weather.windSpeed,
    pressure: weather.pressure,
    visibility: weather.visibility,
    rainfall: weather.rainfall,
    currentSpeed: ocean.currentSpeed,
    vesselCount,
  });

  const legacyStatus: SafetyScore['status'] =
    result.status === 'SAFE' ? 'SAFE' :
    result.status === 'CAUTION' ? 'MODERATE' :
    result.status === 'HIGH_RISK' ? 'DANGEROUS' : 'CRITICAL';

  const label =
    result.status === 'SAFE' ? 'Safe to Sail' :
    result.status === 'CAUTION' ? 'Moderate Risk' :
    result.status === 'HIGH_RISK' ? 'Dangerous Conditions' : 'Extremely Dangerous (AVOID)';

  return {
    overall: result.score,
    status: legacyStatus,
    label,
    components: result.factors,
  };
}
