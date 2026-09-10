// ============================================================
// ORCA Mock Data — Realistic Marine Data for Demo Mode
// Location: Mumbai / Arabian Sea (18.95°N, 72.82°E)
// ============================================================

import {
  MarineConditions, WeatherData, WaveData, OceanData, SafetyScore,
  FishingZone, Vessel, RouteOption, Alert, WeatherForecast, ForecastPoint,
  OceanMetric, DataSource, Location, Agent
} from '@/types/marine';

// ---- Utility: Add variance to make data feel alive ----
function vary(base: number, variance: number): number {
  return +(base + (Math.random() - 0.5) * 2 * variance).toFixed(2);
}

// ---- Default Location ----
export const DEFAULT_LOCATION: Location = {
  coordinates: { lat: 18.95, lon: 72.82 },
  name: 'Mumbai Coast',
  region: 'Arabian Sea',
};

// ---- Weather ----
export function getMockWeather(): WeatherData {
  return {
    windSpeed: vary(22, 3),
    windDirection: 'SW',
    windDegrees: vary(225, 10),
    temperature: vary(30, 1),
    humidity: vary(78, 5),
    pressure: vary(1008, 3),
    visibility: vary(8.5, 1),
    cloudCover: vary(45, 10),
    rainfall: vary(0.2, 0.2),
    uvIndex: 7,
    description: 'Partly cloudy with moderate winds',
    icon: 'cloud-sun',
  };
}

// ---- Waves ----
export function getMockWaves(): WaveData {
  return {
    height: vary(1.8, 0.3),
    period: vary(8, 1),
    direction: 'NW',
    directionDegrees: vary(315, 15),
    swellHeight: vary(1.2, 0.2),
    swellDirection: 'W',
    swellPeriod: vary(10, 1),
  };
}

// ---- Ocean ----
export function getMockOcean(): OceanData {
  return {
    sst: vary(28.4, 0.5),
    salinity: vary(35.2, 0.3),
    currentSpeed: vary(1.2, 0.2),
    currentDirection: 'NE',
    currentDegrees: vary(45, 10),
    chlorophyll: vary(2.8, 0.5),
    mixedLayerDepth: vary(32, 5),
    seaLevel: vary(0.12, 0.05),
    waterTempAtDepth: vary(24.6, 0.5),
    bathymetry: 85,
  };
}

// ---- Safety Score ----
export function getMockSafety(): SafetyScore {
  return {
    overall: 78,
    status: 'SAFE',
    label: 'Safe to Sail',
    components: [
      { name: 'Wave Risk', score: 72, weight: 30, description: 'Moderate wave conditions' },
      { name: 'Wind Risk', score: 68, weight: 25, description: 'Manageable wind speeds' },
      { name: 'Current Risk', score: 85, weight: 15, description: 'Normal current patterns' },
      { name: 'Storm Risk', score: 92, weight: 20, description: 'No storms expected' },
      { name: 'Traffic Risk', score: 80, weight: 10, description: 'Moderate vessel traffic' },
    ],
  };
}

// ---- Unified Marine Conditions ----
export function getMockMarineConditions(): MarineConditions {
  return {
    location: DEFAULT_LOCATION,
    weather: getMockWeather(),
    waves: getMockWaves(),
    ocean: getMockOcean(),
    safety: getMockSafety(),
    timestamp: new Date().toISOString(),
    source: 'ORCA Demo Engine',
    dataStatus: 'MOCK',
  };
}

// ---- Dashboard Metrics ----
export function getMockDashboardMetrics(): OceanMetric[] {
  const weather = getMockWeather();
  const waves = getMockWaves();
  const ocean = getMockOcean();

  return [
    {
      id: 'wind',
      label: 'Wind',
      value: Math.round(weather.windSpeed),
      unit: 'km/h',
      trend: 'up',
      status: weather.windSpeed > 30 ? 'danger' : weather.windSpeed > 20 ? 'moderate' : 'good',
      icon: 'wind',
      description: weather.windDirection,
    },
    {
      id: 'waves',
      label: 'Wave Height',
      value: waves.height.toFixed(1),
      unit: 'm',
      trend: 'up',
      status: waves.height > 3 ? 'danger' : waves.height > 2 ? 'moderate' : 'good',
      icon: 'waves',
    },
    {
      id: 'sst',
      label: 'Sea Temperature',
      value: ocean.sst.toFixed(1),
      unit: '°C',
      trend: 'stable',
      status: 'good',
      icon: 'thermometer',
    },
    {
      id: 'current',
      label: 'Current',
      value: ocean.currentSpeed.toFixed(1),
      unit: 'knots',
      trend: 'down',
      status: ocean.currentSpeed > 2 ? 'warning' : 'good',
      icon: 'navigation',
      description: ocean.currentDirection,
    },
    {
      id: 'visibility',
      label: 'Visibility',
      value: weather.visibility.toFixed(1),
      unit: 'km',
      trend: 'stable',
      status: weather.visibility < 3 ? 'danger' : weather.visibility < 5 ? 'warning' : 'good',
      icon: 'eye',
    },
    {
      id: 'condition',
      label: 'Sea Condition',
      value: 'Moderate',
      unit: '',
      trend: 'stable',
      status: 'moderate',
      icon: 'anchor',
    },
  ];
}

// ---- Fishing Zones ----
export function getMockFishingZones(): FishingZone[] {
  return [
    {
      id: 'zone-a',
      name: 'Fishing Zone A — Mumbai High Shelf',
      center: { lat: 18.62, lon: 72.15 },
      radius: 15,
      suitabilityScore: 88,
      sst: 27.8,
      chlorophyll: 3.4,
      currentSpeed: 1.1,
      salinity: 35.0,
      depth: 72,
      historicalActivity: 'High',
      fishingEffort: 85,
      season: 'Post-monsoon',
      distanceFromCoast: 42,
      color: '#10b981',
      sectorId: 'konkan',
      factors: [
        { name: 'SST Suitability', value: 27.8, score: 82, unit: '°C' },
        { name: 'Chlorophyll-a', value: 3.4, score: 91, unit: 'mg/m³' },
        { name: 'Current', value: 1.1, score: 73, unit: 'knots' },
      ],
    },
    {
      id: 'zone-b',
      name: 'Fishing Zone B — Alibag Coastal Shelf',
      center: { lat: 18.80, lon: 72.40 },
      radius: 11,
      suitabilityScore: 96,
      sst: 27.2,
      chlorophyll: 4.1,
      currentSpeed: 0.8,
      salinity: 34.8,
      depth: 48,
      historicalActivity: 'High',
      fishingEffort: 78,
      season: 'Post-monsoon',
      distanceFromCoast: 24,
      color: '#06b6d4',
      sectorId: 'konkan',
      factors: [
        { name: 'SST Suitability', value: 27.2, score: 94, unit: '°C' },
        { name: 'Chlorophyll-a', value: 4.1, score: 98, unit: 'mg/m³' },
      ],
    },
    {
      id: 'zone-c',
      name: 'Fishing Zone C — Deep Offshore Trench',
      center: { lat: 19.15, lon: 72.55 },
      radius: 18,
      suitabilityScore: 72,
      sst: 28.5,
      chlorophyll: 2.2,
      currentSpeed: 1.6,
      salinity: 35.5,
      depth: 115,
      historicalActivity: 'Medium',
      fishingEffort: 60,
      season: 'Post-monsoon',
      distanceFromCoast: 58,
      color: '#f59e0b',
      sectorId: 'konkan',
      factors: [
        { name: 'SST Suitability', value: 28.5, score: 70, unit: '°C' },
        { name: 'Chlorophyll-a', value: 2.2, score: 65, unit: 'mg/m³' },
      ],
    },
    {
      id: 'zone-gujarat',
      name: 'Dwarka Thermal Front PFZ',
      center: { lat: 21.80, lon: 69.10 },
      radius: 20,
      suitabilityScore: 94,
      sst: 26.5,
      chlorophyll: 4.2,
      currentSpeed: 1.4,
      salinity: 35.8,
      depth: 55,
      historicalActivity: 'High',
      fishingEffort: 92,
      season: 'Post-monsoon',
      distanceFromCoast: 35,
      color: '#8b5cf6',
      sectorId: 'gujarat',
      factors: [
        { name: 'SST Suitability', value: 26.5, score: 95, unit: '°C' },
        { name: 'Chlorophyll-a', value: 4.2, score: 96, unit: 'mg/m³' },
      ],
    },
    {
      id: 'zone-gujarat-2',
      name: 'Porbandar Deep Shelf PFZ',
      center: { lat: 21.40, lon: 69.40 },
      radius: 16,
      suitabilityScore: 89,
      sst: 26.8,
      chlorophyll: 3.8,
      currentSpeed: 1.2,
      salinity: 35.6,
      depth: 62,
      historicalActivity: 'High',
      fishingEffort: 85,
      season: 'Post-monsoon',
      distanceFromCoast: 28,
      color: '#a855f7',
      sectorId: 'gujarat',
      factors: [],
    },
    {
      id: 'zone-goa',
      name: 'Marmagao Upwelling PFZ',
      center: { lat: 15.25, lon: 73.50 },
      radius: 14,
      suitabilityScore: 86,
      sst: 28.0,
      chlorophyll: 3.1,
      currentSpeed: 0.9,
      salinity: 34.9,
      depth: 60,
      historicalActivity: 'High',
      fishingEffort: 78,
      season: 'Post-monsoon',
      distanceFromCoast: 25,
      color: '#ec4899',
      sectorId: 'goa',
      factors: [],
    },
    {
      id: 'zone-kanara',
      name: 'Malpe High-Yield Shelf PFZ',
      center: { lat: 13.35, lon: 74.50 },
      radius: 15,
      suitabilityScore: 91,
      sst: 28.2,
      chlorophyll: 3.7,
      currentSpeed: 1.0,
      salinity: 34.6,
      depth: 55,
      historicalActivity: 'High',
      fishingEffort: 88,
      season: 'Post-monsoon',
      distanceFromCoast: 30,
      color: '#10b981',
      sectorId: 'kanara',
      factors: [],
    },
    {
      id: 'zone-kochi',
      name: 'Kochi Deep-Sea Sardine PFZ',
      center: { lat: 9.85, lon: 75.80 },
      radius: 16,
      suitabilityScore: 92,
      sst: 28.4,
      chlorophyll: 3.8,
      currentSpeed: 1.2,
      salinity: 34.5,
      depth: 80,
      historicalActivity: 'High',
      fishingEffort: 90,
      season: 'Post-monsoon',
      distanceFromCoast: 38,
      color: '#10b981',
      sectorId: 'malabar',
      factors: [],
    },
    {
      id: 'zone-chennai',
      name: 'Coromandel Chlorophyll Ridge PFZ',
      center: { lat: 13.15, lon: 80.60 },
      radius: 14,
      suitabilityScore: 85,
      sst: 28.9,
      chlorophyll: 3.0,
      currentSpeed: 1.0,
      salinity: 35.1,
      depth: 65,
      historicalActivity: 'High',
      fishingEffort: 80,
      season: 'Post-monsoon',
      distanceFromCoast: 30,
      color: '#14b8a6',
      sectorId: 'coromandel',
      factors: [],
    },
    {
      id: 'zone-vizag',
      name: 'Visakhapatnam Shelf Front PFZ',
      center: { lat: 17.55, lon: 83.50 },
      radius: 15,
      suitabilityScore: 90,
      sst: 27.9,
      chlorophyll: 3.6,
      currentSpeed: 1.3,
      salinity: 34.7,
      depth: 90,
      historicalActivity: 'High',
      fishingEffort: 88,
      season: 'Post-monsoon',
      distanceFromCoast: 32,
      color: '#10b981',
      sectorId: 'andhra',
      factors: [],
    },
    {
      id: 'zone-odisha',
      name: 'Paradip-Puri Phytoplankton Belt',
      center: { lat: 20.05, lon: 86.80 },
      radius: 14,
      suitabilityScore: 87,
      sst: 27.2,
      chlorophyll: 3.5,
      currentSpeed: 1.1,
      salinity: 33.8,
      depth: 50,
      historicalActivity: 'High',
      fishingEffort: 82,
      season: 'Post-monsoon',
      distanceFromCoast: 28,
      color: '#14b8a6',
      sectorId: 'odisha',
      factors: [],
    },
    {
      id: 'zone-bengal',
      name: 'Digha Estuarine Nutrient PFZ',
      center: { lat: 21.35, lon: 88.00 },
      radius: 12,
      suitabilityScore: 83,
      sst: 26.8,
      chlorophyll: 4.0,
      currentSpeed: 1.5,
      salinity: 32.5,
      depth: 35,
      historicalActivity: 'Medium',
      fishingEffort: 75,
      season: 'Post-monsoon',
      distanceFromCoast: 22,
      color: '#f59e0b',
      sectorId: 'bengal',
      factors: [],
    },
    {
      id: 'zone-lakshadweep',
      name: 'Kavaratti Tuna Upwelling PFZ',
      center: { lat: 10.56, lon: 72.40 },
      radius: 16,
      suitabilityScore: 95,
      sst: 28.8,
      chlorophyll: 4.3,
      currentSpeed: 0.9,
      salinity: 35.2,
      depth: 140,
      historicalActivity: 'High',
      fishingEffort: 85,
      season: 'Post-monsoon',
      distanceFromCoast: 12,
      color: '#06b6d4',
      sectorId: 'lakshadweep',
      factors: [],
    },
    {
      id: 'zone-andaman',
      name: 'Port Blair Deep Trench PFZ',
      center: { lat: 11.62, lon: 92.50 },
      radius: 18,
      suitabilityScore: 93,
      sst: 29.0,
      chlorophyll: 3.9,
      currentSpeed: 1.1,
      salinity: 34.0,
      depth: 180,
      historicalActivity: 'High',
      fishingEffort: 82,
      season: 'Post-monsoon',
      distanceFromCoast: 15,
      color: '#8b5cf6',
      sectorId: 'andaman',
      factors: [],
    },
    {
      id: 'zone-lakshadweep',
      name: 'Kavaratti Lagoon Oceanic Tuna PFZ',
      center: { lat: 10.40, lon: 72.30 },
      radius: 20,
      suitabilityScore: 96,
      sst: 28.5,
      chlorophyll: 4.5,
      currentSpeed: 0.8,
      salinity: 35.5,
      depth: 250,
      historicalActivity: 'High',
      fishingEffort: 95,
      season: 'Post-monsoon',
      distanceFromCoast: 15,
      color: '#10b981',
      factors: [],
    },
    {
      id: 'zone-andaman',
      name: 'Port Blair Deep Pelagic Trench PFZ',
      center: { lat: 11.45, lon: 92.90 },
      radius: 22,
      suitabilityScore: 91,
      sst: 28.8,
      chlorophyll: 3.7,
      currentSpeed: 0.9,
      salinity: 34.6,
      depth: 320,
      historicalActivity: 'High',
      fishingEffort: 89,
      season: 'Post-monsoon',
      distanceFromCoast: 25,
      color: '#10b981',
      factors: [],
    },
  ];
}

// ---- Vessels ----
export function getMockVessels(): Vessel[] {
  return [
    { id: 'INF-2847', name: 'Sagar Mitra', type: 'fishing', position: { lat: 18.88, lon: 72.70 }, speed: 4.2, heading: 215, activity: 'Fishing', lastUpdated: new Date().toISOString(), flag: 'IN', length: 12 },
    { id: 'INF-3102', name: 'Matsya Rani', type: 'fishing', position: { lat: 18.72, lon: 72.45 }, speed: 6.1, heading: 180, activity: 'Transit', lastUpdated: new Date().toISOString(), flag: 'IN', length: 15 },
    { id: 'INF-1965', name: 'Deep Blue', type: 'fishing', position: { lat: 18.95, lon: 72.15 }, speed: 0.3, heading: 90, activity: 'Anchored', lastUpdated: new Date().toISOString(), flag: 'IN', length: 18 },
    { id: 'INC-8841', name: 'Mumbai Express', type: 'commercial', position: { lat: 18.82, lon: 72.88 }, speed: 12.5, heading: 270, activity: 'Transit', lastUpdated: new Date().toISOString(), flag: 'IN', length: 185 },
    { id: 'INF-4420', name: 'Samudra', type: 'fishing', position: { lat: 18.65, lon: 72.30 }, speed: 3.8, heading: 165, activity: 'Fishing', lastUpdated: new Date().toISOString(), flag: 'IN', length: 14 },
    { id: 'INF-5591', name: 'Neel Kamal', type: 'fishing', position: { lat: 19.02, lon: 72.60 }, speed: 5.5, heading: 200, activity: 'Transit', lastUpdated: new Date().toISOString(), flag: 'IN', length: 11 },
    { id: 'INC-7723', name: 'Arabian Star', type: 'cargo', position: { lat: 18.50, lon: 72.95 }, speed: 14.2, heading: 310, activity: 'Transit', lastUpdated: new Date().toISOString(), flag: 'PA', length: 220 },
    { id: 'INF-6678', name: 'Meenakshi', type: 'fishing', position: { lat: 18.78, lon: 72.55 }, speed: 2.1, heading: 45, activity: 'Fishing', lastUpdated: new Date().toISOString(), flag: 'IN', length: 13 },
    { id: 'INP-3340', name: 'Mandovi Queen', type: 'passenger', position: { lat: 18.92, lon: 72.83 }, speed: 8.0, heading: 0, activity: 'Docked', lastUpdated: new Date().toISOString(), flag: 'IN', length: 42 },
    { id: 'INF-8892', name: 'Sagari', type: 'fishing', position: { lat: 18.55, lon: 72.20 }, speed: 4.7, heading: 190, activity: 'Fishing', lastUpdated: new Date().toISOString(), flag: 'IN', length: 16 },
    { id: 'INF-2215', name: 'Jal Devi', type: 'fishing', position: { lat: 19.10, lon: 72.48 }, speed: 0.5, heading: 120, activity: 'Anchored', lastUpdated: new Date().toISOString(), flag: 'IN', length: 10 },
    { id: 'INC-4456', name: 'Coastal Runner', type: 'commercial', position: { lat: 18.40, lon: 72.78 }, speed: 10.8, heading: 255, activity: 'Transit', lastUpdated: new Date().toISOString(), flag: 'SG', length: 95 },
    { id: 'INF-7734', name: 'Varuna', type: 'fishing', position: { lat: 18.68, lon: 72.38 }, speed: 3.2, heading: 175, activity: 'Fishing', lastUpdated: new Date().toISOString(), flag: 'IN', length: 14 },
    { id: 'INF-9901', name: 'Priya', type: 'fishing', position: { lat: 18.85, lon: 72.62 }, speed: 5.9, heading: 230, activity: 'Transit', lastUpdated: new Date().toISOString(), flag: 'IN', length: 12 },
    { id: 'INF-1123', name: 'Ocean Pearl', type: 'fishing', position: { lat: 18.58, lon: 72.28 }, speed: 1.8, heading: 300, activity: 'Fishing', lastUpdated: new Date().toISOString(), flag: 'IN', length: 17 },
    { id: 'INC-6609', name: 'Bharat Sagar', type: 'cargo', position: { lat: 18.45, lon: 73.05 }, speed: 11.5, heading: 180, activity: 'Transit', lastUpdated: new Date().toISOString(), flag: 'IN', length: 165 },
    { id: 'INF-3367', name: 'Lakshmi', type: 'fishing', position: { lat: 19.05, lon: 72.42 }, speed: 4.0, heading: 210, activity: 'Fishing', lastUpdated: new Date().toISOString(), flag: 'IN', length: 13 },
    { id: 'INF-5548', name: 'Sindhu', type: 'fishing', position: { lat: 18.75, lon: 72.50 }, speed: 0.2, heading: 0, activity: 'Anchored', lastUpdated: new Date().toISOString(), flag: 'IN', length: 15 },
    { id: 'INF-8870', name: 'Triton', type: 'fishing', position: { lat: 18.62, lon: 72.18 }, speed: 6.3, heading: 195, activity: 'Transit', lastUpdated: new Date().toISOString(), flag: 'IN', length: 19 },
    { id: 'INO-2244', name: 'Sea Breeze', type: 'other', position: { lat: 18.98, lon: 72.75 }, speed: 7.5, heading: 135, activity: 'Patrol', lastUpdated: new Date().toISOString(), flag: 'IN', length: 28 },
  ];
}

// ---- Routes ----
export function getMockRoutes(): RouteOption[] {
  return [
    {
      id: 'route-a',
      name: 'Route A — Direct',
      waypoints: [
        { lat: 18.95, lon: 72.82 },
        { lat: 18.85, lon: 72.60 },
        { lat: 18.72, lon: 72.35 },
        { lat: 18.62, lon: 72.15 },
      ],
      distance: 32,
      eta: '1h 25m',
      etaMinutes: 85,
      safetyScore: 91,
      fuelEfficiency: 'High',
      isRecommended: false,
      weatherAlongRoute: 'Moderate winds, manageable waves',
      waveExposure: 'Moderate',
      trafficDensity: 'Medium (MarineTraffic AIS)',
      aisSource: 'MarineTraffic Live AIS',
      aisUrl: 'https://www.marinetraffic.com/en/ais/home/centerx:-12.0/centery:25.0/zoom:4',
      risks: [
        { type: 'Vessel Traffic', severity: 'MEDIUM', description: 'Moderate traffic near shipping lane (verified via MarineTraffic AIS)' },
      ],
    },
    {
      id: 'route-b',
      name: 'Route B — Coastal Safe',
      waypoints: [
        { lat: 18.95, lon: 72.82 },
        { lat: 18.90, lon: 72.65 },
        { lat: 18.82, lon: 72.48 },
        { lat: 18.75, lon: 72.32 },
        { lat: 18.65, lon: 72.20 },
        { lat: 18.62, lon: 72.15 },
      ],
      distance: 38,
      eta: '1h 40m',
      etaMinutes: 100,
      safetyScore: 96,
      fuelEfficiency: 'Medium',
      isRecommended: true,
      reason: 'Lower wave exposure and zero commercial vessel collision risk based on MarineTraffic AIS vessel tracking.',
      weatherAlongRoute: 'Sheltered from western swell',
      waveExposure: 'Low',
      trafficDensity: 'Low (MarineTraffic AIS)',
      aisSource: 'MarineTraffic Live AIS',
      aisUrl: 'https://www.marinetraffic.com/en/ais/home/centerx:-12.0/centery:25.0/zoom:4',
      risks: [],
    },
    {
      id: 'route-c',
      name: 'Route C — Offshore',
      waypoints: [
        { lat: 18.95, lon: 72.82 },
        { lat: 18.80, lon: 72.55 },
        { lat: 18.60, lon: 72.10 },
        { lat: 18.62, lon: 72.15 },
      ],
      distance: 29,
      eta: '1h 18m',
      etaMinutes: 78,
      safetyScore: 72,
      fuelEfficiency: 'Low',
      isRecommended: false,
      weatherAlongRoute: 'Exposed to stronger winds and swell',
      waveExposure: 'High',
      trafficDensity: 'High (MarineTraffic AIS)',
      aisSource: 'MarineTraffic Live AIS',
      aisUrl: 'https://www.marinetraffic.com/en/ais/home/centerx:-12.0/centery:25.0/zoom:4',
      risks: [
        { type: 'Wave Exposure', severity: 'HIGH', description: 'Higher swell expected in open water' },
        { type: 'Vessel Traffic', severity: 'HIGH', description: 'Crosses major commercial shipping lane (18 vessels tracked on MarineTraffic AIS)' },
      ],
    },
    {
      id: 'route-d',
      name: 'Route D — MarineTraffic AIS Shipping Lane Bypass',
      waypoints: [
        { lat: 18.95, lon: 72.82 },
        { lat: 18.88, lon: 72.70 },
        { lat: 18.78, lon: 72.50 },
        { lat: 18.68, lon: 72.30 },
        { lat: 18.62, lon: 72.15 },
      ],
      distance: 35,
      eta: '1h 30m',
      etaMinutes: 90,
      safetyScore: 94,
      fuelEfficiency: 'High',
      isRecommended: false,
      reason: 'Calculated using real-time MarineTraffic AIS vessel density maps to bypass major container vessel traffic channels.',
      weatherAlongRoute: 'Favorable winds and mild waves',
      waveExposure: 'Low',
      trafficDensity: 'Very Low (MarineTraffic AIS)',
      aisSource: 'MarineTraffic Live AIS',
      aisUrl: 'https://www.marinetraffic.com/en/ais/home/centerx:-12.0/centery:25.0/zoom:4',
      risks: [],
    },
  ];
}

// ---- Alerts ----
export function getMockAlerts(): Alert[] {
  const now = new Date();
  return [
    {
      id: 'alert-1',
      type: 'high_waves',
      severity: 'HIGH',
      title: 'High Wave Alert',
      description: 'Wave height expected to increase to 3.2 m in the evening hours.',
      location: 'Arabian Sea — Mumbai Coast',
      area: { lat: 18.95, lon: 72.82 },
      startTime: new Date(now.getTime() + 6 * 3600000).toISOString(),
      endTime: new Date(now.getTime() + 11 * 3600000).toISOString(),
      recommendation: 'Return to shore before 18:00. Avoid open water during this period.',
      isActive: true,
      source: 'INCOIS',
    },
    {
      id: 'alert-2',
      type: 'strong_wind',
      severity: 'MEDIUM',
      title: 'Strong Wind Advisory',
      description: 'Wind speeds expected to reach 35-40 km/h from the southwest.',
      location: 'Arabian Sea — Offshore Mumbai',
      area: { lat: 18.70, lon: 72.50 },
      startTime: new Date(now.getTime() + 4 * 3600000).toISOString(),
      endTime: new Date(now.getTime() + 14 * 3600000).toISOString(),
      recommendation: 'Exercise caution if sailing. Secure equipment and check vessel stability.',
      isActive: true,
      source: 'IMD',
    },
    {
      id: 'alert-3',
      type: 'high_traffic',
      severity: 'LOW',
      title: 'High Vessel Traffic',
      description: 'Increased commercial vessel activity near Mumbai Port approach channel.',
      location: 'Mumbai Port Approach',
      area: { lat: 18.92, lon: 72.85 },
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + 8 * 3600000).toISOString(),
      recommendation: 'Maintain safe distance from shipping lanes. Use AIS if available.',
      isActive: true,
      source: 'VTS Mumbai',
    },
    {
      id: 'alert-4',
      type: 'dangerous_current',
      severity: 'MEDIUM',
      title: 'Strong Current Warning',
      description: 'Tidal currents exceeding 2.5 knots near the estuary mouth.',
      location: 'Thane Creek Entrance',
      area: { lat: 19.05, lon: 72.90 },
      startTime: new Date(now.getTime() + 2 * 3600000).toISOString(),
      endTime: new Date(now.getTime() + 5 * 3600000).toISOString(),
      recommendation: 'Avoid small vessel transit during peak tidal flow.',
      isActive: true,
      source: 'INCOIS',
    },
    {
      id: 'alert-5',
      type: 'low_visibility',
      severity: 'LOW',
      title: 'Reduced Visibility Expected',
      description: 'Morning fog and haze may reduce visibility to 2-3 km.',
      location: 'Mumbai Coastal Waters',
      area: { lat: 18.95, lon: 72.82 },
      startTime: new Date(now.getTime() + 18 * 3600000).toISOString(),
      endTime: new Date(now.getTime() + 22 * 3600000).toISOString(),
      recommendation: 'Use navigation lights. Reduce speed in low visibility areas.',
      isActive: false,
      source: 'IMD',
    },
  ];
}

// ---- Hourly Forecast ----
export function getMockForecast(): ForecastPoint[] {
  const now = new Date();
  const points: ForecastPoint[] = [];

  const baseWind = 22;
  const baseWave = 1.8;
  const baseTemp = 30;
  const baseRain = 0;
  const basePressure = 1008;

  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 3600000);
    const hour = time.getHours();
    const isEvening = hour >= 18 && hour <= 23;
    const isNight = hour >= 0 && hour < 6;

    const windMultiplier = isEvening ? 1.6 : isNight ? 1.2 : 1.0;
    const waveMultiplier = isEvening ? 1.8 : isNight ? 1.4 : 1.0;

    const windSpeed = vary(baseWind * windMultiplier, 2);
    const waveHeight = vary(baseWave * waveMultiplier, 0.2);
    const isDangerous = waveHeight > 2.8 || windSpeed > 35;

    points.push({
      time: time.toISOString(),
      label: time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      windSpeed: +windSpeed.toFixed(1),
      windDirection: 'SW',
      waveHeight: +waveHeight.toFixed(1),
      wavePeriod: vary(8, 1),
      temperature: vary(baseTemp - (isNight ? 2 : 0), 0.5),
      rainfall: isEvening ? vary(2, 1) : vary(baseRain, 0.1),
      pressure: vary(basePressure - (isEvening ? 3 : 0), 1),
      isDangerous,
      dangerReason: isDangerous ? 'High wave and wind conditions' : undefined,
    });
  }
  return points;
}

// ---- 7-Day Forecast ----
export function getMock7DayForecast(): WeatherForecast[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() + i * 86400000);
    const isStormy = i === 3 || i === 4;
    return {
      time: date.toISOString(),
      weather: {
        windSpeed: vary(isStormy ? 35 : 20, 5),
        windDirection: 'SW',
        windDegrees: 225,
        temperature: vary(isStormy ? 27 : 30, 1),
        humidity: vary(isStormy ? 90 : 75, 5),
        pressure: vary(isStormy ? 1002 : 1010, 2),
        visibility: vary(isStormy ? 3 : 9, 1),
        cloudCover: vary(isStormy ? 85 : 40, 10),
        rainfall: isStormy ? vary(15, 5) : vary(0.5, 0.5),
        uvIndex: isStormy ? 3 : 7,
        description: isStormy ? 'Stormy conditions expected' : 'Partly cloudy',
        icon: isStormy ? 'cloud-lightning' : 'cloud-sun',
      },
      waveHeight: vary(isStormy ? 3.5 : 1.6, 0.3),
      wavePeriod: vary(isStormy ? 12 : 8, 1),
      swellHeight: vary(isStormy ? 2.8 : 1.0, 0.2),
      swellDirection: 'W',
    };
  });
}

// ---- Data Sources ----
export function getMockDataSources(): DataSource[] {
  return [
    {
      id: 'open-meteo',
      name: 'Open-Meteo',
      description: 'Free weather and marine forecast API providing global weather, wave, and ocean data.',
      dataProvided: ['Wind speed & direction', 'Wave height & period', 'Temperature', 'Precipitation', 'Pressure'],
      updateFrequency: 'Hourly',
      dataType: 'Forecast',
      status: 'MOCK',
      url: 'https://open-meteo.com',
      isConfigured: false,
    },
    {
      id: 'noaa',
      name: 'NOAA',
      description: 'National Oceanic and Atmospheric Administration — ocean and atmospheric data from the United States.',
      dataProvided: ['Sea Surface Temperature', 'Ocean currents', 'Bathymetry', 'Sea level'],
      updateFrequency: 'Daily',
      dataType: 'Observation + Forecast',
      status: 'MOCK',
      url: 'https://www.noaa.gov',
      isConfigured: false,
    },
    {
      id: 'copernicus',
      name: 'Copernicus Marine',
      description: 'European Union\'s Earth observation programme providing ocean monitoring data.',
      dataProvided: ['SST', 'Salinity', 'Chlorophyll-a', 'Ocean currents', 'Mixed layer depth'],
      updateFrequency: 'Daily',
      dataType: 'Near Real-Time',
      status: 'MOCK',
      url: 'https://marine.copernicus.eu',
      isConfigured: false,
    },
    {
      id: 'incois',
      name: 'INCOIS',
      description: 'Indian National Centre for Ocean Information Services — ocean data and advisories for Indian waters.',
      dataProvided: ['Potential Fishing Zones', 'Ocean State Forecast', 'Tsunami warnings', 'Tidal data'],
      updateFrequency: 'Daily',
      dataType: 'Forecast + Advisory',
      status: 'MOCK',
      url: 'https://incois.gov.in',
      isConfigured: false,
    },
    {
      id: 'marinetraffic',
      name: 'MarineTraffic AIS Stream',
      description: 'Real-time global Automatic Identification System (AIS) vessel tracking, live vessel positions, shipping lane density, and route collision avoidance.',
      dataProvided: ['Live Vessel Positions', 'Shipping Lane Density', 'Vessel Speed & Heading', 'Commercial Traffic Channels', 'AIS Route Avoidance'],
      updateFrequency: 'Real-time AIS Stream',
      dataType: 'AIS Live Feed (Direct API)',
      status: 'LIVE',
      url: '/api/vessels',
      isConfigured: true,
    },
    {
      id: 'gfw',
      name: 'Global Fishing Watch',
      description: 'Open-access platform for tracking global fishing activity and vessel movements.',
      dataProvided: ['Vessel positions', 'Fishing activity', 'Vessel identity', 'Fishing effort'],
      updateFrequency: 'Near real-time',
      dataType: 'AIS-based',
      status: 'LIVE',
      url: 'https://globalfishingwatch.org',
      isConfigured: true,
    },
    {
      id: 'mapbox',
      name: 'Mapbox',
      description: 'Interactive mapping platform providing base maps, satellite imagery, and geospatial tools.',
      dataProvided: ['Base maps', 'Satellite imagery', 'Terrain data', 'Geocoding'],
      updateFrequency: 'Continuous',
      dataType: 'Map tiles',
      status: 'MOCK',
      url: 'https://www.mapbox.com',
      isConfigured: false,
    },
    {
      id: 'mosdac',
      name: 'ISRO MOSDAC',
      description: 'Meteorological and Oceanographic Satellite Data Archival Centre — ISRO\'s official satellite data archive. Uses the MOSDAC Data Download API with datasets 3DIMG_L2B_SST, E06SCA_L2B_OWV, and E06OCM_L2C_AD.',
      dataProvided: ['INSAT-3D SST (3DIMG_L2B_SST)', 'EOS-06 Scatterometer Winds (E06SCA_L2B_OWV)', 'EOS-06 OCM Chlorophyll-a (E06OCM_L2C_AD)', 'INSAT-3D OLR (3DIMG_L2B_OLR)'],
      updateFrequency: '3-hourly (INSAT-3D) / Daily (EOS-06)',
      dataType: 'Satellite Observation (Near Real-Time)',
      status: 'MOCK',
      url: 'https://www.mosdac.gov.in',
      isConfigured: false,
    },
    {
      id: 'firebase',
      name: 'Firebase Auth & Firestore',
      description: 'Google Firebase authentication and real-time cloud document database for storing user profiles, saved fishing zones, and query logs.',
      dataProvided: ['User Profiles', 'Saved Fishing Zones', 'Cloud Query Logs', 'PWA Session Tokens'],
      updateFrequency: 'Real-time Sync',
      dataType: 'Cloud Database & Auth',
      status: 'LIVE',
      url: 'https://firebase.google.com',
      isConfigured: true,
    },
    {
      id: 'rag-engine',
      name: 'ORCA RAG Engine',
      description: 'Embedded Retrieval-Augmented Generation knowledge vector store indexing ISRO MOSDAC manuals, IMD advisories, INCOIS PFZ science, and Indian EEZ regulations.',
      dataProvided: ['ISRO MOSDAC Dataset Manuals', 'IMD Cyclone & Warning Rules', 'INCOIS PFZ Thermal Gradients', 'Indian EEZ Maritime Rules'],
      updateFrequency: 'Continuous',
      dataType: 'Vector Knowledge Store',
      status: 'LIVE',
      url: 'https://www.mosdac.gov.in',
      isConfigured: true,
    },
  ];
}

// ---- Agents ----
export function getMockAgents(): Agent[] {
  return [
    { id: 'orchestrator', name: 'Orchestrator Agent', description: 'Decomposes queries, detects intent, delegates to specialists, and synthesizes results.', icon: 'brain', status: 'idle' },
    { id: 'ocean_pfz', name: 'Ocean/PFZ Agent', description: 'Evaluates SST, chlorophyll, currents, and Potential Fishing Zone (PFZ) suitability.', icon: 'waves', status: 'idle' },
    { id: 'weather_hazard', name: 'Weather/Hazard Agent', description: 'Monitors weather, wind, rainfall, lightning, cyclones, and marine advisories.', icon: 'cloud-sun', status: 'idle' },
    { id: 'gis_navigation', name: 'GIS/Navigation Agent', description: 'Handles distance, geofencing, restricted zones, route comparison, and map actions.', icon: 'map', status: 'idle' },
    { id: 'safety_decision', name: 'Safety/Decision Agent', description: 'Evaluates deterministic risk scores (0-100) and produces explainable safety decisions.', icon: 'shield-check', status: 'idle' },
  ];
}

// ---- Ocean Parameters (for Ocean Conditions page) ----
export interface OceanParameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'moderate' | 'warning' | 'danger';
  forecast: { time: string; value: number }[];
}

export function getMockOceanParameters(): OceanParameter[] {
  const ocean = getMockOcean();
  const waves = getMockWaves();
  
  const makeForecast = (base: number, variance: number) =>
    [0, 6, 12, 24, 48].map((h) => ({
      time: `+${h}h`,
      value: +(base + (Math.random() - 0.3) * variance * (h / 12)).toFixed(2),
    }));

  return [
    { id: 'sst', name: 'Sea Surface Temperature', value: ocean.sst, unit: '°C', description: 'Temperature of the ocean surface layer', trend: 'stable', status: 'good', forecast: makeForecast(ocean.sst, 0.5) },
    { id: 'salinity', name: 'Salinity', value: ocean.salinity, unit: 'PSU', description: 'Salt concentration in seawater', trend: 'stable', status: 'good', forecast: makeForecast(ocean.salinity, 0.2) },
    { id: 'current-speed', name: 'Ocean Current Speed', value: ocean.currentSpeed, unit: 'knots', description: 'Speed of ocean currents at the surface', trend: 'up', status: ocean.currentSpeed > 2 ? 'warning' : 'good', forecast: makeForecast(ocean.currentSpeed, 0.3) },
    { id: 'wave-height', name: 'Wave Height', value: waves.height, unit: 'm', description: 'Significant wave height', trend: 'up', status: waves.height > 3 ? 'danger' : waves.height > 2 ? 'moderate' : 'good', forecast: makeForecast(waves.height, 0.5) },
    { id: 'wave-period', name: 'Wave Period', value: waves.period, unit: 's', description: 'Time between successive wave crests', trend: 'stable', status: 'good', forecast: makeForecast(waves.period, 1) },
    { id: 'swell-height', name: 'Swell Height', value: waves.swellHeight, unit: 'm', description: 'Height of ocean swells from distant storms', trend: 'stable', status: 'good', forecast: makeForecast(waves.swellHeight, 0.3) },
    { id: 'chlorophyll', name: 'Chlorophyll-a', value: ocean.chlorophyll, unit: 'mg/m³', description: 'Indicator of phytoplankton abundance', trend: 'up', status: 'good', forecast: makeForecast(ocean.chlorophyll, 0.5) },
    { id: 'mld', name: 'Mixed Layer Depth', value: ocean.mixedLayerDepth, unit: 'm', description: 'Depth of the upper well-mixed ocean layer', trend: 'stable', status: 'good', forecast: makeForecast(ocean.mixedLayerDepth, 3) },
    { id: 'sea-level', name: 'Sea Level', value: ocean.seaLevel, unit: 'm', description: 'Sea level relative to mean', trend: 'stable', status: 'good', forecast: makeForecast(ocean.seaLevel, 0.05) },
    { id: 'temp-depth', name: 'Temperature at 50m', value: ocean.waterTempAtDepth, unit: '°C', description: 'Water temperature at 50 meters depth', trend: 'down', status: 'good', forecast: makeForecast(ocean.waterTempAtDepth, 0.3) },
    { id: 'bathymetry', name: 'Bathymetry', value: ocean.bathymetry, unit: 'm', description: 'Ocean floor depth below surface', trend: 'stable', status: 'good', forecast: makeForecast(ocean.bathymetry, 0) },
  ];
}
