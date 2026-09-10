// ============================================================
// JalSaathi — Maritime Geofencing & Boundary Safeguards Engine
// Real distance & boundary proximity calculation (Phase 9)
// ============================================================

import { Coordinates } from '@/types/marine';

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'IMBL' | 'MPA' | 'MILITARY_ZONE' | 'SHALLOW_REEF';
  center: Coordinates;
  radiusKm: number;
  advisory: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface GeofenceResult {
  status: 'INSIDE' | 'WARNING' | 'CLEAR';
  nearestZone: string;
  distanceKm: number;
  zoneType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NONE';
  advisory: string;
  isRestricted: boolean;
}

// Key Indian Maritime Restricted Zones & Boundaries
export const RESTRICTED_MARITIME_ZONES: GeofenceZone[] = [
  {
    id: 'imbl-gujarat-sircreek',
    name: 'IMBL — International Boundary (Sir Creek Corridor)',
    type: 'IMBL',
    center: { lat: 23.63, lon: 68.12 },
    radiusKm: 25,
    advisory: 'CRITICAL WARNING: Approaching International Boundary Line (IMBL). Cross-border fishing is strictly prohibited.',
    severity: 'CRITICAL',
  },
  {
    id: 'imbl-palk-strait',
    name: 'IMBL — Palk Strait Boundary (India / Sri Lanka)',
    type: 'IMBL',
    center: { lat: 9.85, lon: 79.55 },
    radiusKm: 20,
    advisory: 'CRITICAL WARNING: Approaching Palk Strait IMBL limit. Remain within Indian territorial waters.',
    severity: 'CRITICAL',
  },
  {
    id: 'mpa-gulf-of-kutch',
    name: 'Gulf of Kutch Marine National Park (Protected Sanctuary)',
    type: 'MPA',
    center: { lat: 22.45, lon: 69.80 },
    radiusKm: 18,
    advisory: 'ECOLOGICAL ADVISORY: Marine National Park boundary. Commercial trawling and anchoring prohibited.',
    severity: 'HIGH',
  },
  {
    id: 'mpa-sundarbans',
    name: 'Sundarbans Biosphere Reserve & Estuarine Sanctuary',
    type: 'MPA',
    center: { lat: 21.65, lon: 88.80 },
    radiusKm: 30,
    advisory: 'ECOLOGICAL ADVISORY: Protected Tiger & Marine Biosphere. Fishing restricted to authorized buffer zones.',
    severity: 'HIGH',
  },
  {
    id: 'military-mumbai-naval',
    name: 'Mumbai High Offshore & Naval Security Zone',
    type: 'MILITARY_ZONE',
    center: { lat: 19.40, lon: 71.30 },
    radiusKm: 22,
    advisory: 'SECURITY ADVISORY: Offshore Oil Platform Security Perimeter. Maintain minimum 5 nm clearance.',
    severity: 'HIGH',
  },
  {
    id: 'reef-angria-bank',
    name: 'Angria Bank Submerged Coral Atoll & Shallow Reef',
    type: 'SHALLOW_REEF',
    center: { lat: 16.65, lon: 72.10 },
    radiusKm: 15,
    advisory: 'NAVIGATIONAL HAZARD: Shallow submerged coral reef (depth < 8m). High risk of grounding for vessels with >3m draft.',
    severity: 'MEDIUM',
  },
];

/**
 * Calculates Great-Circle Haversine distance between two lat/lon points in kilometers.
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lon - coord1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Evaluates position against restricted zones and returns proximity status.
 */
export function checkGeofenceProximity(
  location: Coordinates,
  warningBufferKm = 15
): GeofenceResult {
  let closestZone: GeofenceZone | null = null;
  let minDistance = Infinity;

  for (const zone of RESTRICTED_MARITIME_ZONES) {
    const dist = calculateHaversineDistance(location, zone.center);
    if (dist < minDistance) {
      minDistance = dist;
      closestZone = zone;
    }
  }

  if (!closestZone) {
    return {
      status: 'CLEAR',
      nearestZone: 'None',
      distanceKm: 999,
      zoneType: 'OPEN_SEA',
      severity: 'NONE',
      advisory: 'Operational area clear of restricted maritime zones.',
      isRestricted: false,
    };
  }

  // Inside restricted zone radius
  if (minDistance <= closestZone.radiusKm) {
    return {
      status: 'INSIDE',
      nearestZone: closestZone.name,
      distanceKm: +minDistance.toFixed(1),
      zoneType: closestZone.type,
      severity: closestZone.severity,
      advisory: closestZone.advisory,
      isRestricted: true,
    };
  }

  // Approaching restricted zone buffer
  const distanceToBoundary = minDistance - closestZone.radiusKm;
  if (distanceToBoundary <= warningBufferKm) {
    return {
      status: 'WARNING',
      nearestZone: closestZone.name,
      distanceKm: +distanceToBoundary.toFixed(1),
      zoneType: closestZone.type,
      severity: closestZone.severity,
      advisory: `APPROACHING RESTRICTED AREA (${closestZone.name}) — ${distanceToBoundary.toFixed(1)} km to boundary. ${closestZone.advisory}`,
      isRestricted: true,
    };
  }

  return {
    status: 'CLEAR',
    nearestZone: closestZone.name,
    distanceKm: +distanceToBoundary.toFixed(1),
    zoneType: closestZone.type,
    severity: 'NONE',
    advisory: `Position verified clear. Nearest restricted area (${closestZone.name}) is ${distanceToBoundary.toFixed(1)} km away.`,
    isRestricted: false,
  };
}
