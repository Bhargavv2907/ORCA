'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route, MapPin, Navigation, Search, WifiOff, Wifi, Ship, Layers,
  RefreshCw, Compass, Anchor, Radio, Fish, ArrowUpRight, Shield,
  Crosshair, AlertTriangle, Plus, Minus, X, Check, Volume2, ShieldAlert,
  Zap, Info, Gauge, AlertOctagon, CheckCircle2, Sliders
} from 'lucide-react';
import { RouteCard, DemoModeBanner } from '@/components/cards';
import { getMockRoutes, getMockFishingZones, getMockVessels } from '@/data/mock-data';
import { RouteOption, Coordinates, FishingZone, Vessel } from '@/types/marine';
import { generateOfflineRoutes } from '@/lib/offline-routing';
import { MapAction } from '@/lib/agents/schemas';
import { INDIAN_COASTAL_SECTORS } from '@/components/world-map';
import { evaluateFleetRisk, COLREGS_DISCLAIMER, FleetCollisionReport } from '@/lib/maritime/collisionRisk';
import { planSafeRoutes, RouteMode, MultiRoutePlan } from '@/lib/maritime/routePlanner';
import { MOCK_INCOIS_PFZ_LIST, PFZMetadata } from '@/lib/maritime/pfzService';

// Dynamic import for Leaflet WorldMap (SSR disabled)
const WorldMap = dynamic(() => import('@/components/world-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-[#0a1628] flex flex-col items-center justify-center gap-3 text-teal-400">
      <RefreshCw className="w-8 h-8 animate-spin" />
      <p className="text-sm font-semibold tracking-wide">Loading Leaflet Nautical Radar & ECDIS Charting Canvas...</p>
    </div>
  ),
});

// Known coastal waypoint dictionary for offline fallback
const OFFLINE_LOCATIONS: Record<string, Coordinates> = {
  'sassoon dock, colaba': { lat: 18.92, lon: 72.83 },
  'mumbai harbor': { lat: 18.95, lon: 72.84 },
  'porbandar harbor': { lat: 21.63, lon: 69.60 },
  'veraval harbor': { lat: 20.90, lon: 70.36 },
  'ratnagiri harbor': { lat: 16.98, lon: 73.29 },
  'mormugao harbor': { lat: 15.40, lon: 73.79 },
  'karwar harbor': { lat: 14.80, lon: 74.12 },
  'old mangalore harbor': { lat: 12.85, lon: 74.81 },
  'kochi harbor': { lat: 9.96, lon: 76.26 },
  'tuticorin harbor': { lat: 8.76, lon: 78.18 },
  'chennai harbor': { lat: 13.09, lon: 80.29 },
  'visakhapatnam harbor': { lat: 17.69, lon: 83.28 },
  'kakinada harbor': { lat: 16.94, lon: 82.25 },
  'paradip harbor': { lat: 20.26, lon: 86.67 },
  'haldia harbor': { lat: 22.04, lon: 88.09 },
  'kavaratti harbor': { lat: 10.56, lon: 72.64 },
  'port blair harbor': { lat: 11.68, lon: 92.74 },
};

function getCoordsForInput(input: string, fallback: Coordinates): Coordinates {
  const normalized = input.trim().toLowerCase();
  return OFFLINE_LOCATIONS[normalized] || fallback;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState('konkan'); // Konkan (Mumbai) default
  const [start, setStart] = useState('Sassoon Dock, Colaba');
  const [destination, setDestination] = useState('PFZ Zone A — Mumbai High Shelf');
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(1); // Default to recommended
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [routeMode, setRouteMode] = useState<RouteMode>('BALANCED');
  const [isDemoCollisionActive, setIsDemoCollisionActive] = useState(false);

  // Vessel AIS State
  const [vesselData, setVesselData] = useState<{ totalVessels: number; trafficDensity: string; shippingLaneStatus: string; vessels: Vessel[]; source?: string; isDemonstrationMode?: boolean } | null>(null);

  // Own Boat Telemetry
  const ownVessel = useMemo(() => ({
    name: 'Jai Malhar',
    registration: 'IND-MH-01-MM-4592',
    position: { lat: 18.92, lon: 72.82 },
    speed: 6.2,
    heading: 230,
  }), []);

  // Active Coastal Sector
  const currentSector = INDIAN_COASTAL_SECTORS.find(s => s.id === selectedSectorId) || INDIAN_COASTAL_SECTORS[1];

  // Target PFZ Metadata List
  const targetPFZ = useMemo(() => {
    return MOCK_INCOIS_PFZ_LIST.find(p => p.name.includes(destination) || destination.includes(p.name)) || MOCK_INCOIS_PFZ_LIST[0];
  }, [destination]);

  // Compute Active Vessels (including simulated collision demo scenario if toggled)
  const activeVessels = useMemo(() => {
    const baseList = vesselData?.vessels || getMockVessels();

    if (isDemoCollisionActive) {
      // Inject high-risk collision cargo vessel heading directly towards own vessel
      const collisionCargo: Vessel = {
        id: 'mv-container-express',
        name: 'MV Pacific Express (Cargo)',
        type: 'cargo',
        position: { lat: 18.96, lon: 72.78 }, // Directly ahead in channel
        speed: 16.5,                           // High speed cargo
        heading: 110,                          // Heading directly on collision vector
        activity: 'Transit (High Speed)',
        lastUpdated: new Date().toISOString(),
        flag: 'IN',
        length: 240,
      };
      return [collisionCargo, ...baseList];
    }

    return baseList;
  }, [vesselData, isDemoCollisionActive]);

  // Evaluate Collision Risk across Active Fleet
  const fleetRiskReport: FleetCollisionReport = useMemo(() => {
    return evaluateFleetRisk(ownVessel.position, ownVessel.speed, ownVessel.heading, activeVessels);
  }, [ownVessel, activeVessels]);

  // Compute Safe Multi-Route Plan (Fastest, Safest, Balanced)
  const safeRoutePlan: MultiRoutePlan = useMemo(() => {
    const startPt = getCoordsForInput(start, ownVessel.position);
    const destPt = targetPFZ.center;
    return planSafeRoutes(startPt, destPt, activeVessels, routeMode);
  }, [start, targetPFZ, activeVessels, routeMode, ownVessel.position]);

  // IMD (India Meteorological Department) Data State
  const [imdData, setImdData] = useState<{
    status: string;
    source: string;
    warningText?: string;
    portSignal?: string;
    mslp?: number;
    seaCondition?: string;
    windSpeedKmph?: number;
  } | null>(null);

  // ECDIS Overlays Panel State
  const [isOverlaysOpen, setIsOverlaysOpen] = useState(true);
  const [overlays, setOverlays] = useState({
    pfz: true,
    ais: true,
    tss: true,
    military: true,
    weather: false,
  });

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch live MarineTraffic AIS vessel data
    fetch(`/api/vessels?lat=${currentSector.center.lat}&lon=${currentSector.center.lon}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) setVesselData(json.data);
      })
      .catch(() => null);

    // Fetch India Meteorological Department (IMD) Live Marine Warnings
    fetch('/api/imd/marine')
      .then(res => res.json())
      .then(json => {
        if (json) {
          setImdData({
            status: json.status || 'LIVE',
            source: json.source || 'India Meteorological Department (IMD)',
            warningText: json.fishermenWarnings?.[0]?.warning || `IMD Advisory: Squally wind speeds 45-55 kmph gusting to 65 kmph likely along ${currentSector.name}. Sea condition rough with 2.8m waves. Fishermen advised not to venture into deep sea.`,
            portSignal: json.coastalBulletins?.[0]?.portSignal || 'Local Cautionary Signal No. 3',
            mslp: 1011.4,
            seaCondition: json.seaBulletins?.[0]?.seaCondition || 'Rough to Very Rough (2.4m - 3.2m swell)',
            windSpeedKmph: 36.5,
          });
        }
      })
      .catch(() => null);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentSector.center.lat, currentSector.center.lon, currentSector.name]);

  const handleSectorChange = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    const sector = INDIAN_COASTAL_SECTORS.find(s => s.id === sectorId);
    if (!sector) return;

    const defaultStart = sector.name.split(' ')[0] + ' Harbor';
    setStart(defaultStart);

    fetch(`/api/vessels?lat=${sector.center.lat}&lon=${sector.center.lon}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) setVesselData(json.data);
      })
      .catch(() => null);
  };

  const toggleOverlay = (key: keyof typeof overlays) => {
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeLayersSet = new Set<string>();
  if (overlays.pfz) activeLayersSet.add('fishing');
  if (overlays.ais) activeLayersSet.add('vessels');
  if (overlays.tss) activeLayersSet.add('tss');
  if (overlays.military) activeLayersSet.add('military');
  if (overlays.weather) activeLayersSet.add('winds');

  const startCoord = getCoordsForInput(start, ownVessel.position);
  const endCoord = targetPFZ.center;

  // Map Action Payload for Leaflet Map
  const mapActionPayload: MapAction = {
    mapAction: 'draw_route',
    selectedZone: targetPFZ.name,
    layers: ['pfz_zones', 'vessels', 'recommended_route'],
    markers: [
      { lat: startCoord.lat, lon: startCoord.lon, label: `Start: ${start}`, type: 'coastal' },
      { lat: endCoord.lat, lon: endCoord.lon, label: `PFZ Target: ${targetPFZ.name}`, type: 'pfz' },
    ],
    route: safeRoutePlan.selectedRoute.waypoints,
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-5 text-slate-100 font-sans">
      {/* 1. TOP MARITIME CONTROL & TELEMETRY HEADER */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 text-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#1e3a8a] text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm">
            <Ship className="w-5 h-5 text-cyan-300" />
            <span className="text-base tracking-tight">{ownVessel.name}</span>
            <span className="bg-[#0284c7] text-white text-[11px] px-2 py-0.5 rounded font-mono font-semibold">
              {ownVessel.registration}
            </span>
          </div>
          <div className="hidden sm:block">
            <span className="text-xs text-slate-500 font-medium block">Homeport</span>
            <span className="text-xs font-semibold text-slate-800">Sassoon Dock, Colaba</span>
          </div>
        </div>

        {/* Center Telemetry Metrics Box */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl text-xs">
          <div className="pl-1">
            <span className="text-slate-400 font-medium block text-[11px]">GPS Fix</span>
            <span className="text-xs font-bold text-[#1e3a8a] font-mono leading-tight block">
              {ownVessel.position.lat}°N, {ownVessel.position.lon}°E
            </span>
          </div>

          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 font-medium block text-[11px]">True Heading</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-[#0284c7] transform rotate-[230deg]" />
              {ownVessel.heading}° SW
            </span>
          </div>

          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 font-medium block text-[11px]">Speed Over Ground</span>
            <span className="text-sm font-bold text-slate-900">{ownVessel.speed} kts</span>
          </div>

          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 font-medium block text-[11px]">AIS Telemetry</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {vesselData?.source ? 'MarineTraffic API' : 'AIS Active'}
            </span>
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDemoCollisionActive(!isDemoCollisionActive)}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
              isDemoCollisionActive
                ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400 animate-pulse'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 border border-amber-500/40'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-600" />
            {isDemoCollisionActive ? '⚡ Collision Demo Active' : '⚡ Simulate Collision Scenario'}
          </button>

          <button
            onClick={() => setIsOverlaysOpen(!isOverlaysOpen)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border border-slate-300"
          >
            <Layers className="w-4 h-4 text-slate-700" />
            Layers
          </button>
        </div>
      </div>

      {/* 1.5 COLREGS MARITIME SAFETY DISCLAIMER BANNER */}
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong className="font-extrabold text-amber-950">MARITIME DECISION SUPPORT DISCLAIMER:</strong> Route recommendations are for decision support only. Always obey official COLREGs regulations, maintain a proper lookout by sight and hearing, and follow onboard radar &amp; AIS equipment.
          </p>
        </div>
        <span className="text-[10px] bg-amber-200/80 font-mono px-2 py-1 rounded border border-amber-300 font-bold shrink-0">
          COLREGs Rules 8, 14, 15
        </span>
      </div>

      {/* 2. MAIN 3-COLUMN MARITIME ROUTE DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: NAVIGATION & PFZ OPTIMIZER (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Target Coastal Sector */}
          <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 text-xs">
            <label className="font-extrabold text-[#1e3a8a] flex items-center gap-2 text-xs">
              <Compass className="w-4 h-4 text-[#0284c7]" />
              Active Coastal Sector
            </label>
            <select
              value={selectedSectorId}
              onChange={e => handleSectorChange(e.target.value)}
              className="w-full bg-slate-50 border-2 border-[#0284c7]/40 text-slate-900 font-bold rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0284c7] cursor-pointer"
            >
              {INDIAN_COASTAL_SECTORS.map((sector) => (
                <option key={sector.id} value={sector.id} className="bg-white text-slate-900">
                  🇮🇳 {sector.name} ({sector.state})
                </option>
              ))}
            </select>
          </div>

          {/* Destination PFZ Selector */}
          <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 text-xs">
            <label className="font-extrabold text-[#1e3a8a] flex items-center gap-2 text-xs">
              <Fish className="w-4 h-4 text-teal-600" />
              Target Potential Fishing Zone (PFZ)
            </label>
            <select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-bold rounded-xl px-3 py-2.5 text-xs cursor-pointer"
            >
              {MOCK_INCOIS_PFZ_LIST.map(pfz => (
                <option key={pfz.id} value={pfz.name}>
                  🎯 {pfz.name} ({pfz.confidenceScore}% Confidence)
                </option>
              ))}
            </select>

            {/* PFZ Card Stats */}
            <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-teal-900 text-xs">🎯 {targetPFZ.name.split('—')[1] || targetPFZ.name}</span>
                <span className="bg-teal-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded">
                  {targetPFZ.confidenceScore}% Confidence
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-teal-900">
                <div>Fish Density: <strong className="text-teal-950 font-bold">{targetPFZ.predictedFishDensity}</strong></div>
                <div>Distance: <strong className="text-teal-950 font-bold">{targetPFZ.distanceNM} NM</strong></div>
                <div>SST: <strong className="text-teal-950 font-bold">{targetPFZ.sstCelsius}°C</strong></div>
                <div>Chlorophyll: <strong className="text-teal-950 font-bold">{targetPFZ.chlorophyllMgM3} mg/m³</strong></div>
              </div>
              <div className="text-[10px] text-teal-700 border-t border-teal-200/60 pt-1.5 font-medium">
                Target: {targetPFZ.targetSpecies.join(', ')}
              </div>
            </div>
          </div>

          {/* Route Mode Optimization Selector */}
          <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 text-xs">
            <label className="font-extrabold text-[#1e3a8a] flex items-center gap-2 text-xs">
              <Sliders className="w-4 h-4 text-[#0284c7]" />
              Route Optimization Mode
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setRouteMode('BALANCED')}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                  routeMode === 'BALANCED'
                    ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] font-bold shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>🟢 Balanced Safe Route (Default)</span>
                  <span className="text-[10px] opacity-80">Safe + Practical</span>
                </div>
                <p className="text-[11px] opacity-90 font-normal">
                  Optimizes distance, travel time, and vessel collision avoidance.
                </p>
              </button>

              <button
                onClick={() => setRouteMode('SAFEST')}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                  routeMode === 'SAFEST'
                    ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>🛡️ Maximum Safety Route</span>
                  <span className="text-[10px] opacity-80">Max Safety</span>
                </div>
                <p className="text-[11px] opacity-90 font-normal">
                  Maximum detour bypassing all active shipping lanes and high-density AIS clusters.
                </p>
              </button>

              <button
                onClick={() => setRouteMode('FASTEST')}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                  routeMode === 'FASTEST'
                    ? 'bg-blue-700 text-white border-blue-700 font-bold shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>⚡ Maximum Efficiency</span>
                  <span className="text-[10px] opacity-80">Shortest Time</span>
                </div>
                <p className="text-[11px] opacity-90 font-normal">
                  Direct shortest course. Requires active AIS collision monitoring.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: INTERACTIVE NAUTICAL RADAR & MAP CANVAS (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* MAP CANVAS */}
          <div className="relative w-full h-[640px] rounded-2xl overflow-hidden shadow-xl border-2 border-slate-300/80 bg-[#c7e4ff]">
            <WorldMap
              fishingZones={[
                {
                  id: targetPFZ.id,
                  name: targetPFZ.name,
                  center: targetPFZ.center,
                  radius: targetPFZ.radiusKm,
                  suitabilityScore: targetPFZ.confidenceScore,
                  sst: targetPFZ.sstCelsius,
                  chlorophyll: targetPFZ.chlorophyllMgM3,
                  historicalActivity: targetPFZ.predictedFishDensity,
                  sectorId: selectedSectorId,
                  color: '#10b981',
                  currentSpeed: 1.2,
                  salinity: 35.2,
                  depth: targetPFZ.depthMeters,
                  fishingEffort: 42,
                  season: 'Peak Monsoon',
                  distanceFromCoast: targetPFZ.distanceNM,
                  factors: [],
                }
              ]}
              vessels={activeVessels}
              mapActionPayload={mapActionPayload}
              selectedRegion={currentSector}
              satelliteMode="nautical_ecdis"
              activeLayers={activeLayersSet}
            />

            {/* Overlays Drawer */}
            <AnimatePresence>
              {isOverlaysOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute top-4 left-4 z-[400] w-72 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-300 space-y-3 text-xs text-slate-800"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2 font-extrabold text-[#1e3a8a] text-sm">
                      <Layers className="w-4 h-4 text-[#0284c7]" />
                      Active Map Layers
                    </div>
                    <button onClick={() => setIsOverlaysOpen(false)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-slate-800">🎯 Potential Fishing Zones</span>
                      <input type="checkbox" checked={overlays.pfz} onChange={() => toggleOverlay('pfz')} className="accent-[#0284c7]" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-slate-800">🚢 AIS Traffic Ships ({activeVessels.length})</span>
                      <input type="checkbox" checked={overlays.ais} onChange={() => toggleOverlay('ais')} className="accent-[#0284c7]" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-slate-800">⚓ Shipping Channels (TSS)</span>
                      <input type="checkbox" checked={overlays.tss} onChange={() => toggleOverlay('tss')} className="accent-[#0284c7]" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-slate-800">🚫 Restricted Naval Zones</span>
                      <input type="checkbox" checked={overlays.military} onChange={() => toggleOverlay('military')} className="accent-[#0284c7]" />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: ROUTE SAFETY METRICS & LIVE COLLISION ALERTS (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* SAFE ROUTE METRICS CARD */}
          <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div>
                <span className="font-extrabold text-[#1e3a8a] text-sm block">Safe Route Analysis</span>
                <span className="text-[11px] text-slate-500 font-semibold">{safeRoutePlan.selectedRoute.name}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-600 block leading-tight">
                  {safeRoutePlan.selectedRoute.overallSafetyScore}/100
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  SAFE ROUTE
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-medium">Distance</span>
                <strong className="text-slate-900 text-sm font-extrabold">{safeRoutePlan.selectedRoute.distanceNM} NM</strong>
                <span className="text-[10px] text-slate-500 block">({safeRoutePlan.selectedRoute.distanceKm} km)</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-medium">Estimated Time</span>
                <strong className="text-slate-900 text-sm font-extrabold">{safeRoutePlan.selectedRoute.etaFormatted}</strong>
                <span className="text-[10px] text-slate-500 block">@ {ownVessel.speed} knots</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-medium">Fuel Estimate</span>
                <strong className="text-slate-900 text-sm font-extrabold">{safeRoutePlan.selectedRoute.fuelEstimateLiters} L</strong>
                <span className="text-[10px] text-slate-500 block">Diesel Fuel</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-medium">Traffic Risk</span>
                <strong className={`text-sm font-extrabold ${safeRoutePlan.selectedRoute.trafficRiskLevel === 'HIGH' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {safeRoutePlan.selectedRoute.trafficRiskLevel}
                </strong>
                <span className="text-[10px] text-slate-500 block">Collision Risk</span>
              </div>
            </div>

            {/* Route Explanation */}
            <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl space-y-1.5 text-xs text-blue-950">
              <span className="font-extrabold text-[#1e3a8a] text-xs block">Why This Route Was Chosen:</span>
              <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
                {safeRoutePlan.selectedRoute.explanation}
              </p>
              <ul className="space-y-1 pt-1 text-[11px] text-blue-900 font-medium">
                {safeRoutePlan.selectedRoute.keyReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* LIVE COLLISION ALERTS PANEL */}
          <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span className="font-extrabold text-[#1e3a8a] text-xs">Live Collision Alerts</span>
              </div>
              <span className="bg-red-100 text-red-700 font-extrabold text-[10px] px-2 py-0.5 rounded">
                {fleetRiskReport.criticalAlerts.length} Alerts
              </span>
            </div>

            {fleetRiskReport.criticalAlerts.length > 0 ? (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {fleetRiskReport.criticalAlerts.map((assessment, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border space-y-1.5 text-xs ${
                      assessment.riskLevel === 'HIGH'
                        ? 'bg-red-50/90 border-red-300 text-red-950'
                        : 'bg-amber-50/90 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between font-extrabold">
                      <span className="flex items-center gap-1.5">
                        <Ship className="w-4 h-4 text-red-600" />
                        {assessment.vessel.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white border font-mono">
                        CPA: {assessment.cpaResult.cpaNM} NM
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div>Type: <strong>{assessment.vessel.type.toUpperCase()}</strong></div>
                      <div>Speed: <strong>{assessment.vessel.speed} kts</strong></div>
                      <div>Distance: <strong>{assessment.cpaResult.distanceNM} NM</strong></div>
                      <div>TCPA: <strong>{assessment.cpaResult.tcpaMinutes} min</strong></div>
                    </div>

                    {assessment.recommendedAction && (
                      <div className="text-[10px] bg-white/90 p-2 rounded-lg border font-semibold text-slate-800 leading-snug">
                        💡 <strong>COLREGs Advice:</strong> {assessment.recommendedAction}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <span className="font-extrabold text-xs block">No Collision Risks Detected</span>
                <p className="text-[11px] text-emerald-700">All nearby AIS vessels are maintaining safe CPA (&gt;1.5 NM) trajectory.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
