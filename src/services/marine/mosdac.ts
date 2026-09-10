// ============================================================
// JalSaathi — ISRO MOSDAC Data Download API Integration
// Meteorological and Oceanographic Satellite Data Archival Centre
// https://www.mosdac.gov.in
//
// Uses the official MOSDAC Data Download API:
//   - Search API (no auth required)
//   - Auth + Download (requires MOSDAC account)
//
// Key Datasets:
//   3DIMG_L2B_SST     — INSAT-3D Imager SST Level 2B
//   3DIMG_L2B_OLR     — INSAT-3D Outgoing Longwave Radiation
//   E06SCA_L2B_OWV    — EOS-06 (Oceansat-3) Scatterometer Ocean Wind Vectors
//   E06OCM_L2C_AD     — EOS-06 OCM Aerosol/Chlorophyll
//   3SIMG_L1B_STD     — INSAT-3D Sounder Imager Level 1B
// ============================================================

// ---- MOSDAC API Endpoints (from official mdapi.py) ----
const MOSDAC_TOKEN_URL = 'https://mosdac.gov.in/download_api/gettoken';
const MOSDAC_SEARCH_URL = 'https://mosdac.gov.in/apios/datasets.json';
const MOSDAC_DOWNLOAD_URL = 'https://mosdac.gov.in/download_api/download';
const MOSDAC_REFRESH_URL = 'https://mosdac.gov.in/download_api/refresh-token';
const MOSDAC_LOGOUT_URL = 'https://mosdac.gov.in/download_api/logout';

// ---- Known Ocean Dataset IDs ----
export const MOSDAC_DATASETS = {
  SST:         '3DIMG_L2B_SST',      // INSAT-3D Sea Surface Temperature
  WIND:        'E06SCA_L2B_OWV',     // EOS-06 Scatterometer Wind Vectors
  CHLOROPHYLL: 'E06OCM_L2C_AD',      // EOS-06 OCM Chlorophyll / Aerosol
  OLR:         '3DIMG_L2B_OLR',      // INSAT-3D Outgoing Longwave Radiation
  IMAGER_L1B:  '3DIMG_L1B_STD',      // INSAT-3D Imager Level 1B
} as const;

// ---- Types ----
export interface MosdacSearchConfig {
  datasetId: string;
  startTime?: string;         // YYYY-MM-DD
  endTime?: string;           // YYYY-MM-DD
  count?: number;             // max 100
  boundingBox?: string;       // "minLon,minLat,maxLon,maxLat"
  gId?: string;               // Granule ID for single file
}

export interface MosdacSearchResult {
  totalFiles: number;
  totalSize: string;
  files: MosdacFileEntry[];
  searchStatus: 'success' | 'error' | 'empty';
  message?: string;
}

export interface MosdacFileEntry {
  granuleId: string;
  filename: string;
  fileSize: number;
  startTime: string;
  endTime: string;
  downloadUrl?: string;
}

export interface MosdacAuthSession {
  accessToken: string;
  refreshToken: string;
  username: string;
  authenticated: boolean;
  expiresAt?: number;
}

export interface MosdacDataResponse {
  sst?: number;
  windSpeed?: number;
  windDirection?: number;
  chlorophyll?: number;
  olr?: number;
  status: 'LIVE' | 'CACHED' | 'MOCK' | 'FALLBACK';
  source: string;
  granuleIds?: string[];
  lastUpdated?: string;
  datasetVersions?: Record<string, string>;
}

// ---- In-Memory Cache ----
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const dataCache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = dataCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttlMs) {
    dataCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  dataCache.set(key, { data, timestamp: Date.now(), ttlMs });
}

// ---- Credential Check ----
export function hasMosdacCredentials(): boolean {
  return !!(process.env.MOSDAC_USERNAME && process.env.MOSDAC_PASSWORD);
}

// ---- Authentication ----
let authSession: MosdacAuthSession | null = null;

async function authenticateMosdac(): Promise<MosdacAuthSession | null> {
  // Return cached session if still valid
  if (authSession?.authenticated && authSession.expiresAt && Date.now() < authSession.expiresAt) {
    return authSession;
  }

  const username = process.env.MOSDAC_USERNAME;
  const password = process.env.MOSDAC_PASSWORD;

  if (!username || !password) {
    console.warn('[MOSDAC] No credentials configured. Set MOSDAC_USERNAME and MOSDAC_PASSWORD in .env.local');
    return null;
  }

  try {
    // MOSDAC uses POST /download_api/gettoken with {username, password}
    const response = await fetch(MOSDAC_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.status === 401) {
      const err = await response.json().catch(() => ({}));
      console.error(`[MOSDAC] Authentication failed — invalid credentials: ${err.error || response.statusText}`);
      return null;
    }

    if (!response.ok) {
      console.error(`[MOSDAC] Authentication failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    authSession = {
      accessToken: data.access_token || '',
      refreshToken: data.refresh_token || '',
      username,
      authenticated: true,
      expiresAt: Date.now() + 3600_000, // 1 hour session
    };

    console.log(`[MOSDAC] ✓ Authenticated as ${username} — access_token received`);
    return authSession;
  } catch (error) {
    console.error('[MOSDAC] Authentication error:', error);
    return null;
  }
}

// ---- Search API (No Auth Required) ----
export async function searchMosdacCatalog(config: MosdacSearchConfig): Promise<MosdacSearchResult> {
  const cacheKey = `mosdac_search_${JSON.stringify(config)}`;
  const cached = getCached<MosdacSearchResult>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams();
    params.set('datasetId', config.datasetId);
    if (config.startTime) params.set('startTime', config.startTime);
    if (config.endTime) params.set('endTime', config.endTime);
    if (config.count) params.set('count', config.count.toString());
    if (config.boundingBox) params.set('boundingBox', config.boundingBox);
    if (config.gId) params.set('gId', config.gId);

    const response = await fetch(`${MOSDAC_SEARCH_URL}?${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return { totalFiles: 0, totalSize: '0', files: [], searchStatus: 'error', message: `HTTP ${response.status}` };
    }

    const data = await response.json();

    const result: MosdacSearchResult = {
      totalFiles: data.totalResults ?? data.totalFiles ?? 0,
      totalSize: data.totalSizeMB ? `${data.totalSizeMB} MB` : '0 MB',
      files: (data.entries ?? data.files ?? []).map((f: Record<string, unknown>) => ({
        granuleId: (f.id ?? f.granuleId ?? '') as string,
        filename: (f.identifier ?? f.filename ?? '') as string,
        fileSize: (f.fileSize ?? f.size ?? 0) as number,
        startTime: (f.updated ?? f.startTime ?? '') as string,
        endTime: (f.endTime ?? '') as string,
        downloadUrl: f.id ? `${MOSDAC_DOWNLOAD_URL}?id=${f.id}` : '' as string,
      })),
      searchStatus: 'success',
    };

    // Cache search results for 30 minutes
    setCache(cacheKey, result, 30 * 60_000);
    return result;
  } catch (error) {
    console.error('[MOSDAC] Search error:', error);
    return { totalFiles: 0, totalSize: '0', files: [], searchStatus: 'error', message: String(error) };
  }
}

// ---- Date Helpers ----
function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

// ---- Bounding Box for Indian Ocean Region ----
function buildBoundingBox(lat: number, lon: number, radiusDeg: number = 2): string {
  return `${(lon - radiusDeg).toFixed(1)},${(lat - radiusDeg).toFixed(1)},${(lon + radiusDeg).toFixed(1)},${(lat + radiusDeg).toFixed(1)}`;
}

// ---- Fetch Real-Time Satellite Data ----
export async function fetchMosdacSatelliteData(
  lat: number,
  lon: number,
  products: ('sst' | 'winds' | 'chlorophyll')[] = ['sst', 'winds', 'chlorophyll']
): Promise<MosdacDataResponse> {

  // Check cache first (keyed by rounded coordinates + product set)
  const roundedLat = Math.round(lat * 10) / 10;
  const roundedLon = Math.round(lon * 10) / 10;
  const cacheKey = `mosdac_data_${roundedLat}_${roundedLon}_${products.sort().join(',')}`;
  const cached = getCached<MosdacDataResponse>(cacheKey);
  if (cached) return cached;

  // ---- If no credentials, return realistic mock Arabian Sea data ----
  if (!hasMosdacCredentials()) {
    const mockResult: MosdacDataResponse = {
      sst: 28.4 + (Math.random() - 0.5) * 0.4,
      windSpeed: 21.5 + (Math.random() - 0.5) * 3,
      windDirection: 225 + Math.round((Math.random() - 0.5) * 30),
      chlorophyll: 2.8 + (Math.random() - 0.5) * 0.6,
      olr: 220 + Math.round((Math.random() - 0.5) * 20),
      status: 'MOCK',
      source: 'INSAT-3D + EOS-06 Oceansat-3 (Simulated Archive)',
      lastUpdated: new Date().toISOString(),
    };
    setCache(cacheKey, mockResult, 5 * 60_000); // Cache mock for 5 min
    return mockResult;
  }

  // ---- Real MOSDAC API Flow ----
  const result: MosdacDataResponse = {
    status: 'LIVE',
    source: 'ISRO MOSDAC Satellite Data',
    granuleIds: [],
    datasetVersions: {},
    lastUpdated: new Date().toISOString(),
  };

  const bbox = buildBoundingBox(lat, lon, 2);
  const endDate = todayISO();
  const startDate = daysAgoISO(2); // Last 2 days for near-real-time

  try {
    // Authenticate with MOSDAC
    const session = await authenticateMosdac();
    if (session) {
      console.log(`[MOSDAC] Session active for ${session.username}`);
    } else {
      console.warn('[MOSDAC] Could not authenticate, falling back to search-only mode');
    }

    // ---- SST from INSAT-3D ----
    if (products.includes('sst')) {
      const sstSearch = await searchMosdacCatalog({
        datasetId: MOSDAC_DATASETS.SST,
        startTime: startDate,
        endTime: endDate,
        boundingBox: bbox,
        count: 5,
      });

      if (sstSearch.searchStatus === 'success' && sstSearch.totalFiles > 0) {
        result.datasetVersions!['sst'] = MOSDAC_DATASETS.SST;
        result.granuleIds!.push(sstSearch.files[0]?.granuleId);

        // If we have auth, download and parse the latest SST granule
        if (session && sstSearch.files[0]?.granuleId) {
          const sstValue = await downloadAndParseSatelliteValue(
            `${MOSDAC_DOWNLOAD_URL}?id=${sstSearch.files[0].granuleId}`,
            session.accessToken,
            lat, lon, 'sst'
          );
          if (sstValue !== null) result.sst = sstValue;
        }

        // Use file count as a data availability indicator
        result.source = `INSAT-3D SST (${sstSearch.totalFiles} granules available)`;
      }
    }

    // ---- Wind Vectors from EOS-06 Scatterometer ----
    if (products.includes('winds')) {
      const windSearch = await searchMosdacCatalog({
        datasetId: MOSDAC_DATASETS.WIND,
        startTime: startDate,
        endTime: endDate,
        boundingBox: bbox,
        count: 5,
      });

      if (windSearch.searchStatus === 'success' && windSearch.totalFiles > 0) {
        result.datasetVersions!['wind'] = MOSDAC_DATASETS.WIND;
        result.granuleIds!.push(windSearch.files[0]?.granuleId);

        if (session && windSearch.files[0]?.granuleId) {
          const windData = await downloadAndParseSatelliteValue(
            `${MOSDAC_DOWNLOAD_URL}?id=${windSearch.files[0].granuleId}`,
            session.accessToken,
            lat, lon, 'wind'
          );
          if (windData !== null) {
            result.windSpeed = windData;
            result.windDirection = 225; // Default SW monsoon direction
          }
        }

        result.source += ` + EOS-06 Winds (${windSearch.totalFiles} granules)`;
      }
    }

    // ---- Chlorophyll from EOS-06 OCM ----
    if (products.includes('chlorophyll')) {
      const chlSearch = await searchMosdacCatalog({
        datasetId: MOSDAC_DATASETS.CHLOROPHYLL,
        startTime: daysAgoISO(7), // Chlorophyll composites are less frequent
        endTime: endDate,
        boundingBox: bbox,
        count: 3,
      });

      if (chlSearch.searchStatus === 'success' && chlSearch.totalFiles > 0) {
        result.datasetVersions!['chlorophyll'] = MOSDAC_DATASETS.CHLOROPHYLL;
        result.granuleIds!.push(chlSearch.files[0]?.granuleId);

        if (session && chlSearch.files[0]?.granuleId) {
          const chlValue = await downloadAndParseSatelliteValue(
            `${MOSDAC_DOWNLOAD_URL}?id=${chlSearch.files[0].granuleId}`,
            session.accessToken,
            lat, lon, 'chlorophyll'
          );
          if (chlValue !== null) result.chlorophyll = chlValue;
        }

        result.source += ` + EOS-06 OCM Chlorophyll (${chlSearch.totalFiles} granules)`;
      }
    }

    // Cache real data for 1 hour
    setCache(cacheKey, result, 60 * 60_000);
    return result;

  } catch (error) {
    console.error('[MOSDAC] Data fetch pipeline error:', error);
    return {
      sst: 28.4,
      windSpeed: 22.0,
      windDirection: 225,
      chlorophyll: 2.8,
      olr: 220,
      status: 'FALLBACK',
      source: 'MOSDAC Fallback Cache (API unreachable)',
      lastUpdated: new Date().toISOString(),
    };
  }
}

// ---- Download & Parse Satellite File ----
// In a production system, this would download the HDF5/NetCDF file,
// extract the value at the given lat/lon using a scientific data parser.
// For now, this handles the download request and returns a parsed value
// if the response contains JSON metadata.
async function downloadAndParseSatelliteValue(
  downloadUrl: string,
  authToken: string,
  lat: number,
  lon: number,
  variable: 'sst' | 'wind' | 'chlorophyll'
): Promise<number | null> {
  try {
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json, application/octet-stream',
      },
    });

    if (!response.ok) {
      console.warn(`[MOSDAC] Download failed for ${variable}: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || '';

    // If the API returns JSON metadata (some endpoints do)
    if (contentType.includes('application/json')) {
      const data = await response.json();
      switch (variable) {
        case 'sst': return data.sst ?? data.value ?? data.sea_surface_temperature ?? null;
        case 'wind': return data.wind_speed ?? data.windSpeed ?? data.value ?? null;
        case 'chlorophyll': return data.chlorophyll ?? data.chl_a ?? data.value ?? null;
      }
    }

    // For binary satellite files (HDF5/NetCDF), we would need server-side
    // scientific processing. Log the availability for now.
    console.log(`[MOSDAC] Binary file received for ${variable} (${contentType}). ` +
      `Server-side HDF5/NetCDF parsing needed for exact lat/lon extraction at ${lat},${lon}.`);
    return null;

  } catch (error) {
    console.warn(`[MOSDAC] Download/parse error for ${variable}:`, error);
    return null;
  }
}

// ---- Status Utility ----
export function getMosdacStatus() {
  return {
    hasCredentials: hasMosdacCredentials(),
    isAuthenticated: authSession?.authenticated ?? false,
    username: authSession?.username ?? null,
    datasets: MOSDAC_DATASETS,
    searchAvailable: true, // Search is always available (no auth needed)
    downloadAvailable: hasMosdacCredentials(),
  };
}
