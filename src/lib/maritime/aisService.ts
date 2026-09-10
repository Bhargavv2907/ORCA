// ============================================================
// JalSaathi MarineTraffic AIS Service Wrapper
// Server-side integration with official MarineTraffic AIS API.
// Uses MARINETRAFFIC_API_KEY from process.env (never exposed to client).
// Includes 60s in-memory caching & demonstration simulation fallback.
// ============================================================

import { Vessel, Coordinates } from '@/types/marine';
import { getMockVessels } from '@/data/mock-data';

export interface AISFetchOptions {
  lat?: number;
  lon?: number;
  radiusKm?: number;
  minLat?: number;
  maxLat?: number;
  minLon?: number;
  maxLon?: number;
}

export interface AISStreamResult {
  source: string;
  isRealTimeAPI: boolean;
  isDemonstrationMode: boolean;
  retrievedAt: string;
  staleSeconds: number;
  totalVessels: number;
  vessels: Vessel[];
}

// In-memory server cache
let cachedAIS: { data: AISStreamResult; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

/**
 * Fetches live AIS vessels from MarineTraffic API or demonstration simulation engine
 */
export async function getAISVessels(options: AISFetchOptions = {}): Promise<AISStreamResult> {
  const centerLat = options.lat || 18.95;
  const centerLon = options.lon || 72.82;
  const apiKey = process.env.MARINETRAFFIC_API_KEY;

  const now = Date.now();

  // Return cached result if valid (within 60s)
  if (cachedAIS && now - cachedAIS.timestamp < CACHE_TTL_MS) {
    const staleSec = Math.floor((now - cachedAIS.timestamp) / 1000);
    return {
      ...cachedAIS.data,
      staleSeconds: staleSec,
    };
  }

  // 1. If MARINETRAFFIC_API_KEY is present, fetch from official MarineTraffic API endpoint
  if (apiKey) {
    try {
      // Area-of-interest query (bounding box surrounding center)
      const minLat = options.minLat || centerLat - 0.5;
      const maxLat = options.maxLat || centerLat + 0.5;
      const minLon = options.minLon || centerLon - 0.5;
      const maxLon = options.maxLon || centerLon + 0.5;

      const url = `https://services.marinetraffic.com/api/exportvessels/${apiKey}/MINLAT:${minLat}/MAXLAT:${maxLat}/MINLON:${minLon}/MAXLON:${maxLon}/protocol:json`;

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      });

      if (response.ok) {
        const rawVessels = await response.json();

        if (Array.isArray(rawVessels)) {
          const vessels: Vessel[] = rawVessels.map((v: Record<string, unknown>, idx: number) => {
            const vesselTypeNum = Number(v.SHIPTYPE || 0);
            let type: Vessel['type'] = 'commercial';
            if (vesselTypeNum >= 30 && vesselTypeNum <= 39) type = 'fishing';
            else if (vesselTypeNum >= 60 && vesselTypeNum <= 69) type = 'passenger';
            else if (vesselTypeNum >= 70 && vesselTypeNum <= 79) type = 'cargo';

            return {
              id: String(v.MMSI || `mmsi-${idx}`),
              name: String(v.SHIPNAME || `Vessel-${v.MMSI}`),
              type,
              position: {
                lat: parseFloat(String(v.LAT || centerLat)),
                lon: parseFloat(String(v.LON || centerLon)),
              },
              speed: parseFloat(String(v.SPEED || 8.5)),
              heading: parseInt(String(v.HEADING || v.COURSE || 180), 10),
              activity: parseFloat(String(v.SPEED || 0)) < 0.5 ? 'Anchored' : 'Transit',
              lastUpdated: new Date().toISOString(),
              flag: String(v.FLAG || 'IN'),
              length: Number(v.LENGTH || 120),
            };
          });

          const result: AISStreamResult = {
            source: 'Official MarineTraffic AIS API',
            isRealTimeAPI: true,
            isDemonstrationMode: false,
            retrievedAt: new Date().toISOString(),
            staleSeconds: 0,
            totalVessels: vessels.length,
            vessels,
          };

          cachedAIS = { data: result, timestamp: now };
          return result;
        }
      }
    } catch (err) {
      console.warn('[JalSaathi] MarineTraffic API request failed, switching to demo mode:', err);
    }
  }

  // 2. Demonstration Fallback Simulation Engine
  const baseVessels = getMockVessels();
  const simulatedVessels: Vessel[] = baseVessels.map((v) => ({
    ...v,
    position: {
      lat: +(centerLat + (v.position.lat - 18.95)).toFixed(4),
      lon: +(centerLon + (v.position.lon - 72.82)).toFixed(4),
    },
    lastUpdated: new Date().toISOString(),
  }));

  const demoResult: AISStreamResult = {
    source: apiKey ? 'MarineTraffic API (Demo Fallback)' : 'Live AIS Unavailable — Demonstration Mode',
    isRealTimeAPI: false,
    isDemonstrationMode: true,
    retrievedAt: new Date().toISOString(),
    staleSeconds: 0,
    totalVessels: simulatedVessels.length,
    vessels: simulatedVessels,
  };

  cachedAIS = { data: demoResult, timestamp: now };
  return demoResult;
}
