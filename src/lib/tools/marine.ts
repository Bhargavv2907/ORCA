import 'server-only';

import { z } from 'zod';
import { fetchOpenMeteoData } from '@/services/marine/unified';
import { fetchMosdacSatelliteData } from '@/services/marine/mosdac';
import { fetchCycloneTrack, fetchIMDMarineData } from '@/services/marine/imd';
import { calculateSafetyScore } from '@/lib/risk-engine';
import {
  CoordinatesSchema,
  LocationInputSchema,
  NormalizedToolResult,
  OptionalLocationInputSchema,
  normalizeResult,
} from './schemas';

const WeatherValueSchema = z.object({
  temperature: z.number().finite().optional(),
  humidity: z.number().finite().optional(),
  pressure: z.number().finite().optional(),
  windSpeed: z.number().finite().optional(),
  windDirection: z.string().min(1).optional(),
  windDegrees: z.number().finite().optional(),
  rainfall: z.number().finite().optional(),
  cloudCover: z.number().finite().optional(),
});
const WavesValueSchema = z.object({
  height: z.number().finite().optional(),
  period: z.number().finite().optional(),
  directionDegrees: z.number().finite().optional(),
  swellHeight: z.number().finite().optional(),
  swellPeriod: z.number().finite().optional(),
});
const NumericValueSchema = z.number().finite();

function now(): string {
  return new Date().toISOString();
}

function unavailable<T>(
  valueSchema: z.ZodType<T>,
  source: string,
  location: z.infer<typeof CoordinatesSchema> | null,
  type: 'observation' | 'forecast' | 'advisory',
  reason: string,
  unit: string | null = null,
): NormalizedToolResult<T> {
  return normalizeResult(valueSchema, {
    source,
    retrievedAt: now(),
    validFrom: null,
    validUntil: null,
    location,
    value: null,
    unit,
    type,
    status: 'unavailable',
    reason,
  });
}

async function getOpenMeteo(location: z.infer<typeof CoordinatesSchema>) {
  return fetchOpenMeteoData(location.lat, location.lon);
}

export async function getWeather(input: unknown): Promise<NormalizedToolResult<z.infer<typeof WeatherValueSchema>>> {
  const { location } = LocationInputSchema.parse(input);
  const data = await getOpenMeteo(location);
  const value = data?.weather;

  if (!value || Object.keys(value).length === 0) {
    return unavailable(WeatherValueSchema, 'Open-Meteo', location, 'forecast', 'No weather fields were returned by Open-Meteo.');
  }

  return normalizeResult(WeatherValueSchema, {
    source: 'Open-Meteo', retrievedAt: now(), validFrom: null, validUntil: null,
    location, value, unit: null, type: 'forecast', status: 'live',
  });
}

export async function getWind(input: unknown): Promise<NormalizedToolResult<z.infer<typeof WeatherValueSchema>>> {
  const { location } = LocationInputSchema.parse(input);
  const mosdac = await fetchMosdacSatelliteData(location.lat, location.lon, ['winds']);
  if ((mosdac.status === 'LIVE' || mosdac.status === 'CACHED') && typeof mosdac.windSpeed === 'number') {
    return normalizeResult(WeatherValueSchema, {
      source: mosdac.source, retrievedAt: mosdac.lastUpdated ?? now(), validFrom: null, validUntil: null,
      location, value: { windSpeed: mosdac.windSpeed, windDegrees: mosdac.windDirection }, unit: 'km/h',
      type: 'observation', status: mosdac.status === 'CACHED' ? 'cached' : 'live',
    });
  }
  const weather = await getWeather(input);
  if (!weather.value || weather.value.windSpeed === undefined) {
    return unavailable(WeatherValueSchema, weather.source, weather.location, 'forecast', 'Wind speed is unavailable from Open-Meteo.', 'km/h');
  }
  return normalizeResult(WeatherValueSchema, { ...weather, value: {
    windSpeed: weather.value.windSpeed, windDirection: weather.value.windDirection, windDegrees: weather.value.windDegrees,
  }, unit: 'km/h' });
}

export async function getRainfall(input: unknown): Promise<NormalizedToolResult<number>> {
  const weather = await getWeather(input);
  if (!weather.value || weather.value.rainfall === undefined) {
    return unavailable(NumericValueSchema, weather.source, weather.location, 'forecast', 'Rainfall is unavailable from Open-Meteo.', 'mm');
  }
  return normalizeResult(NumericValueSchema, { ...weather, value: weather.value.rainfall, unit: 'mm' });
}

export async function getWaves(input: unknown): Promise<NormalizedToolResult<z.infer<typeof WavesValueSchema>>> {
  const { location } = LocationInputSchema.parse(input);
  const data = await getOpenMeteo(location);
  const value = data?.waves;
  if (!value || Object.keys(value).length === 0) {
    return unavailable(WavesValueSchema, 'Open-Meteo Marine', location, 'forecast', 'No wave fields were returned by Open-Meteo Marine.');
  }
  return normalizeResult(WavesValueSchema, {
    source: 'Open-Meteo Marine', retrievedAt: now(), validFrom: null, validUntil: null,
    location, value, unit: null, type: 'forecast', status: 'live',
  });
}

export async function getTide(input: unknown) {
  const { location } = LocationInputSchema.parse(input);
  return unavailable(z.unknown(), 'JalSaathi tide sources', location, 'forecast', 'No tide data source is integrated.');
}

async function getMosdacValue(
  input: unknown,
  key: 'sst' | 'chlorophyll',
  unit: string,
): Promise<NormalizedToolResult<number>> {
  const { location } = LocationInputSchema.parse(input);
  const data = await fetchMosdacSatelliteData(location.lat, location.lon, [key === 'sst' ? 'sst' : 'chlorophyll']);
  const value = data[key];

  if ((data.status !== 'LIVE' && data.status !== 'CACHED') || typeof value !== 'number') {
    return unavailable(NumericValueSchema, data.source, location, 'observation',
      'MOSDAC did not return a parsed live or cached value. Simulated and fallback values are excluded.', unit);
  }
  return normalizeResult(NumericValueSchema, {
    source: data.source, retrievedAt: data.lastUpdated ?? now(), validFrom: null, validUntil: null,
    location, value, unit, type: 'observation', status: data.status === 'CACHED' ? 'cached' : 'live',
  });
}

export function getSST(input: unknown) { return getMosdacValue(input, 'sst', 'degC'); }
export function getChlorophyll(input: unknown) { return getMosdacValue(input, 'chlorophyll', 'mg/m3'); }

export async function getPFZ(input: unknown) {
  const { location } = LocationInputSchema.parse(input);
  return unavailable(z.array(z.unknown()), 'JalSaathi PFZ / Copernicus Marine', location, 'advisory',
    'No live PFZ or Copernicus Marine integration exists. Mock fishing zones are excluded.');
}

export async function getVesselActivity(input: unknown) {
  const { location } = LocationInputSchema.parse(input);
  return unavailable(z.array(z.unknown()), 'Global Fishing Watch', location, 'observation',
    'Global Fishing Watch is configured only as a placeholder; no live vessel integration exists.');
}

export async function getCycloneAlerts(input: unknown) {
  const { location } = LocationInputSchema.parse(input);
  const cyclone = await fetchCycloneTrack();
  if (!cyclone || (cyclone.observed.length === 0 && cyclone.forecast.length === 0)) {
    return unavailable(z.unknown(), 'India Meteorological Department', location, 'advisory', 'No active IMD cyclone track is available.');
  }
  return normalizeResult(z.unknown(), {
    source: 'India Meteorological Department', retrievedAt: now(), validFrom: null, validUntil: null,
    location, value: cyclone, unit: null, type: 'advisory', status: 'live',
  });
}

export async function getLightningAlerts(input: unknown) {
  const { location } = LocationInputSchema.parse(input);
  return unavailable(z.array(z.unknown()), 'India Meteorological Department', location, 'advisory',
    'No lightning alert endpoint is integrated.');
}

export async function getMarineAdvisories(input: unknown) {
  const { location } = LocationInputSchema.parse(input);
  const data = await fetchIMDMarineData();
  const value = {
    portWarnings: data.portWarnings, seaBulletins: data.seaBulletins,
    coastalBulletins: data.coastalBulletins, fishermenWarnings: data.fishermenWarnings, cyclone: data.cyclone,
  };
  const hasAdvisory = Object.values(value).some((entry) => Array.isArray(entry) ? entry.length > 0 : entry !== null);
  if (!hasAdvisory) {
    return unavailable(z.unknown(), data.source, location, 'advisory', 'No IMD marine advisories are available.');
  }
  return normalizeResult(z.unknown(), {
    source: data.source, retrievedAt: now(), validFrom: null, validUntil: null,
    location, value, unit: null, type: 'advisory', status: data.status === 'LIVE' ? 'live' : 'cached',
  });
}

export function getUserLocation(input: unknown) {
  const { location } = OptionalLocationInputSchema.parse(input);
  if (!location) return unavailable(CoordinatesSchema, 'JalSaathi user location', null, 'observation', 'No user location was supplied to the server.');
  return normalizeResult(CoordinatesSchema, {
    source: 'Caller-supplied location', retrievedAt: now(), validFrom: null, validUntil: null,
    location, value: location, unit: null, type: 'observation', status: 'cached',
  });
}

const DistanceInputSchema = z.object({ from: CoordinatesSchema, to: CoordinatesSchema });
export function calculateDistance(input: unknown) {
  const { from, to } = DistanceInputSchema.parse(input);
  const radians = (value: number) => value * Math.PI / 180;
  const a = Math.sin(radians(to.lat - from.lat) / 2) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(radians(to.lon - from.lon) / 2) ** 2;
  const value = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return normalizeResult(NumericValueSchema, {
    source: 'JalSaathi GIS calculation', retrievedAt: now(), validFrom: null, validUntil: null,
    location: to, value, unit: 'km', type: 'observation', status: 'live',
  });
}

export async function findNearestPFZ(input: unknown) {
  const { location } = LocationInputSchema.parse(input);
  return unavailable(z.unknown(), 'JalSaathi PFZ / Copernicus Marine', location, 'advisory', 'No verified PFZ dataset is available to search.');
}

const GeofenceInputSchema = z.object({ location: CoordinatesSchema, boundary: z.array(CoordinatesSchema).min(3) });
export function checkGeofence(input: unknown) {
  const { location, boundary } = GeofenceInputSchema.parse(input);
  let inside = false;
  for (let index = 0, previous = boundary.length - 1; index < boundary.length; previous = index++) {
    const current = boundary[index];
    const prior = boundary[previous];
    if ((current.lat > location.lat) !== (prior.lat > location.lat) && location.lon < (prior.lon - current.lon) * (location.lat - current.lat) / (prior.lat - current.lat) + current.lon) inside = !inside;
  }
  return normalizeResult(z.object({ inside: z.boolean() }), {
    source: 'JalSaathi GIS calculation', retrievedAt: now(), validFrom: null, validUntil: null,
    location, value: { inside }, unit: null, type: 'observation', status: 'live',
  });
}

export async function findRestrictedAreas(input: unknown) {
  const { location } = LocationInputSchema.parse(input);
  return unavailable(z.array(z.unknown()), 'JalSaathi GIS', location, 'advisory', 'No restricted-area dataset is integrated.');
}

const RouteInputSchema = z.object({ origin: CoordinatesSchema, destination: CoordinatesSchema });
export async function calculateRoute(input: unknown) {
  const { origin, destination } = RouteInputSchema.parse(input);
  return unavailable(z.array(z.unknown()), 'JalSaathi offline router', origin, 'forecast',
    `The prototype router has no verified chart, geofence, weather, or traffic inputs for the requested destination (${destination.lat}, ${destination.lon}).`);
}

const RouteCandidateSchema = z.object({ id: z.string().min(1), distanceKm: z.number().finite().nonnegative(), riskScore: z.number().finite().min(0).max(100) });
export function compareRoutes(input: unknown) {
  const { routes, location } = z.object({ routes: z.array(RouteCandidateSchema).min(1), location: CoordinatesSchema }).parse(input);
  const value = [...routes].sort((a, b) => a.riskScore - b.riskScore || a.distanceKm - b.distanceKm);
  return normalizeResult(z.array(RouteCandidateSchema), {
    source: 'JalSaathi route comparison', retrievedAt: now(), validFrom: null, validUntil: null,
    location, value, unit: null, type: 'forecast', status: 'live',
  });
}

const MarineRiskInputSchema = z.object({
  location: CoordinatesSchema,
  weather: z.object({ windSpeed: z.number().finite(), pressure: z.number().finite(), visibility: z.number().finite(), rainfall: z.number().finite() }),
  waves: z.object({ height: z.number().finite() }),
  ocean: z.object({ currentSpeed: z.number().finite() }),
  vesselCount: z.number().int().nonnegative(),
});
export function calculateMarineRisk(input: unknown) {
  const { location, weather, waves, ocean, vesselCount } = MarineRiskInputSchema.parse(input);
  const value = calculateSafetyScore(weather, waves, ocean, vesselCount);
  return normalizeResult(z.unknown(), {
    source: 'JalSaathi deterministic risk engine', retrievedAt: now(), validFrom: null, validUntil: null,
    location, value, unit: 'score_0_to_100', type: 'observation', status: 'live',
  });
}
