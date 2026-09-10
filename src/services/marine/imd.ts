// ============================================================
// JalSaathi — India Meteorological Department (IMD) Integration
// Official IMD Public APIs (https://api.imd.gov.in)
//
// API Key: Required (free) — Register at https://api.imd.gov.in/public/index.php
// IP Whitelisting may be required for server-side access.
//
// Integrated Endpoints:
//   - Current Weather (current_wx) — Real-time station observations
//   - City Forecast (cityforecastloc) — 7-day forecast with lat/lon
//   - Port Warnings (portwarning) — Active port weather warnings
//   - Sea Area Bulletin (seabulletin) — Open-sea conditions & forecasts
//   - Coastal Bulletin (coastalbulletin) — Coastal weather & sea state
//   - Fishermen Warning (fishermenwarning) — Safety warnings for fishermen
//   - Cyclone Track (cyclone_track) — Active cyclone positions & forecasts
//   - District Warnings (districtwarning) — 5-day severe weather warnings
//   - AWS/ARG Data (aws_data) — Auto weather station real-time data
// ============================================================

const IMD_BASE = 'https://api.imd.gov.in/api/v1';

// ---- Types ----
export interface IMDCurrentWeather {
  stationId: string;
  stationName: string;
  dateOfObservation: string;
  timeOfObservation: string;    // UTC
  mslp: number;                 // hPa
  windDirection: number;        // degrees 0-360
  windSpeed: number;            // km/h
  temperature: number;          // °C
  weatherCode: number;          // 01-99
  nebulosity: number;           // 0-8
  humidity: number;             // %
  rainfall24hrs: number;        // mm
}

export interface IMDCityForecast {
  stationCode: string;
  stationName: string;
  latitude: number;
  longitude: number;
  date: string;
  todayMaxTemp: number;
  todayMinTemp: number;
  todayForecast: string;
  humidity0830: number;
  humidity1730: number;
  past24hrsRainfall: number;
  sunriseTime: string;
  sunsetTime: string;
  forecasts: IMDDayForecast[];
}

export interface IMDDayForecast {
  day: number;
  maxTemp: number;
  minTemp: number;
  forecast: string;
}

export interface IMDPortWarning {
  portId: string;
  portName: string;
  issuedBy: string;
  dateOfIssue: string;
  warning: string;
}

export interface IMDSeaBulletin {
  id: string;
  dateOfObservation: string;
  layer: string;
  issuedBy: string;
  validFrom: string;
  validity: string;
  tttWarning: string;
  wind: string;
  synopticSituation: string;
  weather: string;
  visibility: string;
  seaCondition: string;
  updateTime: string;
}

export interface IMDCoastalBulletin {
  id: string;
  dateOfObservation: string;
  layer: string;
  issuedBy: string;
  validFrom: string;
  validity: string;
  wind: string;
  synopticSituation: string;
  weather: string;
  visibility: string;
  seaCondition: string;
  portSignal: string;
  updateTime: string;
}

export interface IMDCycloneData {
  status: string;
  message: string;
  observed: IMDCyclonePoint[];
  forecast: IMDCyclonePoint[];
}

export interface IMDCyclonePoint {
  cycloneName: string;
  hour: string;
  dateTime: string;
  lat: number;
  lon: number;
  mswRangeKmph: string;
  meanMswKmph: number;
  mswKt: number;
  category: string;
}

export interface IMDDistrictWarning {
  objId: string;
  date: string;
  district: string;
  warnings: { day: number; code: string; color: number }[];
}

export interface IMDFishermenWarning {
  id: string;
  area: string;
  dateOfIssue: string;
  warning: string;
  validUpto: string;
}

export interface IMDAWSData {
  id: string;
  callSign: string;
  district: string;
  state: string;
  station: string;
  date: string;
  time: string;
  currentTemp: number;
  dewPointTemp: number;
  relativeHumidity: number;
  windDirection: number;
  windSpeed: number;
  mslp: number;
  minTemp: number;
  maxTemp: number;
  latitude: number;
  longitude: number;
  weatherCode: number;
  nebulosity: number;
  feelsLike: number;
}

// ---- Cache ----
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttlMs });
}

// ---- Credential Check ----
export function hasIMDApiKey(): boolean {
  return !!process.env.IMD_API_KEY;
}

function getApiKey(): string {
  return process.env.IMD_API_KEY || '';
}

// ---- Generic Fetcher ----
async function fetchIMD<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }

  const url = new URL(`${IMD_BASE}/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // 5-minute ISR cache
    });

    if (!response.ok) {
      console.warn(`[IMD] ${endpoint} returned ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[IMD] Error fetching ${endpoint}:`, error);
    return null;
  }
}

// ---- Public API Functions ----

/** Fetch current weather observations for a station */
export async function fetchCurrentWeather(stationId?: string): Promise<IMDCurrentWeather[] | null> {
  const cacheKey = `imd_current_${stationId || 'all'}`;
  const cached = getCached<IMDCurrentWeather[]>(cacheKey);
  if (cached) return cached;

  const params = stationId ? { id: stationId } : undefined;
  const raw = await fetchIMD<Record<string, unknown>[]>('current_wx', params);
  if (!raw || !Array.isArray(raw)) return null;

  const result = raw.map((r): IMDCurrentWeather => ({
    stationId: String(r['Station Id'] ?? ''),
    stationName: String(r['Station'] ?? ''),
    dateOfObservation: String(r['Date of Observation'] ?? ''),
    timeOfObservation: String(r['Time of Observation'] ?? ''),
    mslp: Number(r['M.S.L.P'] ?? 0),
    windDirection: Number(r['Wind Direction'] ?? 0),
    windSpeed: Number(r['Wind Speed'] ?? 0),
    temperature: Number(r['Temperature'] ?? 0),
    weatherCode: Number(r['Weather Code'] ?? 0),
    nebulosity: Number(r['Nebulosity'] ?? 0),
    humidity: Number(r['Humidity'] ?? 0),
    rainfall24hrs: Number(r['Last 24 hrs Rainfall'] ?? 0),
  }));

  setCache(cacheKey, result, 15 * 60_000); // 15 min cache
  return result;
}

/** Fetch 7-day city forecast with lat/lon */
export async function fetchCityForecast(stationId?: string): Promise<IMDCityForecast[] | null> {
  const cacheKey = `imd_forecast_${stationId || 'all'}`;
  const cached = getCached<IMDCityForecast[]>(cacheKey);
  if (cached) return cached;

  const params = stationId ? { id: stationId } : undefined;
  const raw = await fetchIMD<Record<string, unknown>[]>('cityforecastloc', params);
  if (!raw || !Array.isArray(raw)) return null;

  const result = raw.map((r): IMDCityForecast => ({
    stationCode: String(r['Station_Code'] ?? ''),
    stationName: String(r['Station_Name'] ?? ''),
    latitude: Number(r['Latitude'] ?? 0),
    longitude: Number(r['Longitude'] ?? 0),
    date: String(r['Date'] ?? ''),
    todayMaxTemp: Number(r['Today_Max_temp'] ?? 0),
    todayMinTemp: Number(r['Today_Min_temp'] ?? 0),
    todayForecast: String(r['Todays_Forecast'] ?? ''),
    humidity0830: Number(r['Relative_Humidity_at_0830'] ?? 0),
    humidity1730: Number(r['Relative_Humidity_at_1730'] ?? 0),
    past24hrsRainfall: Number(r['Past_24_hrs_Rainfall'] ?? 0),
    sunriseTime: String(r['Sunrise_time'] ?? ''),
    sunsetTime: String(r['Sunset_time'] ?? ''),
    forecasts: [2, 3, 4, 5, 6, 7].map(day => ({
      day,
      maxTemp: Number(r[`Day_${day}_Max_Temp`] ?? 0),
      minTemp: Number(r[`Day_${day}_Min_temp`] ?? 0),
      forecast: String(r[`Day_${day}_Forecast`] ?? ''),
    })),
  }));

  setCache(cacheKey, result, 30 * 60_000); // 30 min cache
  return result;
}

/** Fetch active port warnings */
export async function fetchPortWarnings(portId?: string): Promise<IMDPortWarning[] | null> {
  const cacheKey = `imd_port_${portId || 'all'}`;
  const cached = getCached<IMDPortWarning[]>(cacheKey);
  if (cached) return cached;

  const params = portId ? { id: portId } : undefined;
  const raw = await fetchIMD<Record<string, unknown>[]>('portwarning', params);
  if (!raw || !Array.isArray(raw)) return null;

  const result = raw.map((r): IMDPortWarning => ({
    portId: String(r['Port Id'] ?? ''),
    portName: String(r['Port Name'] ?? ''),
    issuedBy: String(r['Issued By'] ?? ''),
    dateOfIssue: String(r['Date of Issue'] ?? ''),
    warning: String(r['Warning'] ?? ''),
  }));

  setCache(cacheKey, result, 30 * 60_000);
  return result;
}

/** Fetch sea area bulletins */
export async function fetchSeaBulletins(bulletinId?: string): Promise<IMDSeaBulletin[] | null> {
  const cacheKey = `imd_sea_${bulletinId || 'all'}`;
  const cached = getCached<IMDSeaBulletin[]>(cacheKey);
  if (cached) return cached;

  const params = bulletinId ? { id: bulletinId } : undefined;
  const raw = await fetchIMD<Record<string, unknown>[]>('seabulletin', params);
  if (!raw || !Array.isArray(raw)) return null;

  const result = raw.map((r): IMDSeaBulletin => ({
    id: String(r['Id'] ?? ''),
    dateOfObservation: String(r['Date of Observation'] ?? ''),
    layer: String(r['Layer'] ?? ''),
    issuedBy: String(r['Issued by'] ?? ''),
    validFrom: String(r['Valid From'] ?? ''),
    validity: String(r['Validity'] ?? ''),
    tttWarning: String(r['TTT Warning'] ?? ''),
    wind: String(r['Wind'] ?? ''),
    synopticSituation: String(r['Synoptic Situation'] ?? ''),
    weather: String(r['Weather'] ?? ''),
    visibility: String(r['Visibility'] ?? ''),
    seaCondition: String(r['Sea Condition'] ?? ''),
    updateTime: String(r['Update Time'] ?? ''),
  }));

  setCache(cacheKey, result, 30 * 60_000);
  return result;
}

/** Fetch coastal bulletins */
export async function fetchCoastalBulletins(): Promise<IMDCoastalBulletin[] | null> {
  const cacheKey = 'imd_coastal_all';
  const cached = getCached<IMDCoastalBulletin[]>(cacheKey);
  if (cached) return cached;

  const raw = await fetchIMD<Record<string, unknown>[]>('coastalbulletin');
  if (!raw || !Array.isArray(raw)) return null;

  const result = raw.map((r): IMDCoastalBulletin => ({
    id: String(r['Id'] ?? ''),
    dateOfObservation: String(r['Date of Observation'] ?? ''),
    layer: String(r['Layer'] ?? ''),
    issuedBy: String(r['Issued by'] ?? ''),
    validFrom: String(r['Valid From'] ?? ''),
    validity: String(r['Validity'] ?? ''),
    wind: String(r['Wind'] ?? ''),
    synopticSituation: String(r['Synoptic Situation'] ?? ''),
    weather: String(r['Weather'] ?? ''),
    visibility: String(r['Visibility'] ?? ''),
    seaCondition: String(r['Sea Condition'] ?? ''),
    portSignal: String(r['Port Signal'] ?? ''),
    updateTime: String(r['Update Time'] ?? ''),
  }));

  setCache(cacheKey, result, 30 * 60_000);
  return result;
}

/** Fetch active cyclone track data */
export async function fetchCycloneTrack(): Promise<IMDCycloneData | null> {
  const cacheKey = 'imd_cyclone_track';
  const cached = getCached<IMDCycloneData>(cacheKey);
  if (cached) return cached;

  const raw = await fetchIMD<Record<string, unknown>>('cyclone_track');
  if (!raw) return null;

  const mapPoint = (p: Record<string, unknown>): IMDCyclonePoint => ({
    cycloneName: String(p['CYCLONE_NAME'] ?? ''),
    hour: String(p['Hour'] ?? ''),
    dateTime: String(p['Date/Time'] ?? ''),
    lat: Number(p['lat'] ?? 0),
    lon: Number(p['lon'] ?? 0),
    mswRangeKmph: String(p['MSW range (kmph)'] ?? ''),
    meanMswKmph: Number(p['Mean MSW (kmph)'] ?? 0),
    mswKt: Number(p['MSW (kt)'] ?? 0),
    category: String(p['Category'] ?? ''),
  });

  const data = raw['data'] as Record<string, unknown> | undefined;
  const result: IMDCycloneData = {
    status: String(raw['status'] ?? ''),
    message: String(raw['message'] ?? ''),
    observed: Array.isArray(data?.['observed'])
      ? (data!['observed'] as Record<string, unknown>[]).map(mapPoint)
      : [],
    forecast: Array.isArray(data?.['forecast'])
      ? (data!['forecast'] as Record<string, unknown>[]).map(mapPoint)
      : [],
  };

  setCache(cacheKey, result, 15 * 60_000); // 15 min for cyclones
  return result;
}

/** Fetch fishermen warnings */
export async function fetchFishermenWarnings(): Promise<IMDFishermenWarning[] | null> {
  const cacheKey = 'imd_fishermen_all';
  const cached = getCached<IMDFishermenWarning[]>(cacheKey);
  if (cached) return cached;

  const raw = await fetchIMD<Record<string, unknown>[]>('fishermenwarning');
  if (!raw || !Array.isArray(raw)) return null;

  const result = raw.map((r): IMDFishermenWarning => ({
    id: String(r['Id'] ?? r['id'] ?? ''),
    area: String(r['Area'] ?? r['area'] ?? ''),
    dateOfIssue: String(r['Date of Issue'] ?? r['date_of_issue'] ?? ''),
    warning: String(r['Warning'] ?? r['warning'] ?? ''),
    validUpto: String(r['Valid Upto'] ?? r['valid_upto'] ?? ''),
  }));

  setCache(cacheKey, result, 30 * 60_000);
  return result;
}

/** Fetch district-wise severe weather warnings */
export async function fetchDistrictWarnings(districtId?: string): Promise<IMDDistrictWarning[] | null> {
  const cacheKey = `imd_warning_${districtId || 'all'}`;
  const cached = getCached<IMDDistrictWarning[]>(cacheKey);
  if (cached) return cached;

  const params = districtId ? { id: districtId } : undefined;
  const raw = await fetchIMD<Record<string, unknown>[]>('districtwarning', params);
  if (!raw || !Array.isArray(raw)) return null;

  const result = raw.map((r): IMDDistrictWarning => ({
    objId: String(r['Obj_id'] ?? ''),
    date: String(r['Date'] ?? ''),
    district: String(r['District'] ?? ''),
    warnings: [1, 2, 3, 4, 5].map(day => ({
      day,
      code: String(r[`Day_${day}`] ?? ''),
      color: Number(r[`Day${day}_Color`] ?? 0),
    })),
  }));

  setCache(cacheKey, result, 30 * 60_000);
  return result;
}

/** Fetch AWS (Automatic Weather Station) real-time data */
export async function fetchAWSData(stationId?: string, stateId?: string): Promise<IMDAWSData[] | null> {
  const cacheKey = `imd_aws_${stationId || stateId || 'all'}`;
  const cached = getCached<IMDAWSData[]>(cacheKey);
  if (cached) return cached;

  const params: Record<string, string> = {};
  if (stationId) params.id = stationId;
  if (stateId) params.sid = stateId;

  const raw = await fetchIMD<Record<string, unknown>[]>('aws_data', Object.keys(params).length ? params : undefined);
  if (!raw || !Array.isArray(raw)) return null;

  const result = raw.map((r): IMDAWSData => ({
    id: String(r['ID'] ?? ''),
    callSign: String(r['CALL_SIGN'] ?? ''),
    district: String(r['DISTRICT'] ?? ''),
    state: String(r['STATE'] ?? ''),
    station: String(r['STATION'] ?? ''),
    date: String(r['DATE'] ?? ''),
    time: String(r['TIME'] ?? ''),
    currentTemp: Number(r['CURR_TEMP'] ?? 0),
    dewPointTemp: Number(r['DEW_POINT_TEMP'] ?? 0),
    relativeHumidity: Number(r['RH'] ?? 0),
    windDirection: Number(r['WIND_DIRECTION'] ?? 0),
    windSpeed: Number(r['WIND_SPEED'] ?? 0),
    mslp: Number(r['MSLP'] ?? 0),
    minTemp: Number(r['MIN_TEMP'] ?? 0),
    maxTemp: Number(r['MAX_TEMP'] ?? 0),
    latitude: Number(r['Latitude'] ?? 0),
    longitude: Number(r['Longitude'] ?? 0),
    weatherCode: Number(r['WEATHER_CODE'] ?? 0),
    nebulosity: Number(r['NEBULOSITY'] ?? 0),
    feelsLike: Number(r['Feel Like'] ?? 0),
  }));

  setCache(cacheKey, result, 10 * 60_000); // 10 min for real-time AWS
  return result;
}

// ---- Composite: Get Marine-Relevant IMD Data ----
export interface IMDMarineData {
  portWarnings: IMDPortWarning[];
  seaBulletins: IMDSeaBulletin[];
  coastalBulletins: IMDCoastalBulletin[];
  fishermenWarnings: IMDFishermenWarning[];
  cyclone: IMDCycloneData | null;
  nearestStation: IMDCurrentWeather | null;
  source: string;
  status: 'LIVE' | 'PARTIAL' | 'UNAVAILABLE';
}

export async function fetchIMDMarineData(): Promise<IMDMarineData> {
  if (!hasIMDApiKey()) {
    return {
      portWarnings: [],
      seaBulletins: [],
      coastalBulletins: [],
      fishermenWarnings: [],
      cyclone: null,
      nearestStation: null,
      source: 'IMD (Not configured — register at api.imd.gov.in)',
      status: 'UNAVAILABLE',
    };
  }

  // Fetch all marine-relevant data in parallel
  const [ports, sea, coastal, fishermen, cyclone] = await Promise.all([
    fetchPortWarnings(),
    fetchSeaBulletins(),
    fetchCoastalBulletins(),
    fetchFishermenWarnings(),
    fetchCycloneTrack(),
  ]);

  const hasData = !!(ports?.length || sea?.length || coastal?.length || fishermen?.length || cyclone);

  return {
    portWarnings: ports ?? [],
    seaBulletins: sea ?? [],
    coastalBulletins: coastal ?? [],
    fishermenWarnings: fishermen ?? [],
    cyclone: cyclone ?? null,
    nearestStation: null,
    source: 'India Meteorological Department (IMD)',
    status: hasData ? 'LIVE' : 'PARTIAL',
  };
}

// ---- Status ----
export function getIMDStatus() {
  return {
    hasApiKey: hasIMDApiKey(),
    baseUrl: IMD_BASE,
    registrationUrl: 'https://api.imd.gov.in/public/index.php',
    apiReferenceUrl: 'https://api.imd.gov.in/public/api_reference.html',
    endpoints: {
      currentWeather: `${IMD_BASE}/current_wx`,
      cityForecast: `${IMD_BASE}/cityforecastloc`,
      portWarnings: `${IMD_BASE}/portwarning`,
      seaBulletins: `${IMD_BASE}/seabulletin`,
      coastalBulletins: `${IMD_BASE}/coastalbulletin`,
      fishermenWarnings: `${IMD_BASE}/fishermenwarning`,
      cycloneTrack: `${IMD_BASE}/cyclone_track`,
      cycloneWind: `${IMD_BASE}/cyclone_wind`,
      cycloneCOU: `${IMD_BASE}/cyclone_cou`,
      districtWarnings: `${IMD_BASE}/districtwarning`,
      awsData: `${IMD_BASE}/aws_data`,
      sunMoon: `${IMD_BASE}/sunmoon`,
    },
  };
}
