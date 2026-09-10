// ============================================================
// JalSaathi Maritime Mathematics — CPA / TCPA Collision Calculator
// Calculates Closest Point of Approach (CPA) and Time to CPA (TCPA)
// using 2D nautical vector kinematics and Haversine projection.
// ============================================================

import { Coordinates, Vessel } from '@/types/marine';

export interface CPAResult {
  vesselId: string;
  vesselName: string;
  vesselType: string;
  distanceKm: number;
  distanceNM: number;
  bearingDeg: number;
  relativeBearingDeg: number;
  cpaNM: number;
  tcpaMinutes: number;
  isDiverging: boolean;
  ownPositionAtCPA: Coordinates;
  targetPositionAtCPA: Coordinates;
}

const KM_PER_NM = 1.852;
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Calculates Haversine distance between two coordinates in kilometers and nautical miles
 */
export function calculateHaversineDistance(p1: Coordinates, p2: Coordinates): { km: number; nm: number } {
  const R = 6371; // Earth radius in km
  const dLat = (p2.lat - p1.lat) * DEG_TO_RAD;
  const dLon = (p2.lon - p1.lon) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * DEG_TO_RAD) * Math.cos(p2.lat * DEG_TO_RAD) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  const nm = km / KM_PER_NM;
  return { km: +km.toFixed(2), nm: +nm.toFixed(2) };
}

/**
 * Calculates initial true bearing from p1 to p2 in degrees (0..360)
 */
export function calculateBearing(p1: Coordinates, p2: Coordinates): number {
  const y = Math.sin((p2.lon - p1.lon) * DEG_TO_RAD) * Math.cos(p2.lat * DEG_TO_RAD);
  const x =
    Math.cos(p1.lat * DEG_TO_RAD) * Math.sin(p2.lat * DEG_TO_RAD) -
    Math.sin(p1.lat * DEG_TO_RAD) * Math.cos(p2.lat * DEG_TO_RAD) * Math.cos((p2.lon - p1.lon) * DEG_TO_RAD);
  let brng = Math.atan2(y, x) * RAD_TO_DEG;
  brng = (brng + 360) % 360;
  return +brng.toFixed(1);
}

/**
 * Computes CPA (Nautical Miles) and TCPA (Minutes) for target vessel relative to own vessel
 */
export function calculateCPA(
  ownPos: Coordinates,
  ownSpeedKnots: number,
  ownHeadingDeg: number,
  targetVessel: Vessel
): CPAResult {
  const dist = calculateHaversineDistance(ownPos, targetVessel.position);
  const bearing = calculateBearing(ownPos, targetVessel.position);

  // Relative bearing (0..360, relative to own heading)
  const relBearing = (bearing - ownHeadingDeg + 360) % 360;

  // Convert GPS positions to Cartesian offset relative to own vessel in NM
  // 1 degree latitude ~= 60 NM; 1 degree longitude ~= 60 * cos(lat) NM
  const avgLatRad = (ownPos.lat + targetVessel.position.lat) / 2 * DEG_TO_RAD;
  const dx = (targetVessel.position.lon - ownPos.lon) * 60 * Math.cos(avgLatRad); // East-West offset in NM
  const dy = (targetVessel.position.lat - ownPos.lat) * 60;                        // North-South offset in NM

  // Velocity vectors in knots (NM/hour)
  const ownVx = ownSpeedKnots * Math.sin(ownHeadingDeg * DEG_TO_RAD);
  const ownVy = ownSpeedKnots * Math.cos(ownHeadingDeg * DEG_TO_RAD);

  const targetHeading = targetVessel.heading || 0;
  const targetSpeed = targetVessel.speed || 0;
  const targetVx = targetSpeed * Math.sin(targetHeading * DEG_TO_RAD);
  const targetVy = targetSpeed * Math.cos(targetHeading * DEG_TO_RAD);

  // Relative velocity vector (target velocity relative to own vessel)
  const dVx = targetVx - ownVx;
  const dVy = targetVy - ownVy;

  const relSpeedSq = dVx * dVx + dVy * dVy;

  let tcpaHours = 0;
  let cpaNM = dist.nm;
  let isDiverging = false;

  if (relSpeedSq > 0.0001) {
    // TCPA = - (dx * dVx + dy * dVy) / (relSpeedSq)
    tcpaHours = -(dx * dVx + dy * dVy) / relSpeedSq;

    if (tcpaHours < 0) {
      isDiverging = true;
      cpaNM = dist.nm; // Distance is increasing
    } else {
      // Position offset at CPA
      const cpaDx = dx + dVx * tcpaHours;
      const cpaDy = dy + dVy * tcpaHours;
      cpaNM = Math.sqrt(cpaDx * cpaDx + cpaDy * cpaDy);
    }
  }

  const tcpaMinutes = +(tcpaHours * 60).toFixed(1);
  cpaNM = +cpaNM.toFixed(2);

  // Forecast positions at CPA
  const ownCpaLat = ownPos.lat + (ownVy * tcpaHours) / 60;
  const ownCpaLon = ownPos.lon + (ownVx * tcpaHours) / (60 * Math.cos(avgLatRad));

  const targetCpaLat = targetVessel.position.lat + (targetVy * tcpaHours) / 60;
  const targetCpaLon = targetVessel.position.lon + (targetVx * tcpaHours) / (60 * Math.cos(avgLatRad));

  return {
    vesselId: targetVessel.id,
    vesselName: targetVessel.name,
    vesselType: targetVessel.type,
    distanceKm: dist.km,
    distanceNM: dist.nm,
    bearingDeg: bearing,
    relativeBearingDeg: +relBearing.toFixed(1),
    cpaNM,
    tcpaMinutes,
    isDiverging,
    ownPositionAtCPA: { lat: +ownCpaLat.toFixed(4), lon: +ownCpaLon.toFixed(4) },
    targetPositionAtCPA: { lat: +targetCpaLat.toFixed(4), lon: +targetCpaLon.toFixed(4) },
  };
}
