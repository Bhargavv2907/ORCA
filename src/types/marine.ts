// ============================================================
// ORCA — The Ocean Helper
// TypeScript Type Definitions for Marine Data
// ============================================================

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Location {
  coordinates: Coordinates;
  name: string;
  region: string;
}

// ---- Weather ----
export interface WeatherData {
  windSpeed: number;        // km/h
  windDirection: string;    // e.g. "SW"
  windDegrees: number;
  temperature: number;      // °C
  humidity: number;         // %
  pressure: number;         // hPa
  visibility: number;       // km
  cloudCover: number;       // %
  rainfall: number;         // mm
  uvIndex: number;
  description: string;
  icon: string;
}

export interface WeatherForecast {
  time: string;             // ISO string
  weather: WeatherData;
  waveHeight: number;
  wavePeriod: number;
  swellHeight: number;
  swellDirection: string;
}

// ---- Waves ----
export interface WaveData {
  height: number;           // meters
  period: number;           // seconds
  direction: string;        // e.g. "NW"
  directionDegrees: number;
  swellHeight: number;
  swellDirection: string;
  swellPeriod: number;
}

// ---- Ocean ----
export interface OceanData {
  sst: number;              // °C Sea Surface Temperature
  salinity: number;         // PSU
  currentSpeed: number;     // knots
  currentDirection: string;
  currentDegrees: number;
  chlorophyll: number;      // mg/m³
  mixedLayerDepth: number;  // meters
  seaLevel: number;         // meters relative
  waterTempAtDepth: number; // °C at 50m depth
  bathymetry: number;       // meters depth
}

// ---- Fishing ----
export interface FishingZone {
  id: string;
  name: string;
  center: Coordinates;
  radius: number;           // km
  suitabilityScore: number; // 0-100
  sst: number;
  chlorophyll: number;
  currentSpeed: number;
  salinity: number;
  depth: number;
  historicalActivity: string; // "High" | "Medium" | "Low"
  fishingEffort: number;
  season: string;
  distanceFromCoast: number;  // km
  color: string;              // hex color for map
  factors: FishingFactor[];
}

export interface FishingFactor {
  name: string;
  value: number;
  score: number;             // 0-100
  unit: string;
}

// ---- Vessels ----
export interface Vessel {
  id: string;
  name: string;
  type: 'fishing' | 'commercial' | 'passenger' | 'cargo' | 'other';
  position: Coordinates;
  speed: number;             // knots
  heading: number;           // degrees
  activity: string;
  lastUpdated: string;       // ISO string
  flag: string;
  length: number;            // meters
}

// ---- Routes ----
export interface RouteOption {
  id: string;
  name: string;
  waypoints: Coordinates[];
  distance: number;          // km
  eta: string;               // e.g. "1h 25m"
  etaMinutes: number;
  safetyScore: number;       // 0-100
  fuelEfficiency: 'High' | 'Medium' | 'Low';
  isRecommended: boolean;
  reason?: string;
  risks: RouteRisk[];
  weatherAlongRoute: string;
  waveExposure: string;
  trafficDensity: string;
  aisSource?: string;
  aisUrl?: string;
}

export interface RouteRisk {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  location?: Coordinates;
}

// ---- Alerts ----
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertType = 'storm' | 'high_waves' | 'strong_wind' | 'dangerous_current' | 'low_visibility' | 'restricted_zone' | 'high_traffic';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  location: string;
  area: Coordinates;
  startTime: string;
  endTime: string;
  recommendation: string;
  isActive: boolean;
  source: string;
}

// ---- Safety & Risk ----
export interface SafetyScore {
  overall: number;           // 0-100
  status: 'SAFE' | 'MODERATE' | 'DANGEROUS' | 'CRITICAL' | 'WARNING';
  label: string;
  components: RiskComponent[];
}

export interface RiskComponent {
  name: string;
  score: number;             // 0-100 (higher = safer)
  weight: number;            // percentage weight
  description: string;
}

export interface RiskWeights {
  wave: number;
  wind: number;
  current: number;
  storm: number;
  traffic: number;
}

// ---- AI Orchestrator ----
export type AgentType =
  | 'orchestrator'
  | 'ocean_pfz'
  | 'weather_hazard'
  | 'gis_navigation'
  | 'safety_decision'
  // Legacy aliases for backward compatibility
  | 'weather'
  | 'ocean'
  | 'fishing'
  | 'route'
  | 'safety'
  | 'language';

export interface Agent {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  output?: Record<string, unknown>;
  executionTime?: number;    // ms
}

export interface OrcaQuery {
  question: string;
  location: Coordinates;
  time: string;
  language: string;
}

export interface AgentTraceEvent {
  step: number;
  agentId: AgentType;
  agentName: string;
  toolsCalled: string[];
  durationMs: number;
  timestamp: string;
  status: 'running' | 'completed' | 'error';
  summary: string;
}

export interface EvidenceItem {
  metric: string;
  value: string | number;
  unit?: string;
  source: string;
  timestamp: string;
  type: 'observation' | 'forecast' | 'advisory';
  status: 'live' | 'cached' | 'unavailable';
}

export interface EvidencePayload {
  measurements: EvidenceItem[];
  riskFactors: RiskComponent[];
  confidence: number;
  agentsInvolved: string[];
  warnings: string[];
}

export interface WhatIfComparisonPayload {
  baselineTime: string;
  alternativeTime: string;
  baselineScore: number;
  alternativeScore: number;
  baselineWaveHeight: number;
  alternativeWaveHeight: number;
  baselineWindSpeed: number;
  alternativeWindSpeed: number;
  recommendation: string;
}

export interface MissionPlannerPayload {
  recommendedZone: string;
  suitabilityScore: number;
  safetyScore: number;
  safetyLabel: string;
  recommendedTime: string;
  recommendedRoute: string;
  distanceKm: number;
  warnings: string[];
  mapAction: string;
  evidence?: EvidencePayload;
}

import type { GeofenceResult } from '@/lib/geofence-engine';
export type { GeofenceResult };

export interface OrcaResponse {
  query: string;
  agentsUsed: Agent[];
  safetyStatus: SafetyScore;
  reasoning: string[];
  recommendation: string;
  dataSources: string[];
  timestamp: string;
  confidence: number;
  structuredData?: Record<string, unknown>;
  executionTrace?: AgentTraceEvent[];
  evidence?: EvidencePayload;
  whatIfComparison?: WhatIfComparisonPayload;
  missionPlan?: MissionPlannerPayload;
  geofenceResult?: GeofenceResult;
}

// ---- Chat ----
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentsUsed?: Agent[];
  safetyStatus?: SafetyScore;
  reasoning?: string[];
  recommendation?: string;
  dataSources?: string[];
  structuredData?: Record<string, unknown>;
  executionTrace?: AgentTraceEvent[];
  evidence?: EvidencePayload;
  whatIfComparison?: WhatIfComparisonPayload;
  missionPlan?: MissionPlannerPayload;
  geofenceResult?: GeofenceResult;
}

// ---- Marine Conditions (Unified) ----
export interface MarineConditions {
  location: Location;
  weather: WeatherData;
  waves: WaveData;
  ocean: OceanData;
  safety: SafetyScore;
  timestamp: string;
  source: string;
  dataStatus: 'LIVE' | 'NEAR_REAL_TIME' | 'FORECAST' | 'HISTORICAL' | 'MOCK';
}

// ---- Data Sources ----
export interface DataSource {
  id: string;
  name: string;
  description: string;
  dataProvided: string[];
  updateFrequency: string;
  dataType: string;
  status: 'LIVE' | 'NEAR_REAL_TIME' | 'FORECAST' | 'HISTORICAL' | 'MOCK';
  url: string;
  isConfigured: boolean;
}

// ---- Settings ----
export interface UserSettings {
  language: string;
  units: {
    speed: 'km/h' | 'knots' | 'mph';
    distance: 'km' | 'nm' | 'miles';
    temperature: '°C' | '°F';
    depth: 'm' | 'ft';
  };
  location: Location;
  demoMode: boolean;
  mapLayers: {
    weather: boolean;
    waves: boolean;
    currents: boolean;
    fishingActivity: boolean;
    vessels: boolean;
    routes: boolean;
    depth: boolean;
  };
  riskSensitivity: 'low' | 'medium' | 'high';
  notifications: boolean;
}

// ---- Ocean Metrics ----
export interface OceanMetric {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'moderate' | 'warning' | 'danger';
  icon: string;
  description?: string;
}

// ---- Forecast Timeline ----
export interface ForecastPoint {
  time: string;
  label: string;
  windSpeed: number;
  windDirection: string;
  waveHeight: number;
  wavePeriod: number;
  temperature: number;
  rainfall: number;
  pressure: number;
  isDangerous: boolean;
  dangerReason?: string;
}
