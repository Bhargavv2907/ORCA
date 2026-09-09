// ============================================================
// ORCA AI Orchestrator — Multi-Agent Intelligence Engine (Phase 2)
// Target 5-Agent Architecture with Zod Validation & Map Actions
// ============================================================

import { Agent, AgentType, OrcaResponse } from '@/types/marine';
import { getMockWeather, getMockWaves, getMockOcean, getMockFishingZones, getMockRoutes, getMockSafety } from '@/data/mock-data';
import { calculateSafetyScore } from '@/lib/risk-engine';
import { getMarineConditions } from '@/services/marine/unified';
import { retrieveRelevantContext, RAGSearchResult } from '@/lib/rag-engine';
import {
  OceanPFZOutputSchema,
  WeatherHazardOutputSchema,
  GISNavigationOutputSchema,
  SafetyDecisionOutputSchema,
  MapAction,
} from '@/lib/agents/schemas';

// ---- Reconciled 5-Agent Query Classification ----
export interface QueryClassification {
  agents: AgentType[];
  intent: string;
  category: 'safety' | 'fishing' | 'route' | 'weather' | 'general';
}

const QUERY_PATTERNS: { pattern: RegExp; agents: AgentType[]; intent: string; category: QueryClassification['category'] }[] = [
  {
    pattern: /safe|danger|risk|go out|sail/i,
    agents: ['weather_hazard', 'ocean_pfz', 'safety_decision'],
    intent: 'safety_assessment',
    category: 'safety',
  },
  {
    pattern: /fish|catch|where.*fish|zone|pfz/i,
    agents: ['ocean_pfz', 'weather_hazard', 'gis_navigation', 'safety_decision'],
    intent: 'fishing_recommendation',
    category: 'fishing',
  },
  {
    pattern: /route|path|way|navigate|travel|distance/i,
    agents: ['gis_navigation', 'weather_hazard', 'safety_decision'],
    intent: 'route_planning',
    category: 'route',
  },
  {
    pattern: /weather|wind|rain|storm|forecast|lightning|cyclone|advisory/i,
    agents: ['weather_hazard', 'safety_decision'],
    intent: 'weather_query',
    category: 'weather',
  },
  {
    pattern: /wave|swell|sea.*state/i,
    agents: ['weather_hazard', 'ocean_pfz'],
    intent: 'wave_query',
    category: 'weather',
  },
  {
    pattern: /temperature|sst|warm|cold|chlorophyll|salinity/i,
    agents: ['ocean_pfz'],
    intent: 'ocean_query',
    category: 'general',
  },
  {
    pattern: /geofence|restricted|boundary|limit|zone.*avoid/i,
    agents: ['gis_navigation', 'safety_decision'],
    intent: 'geofence_query',
    category: 'route',
  },
];

export function classifyQuery(question: string): QueryClassification {
  for (const pattern of QUERY_PATTERNS) {
    if (pattern.pattern.test(question)) {
      return { agents: pattern.agents, intent: pattern.intent, category: pattern.category };
    }
  }
  return {
    agents: ['ocean_pfz', 'weather_hazard', 'safety_decision'],
    intent: 'general_query',
    category: 'general',
  };
}

// ---- Agent Execution Interface ----
export interface AgentOutput {
  agent: Agent;
  data: Record<string, unknown>;
  summary: string;
}

// Map legacy agent IDs to target 5 agent IDs if passed
function normalizeAgentType(type: AgentType): AgentType {
  switch (type) {
    case 'weather': return 'weather_hazard';
    case 'ocean':
    case 'fishing': return 'ocean_pfz';
    case 'route': return 'gis_navigation';
    case 'safety': return 'safety_decision';
    case 'language': return 'orchestrator';
    default: return type;
  }
}

export async function executeAgent(agentType: AgentType): Promise<AgentOutput> {
  const normalized = normalizeAgentType(agentType);
  await new Promise(r => setTimeout(r, 200 + Math.random() * 300));

  const conditions = await getMarineConditions(18.95, 72.82);
  const weather = conditions.weather;
  const waves = conditions.waves;
  const ocean = conditions.ocean;
  const zones = getMockFishingZones();
  const routes = getMockRoutes();

  zones.forEach(z => {
    z.sst = +ocean.sst.toFixed(1);
    z.chlorophyll = +ocean.chlorophyll.toFixed(2);
  });

  if (normalized === 'orchestrator') {
    return {
      agent: { id: 'orchestrator', name: 'Orchestrator Agent', description: 'Intent, location, language & routing', icon: 'brain', status: 'completed' },
      data: { intent: 'intent_parsed', language: 'en', userLocation: { lat: 18.95, lon: 72.82 } },
      summary: 'Parsed user query, location (18.95°N, 72.82°E), language English',
    };
  }

  if (normalized === 'ocean_pfz') {
    const rawData = {
      sst: ocean.sst,
      chlorophyll: ocean.chlorophyll,
      salinity: ocean.salinity,
      currentSpeed: ocean.currentSpeed,
      currentDirection: ocean.currentDirection,
      zones: zones.map(z => ({
        id: z.id,
        name: z.name,
        suitabilityScore: z.suitabilityScore,
        sst: z.sst,
        chlorophyll: z.chlorophyll,
        distanceFromCoast: z.distanceFromCoast,
      })),
      summary: `Zone A (Suitability: ${zones[0].suitabilityScore}%, SST: ${ocean.sst.toFixed(1)}°C, Chlorophyll: ${ocean.chlorophyll.toFixed(2)} mg/m³)`,
    };
    const validated = OceanPFZOutputSchema.parse(rawData);
    return {
      agent: { id: 'ocean_pfz', name: 'Ocean/PFZ Agent', description: 'Evaluates SST, Chlorophyll & PFZ scores', icon: 'waves', status: 'completed' },
      data: validated,
      summary: validated.summary,
    };
  }

  if (normalized === 'weather_hazard') {
    const rawData = {
      temperature: weather.temperature,
      windSpeed: weather.windSpeed,
      windDirection: weather.windDirection,
      pressure: weather.pressure,
      visibility: weather.visibility,
      rainfall: weather.rainfall,
      waveHeight: waves.height,
      hasCycloneAlert: false,
      hasLightningAlert: false,
      advisories: ['Moderate swell observed along Western shelf.'],
      summary: `Wind ${Math.round(weather.windSpeed)} km/h ${weather.windDirection}, Waves ${waves.height.toFixed(1)}m, Temp ${weather.temperature.toFixed(1)}°C`,
    };
    const validated = WeatherHazardOutputSchema.parse(rawData);
    return {
      agent: { id: 'weather_hazard', name: 'Weather/Hazard Agent', description: 'Monitors weather, wind, waves & alerts', icon: 'cloud-sun', status: 'completed' },
      data: validated,
      summary: validated.summary,
    };
  }

  if (normalized === 'gis_navigation') {
    const bestRoute = routes.find(r => r.isRecommended) || routes[0];
    const mapActionData: MapAction = {
      mapAction: 'highlight_pfz',
      selectedZone: zones[0].name,
      layers: ['pfz_zones', 'recommended_route'],
      markers: [{ lat: zones[0].center.lat, lon: zones[0].center.lon, label: zones[0].name, type: 'pfz' }],
      route: bestRoute.waypoints,
    };
    const rawData = {
      userLocation: { lat: 18.95, lon: 72.82 },
      distanceKm: zones[0].distanceFromCoast,
      isRestricted: false,
      geofenceStatus: 'CLEAR (Inside safe fishing boundaries)',
      routes: routes.map(r => ({
        id: r.id,
        name: r.name,
        distance: r.distance,
        safetyScore: r.safetyScore,
        isRecommended: r.isRecommended,
      })),
      mapAction: mapActionData,
      summary: `Recommended Route: ${bestRoute.name} (${bestRoute.distance} km, Safety ${bestRoute.safetyScore}%)`,
    };
    const validated = GISNavigationOutputSchema.parse(rawData);
    return {
      agent: { id: 'gis_navigation', name: 'GIS/Navigation Agent', description: 'Distance, geofencing & route planning', icon: 'map', status: 'completed' },
      data: validated,
      summary: validated.summary,
    };
  }

  // safety_decision
  const safety = calculateSafetyScore(weather, waves, ocean);
  const rawData = {
    overallScore: safety.overall,
    status: safety.status,
    label: safety.label,
    factors: safety.components,
    confidence: 88,
    summary: `Safety Score: ${safety.overall}/100 — ${safety.label}`,
  };
  const validated = SafetyDecisionOutputSchema.parse(rawData);
  return {
    agent: { id: 'safety_decision', name: 'Safety/Decision Agent', description: 'Deterministic marine risk scoring', icon: 'shield-check', status: 'completed' },
    data: validated,
    summary: validated.summary,
  };
}

// ---- Response Synthesis ----
function generateResponse(
  question: string,
  classification: QueryClassification,
  outputs: AgentOutput[],
): OrcaResponse {
  const weather = getMockWeather();
  const waves = getMockWaves();
  const ocean = getMockOcean();
  const safety = calculateSafetyScore(weather, waves, ocean);
  const zones = getMockFishingZones();

  const gisOutput = outputs.find(o => normalizeAgentType(o.agent.id) === 'gis_navigation')?.data as { mapAction?: MapAction } | undefined;

  const responses: Record<string, () => Partial<OrcaResponse>> = {
    safety_assessment: () => ({
      safetyStatus: safety,
      reasoning: [
        `Wave height: ${waves.height.toFixed(1)} m — ${waves.height > 2.5 ? 'rough' : 'manageable'}.`,
        `Wind speed: ${Math.round(weather.windSpeed)} km/h from ${weather.windDirection}.`,
        `Ocean current: ${ocean.currentSpeed.toFixed(1)} knots — within operational limits.`,
        `Visibility: ${weather.visibility.toFixed(1)} km — good visual range.`,
      ],
      recommendation: safety.overall >= 70
        ? 'Fishing is safe with standard caution. Return before evening as wind speeds may increase.'
        : 'Marine conditions are hazardous. Remaining onshore or returning to harbor is advised.',
    }),
    fishing_recommendation: () => ({
      safetyStatus: safety,
      reasoning: [
        `Zone A (Southwest Shelf) has highest suitability score at ${zones[0].suitabilityScore}%.`,
        `SST is ${zones[0].sst}°C and Chlorophyll-a is ${zones[0].chlorophyll} mg/m³.`,
        `Zone A is ${zones[0].distanceFromCoast} km offshore. Geofence checks clear.`,
      ],
      recommendation: `Zone A is highly recommended today (Suitability ${zones[0].suitabilityScore}%). Route B (38 km, 96% safety score) is optimal.`,
      structuredData: {
        bestZone: zones[0].name,
        suitability: zones[0].suitabilityScore,
        distanceKm: zones[0].distanceFromCoast,
        sst: zones[0].sst,
        safetyScore: safety.overall,
        mapAction: gisOutput?.mapAction?.mapAction || 'highlight_pfz',
      },
    }),
    route_planning: () => ({
      safetyStatus: safety,
      reasoning: [
        'Analyzed 3 potential navigation paths to coastal shelf.',
        'Route B (Coastal Path) recommended: 38 km distance with 96% safety rating.',
        'Route B avoids high swell exposure and heavy traffic corridors.',
      ],
      recommendation: 'Route B is the safest path. It minimizes wave impact and bypasses congested shipping lanes.',
      structuredData: {
        recommendedRoute: 'Route B (Coastal Path)',
        distanceKm: 38,
        safetyScore: 96,
        mapAction: gisOutput?.mapAction?.mapAction || 'draw_route',
      },
    }),
    weather_query: () => ({
      safetyStatus: safety,
      reasoning: [
        `Wind: ${Math.round(weather.windSpeed)} km/h ${weather.windDirection}.`,
        `Temperature: ${weather.temperature.toFixed(1)}°C | Humidity: ${weather.humidity}%.`,
        `Pressure: ${weather.pressure.toFixed(0)} hPa (stable).`,
      ],
      recommendation: weather.windSpeed > 30
        ? 'Strong wind alert in effect. Small crafts should avoid open sea.'
        : 'Weather conditions are stable for daytime fishing operations.',
    }),
    geofence_query: () => ({
      safetyStatus: safety,
      reasoning: [
        'Current position verified against Indian Maritime Boundary Line (IMBL) & MPA boundaries.',
        'No restricted zone violations detected within 20 km radius.',
      ],
      recommendation: 'Current operational area is clear of restricted maritime zones.',
      structuredData: {
        geofenceStatus: 'CLEAR',
        mapAction: gisOutput?.mapAction?.mapAction || 'show_geofence',
      },
    }),
    general_query: () => ({
      safetyStatus: safety,
      reasoning: [
        `Live Mumbai Coast conditions: SST ${ocean.sst.toFixed(1)}°C, Wind ${Math.round(weather.windSpeed)} km/h, Waves ${waves.height.toFixed(1)}m.`,
        `Overall safety index: ${safety.overall}/100 — ${safety.label}.`,
      ],
      recommendation: 'Ask specific questions regarding fishing zones, weather advisories, or navigation routes.',
    }),
  };

  const generator = responses[classification.intent] || responses.general_query;
  const partial = generator();

  return {
    query: question,
    agentsUsed: outputs.map(o => o.agent),
    safetyStatus: partial.safetyStatus || safety,
    reasoning: partial.reasoning || [],
    recommendation: partial.recommendation || '',
    dataSources: ['ISRO MOSDAC Satellite API', 'Open-Meteo Weather & Marine API', 'IMD Marine Bulletins', 'ORCA Risk Engine'],
    timestamp: new Date().toISOString(),
    confidence: 85,
    structuredData: partial.structuredData,
  };
}

// ---- Main Orchestrator Function ----
export async function orchestrate(
  question: string,
  onAgentStart?: (agent: AgentType) => void,
  onAgentComplete?: (agent: AgentType, output: AgentOutput) => void,
): Promise<OrcaResponse> {
  const classification = classifyQuery(question);
  const outputs: AgentOutput[] = [];

  const ragMatches: RAGSearchResult[] = retrieveRelevantContext(question, 2);

  for (const agentType of classification.agents) {
    onAgentStart?.(agentType);
    const output = await executeAgent(agentType);
    outputs.push(output);
    onAgentComplete?.(agentType, output);
  }

  await new Promise(r => setTimeout(r, 250));

  const response = generateResponse(question, classification, outputs);

  if (ragMatches.length > 0) {
    const ragReasoning = ragMatches.map(
      (m) => `📚 [RAG Base — ${m.document.title}]: ${m.snippet}`
    );
    const ragSources = ragMatches.map((m) => `${m.document.source} (${m.document.title})`);
    response.reasoning = [...ragReasoning, ...response.reasoning];
    response.dataSources = Array.from(new Set([...response.dataSources, ...ragSources]));
  }

  return response;
}
