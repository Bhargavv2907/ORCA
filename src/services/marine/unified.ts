// ============================================================
// ORCA Unified Marine Service Layer
// Aggregates data from IMD, MOSDAC, Open-Meteo, and local mock engine
// ============================================================

import { MarineConditions, Coordinates } from '@/types/marine';
import { getMockMarineConditions } from '@/data/mock-data';
import { fetchMosdacSatelliteData, hasMosdacCredentials } from './mosdac';
import { hasIMDApiKey, fetchCurrentWeather } from './imd';
import { calculateSafetyScore } from '@/lib/risk-engine';

// Check if API credentials are configured
function hasOpenMeteoConfig(): boolean {
  return true; // Open-Meteo is free, no key needed
}

function hasCopernicusConfig(): boolean {
  return !!(process.env.COPERNICUS_USERNAME && process.env.COPERNICUS_PASSWORD);
}

function hasGFWConfig(): boolean {
  return !!process.env.GFW_API_TOKEN;
}

// ---- Open-Meteo Service ----
export async function fetchOpenMeteoData(lat: number, lon: number): Promise<{ weather?: Partial<MarineConditions['weather']>; waves?: Partial<MarineConditions['waves']> } | null> {
  try {
    const marineUrl = process.env.OPEN_METEO_API || 'https://marine-api.open-meteo.com/v1/marine';
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast';

    const marineParams = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period',
    });

    const weatherParams = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,rain,cloud_cover',
    });

    const [marineRes, weatherRes] = await Promise.all([
      fetch(`${marineUrl}?${marineParams}`).catch(() => null),
      fetch(`${weatherUrl}?${weatherParams}`).catch(() => null),
    ]);

    const result: { weather?: Partial<MarineConditions['weather']>; waves?: Partial<MarineConditions['waves']> } = {};

    if (marineRes && marineRes.ok) {
      const data = await marineRes.json();
      result.waves = {
        height: data.current?.wave_height ?? 1.5,
        period: data.current?.wave_period ?? 7,
        direction: 'NW',
        directionDegrees: data.current?.wave_direction ?? 315,
        swellHeight: data.current?.swell_wave_height ?? 1.0,
        swellDirection: 'W',
        swellPeriod: data.current?.swell_wave_period ?? 9,
      };
    }

    if (weatherRes && weatherRes.ok) {
      const data = await weatherRes.json();
      const deg = data.current?.wind_direction_10m ?? 225;
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const dir = dirs[Math.round(deg / 45) % 8];

      result.weather = {
        temperature: data.current?.temperature_2m ?? 28,
        humidity: data.current?.relative_humidity_2m ?? 80,
        pressure: data.current?.surface_pressure ?? 1008,
        windSpeed: data.current?.wind_speed_10m ?? 18,
        windDegrees: deg,
        windDirection: dir,
        rainfall: data.current?.rain ?? 0,
        cloudCover: data.current?.cloud_cover ?? 50,
      };
    }

    return result;
  } catch {
    return null;
  }
}

// ---- Unified Interface ----
export async function getMarineConditions(lat: number, lon: number): Promise<MarineConditions> {
  let conditions = getMockMarineConditions();
  const sources: string[] = [];

  // ---- Layer 1: IMD Current Weather (Official Indian Met. Dept.) ----
  if (hasIMDApiKey()) {
    try {
      // Mumbai station = 43003, Goa = 43192, Chennai = 43279, Kolkata = 42807
      const stationData = await fetchCurrentWeather();
      if (stationData && stationData.length > 0) {
        // Find nearest station to the requested coordinates
        // For now, use the first station (typically the default Mumbai station)
        const station = stationData[0];
        if (station.temperature) conditions.weather.temperature = station.temperature;
        if (station.humidity) conditions.weather.humidity = station.humidity;
        if (station.windSpeed) conditions.weather.windSpeed = station.windSpeed;
        if (station.windDirection) conditions.weather.windDegrees = station.windDirection;
        if (station.mslp) conditions.weather.pressure = station.mslp;
        if (station.rainfall24hrs) conditions.weather.rainfall = station.rainfall24hrs;
        sources.push(`IMD (${station.stationName || 'Station'})`);
        conditions.dataStatus = 'LIVE';
      }
    } catch (err) {
      console.warn('[Unified] Failed to merge IMD data:', err);
    }
  }

  // ---- Layer 2: MOSDAC Satellite Data (SST, Winds, Chlorophyll) ----
  try {
    const mosdacData = await fetchMosdacSatelliteData(lat, lon);
    if (mosdacData) {
      if (mosdacData.sst !== undefined) conditions.ocean.sst = mosdacData.sst;
      if (mosdacData.chlorophyll !== undefined) conditions.ocean.chlorophyll = mosdacData.chlorophyll;
      // Only use MOSDAC wind if IMD didn't provide it
      if (mosdacData.windSpeed !== undefined && !hasIMDApiKey()) {
        conditions.weather.windSpeed = mosdacData.windSpeed;
        conditions.weather.windDegrees = mosdacData.windDirection ?? 225;
      }
      sources.push(`MOSDAC (${mosdacData.source})`);

      if (mosdacData.status === 'LIVE' || mosdacData.status === 'CACHED') {
        if (conditions.dataStatus !== 'LIVE') {
          conditions.dataStatus = 'NEAR_REAL_TIME';
        }
      }
    }
  } catch (err) {
    console.warn('[Unified] Failed to merge MOSDAC data:', err);
  }

  // ---- Layer 3: Open-Meteo (Weather & Wave forecasts) ----
  if (hasOpenMeteoConfig()) {
    try {
      const liveData = await fetchOpenMeteoData(lat, lon);
      if (liveData) {
        if (liveData.waves) {
          conditions.waves = { ...conditions.waves, ...liveData.waves };
        }
        if (liveData.weather) {
          conditions.weather = { ...conditions.weather, ...liveData.weather };
        }
        if (!conditions.dataStatus || conditions.dataStatus === 'MOCK') {
          conditions.dataStatus = 'FORECAST';
        }
        sources.push('Open-Meteo');
      }
    } catch {
      // Fall through
    }
  }

  // ---- Dynamic Safety Score Recalculation ----
  conditions.safety = calculateSafetyScore(conditions.weather, conditions.waves, conditions.ocean);

  // Build composite source label
  if (sources.length > 0) {
    conditions.source = sources.join(' + ') + ' + ORCA Engine';
  }

  return conditions;
}

export function getServiceStatus() {
  return {
    openMeteo: { configured: hasOpenMeteoConfig(), label: 'Open-Meteo' },
    copernicus: { configured: hasCopernicusConfig(), label: 'Copernicus Marine' },
    gfw: { configured: hasGFWConfig(), label: 'Global Fishing Watch' },
    mosdac: { configured: hasMosdacCredentials(), label: 'ISRO MOSDAC' },
    imd: { configured: hasIMDApiKey(), label: 'IMD (India Met. Dept.)' },
    mapbox: { configured: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN, label: 'Mapbox' },
  };
}

// Re-export coordinate type for convenience  
export type { Coordinates };
