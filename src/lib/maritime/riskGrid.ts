// ============================================================
// JalSaathi Maritime Risk Grid Generator
// Builds a 2D spatial grid evaluating traffic, weather, wave,
// ocean current, and restricted area risks for A* pathfinding.
// ============================================================

import { Coordinates, Vessel } from '@/types/marine';
import { calculateHaversineDistance } from './cpaCalculator';

export interface GridWeights {
  trafficWeight: number;      // Default: 0.35
  weatherWeight: number;      // Default: 0.20
  waveWeight: number;         // Default: 0.15
  currentWeight: number;      // Default: 0.10
  restrictedWeight: number;    // Default: 0.20
}

export const DEFAULT_GRID_WEIGHTS: GridWeights = {
  trafficWeight: 0.35,
  weatherWeight: 0.20,
  waveWeight: 0.15,
  currentWeight: 0.10,
  restrictedWeight: 0.20,
};

export interface GridNode {
  id: string;
  lat: number;
  lon: number;
  trafficRisk: number;     // 0 (safe) to 1 (high risk)
  weatherRisk: number;     // 0 to 1
  waveRisk: number;        // 0 to 1
  currentRisk: number;     // 0 to 1
  restrictedRisk: number;  // 0 to 1 (1 = prohibited polygon)
  totalRisk: number;       // Weighted composite risk (0..1)
  isBlocked: boolean;      // True if inside restricted zone or land
}

export interface PolygonArea {
  id: string;
  name: string;
  type: 'naval' | 'coastline' | 'shallow' | 'protected';
  coordinates: Coordinates[];
}

/**
 * Checks if a point is inside a polygon using ray-casting algorithm
 */
export function isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lon;
    const xj = polygon[j].lat, yj = polygon[j].lon;

    const intersect =
      (yi > point.lon) !== (yj > point.lon) &&
      point.lat < ((xj - xi) * (point.lon - yi)) / (yj - yi + 0.00001) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Known naval & military restricted zones around Indian Coasts
 */
export const RESTRICTED_MARITIME_ZONES: PolygonArea[] = [
  {
    id: 'mumbai_naval_zone',
    name: 'Naval Defence Zone (Mumbai High)',
    type: 'naval',
    coordinates: [
      { lat: 18.96, lon: 72.90 },
      { lat: 18.95, lon: 72.97 },
      { lat: 18.82, lon: 72.96 },
      { lat: 18.83, lon: 72.89 },
    ],
  },
  {
    id: 'vizag_naval_base',
    name: 'Visakhapatnam Naval Exercise Zone',
    type: 'naval',
    coordinates: [
      { lat: 17.72, lon: 83.30 },
      { lat: 17.70, lon: 83.38 },
      { lat: 17.60, lon: 83.35 },
      { lat: 17.62, lon: 83.27 },
    ],
  },
];

/**
 * Computes composite risk for a specific lat/lon node
 */
export function evaluateNodeRisk(
  coord: Coordinates,
  vessels: Vessel[],
  restrictedZones: PolygonArea[] = RESTRICTED_MARITIME_ZONES,
  weights: GridWeights = DEFAULT_GRID_WEIGHTS
): GridNode {
  // 1. Traffic Risk: Compute influence from nearby vessels
  let trafficSum = 0;
  vessels.forEach((v) => {
    const dist = calculateHaversineDistance(coord, v.position).nm;
    if (dist < 3.0) {
      // Exponential decay within 3 NM radius
      const risk = Math.exp(-dist / 0.8) * (v.speed > 10 ? 1.2 : 1.0);
      trafficSum += risk;
    }
  });
  const trafficRisk = Math.min(1.0, trafficSum);

  // 2. Weather & Ocean Swell Risk (Normalized 0..1)
  const weatherRisk = 0.25; // Moderate coastal wind baseline
  const waveRisk = 0.30;    // 1.8m swell baseline
  const currentRisk = 0.15; // 1.2 knot surface current

  // 3. Restricted Polygon Check
  let isBlocked = false;
  let restrictedRisk = 0;

  for (const zone of restrictedZones) {
    if (isPointInPolygon(coord, zone.coordinates)) {
      isBlocked = true;
      restrictedRisk = 1.0;
      break;
    }
  }

  const totalRisk = isBlocked
    ? 1.0
    : weights.trafficWeight * trafficRisk +
      weights.weatherWeight * weatherRisk +
      weights.waveWeight * waveRisk +
      weights.currentWeight * currentRisk +
      weights.restrictedWeight * restrictedRisk;

  return {
    id: `${coord.lat.toFixed(3)}_${coord.lon.toFixed(3)}`,
    lat: coord.lat,
    lon: coord.lon,
    trafficRisk,
    weatherRisk,
    waveRisk,
    currentRisk,
    restrictedRisk,
    totalRisk: +totalRisk.toFixed(3),
    isBlocked,
  };
}
