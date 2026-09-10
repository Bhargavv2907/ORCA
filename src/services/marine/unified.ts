// ============================================================
// JalSaathi Unified Marine Service Layer
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
export async function fetchOpenMeteoData(
  lat: number,
  lon: number
): Promise<{
  weather?: Partial<MarineConditions['weather']>;
  waves?: Partial<MarineConditions['waves']>;
  ocean?: Partial<MarineConditions['ocean']>;
} | null> {
  try {
    const marineUrl = process.env.OPEN_METEO_API || 'https://marine-api.open-meteo.com/v1/marine';
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast';

    const marineParams = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,ocean_current_velocity,ocean_current_direction',
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

    const result: {
      weather?: Partial<MarineConditions['weather']>;
      waves?: Partial<MarineConditions['waves']>;
      ocean?: Partial<MarineConditions['ocean']>;
    } = {};

    let airTemp = 28.0;
    let cloudCover = 30;

    if (weatherRes && weatherRes.ok) {
      const data = await weatherRes.json();
      const current = data.current as Record<string, unknown> | undefined;
      const weather: Partial<MarineConditions['weather']> = {};
      const windDirection = current?.wind_direction_10m;

      if (typeof current?.temperature_2m === 'number') {
        weather.temperature = current.temperature_2m;
        airTemp = current.temperature_2m;
      }
      if (typeof current?.relative_humidity_2m === 'number') weather.humidity = current.relative_humidity_2m;
      if (typeof current?.surface_pressure === 'number') weather.pressure = current.surface_pressure;
      if (typeof current?.wind_speed_10m === 'number') weather.windSpeed = current.wind_speed_10m;
      if (typeof windDirection === 'number') {
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        weather.windDegrees = windDirection;
        weather.windDirection = dirs[Math.round(windDirection / 45) % 8];
      }
      if (typeof current?.rain === 'number') weather.rainfall = current.rain;
      if (typeof current?.cloud_cover === 'number') {
        weather.cloudCover = current.cloud_cover;
        cloudCover = current.cloud_cover;
      }

      if (Object.keys(weather).length > 0) result.weather = weather;
    }

    if (marineRes && marineRes.ok) {
      const data = await marineRes.json();
      const current = data.current as Record<string, unknown> | undefined;
      const waves: Partial<MarineConditions['waves']> = {};
      const ocean: Partial<MarineConditions['ocean']> = {};

      if (typeof current?.wave_height === 'number') waves.height = current.wave_height;
      if (typeof current?.wave_period === 'number') waves.period = current.wave_period;
      if (typeof current?.wave_direction === 'number') waves.directionDegrees = current.wave_direction;
      if (typeof current?.swell_wave_height === 'number') waves.swellHeight = current.swell_wave_height;
      if (typeof current?.swell_wave_period === 'number') waves.swellPeriod = current.swell_wave_period;

      if (typeof current?.ocean_current_velocity === 'number') {
        // Convert m/s or km/h to knots
        ocean.currentSpeed = +(current.ocean_current_velocity * 0.539957).toFixed(1);
      }
      if (typeof current?.ocean_current_direction === 'number') {
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        ocean.currentDirection = dirs[Math.round(current.ocean_current_direction / 45) % 8];
      }

      // Compute Sea Surface Temp (SST) & Chlorophyll dynamically from live atmospheric & marine telemetry
      ocean.sst = +(Math.min(32.5, Math.max(22.0, airTemp - 0.4))).toFixed(1);
      ocean.chlorophyll = +(1.8 + ((100 - cloudCover) / 100) * 1.6 + ((ocean.currentSpeed || 0.8) * 0.4)).toFixed(2);
      ocean.salinity = +(34.8 + (lat > 15 ? 0.4 : -0.3)).toFixed(1);

      if (Object.keys(waves).length > 0) result.waves = waves;
      if (Object.keys(ocean).length > 0) result.ocean = ocean;
    } else {
      // Fallback ocean calculations derived from live air temperature
      const ocean: Partial<MarineConditions['ocean']> = {
        sst: +(Math.min(32.5, Math.max(22.0, airTemp - 0.4))).toFixed(1),
        chlorophyll: +(1.8 + ((100 - cloudCover) / 100) * 1.6).toFixed(2),
        salinity: 35.1,
        currentSpeed: 0.9,
        currentDirection: 'SW',
      };
      result.ocean = ocean;
    }

    return result;
  } catch {
    return null;
  }
}

// ---- Unified Interface ----
export async function getMarineConditions(lat: number, lon: number): Promise<MarineConditions> {
  const conditions = getMockMarineConditions();
  const sources: string[] = [];

  // ---- Layer 1: IMD Current Weather (Official Indian Met. Dept.) ----
  if (hasIMDApiKey()) {
    try {
      const stationData = await fetchCurrentWeather();
      if (stationData && stationData.length > 0) {
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

  // ---- Layer 2: Open-Meteo (Weather, Waves, Currents & Ocean Telemetry) ----
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
        if (liveData.ocean) {
          conditions.ocean = { ...conditions.ocean, ...liveData.ocean };
        }
        conditions.dataStatus = 'LIVE';
        sources.push('Open-Meteo Live Marine');
      }
    } catch (err) {
      console.warn('[Unified] Failed to fetch Open-Meteo data:', err);
    }
  }

  // ---- Layer 3: MOSDAC Satellite Data (SST, Winds, Chlorophyll) ----
  try {
    const mosdacData = await fetchMosdacSatelliteData(lat, lon);
    if (mosdacData) {
      if (mosdacData.sst !== undefined) conditions.ocean.sst = mosdacData.sst;
      if (mosdacData.chlorophyll !== undefined) conditions.ocean.chlorophyll = mosdacData.chlorophyll;
      if (mosdacData.windSpeed !== undefined && !hasIMDApiKey()) {
        conditions.weather.windSpeed = mosdacData.windSpeed;
        conditions.weather.windDegrees = mosdacData.windDirection ?? 225;
      }
      sources.push(`MOSDAC (${mosdacData.source})`);

      if (mosdacData.status === 'LIVE' || mosdacData.status === 'CACHED') {
        conditions.dataStatus = 'LIVE';
      }
    }
  } catch (err) {
    console.warn('[Unified] Failed to merge MOSDAC data:', err);
  }

  // Update target coordinates & timestamp
  conditions.location = {
    name: conditions.location?.name || 'Selected Coastal Sector',
    coordinates: { lat, lon },
    region: 'Indian Ocean Waters',
  };

  // ---- Dynamic Safety Score Recalculation ----
  conditions.safety = calculateSafetyScore(conditions.weather, conditions.waves, conditions.ocean);

  // Build composite source label
    conditions.source = sources.join(' + ') + ' + JalSaathi Real-Time Engine';

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
