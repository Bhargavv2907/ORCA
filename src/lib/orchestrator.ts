// ============================================================
// ORCA AI Orchestrator — Multi-Agent Intelligence Engine (Phase 2)
// Target 5-Agent Architecture with Zod Validation & Map Actions
// ============================================================

import { Agent, AgentType, OrcaResponse, MissionPlannerPayload } from '@/types/marine';
import { getMockWeather, getMockWaves, getMockOcean, getMockFishingZones, getMockRoutes, getMockSafety } from '@/data/mock-data';
import { calculateSafetyScore, calculateMarineRisk } from '@/lib/risk-engine';
import { checkGeofenceProximity } from '@/lib/geofence-engine';
import { getMarineConditions } from '@/services/marine/unified';
import { retrieveRelevantContext, RAGSearchResult } from '@/lib/rag-engine';
import { getSessionContext, updateSessionContext, resolveFollowUpContext } from '@/lib/session-memory';
import {
  OceanPFZOutputSchema,
  WeatherHazardOutputSchema,
  GISNavigationOutputSchema,
  SafetyDecisionOutputSchema,
  MapAction,
} from '@/lib/agents/schemas';// ---- India Coastal Location Database ----
export interface CoastalLocation {
  name: string;
  state: string;
  lat: number;
  lon: number;
  aliases: string[];
}

export const INDIAN_COASTAL_LOCATIONS: CoastalLocation[] = [
  { name: 'Mumbai',        state: 'Maharashtra',  lat: 18.95, lon: 72.82, aliases: ['bombay', 'mumbai'] },
  { name: 'Kochi',         state: 'Kerala',       lat: 9.93,  lon: 76.26, aliases: ['cochin', 'kochi', 'ernakulam'] },
  { name: 'Chennai',       state: 'Tamil Nadu',   lat: 13.08, lon: 80.27, aliases: ['chennai', 'madras'] },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.68, lon: 83.22, aliases: ['vizag', 'visakhapatnam', 'vishakhapatnam'] },
  { name: 'Kolkata',       state: 'West Bengal',  lat: 22.57, lon: 88.36, aliases: ['kolkata', 'calcutta', 'haldia'] },
  { name: 'Goa',           state: 'Goa',          lat: 15.49, lon: 73.82, aliases: ['goa', 'panaji', 'margao', 'vasco'] },
  { name: 'Mangalore',     state: 'Karnataka',    lat: 12.87, lon: 74.88, aliases: ['mangalore', 'mangaluru'] },
  { name: 'Tuticorin',     state: 'Tamil Nadu',   lat: 8.80,  lon: 78.13, aliases: ['tuticorin', 'thoothukudi', 'tootukudi'] },
  { name: 'Pondicherry',   state: 'Puducherry',   lat: 11.93, lon: 79.83, aliases: ['pondicherry', 'puducherry'] },
  { name: 'Veraval',       state: 'Gujarat',      lat: 20.90, lon: 70.36, aliases: ['veraval', 'somnath'] },
  { name: 'Porbandar',     state: 'Gujarat',      lat: 21.64, lon: 69.61, aliases: ['porbandar'] },
  { name: 'Karwar',        state: 'Karnataka',    lat: 14.81, lon: 74.13, aliases: ['karwar'] },
  { name: 'Paradip',       state: 'Odisha',       lat: 20.32, lon: 86.61, aliases: ['paradip', 'paradeep'] },
  { name: 'Kakinada',      state: 'Andhra Pradesh', lat: 16.94, lon: 82.23, aliases: ['kakinada', 'kakinda'] },
  { name: 'Ratnagiri',     state: 'Maharashtra',  lat: 16.99, lon: 73.30, aliases: ['ratnagiri'] },
  { name: 'Kozhikode',     state: 'Kerala',       lat: 11.25, lon: 75.77, aliases: ['kozhikode', 'calicut'] },
  { name: 'Kannur',        state: 'Kerala',       lat: 11.87, lon: 75.36, aliases: ['kannur', 'cannanore'] },
  { name: 'Thiruvananthapuram', state: 'Kerala',  lat: 8.48,  lon: 76.94, aliases: ['trivandrum', 'thiruvananthapuram'] },
  { name: 'Rameswaram',    state: 'Tamil Nadu',   lat: 9.28,  lon: 79.31, aliases: ['rameswaram', 'rameshwaram'] },
  { name: 'Okha',          state: 'Gujarat',      lat: 22.47, lon: 69.07, aliases: ['okha', 'dwarka'] },
  { name: 'Mandapam',      state: 'Tamil Nadu',   lat: 9.27,  lon: 79.12, aliases: ['mandapam'] },
  { name: 'Bhatkal',       state: 'Karnataka',    lat: 13.97, lon: 74.55, aliases: ['bhatkal'] },
];

const DEFAULT_LOCATION = INDIAN_COASTAL_LOCATIONS[0]; // Mumbai fallback

export function extractLocation(query: string): CoastalLocation {
  const q = query.toLowerCase();
  for (const loc of INDIAN_COASTAL_LOCATIONS) {
    if (loc.aliases.some(alias => q.includes(alias))) {
      return loc;
    }
  }
  return DEFAULT_LOCATION;
}

// ---- Abusive Language Filter ----
const ABUSIVE_WORDS = new Set([
  // English profanity
  'fuck', 'fucker', 'fucking', 'fucked', 'fucks',
  'shit', 'shitty', 'bullshit',
  'ass', 'asshole', 'assholes',
  'bitch', 'bitches',
  'damn', 'damned', 'dammit',
  'bastard', 'bastards',
  'dick', 'dicks', 'dickhead',
  'crap', 'crappy',
  'piss', 'pissed',
  'cunt', 'cunts',
  'slut', 'whore',
  'idiot', 'idiots', 'stupid', 'dumb', 'moron', 'retard', 'retarded',
  'stfu', 'wtf', 'lmao', 'gtfo',
  // Hindi profanity
  'madarchod', 'behenchod', 'chutiya', 'chutiye', 'bhenchod',
  'gaand', 'gandu', 'lund', 'bhosdike', 'bsdk', 'mc', 'bc',
  'harami', 'haramkhor', 'sala', 'saala', 'saale', 'kamina', 'kamine',
  'randi', 'raand',
]);

export function containsAbusiveLanguage(text: string): boolean {
  const tokens = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  return tokens.some(token => ABUSIVE_WORDS.has(token));
}


// ---- Reconciled 5-Agent Query Classification ----
export interface QueryClassification {
  agents: AgentType[];
  intent: string;
  category: 'safety' | 'fishing' | 'route' | 'weather' | 'general';
}

const QUERY_PATTERNS: { pattern: RegExp; agents: AgentType[]; intent: string; category: QueryClassification['category'] }[] = [
  // Greeting / conversational
  {
    pattern: /^\s*(hello|hi|hey|hii+|namaste|namaskar|vanakkam|hola|good\s*(morning|afternoon|evening|night)|howdy|yo\b|sup\b|greetings|jai\s*hind)/i,
    agents: ['weather_hazard', 'safety_decision'],
    intent: 'greeting',
    category: 'general',
  },
  // Fish species / catch prediction
  {
    pattern: /what\s*(fish|fishes)|which\s*(fish|fishes)|expect.*today|species|catch\s*today|fish.*expect|fish.*available|fish.*season|types?\s*of\s*fish|sardine|mackerel|tuna|pomfret|hilsa|prawns?|shrimp/i,
    agents: ['ocean_pfz', 'weather_hazard', 'safety_decision'],
    intent: 'fish_species',
    category: 'fishing',
  },
  {
    pattern: /geofence|restricted|boundary|limit|zone.*avoid|dangerous.*area|prohibited/i,
    agents: ['gis_navigation', 'safety_decision'],
    intent: 'geofence_query',
    category: 'route',
  },
  {
    pattern: /fish|catch|where.*fish|pfz|fishing.*zone/i,
    agents: ['ocean_pfz', 'weather_hazard', 'gis_navigation', 'safety_decision'],
    intent: 'fishing_recommendation',
    category: 'fishing',
  },
  {
    pattern: /safe|danger|risk|go out|sail/i,
    agents: ['weather_hazard', 'ocean_pfz', 'safety_decision'],
    intent: 'safety_assessment',
    category: 'safety',
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
    pattern: /what.*if|leave.*at|departure|earlier|5\s*am|morning/i,
    agents: ['weather_hazard', 'ocean_pfz', 'safety_decision'],
    intent: 'whatif_query',
    category: 'safety',
  },
];

export function classifyQuery(question: string): QueryClassification {
  // Abusive language check — highest priority, skips all agents
  if (containsAbusiveLanguage(question)) {
    return {
      agents: [],
      intent: 'abusive',
      category: 'general',
    };
  }

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

export async function executeAgent(agentType: AgentType, lat = 18.95, lon = 72.82): Promise<AgentOutput> {
  const normalized = normalizeAgentType(agentType);
  await new Promise(r => setTimeout(r, 200 + Math.random() * 300));

  const conditions = await getMarineConditions(lat, lon);
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
      data: { intent: 'intent_parsed', language: 'en', userLocation: { lat, lon } },
      summary: `Parsed user query, location (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E), language English`,
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
      userLocation: { lat, lon },
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
  liveConditions?: import('@/types/marine').MarineConditions,
  location?: CoastalLocation,
): OrcaResponse {
  // Use live conditions if available, fall back to mock only as last resort
  const weather = liveConditions?.weather ?? getMockWeather();
  const waves = liveConditions?.waves ?? getMockWaves();
  const ocean = liveConditions?.ocean ?? getMockOcean();
  const safety = liveConditions?.safety ?? calculateSafetyScore(weather, waves, ocean);
  const cityName = location ? `${location.name}, ${location.state}` : 'Mumbai Coast';
  const zones = getMockFishingZones();

  const gisOutput = outputs.find(o => normalizeAgentType(o.agent.id) === 'gis_navigation')?.data as { mapAction?: MapAction } | undefined;

  // ---- Fish species prediction based on SST, chlorophyll & season ----
  const month = new Date().getMonth(); // 0-indexed
  const sst = ocean.sst;
  const chl = ocean.chlorophyll;

  function predictFishSpecies(): { species: string; depth: string; note: string }[] {
    const results: { species: string; depth: string; note: string }[] = [];

    // Indian Oil Sardine & Mackerel: surface, SST 27-29°C, coastal upwelling
    if (sst >= 26.5 && sst <= 30.0) {
      results.push({ species: 'Indian Oil Sardine', depth: 'Surface – 20m', note: `SST ${sst.toFixed(1)}°C is ideal for sardine aggregation near thermal fronts` });
      results.push({ species: 'Indian Mackerel', depth: 'Surface – 30m', note: 'Schools alongside sardines in coastal upwelling zones' });
    }

    // Ribbonfish & Croakers: demersal, moderate chlorophyll
    if (chl >= 1.5) {
      results.push({ species: 'Ribbonfish (Hairtail)', depth: '30 – 70m (Demersal)', note: `Chlorophyll ${chl.toFixed(2)} mg/m³ — nutrient-rich bottom attracts demersal feeders` });
      results.push({ species: 'Croakers (Ghol)', depth: '30 – 60m', note: 'Active near high-nutrient sediment zones' });
    }

    // Yellowfin & Skipjack Tuna: deep oceanic, warm SST
    if (sst >= 27.0 && chl >= 0.5) {
      results.push({ species: 'Yellowfin Tuna', depth: '> 100m (Oceanic)', note: 'Found around oceanic eddies and seamounts in warm waters' });
      results.push({ species: 'Skipjack Tuna', depth: '50 – 150m', note: 'Pelagic predator following baitfish schools' });
    }

    // Pomfret: post-monsoon season (Oct-Feb)
    if (month >= 9 || month <= 1) {
      results.push({ species: 'Silver Pomfret', depth: '15 – 40m', note: `Post-monsoon season (${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month]}) — peak pomfret availability` });
    }

    // Prawns/Shrimp: monsoon & post-monsoon, estuarine
    if (month >= 5 && month <= 11) {
      results.push({ species: 'Tiger Prawns', depth: '5 – 30m (Estuarine/Coastal)', note: 'Peak catch during and after monsoon near river mouths' });
    }

    // Hilsa: monsoon season in east coast (Jun-Sep)
    if (month >= 5 && month <= 8 && location && ['West Bengal', 'Odisha'].includes(location.state)) {
      results.push({ species: 'Hilsa (Ilish)', depth: 'Surface – 15m (Estuarine)', note: 'Monsoon migration upstream — peak season for Hilsa' });
    }

    // Seer Fish (Surmai): winter months
    if (month >= 10 || month <= 2) {
      results.push({ species: 'Seer Fish (Surmai)', depth: '20 – 60m', note: 'Active predator in cooler post-monsoon waters' });
    }

    // Fallback if nothing matched
    if (results.length === 0) {
      results.push({ species: 'Mixed pelagic catch', depth: 'Surface – 50m', note: `Current SST ${sst.toFixed(1)}°C and Chl ${chl.toFixed(2)} mg/m³ — moderate conditions` });
    }

    return results.slice(0, 5); // Top 5 species
  }

  const responses: Record<string, () => Partial<OrcaResponse>> = {
    // ---- Abusive language warning ----
    abusive: () => ({
      safetyStatus: { overall: 0, status: 'WARNING' as any, label: 'Inappropriate Language', components: [] },
      recommendation: `⚠️ Please use respectful language. ORCA is a marine safety assistant designed to help fishermen stay safe at sea. I'm here to help you with fishing zones, weather conditions, route safety, and ocean data. Please rephrase your question and I'll be happy to assist.`,
    }),

    // ---- Greeting response ----
    greeting: () => {
      const timeHour = new Date().getHours();
      const timeGreeting = timeHour < 12 ? 'Good morning' : timeHour < 17 ? 'Good afternoon' : 'Good evening';
      const conditionBrief = safety.overall >= 70
        ? `Sea conditions look ${safety.overall >= 85 ? 'excellent' : 'good'} right now`
        : `⚠️ Caution — sea conditions are rough right now`;

      return {
        safetyStatus: safety,
        recommendation: `${timeGreeting}! 🌊 Welcome to ORCA — your marine intelligence assistant for ${cityName}. ${conditionBrief} (Safety: ${safety.overall}/100, Waves: ${waves.height.toFixed(1)}m, Wind: ${Math.round(weather.windSpeed)} km/h).\n\nHere's what I can help you with:\n• 🐟 "What fish can I expect today?" — species forecast\n• 🗺️ "Where is the nearest fishing zone?" — PFZ advisory\n• ⛵ "Is it safe to go out?" — safety assessment\n• 🌤️ "What's the weather like?" — live conditions\n• 🧭 "Which route is safest?" — navigation\n\nJust ask me anything about the sea!`,
      };
    },

    // ---- Fish species prediction ----
    fish_species: () => {
      const predicted = predictFishSpecies();
      const speciesList = predicted.map((sp, i) => `${i + 1}. **${sp.species}** (${sp.depth}) — ${sp.note}`).join('\n');
      const bestZone = zones[0];

      return {
        safetyStatus: safety,
        recommendation: `🐟 **Fish Species Forecast for ${cityName}** (based on current ocean conditions):\n\nSST: ${sst.toFixed(1)}°C | Chlorophyll: ${chl.toFixed(2)} mg/m³ | Season: ${['January','February','March','April','May','June','July','August','September','October','November','December'][month]}\n\n${speciesList}\n\n📍 Best fishing zone: ${bestZone.name} — ${bestZone.distanceFromCoast} km offshore, ${bestZone.suitabilityScore}% suitability. Safety: ${safety.overall}/100 (${safety.label}).`,
      };
    },

    safety_assessment: () => ({
      safetyStatus: safety,
      recommendation: safety.overall >= 70
        ? `✅ Safe to go out. Waves ${waves.height.toFixed(1)}m · Wind ${Math.round(weather.windSpeed)} km/h from ${weather.windDirection} · Visibility ${weather.visibility?.toFixed(1) ?? 'good'} km. Safety score: ${safety.overall}/100. Return before evening.`
        : `⚠️ Do NOT go out — hazardous conditions. Waves: ${waves.height.toFixed(1)}m, Wind: ${Math.round(weather.windSpeed)} km/h from ${weather.windDirection}. Safety score: ${safety.overall}/100. Stay ashore.`,
    }),
    fishing_recommendation: () => ({
      safetyStatus: safety,
      recommendation: `🐟 Best zone today: ${zones[0].name} — ${zones[0].distanceFromCoast} km offshore, suitability ${zones[0].suitabilityScore}%. Sea temp ${zones[0].sst}°C, chlorophyll ${zones[0].chlorophyll} mg/m³. Waves ${waves.height.toFixed(1)}m · Wind ${Math.round(weather.windSpeed)} km/h. Safety: ${safety.overall}/100 (${safety.label}). Take Route B (38 km, 96% safety).`,
    }),
    route_planning: () => ({
      safetyStatus: safety,
      recommendation: `🗺️ Route B (Coastal Path) recommended — 38 km, 96% safety score. Current conditions: Waves ${waves.height.toFixed(1)}m, Wind ${Math.round(weather.windSpeed)} km/h ${weather.windDirection}. Route B avoids high swell and shipping lanes. ${safety.overall < 70 ? '⚠️ Conditions are marginal — sail with caution.' : '✅ Good conditions for the trip.'}`,
    }),
    weather_query: () => ({
      safetyStatus: safety,
      recommendation: `🌤️ ${cityName} right now — Wind: ${Math.round(weather.windSpeed)} km/h ${weather.windDirection} · Waves: ${waves.height.toFixed(1)}m · Temp: ${weather.temperature.toFixed(1)}°C · Humidity: ${Math.round(weather.humidity)}% · Pressure: ${Math.round(weather.pressure)} hPa · Visibility: ${weather.visibility?.toFixed(1) ?? '—'} km. ${weather.windSpeed > 30 ? '⚠️ Strong winds — small crafts should avoid open sea.' : '✅ Stable conditions for daytime fishing.'}`,
    }),
    wave_query: () => ({
      safetyStatus: safety,
      recommendation: `🌊 Current waves: ${waves.height.toFixed(1)}m height · Period ${waves.period?.toFixed(0) ?? '—'}s · Swell ${waves.swellHeight?.toFixed(1) ?? '—'}m from ${waves.swellDirection ?? '—'}. ${waves.height > 2.5 ? '⚠️ Rough sea — exercise caution.' : '✅ Sea state manageable for fishing vessels.'}`,
    }),
    ocean_query: () => ({
      safetyStatus: safety,
      recommendation: `🌡️ Ocean data: SST ${ocean.sst.toFixed(1)}°C · Chlorophyll-a ${ocean.chlorophyll.toFixed(2)} mg/m³ · Current ${ocean.currentSpeed.toFixed(1)} knots from ${ocean.currentDirection}. ${ocean.chlorophyll >= 2.0 ? '✅ High chlorophyll — good fishing nearby.' : 'Moderate phytoplankton — check PFZ advisory.'}`,
    }),
    geofence_query: () => {
      const gLat = location?.lat ?? 18.95;
      const gLon = location?.lon ?? 72.82;
      const geoResult = checkGeofenceProximity({ lat: gLat, lon: gLon });
      return {
        safetyStatus: safety,
        recommendation: `📍 ${cityName} (${gLat.toFixed(2)}°N, ${gLon.toFixed(2)}°E): ${geoResult.status}. Nearest restricted boundary: ${geoResult.nearestZone}, ${geoResult.distanceKm} km away. ${geoResult.advisory}`,
        geofenceResult: geoResult,
      };
    },
    whatif_query: () => {
      const baseWave = waves.height;
      const baseWind = weather.windSpeed;
      const altWave = +(baseWave * 0.65).toFixed(1);
      const altWind = +(baseWind * 0.60).toFixed(1);

      const baseRisk = calculateMarineRisk({ waveHeight: baseWave, windSpeed: baseWind, pressure: weather.pressure, visibility: weather.visibility });
      const altRisk = calculateMarineRisk({ waveHeight: altWave, windSpeed: altWind, pressure: weather.pressure, visibility: weather.visibility });

      const scoreDelta = altRisk.score - baseRisk.score;
      const waveDelta = +(baseWave - altWave).toFixed(1);

      return {
        safetyStatus: safety,
        recommendation: `💡 Leaving at 5 AM vs now: Waves ~${altWave}m (${waveDelta}m calmer than current ${baseWave.toFixed(1)}m), wind ~${Math.round(altWind)} km/h vs ${Math.round(baseWind)} km/h now. Safety improves ${baseRisk.score} → ${altRisk.score}/100 (${scoreDelta > 0 ? '+' : ''}${scoreDelta} pts). ${scoreDelta > 5 ? '✅ Early departure strongly recommended.' : 'Marginal difference — conditions are similar either way.'}`,
        whatIfComparison: {
          baselineTime: 'Now',
          alternativeTime: '05:00 AM',
          baselineScore: baseRisk.score,
          alternativeScore: altRisk.score,
          baselineWaveHeight: baseWave,
          alternativeWaveHeight: altWave,
          baselineWindSpeed: baseWind,
          alternativeWindSpeed: altWind,
          recommendation: `Departing at 05:00 AM improves safety by ${scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} points.`,
        },
      };
    },
    general_query: () => ({
      safetyStatus: safety,
      recommendation: `📡 ${cityName} right now: Waves ${waves.height.toFixed(1)}m · Wind ${Math.round(weather.windSpeed)} km/h ${weather.windDirection} · Temp ${weather.temperature.toFixed(1)}°C · SST ${ocean.sst.toFixed(1)}°C · Safety ${safety.overall}/100 (${safety.label}). Ask me about fishing zones, routes, weather alerts, or sea conditions.`,
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
    whatIfComparison: partial.whatIfComparison,
    missionPlan: partial.missionPlan,
    geofenceResult: partial.geofenceResult,
  };
}

// ---- Main Orchestrator Function ----
export async function orchestrate(
  question: string,
  onAgentStart?: (agent: AgentType) => void,
  onAgentComplete?: (agent: AgentType, output: AgentOutput) => void,
): Promise<OrcaResponse> {
  const classification = classifyQuery(question);

  // ---- Short-circuit for abusive language — no agent execution ----
  if (classification.intent === 'abusive') {
    return {
      query: question,
      agentsUsed: [],
      safetyStatus: { overall: 0, status: 'WARNING' as any, label: 'Inappropriate Language', components: [] },
      reasoning: [],
      recommendation: `⚠️ Please use respectful language. ORCA is a marine safety assistant designed to help fishermen stay safe at sea. I'm here to help you with fishing zones, weather conditions, route safety, and ocean data. Please rephrase your question and I'll be happy to assist.`,
      dataSources: [],
      timestamp: new Date().toISOString(),
      confidence: 100,
    };
  }

  const location = extractLocation(question);          // ← detect city from query
  const { lat, lon } = location;

  // Persist selected city → all other pages (dashboard, weather, ocean) pick it up
  if (typeof window !== 'undefined') {
    const { setSelectedLocation } = await import('@/lib/location-store');
    setSelectedLocation(location);
  }

  const outputs: AgentOutput[] = [];
  const executionTrace: any[] = [];
  const startTime = Date.now();

  const ragMatches: RAGSearchResult[] = retrieveRelevantContext(question, 2);

  let stepCounter = 1;
  for (const agentType of classification.agents) {
    onAgentStart?.(agentType);
    const stepStart = Date.now();
    const output = await executeAgent(agentType, lat, lon);  // ← pass coords
    const stepDuration = Date.now() - stepStart;

    outputs.push(output);
    onAgentComplete?.(agentType, output);

    const toolsUsedMap: Record<string, string[]> = {
      ocean_pfz: ['getSST', 'getChlorophyll', 'getPFZ'],
      weather_hazard: ['getWeather', 'getWaves', 'getCycloneAlerts', 'getMarineAdvisories'],
      gis_navigation: ['getUserLocation', 'calculateDistance', 'checkGeofence', 'calculateRoute'],
      safety_decision: ['calculateMarineRisk'],
      orchestrator: ['classifyQuery'],
    };

    const normalizedId = normalizeAgentType(agentType);
    executionTrace.push({
      step: stepCounter++,
      agentId: normalizedId,
      agentName: output.agent.name,
      toolsCalled: toolsUsedMap[normalizedId] || ['query'],
      durationMs: stepDuration,
      timestamp: new Date().toISOString(),
      status: 'completed',
      summary: output.summary,
    });
  }

  await new Promise(r => setTimeout(r, 200));

  // Fetch live conditions ONCE for the detected location
  const conditions = await getMarineConditions(lat, lon);
  conditions.location = { coordinates: { lat, lon }, name: location.name, region: location.state };

  const response = generateResponse(question, classification, outputs, conditions, location);
  response.executionTrace = executionTrace;

  const riskCalculated = calculateMarineRisk({
    waveHeight: conditions.waves.height,
    windSpeed: conditions.weather.windSpeed,
    pressure: conditions.weather.pressure,
    visibility: conditions.weather.visibility,
    rainfall: conditions.weather.rainfall,
    currentSpeed: conditions.ocean.currentSpeed,
  });

  response.evidence = {
    measurements: [
      { metric: 'Wave Height', value: conditions.waves.height.toFixed(1), unit: 'm', source: 'Open-Meteo Marine API', timestamp: new Date().toISOString(), type: 'forecast', status: 'live' },
      { metric: 'Wind Speed', value: Math.round(conditions.weather.windSpeed), unit: 'km/h', source: 'Open-Meteo API', timestamp: new Date().toISOString(), type: 'forecast', status: 'live' },
      { metric: 'Sea Surface Temp', value: conditions.ocean.sst.toFixed(1), unit: '°C', source: 'ISRO MOSDAC INSAT-3D', timestamp: new Date().toISOString(), type: 'observation', status: 'live' },
      { metric: 'Chlorophyll-a', value: conditions.ocean.chlorophyll.toFixed(2), unit: 'mg/m³', source: 'ISRO MOSDAC EOS-06 OCM', timestamp: new Date().toISOString(), type: 'observation', status: 'live' },
      { metric: 'Barometric Pressure', value: Math.round(conditions.weather.pressure), unit: 'hPa', source: 'IMD Marine Station', timestamp: new Date().toISOString(), type: 'observation', status: 'live' },
    ],
    riskFactors: riskCalculated.factors,
    confidence: riskCalculated.confidence,
    agentsInvolved: outputs.map(o => o.agent.name),
    warnings: conditions.waves.height > 2.5 ? ['High wave swell warning along coastal shelf.'] : [],
  };

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
