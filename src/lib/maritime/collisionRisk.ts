// ============================================================
// JalSaathi Vessel Collision Risk Engine
// Classifies AIS targets based on CPA & TCPA safety thresholds,
// generating COLREGs-compliant decision support advisories.
// ============================================================

import { Vessel, Coordinates } from '@/types/marine';
import { calculateCPA, CPAResult } from './cpaCalculator';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CollisionRiskConfig {
  highRiskCpaNM: number;       // Default: 0.5 NM
  highRiskTcpaMin: number;     // Default: 15.0 min
  medRiskCpaNM: number;        // Default: 1.5 NM
  medRiskTcpaMin: number;      // Default: 30.0 min
}

export const DEFAULT_RISK_CONFIG: CollisionRiskConfig = {
  highRiskCpaNM: 0.5,
  highRiskTcpaMin: 15.0,
  medRiskCpaNM: 1.5,
  medRiskTcpaMin: 30.0,
};

export interface VesselCollisionAssessment {
  vessel: Vessel;
  cpaResult: CPAResult;
  riskLevel: RiskLevel;
  riskScore: number; // 0 (safest) to 100 (critical collision)
  alertMessage?: string;
  recommendedAction?: string;
}

export interface FleetCollisionReport {
  timestamp: string;
  totalVesselsAssessed: number;
  overallTrafficRisk: RiskLevel;
  highRiskCount: number;
  medRiskCount: number;
  lowRiskCount: number;
  assessments: VesselCollisionAssessment[];
  criticalAlerts: VesselCollisionAssessment[];
  disclaimer: string;
}

export const COLREGS_DISCLAIMER =
  'COLREGs Decision Support: Recommendations are for guidance only. Fishermen must always obey official COLREGs (Rule 8, 14, 15), maintain a proper lookout by sight and hearing, and use onboard radar and AIS.';

/**
 * Assesses collision risk for a single target vessel against own vessel
 */
export function assessVesselCollisionRisk(
  ownPos: Coordinates,
  ownSpeedKnots: number,
  ownHeadingDeg: number,
  targetVessel: Vessel,
  config: CollisionRiskConfig = DEFAULT_RISK_CONFIG
): VesselCollisionAssessment {
  const cpa = calculateCPA(ownPos, ownSpeedKnots, ownHeadingDeg, targetVessel);

  let riskLevel: RiskLevel = 'LOW';
  let riskScore = 10; // Base low risk

  if (!cpa.isDiverging && cpa.tcpaMinutes > 0) {
    if (cpa.cpaNM <= config.highRiskCpaNM && cpa.tcpaMinutes <= config.highRiskTcpaMin) {
      riskLevel = 'HIGH';
      riskScore = Math.min(100, Math.round(90 + (1 - cpa.cpaNM / config.highRiskCpaNM) * 10));
    } else if (cpa.cpaNM <= config.medRiskCpaNM && cpa.tcpaMinutes <= config.medRiskTcpaMin) {
      riskLevel = 'MEDIUM';
      riskScore = Math.min(85, Math.round(50 + (1 - cpa.cpaNM / config.medRiskCpaNM) * 35));
    } else if (cpa.cpaNM <= 3.0 && cpa.tcpaMinutes <= 45) {
      riskScore = Math.round(25 + (1 - cpa.cpaNM / 3.0) * 25);
    }
  }

  let alertMessage: string | undefined = undefined;
  let recommendedAction: string | undefined = undefined;

  if (riskLevel === 'HIGH') {
    alertMessage = `⚠️ HIGH COLLISION RISK: ${targetVessel.name} (${targetVessel.type}) detected ${cpa.distanceNM} NM ahead. CPA: ${cpa.cpaNM} NM in ${cpa.tcpaMinutes} min.`;

    // Determine COLREGs maneuver advice based on relative bearing
    if (cpa.relativeBearingDeg >= 340 || cpa.relativeBearingDeg <= 20) {
      recommendedAction = 'COLREGs Rule 14 (Head-on): Alter course to STARBOARD (Right) and reduce speed to give way.';
    } else if (cpa.relativeBearingDeg > 20 && cpa.relativeBearingDeg <= 112.5) {
      recommendedAction = 'COLREGs Rule 15 (Crossing): Target on Starboard side. Give way by altering course to Starboard or reducing speed.';
    } else if (cpa.relativeBearingDeg > 112.5 && cpa.relativeBearingDeg < 247.5) {
      recommendedAction = 'COLREGs Rule 13 (Overtaking): Stand on with caution, monitor target speed and distance.';
    } else {
      recommendedAction = 'COLREGs Rule 15 (Crossing): Target on Port side. Stand on with caution, prepare to alter course if target fails to give way.';
    }
  } else if (riskLevel === 'MEDIUM') {
    alertMessage = `⚡ CAUTION: ${targetVessel.name} passing at CPA ${cpa.cpaNM} NM in ${cpa.tcpaMinutes} min.`;
    recommendedAction = 'Maintain VHF Channel 16 watch and monitor AIS trajectory.';
  }

  return {
    vessel: targetVessel,
    cpaResult: cpa,
    riskLevel,
    riskScore,
    alertMessage,
    recommendedAction,
  };
}

/**
 * Evaluates collision risk across an entire fleet of AIS vessels
 */
export function evaluateFleetRisk(
  ownPos: Coordinates,
  ownSpeedKnots: number,
  ownHeadingDeg: number,
  vessels: Vessel[],
  config: CollisionRiskConfig = DEFAULT_RISK_CONFIG
): FleetCollisionReport {
  const assessments = vessels.map((v) =>
    assessVesselCollisionRisk(ownPos, ownSpeedKnots, ownHeadingDeg, v, config)
  );

  assessments.sort((a, b) => b.riskScore - a.riskScore);

  const highRisk = assessments.filter((a) => a.riskLevel === 'HIGH');
  const medRisk = assessments.filter((a) => a.riskLevel === 'MEDIUM');
  const lowRisk = assessments.filter((a) => a.riskLevel === 'LOW');

  const overallTrafficRisk: RiskLevel =
    highRisk.length > 0 ? 'HIGH' : medRisk.length > 0 ? 'MEDIUM' : 'LOW';

  return {
    timestamp: new Date().toISOString(),
    totalVesselsAssessed: vessels.length,
    overallTrafficRisk,
    highRiskCount: highRisk.length,
    medRiskCount: medRisk.length,
    lowRiskCount: lowRisk.length,
    assessments,
    criticalAlerts: [...highRisk, ...medRisk],
    disclaimer: COLREGS_DISCLAIMER,
  };
}
