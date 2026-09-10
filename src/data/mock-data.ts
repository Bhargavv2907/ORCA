// ============================================================
// JalSaathi Mock Data — Realistic Marine Data for Demo Mode
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
    source: 'JalSaathi Demo Engine',
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

import { generateRealTimeFishingZones } from '@/services/marine/pfz';

// ---- Fishing Zones ----
export function getMockFishingZones(): FishingZone[] {
  return generateRealTimeFishingZones(18.95, 72.82, undefined, 'Mumbai Coast');
}

// ---- Vessels ----
export function getMockVessels(): Vessel[] {
  const now = new Date().toISOString();
  return [
    // 1. Gujarat / Kutch & Saurashtra Coast
    { id: 'INC-1001', name: 'Kandla Star', type: 'cargo', position: { lat: 22.85, lon: 70.05 }, speed: 14.5, heading: 240, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 195 },
    { id: 'INF-1002', name: 'Saurashtra Queen', type: 'fishing', position: { lat: 20.90, lon: 70.36 }, speed: 5.2, heading: 180, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 15 },
    { id: 'INC-1003', name: 'Mundra Express', type: 'commercial', position: { lat: 22.35, lon: 69.75 }, speed: 16.0, heading: 290, activity: 'Transit', lastUpdated: now, flag: 'MH', length: 240 },
    { id: 'INF-1004', name: 'Dwarka Sea King', type: 'fishing', position: { lat: 21.80, lon: 68.90 }, speed: 4.1, heading: 150, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 14 },

    // 2. Konkan / Maharashtra Coast
    { id: 'INC-8841', name: 'Mumbai Express', type: 'commercial', position: { lat: 18.82, lon: 72.88 }, speed: 12.5, heading: 270, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 185 },
    { id: 'INF-2847', name: 'Sagar Mitra', type: 'fishing', position: { lat: 18.88, lon: 72.70 }, speed: 4.2, heading: 215, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 12 },
    { id: 'INC-7723', name: 'Arabian Star', type: 'cargo', position: { lat: 18.50, lon: 72.95 }, speed: 14.2, heading: 310, activity: 'Transit', lastUpdated: now, flag: 'PA', length: 220 },
    { id: 'INF-3102', name: 'Matsya Rani', type: 'fishing', position: { lat: 18.72, lon: 72.45 }, speed: 6.1, heading: 180, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 15 },
    { id: 'INP-3340', name: 'Mandovi Queen', type: 'passenger', position: { lat: 18.92, lon: 72.83 }, speed: 8.0, heading: 0, activity: 'Docked', lastUpdated: now, flag: 'IN', length: 42 },
    { id: 'INF-8892', name: 'Sagari', type: 'fishing', position: { lat: 18.55, lon: 72.20 }, speed: 4.7, heading: 190, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 16 },

    // 3. Goa Coast
    { id: 'INC-3001', name: 'Zuari Trader', type: 'cargo', position: { lat: 15.42, lon: 73.75 }, speed: 11.8, heading: 210, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 140 },
    { id: 'INF-3002', name: 'Goa Sea Princess', type: 'fishing', position: { lat: 15.25, lon: 73.65 }, speed: 3.9, heading: 140, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 13 },
    { id: 'INO-3003', name: 'Mandovi Patrol', type: 'other', position: { lat: 15.50, lon: 73.78 }, speed: 18.0, heading: 320, activity: 'Patrol', lastUpdated: now, flag: 'IN', length: 32 },

    // 4. Kanara / Karnataka Coast
    { id: 'INC-4001', name: 'Mangalore Pride', type: 'commercial', position: { lat: 12.92, lon: 74.75 }, speed: 13.4, heading: 260, activity: 'Transit', lastUpdated: now, flag: 'SG', length: 175 },
    { id: 'INF-4002', name: 'Karwar Fisher', type: 'fishing', position: { lat: 14.80, lon: 74.05 }, speed: 5.0, heading: 190, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 14 },
    { id: 'INF-4003', name: 'Netravati', type: 'fishing', position: { lat: 13.34, lon: 74.60 }, speed: 4.6, heading: 220, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 15 },

    // 5. Malabar / Kerala Coast
    { id: 'INC-5001', name: 'Cochin Express', type: 'cargo', position: { lat: 9.96, lon: 76.20 }, speed: 15.1, heading: 280, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 210 },
    { id: 'INF-5002', name: 'Kollam Pearl', type: 'fishing', position: { lat: 8.89, lon: 76.45 }, speed: 5.8, heading: 170, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 16 },
    { id: 'INC-5003', name: 'Vizhinjam Titan', type: 'commercial', position: { lat: 8.38, lon: 76.90 }, speed: 17.5, heading: 130, activity: 'Transit', lastUpdated: now, flag: 'LR', length: 280 },
    { id: 'INF-5004', name: 'Malabar Queen', type: 'fishing', position: { lat: 9.50, lon: 76.10 }, speed: 3.5, heading: 200, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 14 },

    // 6. Coromandel / Tamil Nadu Coast
    { id: 'INC-6001', name: 'Chennai Pioneer', type: 'cargo', position: { lat: 13.12, lon: 80.32 }, speed: 13.8, heading: 90, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 205 },
    { id: 'INC-6002', name: 'Tuticorin Liner', type: 'commercial', position: { lat: 8.75, lon: 78.22 }, speed: 14.9, heading: 160, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 190 },
    { id: 'INF-6003', name: 'Kanyakumari Wave', type: 'fishing', position: { lat: 8.08, lon: 77.60 }, speed: 4.8, heading: 210, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 17 },
    { id: 'INF-6004', name: 'Ennore Fisher', type: 'fishing', position: { lat: 13.25, lon: 80.35 }, speed: 3.2, heading: 75, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 12 },

    // 7. Andhra Coast
    { id: 'INC-7001', name: 'Vizag Giant', type: 'cargo', position: { lat: 17.65, lon: 83.32 }, speed: 12.9, heading: 110, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 230 },
    { id: 'INF-7002', name: 'Kakinada Sea King', type: 'fishing', position: { lat: 16.98, lon: 82.35 }, speed: 4.3, heading: 145, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 15 },
    { id: 'INC-7003', name: 'Krishnapatnam Trader', type: 'commercial', position: { lat: 14.25, lon: 80.20 }, speed: 11.2, heading: 85, activity: 'Transit', lastUpdated: now, flag: 'MH', length: 160 },
    { id: 'INF-7004', name: 'Godavari Ray', type: 'fishing', position: { lat: 16.50, lon: 82.50 }, speed: 5.1, heading: 195, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 13 },

    // 8. Utkal / Odisha Coast
    { id: 'INC-8001', name: 'Paradip Titan', type: 'cargo', position: { lat: 20.25, lon: 86.72 }, speed: 13.0, heading: 120, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 245 },
    { id: 'INF-8002', name: 'Dhamra Fisherman', type: 'fishing', position: { lat: 20.80, lon: 87.05 }, speed: 4.5, heading: 165, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 14 },
    { id: 'INO-8003', name: 'Gopalpur Coast Guard', type: 'other', position: { lat: 19.25, lon: 84.95 }, speed: 21.0, heading: 45, activity: 'Patrol', lastUpdated: now, flag: 'IN', length: 35 },

    // 9. Bengal / West Bengal Coast
    { id: 'INC-9001', name: 'Haldia Runner', type: 'cargo', position: { lat: 22.02, lon: 88.12 }, speed: 10.5, heading: 180, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 180 },
    { id: 'INF-9002', name: 'Digha Matsya', type: 'fishing', position: { lat: 21.55, lon: 87.60 }, speed: 5.4, heading: 150, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 15 },
    { id: 'INC-9003', name: 'Hooghly Navigator', type: 'commercial', position: { lat: 21.75, lon: 88.00 }, speed: 8.9, heading: 200, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 150 },

    // 10. Lakshadweep Archipelago
    { id: 'INP-10001', name: 'Kavaratti Island Ferry', type: 'passenger', position: { lat: 10.56, lon: 72.64 }, speed: 12.0, heading: 270, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 55 },
    { id: 'INF-10002', name: 'Minicoy Tuna Hunter', type: 'fishing', position: { lat: 8.28, lon: 73.05 }, speed: 6.2, heading: 180, activity: 'Fishing', lastUpdated: now, flag: 'IN', length: 18 },

    // 11. Andaman & Nicobar Islands
    { id: 'INP-11001', name: 'Port Blair Sentinel', type: 'passenger', position: { lat: 11.62, lon: 92.75 }, speed: 11.5, heading: 45, activity: 'Transit', lastUpdated: now, flag: 'IN', length: 65 },
    { id: 'INO-11002', name: 'Nicobar Patrol', type: 'other', position: { lat: 9.15, lon: 92.80 }, speed: 19.0, heading: 190, activity: 'Patrol', lastUpdated: now, flag: 'IN', length: 38 },
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
      name: 'JalSaathi RAG Engine',
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
