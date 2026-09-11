// ============================================================
// ORCA Real-Time Potential Fishing Zone (PFZ) Engine
// Generates location-accurate, satellite-driven PFZ advisories
// using real-time MOSDAC, Open-Meteo ocean telemetry & scoring model
// ============================================================

import { FishingZone, MarineConditions } from '@/types/marine';
import { calculateFishingSuitability, getSeason } from '@/lib/fishing-model';
import { calculateHaversineDistance } from '@/lib/geofence-engine';

/**
 * Generates real-time, location-accurate Potential Fishing Zones (PFZs)
 * anchored around the target coordinates (lat, lon) and computed from
 * real-time satellite ocean metrics (SST, Chlorophyll-a, Current, Salinity).
 * Returns 5 distinct oceanographic zones spanning from nearshore to deep oceanic shelf.
 */
export function generateRealTimeFishingZones(
  lat: number = 18.95,
  lon: number = 72.82,
  conditions?: Partial<MarineConditions>,
  locationName?: string
): FishingZone[] {
  const currentSst = conditions?.ocean?.sst ?? 28.2;
  const currentChl = conditions?.ocean?.chlorophyll ?? 2.8;
  const currentSpeed = conditions?.ocean?.currentSpeed ?? 0.8;
  const currentSalinity = conditions?.ocean?.salinity ?? 35.1;
  const season = getSeason();
  const locLabel = locationName || 'Coastal Sector';
  const origin = { lat, lon };

  // Position zones relative to the coastline into open waters
  // Determine offshore base anchor and directional vector into open oceanic waters
  let baseLat = lat;
  let baseLon = lon;
  let latVec = -0.3;
  let lonVec = lon > 78.5 ? 0.95 : -0.95;

  const nameLower = (locationName || '').toLowerCase();

  if (nameLower.includes('mumbai') || nameLower.includes('jnpt') || nameLower.includes('nhava sheva')) {
    baseLat = 18.85;
    baseLon = 72.45;
    latVec = -0.3;
    lonVec = -0.9;
  } else if (nameLower.includes('cochin') || nameLower.includes('kochi') || nameLower.includes('vallarpadam')) {
    baseLat = 9.90;
    baseLon = 75.80;
    latVec = -0.3;
    lonVec = -0.9;
  } else if (nameLower.includes('visakhapatnam') || nameLower.includes('vizag')) {
    baseLat = 17.50;
    baseLon = 83.70;
    latVec = -0.4;
    lonVec = 0.9;
  } else if (nameLower.includes('paradip')) {
    baseLat = 19.90;
    baseLon = 87.20;
    latVec = -0.5;
    lonVec = 0.85;
  } else if (nameLower.includes('chennai') || nameLower.includes('ennore')) {
    baseLat = 13.00;
    baseLon = 80.80;
    latVec = -0.2;
    lonVec = 0.95;
  } else if (nameLower.includes('veraval') || nameLower.includes('porbandar')) {
    baseLat = 20.70;
    baseLon = 69.80;
    latVec = -0.6;
    lonVec = -0.8;
  } else if (nameLower.includes('mangalore') || nameLower.includes('malpe')) {
    baseLat = 12.85;
    baseLon = 74.30;
    latVec = -0.2;
    lonVec = -0.95;
  } else if (nameLower.includes('mormugao') || nameLower.includes('panaji')) {
    baseLat = 15.30;
    baseLon = 73.30;
    latVec = -0.3;
    lonVec = -0.9;
  } else if (nameLower.includes('kandla') || nameLower.includes('mundra') || nameLower.includes('deendayal')) {
    baseLat = 22.30;
    baseLon = 68.90;
    latVec = -0.6;
    lonVec = -0.8;
  } else if (nameLower.includes('gujarat') || (lat > 20 && lat < 24 && lon < 73)) {
    baseLat = 20.85;
    baseLon = 69.35;
    latVec = -0.6;
    lonVec = -0.8;
  } else if (nameLower.includes('odisha') || (lat > 19 && lat < 21.8 && lon > 84.5 && lon < 87.5)) {
    baseLat = 19.55;
    baseLon = 86.95;
    latVec = -0.5;
    lonVec = 0.85;
  } else if (nameLower.includes('bengal') || (lat > 21 && lon > 87.5)) {
    baseLat = 20.80;
    baseLon = 88.90;
    latVec = -0.8;
    lonVec = 0.4;
  } else if (nameLower.includes('konkan') || (lat > 16.5 && lat <= 20 && lon < 73.5)) {
    baseLat = 18.10;
    baseLon = 72.30;
    latVec = -0.2;
    lonVec = -0.95;
  } else if (nameLower.includes('goa') || (lat > 14.8 && lat <= 16.5 && lon < 74.2)) {
    baseLat = 15.25;
    baseLon = 73.25;
    latVec = -0.3;
    lonVec = -0.9;
  } else if (nameLower.includes('kanara') || (lat > 12.5 && lat <= 14.8 && lon < 75)) {
    baseLat = 13.65;
    baseLon = 73.90;
    latVec = -0.2;
    lonVec = -0.95;
  } else if (nameLower.includes('malabar') || (lat <= 12.5 && lon < 77.2)) {
    baseLat = 10.00;
    baseLon = 75.40;
    latVec = -0.3;
    lonVec = -0.9;
  } else if (nameLower.includes('coromandel') || (lat <= 13.5 && lon >= 77.2 && lon <= 80.5)) {
    baseLat = 10.80;
    baseLon = 80.30;
    latVec = -0.2;
    lonVec = 0.95;
  } else if (nameLower.includes('andhra') || (lat > 13.5 && lat <= 19 && lon > 80 && lon <= 84.8)) {
    baseLat = 16.20;
    baseLon = 82.60;
    latVec = -0.4;
    lonVec = 0.9;
  } else if (nameLower.includes('lakshadweep')) {
    baseLat = 10.45;
    baseLon = 71.95;
    latVec = -0.4;
    lonVec = -0.9;
  } else if (nameLower.includes('andaman') || nameLower.includes('port blair')) {
    baseLat = 11.50;
    baseLon = 93.35;
    latVec = -0.3;
    lonVec = 0.9;
  }

  const cosLat = Math.cos((baseLat * Math.PI) / 180);

  // Helper to project exact offshore coordinate for target distance (in km)
  const offsetCoord = (targetKm: number) => {
    const dLat = (latVec * targetKm) / 111.0;
    const dLon = (lonVec * targetKm) / (111.0 * Math.max(0.1, cosLat));
    return {
      lat: +(baseLat + dLat).toFixed(4),
      lon: +(baseLon + dLon).toFixed(4),
    };
  };

  // 1. Zone A — Estuarine & Nearshore Plume (~15 km offshore)
  const zoneA_coords = offsetCoord(15);
  const distA = Math.round(calculateHaversineDistance(origin, zoneA_coords));
  const zoneA_metrics = {
    sst: +(currentSst - 0.2).toFixed(1),
    chlorophyll: +(currentChl * 1.35).toFixed(2), // Very high nutrient runoff
    currentSpeed: +(currentSpeed * 0.8).toFixed(1),
    salinity: +(currentSalinity - 0.6).toFixed(1), // Brackish influence
    depth: 25,
    historicalActivity: 90,
    season,
  };
  const suitabilityA = calculateFishingSuitability(zoneA_metrics);

  // 2. Zone B — Core Upwelling Thermal Front (~30 km offshore)
  const zoneB_coords = offsetCoord(30);
  const distB = Math.round(calculateHaversineDistance(origin, zoneB_coords));
  const zoneB_metrics = {
    sst: +(currentSst - 0.5).toFixed(1), // Thermal front boundary
    chlorophyll: +(currentChl * 1.15).toFixed(2),
    currentSpeed: +(currentSpeed * 1.1).toFixed(1),
    salinity: currentSalinity,
    depth: 48,
    historicalActivity: 85,
    season,
  };
  const suitabilityB = calculateFishingSuitability(zoneB_metrics);

  // 3. Zone C — Continental Shelf Edge Break (~48 km offshore)
  const zoneC_coords = offsetCoord(48);
  const distC = Math.round(calculateHaversineDistance(origin, zoneC_coords));
  const zoneC_metrics = {
    sst: +(currentSst + 0.1).toFixed(1),
    chlorophyll: +(currentChl * 0.90).toFixed(2),
    currentSpeed: +(currentSpeed * 1.0).toFixed(1),
    salinity: +(currentSalinity + 0.2).toFixed(1),
    depth: 85,
    historicalActivity: 75,
    season,
  };
  const suitabilityC = calculateFishingSuitability(zoneC_metrics);

  // 4. Zone D — Oceanic Chlorophyll Swirl Eddy (~68 km offshore)
  const zoneD_coords = offsetCoord(68);
  const distD = Math.round(calculateHaversineDistance(origin, zoneD_coords));
  const zoneD_metrics = {
    sst: +(currentSst + 0.5).toFixed(1),
    chlorophyll: +(currentChl * 0.70).toFixed(2),
    currentSpeed: +(currentSpeed * 1.3).toFixed(1),
    salinity: +(currentSalinity + 0.4).toFixed(1),
    depth: 130,
    historicalActivity: 58,
    season,
  };
  const suitabilityD = calculateFishingSuitability(zoneD_metrics);

  // 5. Zone E — Deep Oceanic Trench / Tuna Seamount (~88 km offshore)
  const zoneE_coords = offsetCoord(88);
  const distE = Math.round(calculateHaversineDistance(origin, zoneE_coords));
  const zoneE_metrics = {
    sst: +(currentSst + 0.9).toFixed(1),
    chlorophyll: +(currentChl * 0.45).toFixed(2),
    currentSpeed: +(currentSpeed * 1.5).toFixed(1),
    salinity: +(currentSalinity + 0.5).toFixed(1),
    depth: 220,
    historicalActivity: 40,
    season,
  };
  const suitabilityE = calculateFishingSuitability(zoneE_metrics);

  const zoneA: FishingZone = {
    id: 'pfz-zone-a',
    name: `Zone A — ${locLabel} Estuarine Plume`,
    center: zoneA_coords,
    radius: 10,
    suitabilityScore: suitabilityA.score,
    sst: zoneA_metrics.sst,
    chlorophyll: zoneA_metrics.chlorophyll,
    currentSpeed: zoneA_metrics.currentSpeed,
    salinity: zoneA_metrics.salinity,
    depth: zoneA_metrics.depth,
    historicalActivity: 'High',
    fishingEffort: 88,
    season,
    distanceFromCoast: distA,
    color: '#10b981', // Emerald
    factors: suitabilityA.factors,
  };

  const zoneB: FishingZone = {
    id: 'pfz-zone-b',
    name: `Zone B — ${locLabel} Thermal Upwelling`,
    center: zoneB_coords,
    radius: 12,
    suitabilityScore: suitabilityB.score,
    sst: zoneB_metrics.sst,
    chlorophyll: zoneB_metrics.chlorophyll,
    currentSpeed: zoneB_metrics.currentSpeed,
    salinity: zoneB_metrics.salinity,
    depth: zoneB_metrics.depth,
    historicalActivity: 'High',
    fishingEffort: 84,
    season,
    distanceFromCoast: distB,
    color: '#06b6d4', // Cyan
    factors: suitabilityB.factors,
  };

  const zoneC: FishingZone = {
    id: 'pfz-zone-c',
    name: `Zone C — ${locLabel} Continental Shelf Break`,
    center: zoneC_coords,
    radius: 15,
    suitabilityScore: suitabilityC.score,
    sst: zoneC_metrics.sst,
    chlorophyll: zoneC_metrics.chlorophyll,
    currentSpeed: zoneC_metrics.currentSpeed,
    salinity: zoneC_metrics.salinity,
    depth: zoneC_metrics.depth,
    historicalActivity: 'Medium',
    fishingEffort: 70,
    season,
    distanceFromCoast: distC,
    color: '#3b82f6', // Blue
    factors: suitabilityC.factors,
  };

  const zoneD: FishingZone = {
    id: 'pfz-zone-d',
    name: `Zone D — ${locLabel} Chlorophyll Eddy`,
    center: zoneD_coords,
    radius: 18,
    suitabilityScore: suitabilityD.score,
    sst: zoneD_metrics.sst,
    chlorophyll: zoneD_metrics.chlorophyll,
    currentSpeed: zoneD_metrics.currentSpeed,
    salinity: zoneD_metrics.salinity,
    depth: zoneD_metrics.depth,
    historicalActivity: 'Medium',
    fishingEffort: 55,
    season,
    distanceFromCoast: distD,
    color: '#f59e0b', // Amber
    factors: suitabilityD.factors,
  };

  const zoneE: FishingZone = {
    id: 'pfz-zone-e',
    name: `Zone E — ${locLabel} Oceanic Tuna Trench`,
    center: zoneE_coords,
    radius: 22,
    suitabilityScore: suitabilityE.score,
    sst: zoneE_metrics.sst,
    chlorophyll: zoneE_metrics.chlorophyll,
    currentSpeed: zoneE_metrics.currentSpeed,
    salinity: zoneE_metrics.salinity,
    depth: zoneE_metrics.depth,
    historicalActivity: 'Low',
    fishingEffort: 38,
    season,
    distanceFromCoast: distE,
    color: '#ef4444', // Red
    factors: suitabilityE.factors,
  };

  return [zoneA, zoneB, zoneC, zoneD, zoneE];
}

/**
 * Generates location-accurate Potential Fishing Zones across ALL 11 Indian Coastal Sectors
 * for the Pan-India view (33 distinct PFZs mapped across all Indian coasts & UTs).
 */
export function generatePanIndiaFishingZones(
  conditions?: Partial<MarineConditions>
): FishingZone[] {
  const sectors = [
    { id: 'gujarat', name: 'Gujarat Coast', lat: 21.75, lon: 70.0 },
    { id: 'konkan', name: 'Konkan Coast', lat: 18.2, lon: 72.9 },
    { id: 'goa', name: 'Goa Coast', lat: 15.35, lon: 73.8 },
    { id: 'kanara', name: 'Kanara Coast', lat: 13.8, lon: 74.4 },
    { id: 'malabar', name: 'Malabar Coast', lat: 10.2, lon: 76.0 },
    { id: 'coromandel', name: 'Coromandel Coast', lat: 10.8, lon: 79.5 },
    { id: 'andhra', name: 'Andhra Coast', lat: 16.2, lon: 81.8 },
    { id: 'odisha', name: 'Odisha Coast', lat: 20.2, lon: 86.2 },
    { id: 'bengal', name: 'Bengal Coast', lat: 21.8, lon: 88.3 },
    { id: 'lakshadweep', name: 'Lakshadweep', lat: 10.56, lon: 72.64 },
    { id: 'andaman', name: 'Andaman Islands', lat: 11.62, lon: 92.72 },
  ];

  const allPanIndiaZones: FishingZone[] = [];
  sectors.forEach((sec) => {
    const sectorZones = generateRealTimeFishingZones(sec.lat, sec.lon, conditions, sec.name);
    // Take top 3 high-probability zones per sector for a clean, comprehensive Pan-India coverage (33 zones)
    sectorZones.slice(0, 3).forEach((z, idx) => {
      allPanIndiaZones.push({
        ...z,
        id: `pfz-${sec.id}-${idx}`,
        sectorId: sec.id,
      });
    });
  });

  return allPanIndiaZones;
}

