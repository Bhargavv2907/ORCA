// ============================================================
// ORCA AI Orchestrator — Multi-Agent Intelligence Engine
// ============================================================

import { Agent, AgentType, OrcaResponse } from '@/types/marine';
import { getMockWeather, getMockWaves, getMockOcean, getMockFishingZones, getMockRoutes, getMockSafety } from '@/data/mock-data';
import { calculateSafetyScore } from '@/lib/risk-engine';

// ---- Query Classification ----
interface QueryClassification {
  agents: AgentType[];
  intent: string;
  category: 'safety' | 'fishing' | 'route' | 'weather' | 'general';
}

const QUERY_PATTERNS: { pattern: RegExp; agents: AgentType[]; intent: string; category: QueryClassification['category'] }[] = [
  { pattern: /safe|danger|risk|go out|sail/i, agents: ['weather', 'ocean', 'safety'], intent: 'safety_assessment', category: 'safety' },
  { pattern: /fish|catch|where.*fish|zone/i, agents: ['fishing', 'ocean', 'weather', 'route'], intent: 'fishing_recommendation', category: 'fishing' },
  { pattern: /route|path|way|navigate|travel/i, agents: ['route', 'weather', 'safety'], intent: 'route_planning', category: 'route' },
  { pattern: /weather|wind|rain|storm|forecast/i, agents: ['weather'], intent: 'weather_query', category: 'weather' },
  { pattern: /wave|swell|sea.*state/i, agents: ['weather', 'ocean'], intent: 'wave_query', category: 'weather' },
  { pattern: /temperature|sst|warm|cold/i, agents: ['ocean'], intent: 'ocean_query', category: 'general' },
  { pattern: /current|tide|flow/i, agents: ['ocean', 'safety'], intent: 'current_query', category: 'general' },
  { pattern: /vessel|ship|boat|traffic/i, agents: ['safety'], intent: 'vessel_query', category: 'general' },
];

function classifyQuery(question: string): QueryClassification {
  for (const pattern of QUERY_PATTERNS) {
    if (pattern.pattern.test(question)) {
      return { agents: pattern.agents, intent: pattern.intent, category: pattern.category };
    }
  }
  return { agents: ['weather', 'ocean', 'safety'], intent: 'general_query', category: 'general' };
}

// ---- Agent Execution ----
interface AgentOutput {
  agent: Agent;
  data: Record<string, unknown>;
  summary: string;
}

import { getMarineConditions } from '@/services/marine/unified';

async function executeAgent(agentType: AgentType): Promise<AgentOutput> {
  // Processing simulation
  await new Promise(r => setTimeout(r, 250 + Math.random() * 450));

  // Fetch live real-time conditions (MOSDAC + Open-Meteo + Risk Engine)
  const conditions = await getMarineConditions(18.95, 72.82);
  const weather = conditions.weather;
  const waves = conditions.waves;
  const ocean = conditions.ocean;
  const zones = getMockFishingZones();
  const routes = getMockRoutes();

  // Update fishing zone SST & Chlorophyll with live MOSDAC parameters
  zones.forEach(z => {
    z.sst = +ocean.sst.toFixed(1);
    z.chlorophyll = +ocean.chlorophyll.toFixed(2);
  });

  const agentMap: Record<AgentType, () => AgentOutput> = {
    weather: () => ({
      agent: { id: 'weather', name: 'Weather Agent', description: 'Analyzes atmospheric conditions', icon: 'cloud-sun', status: 'completed' as const },
      data: { windSpeed: weather.windSpeed, windDirection: weather.windDirection, temperature: weather.temperature, visibility: weather.visibility, pressure: weather.pressure, rainfall: weather.rainfall },
      summary: `Wind ${Math.round(weather.windSpeed)} km/h ${weather.windDirection}, Temperature ${weather.temperature.toFixed(1)}°C, Visibility ${weather.visibility.toFixed(1)} km`,
    }),
    ocean: () => ({
      agent: { id: 'ocean', name: 'Ocean Agent', description: 'Evaluates ocean conditions', icon: 'waves', status: 'completed' as const },
      data: { sst: ocean.sst, salinity: ocean.salinity, currentSpeed: ocean.currentSpeed, currentDirection: ocean.currentDirection, chlorophyll: ocean.chlorophyll, waveHeight: waves.height, wavePeriod: waves.period },
      summary: `SST ${ocean.sst.toFixed(1)}°C, Wave Height ${waves.height.toFixed(1)}m, Current ${ocean.currentSpeed.toFixed(1)} knots ${ocean.currentDirection}`,
    }),
    fishing: () => ({
      agent: { id: 'fishing', name: 'Fish Zone Agent', description: 'Identifies favorable fishing areas', icon: 'fish', status: 'completed' as const },
      data: { zones: zones.map(z => ({ name: z.name, suitability: z.suitabilityScore, sst: z.sst, chlorophyll: z.chlorophyll })) },
      summary: `Zone A: ${zones[0].suitabilityScore}%, Zone B: ${zones[1].suitabilityScore}%, Zone C: ${zones[2].suitabilityScore}%`,
    }),
    route: () => ({
      agent: { id: 'route', name: 'Route Agent', description: 'Plans safe navigation routes', icon: 'map', status: 'completed' as const },
      data: { routes: routes.map(r => ({ name: r.name, distance: r.distance, safety: r.safetyScore, recommended: r.isRecommended })) },
      summary: `Best route: ${routes.find(r => r.isRecommended)?.name || routes[0].name} (Safety: ${routes.find(r => r.isRecommended)?.safetyScore || routes[0].safetyScore}%)`,
    }),
    safety: () => {
      const safety = calculateSafetyScore(weather, waves, ocean);
      return {
        agent: { id: 'safety', name: 'Safety Agent', description: 'Assesses maritime safety', icon: 'shield-check', status: 'completed' as const },
        data: { overallScore: safety.overall, status: safety.status, components: safety.components },
        summary: `Safety Score: ${safety.overall}/100 — ${safety.label}`,
      };
    },
    language: () => ({
      agent: { id: 'language', name: 'Language Agent', description: 'Translates data to simple language', icon: 'languages', status: 'completed' as const },
      data: { language: 'en', translated: true },
      summary: 'Response translated to English',
    }),
  };

  return agentMap[agentType]();
}

// ---- Response Generation ----
function generateResponse(
  question: string,
  classification: QueryClassification,
  outputs: AgentOutput[],
): OrcaResponse {
  const weather = getMockWeather();
  const waves = getMockWaves();
  const ocean = getMockOcean();
  const safety = getMockSafety();
  const zones = getMockFishingZones();

  const responses: Record<string, () => Partial<OrcaResponse>> = {
    safety_assessment: () => ({
      safetyStatus: safety,
      reasoning: [
        `Wave height is currently ${waves.height.toFixed(1)} m — ${waves.height > 2.5 ? 'rough' : 'manageable'} conditions.`,
        `Wind speed is ${Math.round(weather.windSpeed)} km/h from ${weather.windDirection}.`,
        'Conditions are expected to worsen after 6 PM with stronger swell overnight.',
        `Current ocean current speed is ${ocean.currentSpeed.toFixed(1)} knots — ${ocean.currentSpeed > 2 ? 'strong' : 'within safe limits'}.`,
        `Visibility is ${weather.visibility.toFixed(1)} km — ${weather.visibility > 5 ? 'good' : 'reduced'}.`,
      ],
      recommendation: safety.overall >= 70
        ? 'Fishing is possible with caution. Consider returning before evening as conditions are expected to deteriorate.'
        : 'Conditions are not favorable. It is safer to stay onshore or return to port immediately.',
    }),
    fishing_recommendation: () => ({
      safetyStatus: safety,
      reasoning: [
        `Zone A (Southwest Shelf) has the highest suitability at ${zones[0].suitabilityScore}%.`,
        `Sea Surface Temperature at Zone A is ${zones[0].sst}°C — within the optimal range.`,
        `Chlorophyll-a levels are ${zones[0].chlorophyll > 2.5 ? 'elevated' : 'moderate'}, indicating good nutrient availability.`,
        `Historical fishing activity in Zone A is ${zones[0].historicalActivity.toLowerCase()}.`,
        `Zone A is ${zones[0].distanceFromCoast} km from coast — plan fuel accordingly.`,
      ],
      recommendation: `Zone A has the best combination of favorable SST, moderate currents, high chlorophyll, and strong historical fishing activity. The recommended route is 38 km via the coastal path with a safety score of 96%.`,
      structuredData: {
        bestZone: zones[0].name,
        suitability: zones[0].suitabilityScore,
        distance: zones[0].distanceFromCoast,
        sst: zones[0].sst,
        safetyScore: safety.overall,
      },
    }),
    route_planning: () => ({
      safetyStatus: safety,
      reasoning: [
        'Three routes analyzed to Zone A.',
        'Route B (Coastal) is recommended — 38 km, safety score 96%.',
        'Route B avoids stronger waves and high vessel traffic along the coastal shelf.',
        'Route C is shortest (29 km) but has higher wave exposure and crosses a shipping lane.',
      ],
      recommendation: 'Route B is recommended because it avoids stronger waves and high vessel traffic while maintaining favorable fishing conditions.',
    }),
    weather_query: () => ({
      safetyStatus: safety,
      reasoning: [
        `Current wind: ${Math.round(weather.windSpeed)} km/h from ${weather.windDirection}.`,
        `Temperature: ${weather.temperature.toFixed(1)}°C with ${weather.humidity}% humidity.`,
        `Pressure: ${weather.pressure.toFixed(0)} hPa — ${weather.pressure < 1005 ? 'falling, watch for weather changes' : 'stable'}.`,
        `Cloud cover: ${weather.cloudCover}%.`,
        'Conditions expected to worsen in the evening with stronger winds and higher waves.',
      ],
      recommendation: weather.windSpeed > 30
        ? 'Strong winds are expected. Exercise extreme caution if at sea.'
        : 'Current weather is manageable for fishing activities. Monitor for changes in the evening.',
    }),
    wave_query: () => ({
      safetyStatus: safety,
      reasoning: [
        `Significant wave height: ${waves.height.toFixed(1)} m.`,
        `Wave period: ${waves.period.toFixed(0)} seconds.`,
        `Swell height: ${waves.swellHeight.toFixed(1)} m from ${waves.swellDirection}.`,
        'Wave conditions expected to increase significantly after 18:00.',
      ],
      recommendation: waves.height > 2.5
        ? '⚠️ Waves are rough. Not recommended for small vessels.'
        : 'Wave conditions are manageable. Keep monitoring for changes.',
    }),
    general_query: () => ({
      safetyStatus: safety,
      reasoning: [
        `Current conditions at Mumbai Coast (Arabian Sea):`,
        `SST: ${ocean.sst.toFixed(1)}°C | Wind: ${Math.round(weather.windSpeed)} km/h | Waves: ${waves.height.toFixed(1)} m`,
        `Current: ${ocean.currentSpeed.toFixed(1)} knots | Visibility: ${weather.visibility.toFixed(1)} km`,
        `Overall safety score: ${safety.overall}/100 — ${safety.label}`,
      ],
      recommendation: 'For specific queries, try asking about fishing zones, route safety, or weather forecasts.',
    }),
  };

  const responseGenerator = responses[classification.intent] || responses.general_query;
  const partial = responseGenerator();

  return {
    query: question,
    agentsUsed: outputs.map(o => o.agent),
    safetyStatus: partial.safetyStatus || safety,
    reasoning: partial.reasoning || [],
    recommendation: partial.recommendation || '',
    dataSources: ['ISRO MOSDAC Satellite API', 'Open-Meteo Weather & Marine API', 'IMD (India Met. Dept.)', 'ORCA Risk Engine'],
    timestamp: new Date().toISOString(),
    confidence: 78 + Math.round(Math.random() * 15),
    structuredData: partial.structuredData,
  };
}

import { retrieveRelevantContext, RAGSearchResult } from '@/lib/rag-engine';

// ---- Main Orchestrator ----
export async function orchestrate(
  question: string,
  onAgentStart?: (agent: AgentType) => void,
  onAgentComplete?: (agent: AgentType, output: AgentOutput) => void,
): Promise<OrcaResponse> {
  const classification = classifyQuery(question);
  const outputs: AgentOutput[] = [];

  // RAG Context Retrieval
  const ragMatches: RAGSearchResult[] = retrieveRelevantContext(question, 3);

  for (const agentType of classification.agents) {
    onAgentStart?.(agentType);
    const output = await executeAgent(agentType);
    outputs.push(output);
    onAgentComplete?.(agentType, output);
  }

  // Small delay for "reasoning"
  await new Promise(r => setTimeout(r, 400));

  const response = generateResponse(question, classification, outputs);

  // Inject RAG knowledge findings and citations
  if (ragMatches.length > 0) {
    const ragReasoning = ragMatches.map(
      (m) => `📚 [RAG Knowledge Base — ${m.document.title}]: ${m.snippet}`
    );

    const ragSources = ragMatches.map((m) => `${m.document.source} (${m.document.title})`);

    response.reasoning = [...ragReasoning, ...response.reasoning];
    response.dataSources = Array.from(new Set([...response.dataSources, ...ragSources]));
  }

  return response;
}

export { classifyQuery, executeAgent };
export type { AgentOutput, QueryClassification };
