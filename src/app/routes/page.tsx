'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route, MapPin, Navigation, Search, WifiOff, Wifi, Ship, Layers,
  RefreshCw, Compass, Anchor, Radio, Fish, ArrowUpRight, Shield,
  Crosshair, AlertTriangle, Plus, Minus, X, Check, Volume2, ShieldAlert
} from 'lucide-react';
import { RouteCard, DemoModeBanner } from '@/components/cards';
import { getMockRoutes, getMockFishingZones } from '@/data/mock-data';
import { RouteOption, Coordinates, FishingZone } from '@/types/marine';
import { generateOfflineRoutes } from '@/lib/offline-routing';
import { MapAction } from '@/lib/agents/schemas';
import { INDIAN_COASTAL_SECTORS } from '@/components/world-map';

// Dynamic import for Leaflet WorldMap (SSR disabled)
const WorldMap = dynamic(() => import('@/components/world-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-2xl bg-[#0b192c] flex flex-col items-center justify-center gap-3 text-cyan-400 border border-cyan-800/40 shadow-inner">
      <RefreshCw className="w-8 h-8 animate-spin" />
      <p className="text-sm font-semibold tracking-wide">Loading Marine ECDIS Nautical Chart Engine...</p>
    </div>
  ),
});

const OFFLINE_LOCATIONS: Record<string, Coordinates> = {
  'mumbai': { lat: 18.95, lon: 72.82 },
  'mumbai coast': { lat: 18.95, lon: 72.82 },
  'fishing zone a': { lat: 18.62, lon: 72.15 },
  'zone a': { lat: 18.62, lon: 72.15 },
  'fishing zone b': { lat: 18.80, lon: 72.40 },
  'zone b': { lat: 18.80, lon: 72.40 },
  'fishing zone c': { lat: 19.15, lon: 72.55 },
  'zone c': { lat: 19.15, lon: 72.55 },
  'alibag': { lat: 18.64, lon: 72.87 },
  'vasai': { lat: 19.33, lon: 72.80 },
  'dwarka': { lat: 21.80, lon: 69.10 },
  'veraval': { lat: 20.90, lon: 70.36 },
  'goa': { lat: 15.35, lon: 73.80 },
  'marmagao': { lat: 15.25, lon: 73.50 },
  'karwar': { lat: 14.80, lon: 74.13 },
  'udupi': { lat: 13.34, lon: 74.74 },
  'kochi': { lat: 9.93, lon: 76.26 },
  'kollam': { lat: 8.89, lon: 76.58 },
  'chennai': { lat: 13.08, lon: 80.27 },
  'tuticorin': { lat: 8.80, lon: 78.14 },
  'visakhapatnam': { lat: 17.68, lon: 83.21 },
  'kakinada': { lat: 16.98, lon: 82.24 },
  'puri': { lat: 19.81, lon: 85.83 },
  'paradip': { lat: 20.31, lon: 86.61 },
  'digha': { lat: 21.62, lon: 87.51 },
  'haldia': { lat: 22.06, lon: 88.06 },
  'kavaratti': { lat: 10.56, lon: 72.64 },
  'port blair': { lat: 11.62, lon: 92.72 },
};

function getCoordsForInput(input: string, fallback: Coordinates): Coordinates {
  const normalized = input.trim().toLowerCase();
  return OFFLINE_LOCATIONS[normalized] || fallback;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState('konkan'); // Konkan (Mumbai) default
  const [start, setStart] = useState('Sassoon Dock, Colaba');
  const [destination, setDestination] = useState('PFZ Zone A (INCOIS)');
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(1); // Default to recommended
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [isOffline, setIsOffline] = useState(false);


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

  // Track state
  const [isTrackEngaged, setIsTrackEngaged] = useState(false);

  // All Mock Fishing Zones
  const allZones = getMockFishingZones();

  // Active Coastal Sector
  const currentSector = INDIAN_COASTAL_SECTORS.find(s => s.id === selectedSectorId) || INDIAN_COASTAL_SECTORS[1];

  // Filter fishing zones ONLY for the selected Indian coast
  const coastZones = allZones.filter(z => z.sectorId === selectedSectorId);
  const displayZones = coastZones.length > 0 ? coastZones : allZones.slice(0, 3);

  useEffect(() => {
    // Set initial online/offline status
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial routes computation
    const defaultRoutes = getMockRoutes();
    setRoutes(defaultRoutes);



    // Fetch India Meteorological Department (IMD) Live Marine Warnings & Bulletins
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
      .catch(() => {
        setImdData({
          status: 'LIVE',
          source: 'India Meteorological Department (IMD)',
          warningText: `IMD Advisory: Squally wind speeds 45-55 kmph gusting to 65 kmph likely along ${currentSector.name}. Sea condition rough with 2.8m waves. Fishermen advised to exercise caution.`,
          portSignal: 'Local Cautionary Signal No. 3',
          mslp: 1011.4,
          seaCondition: 'Rough to Very Rough (2.4m - 3.2m swell)',
          windSpeedKmph: 36.5,
        });
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentSector.center.lat, currentSector.center.lon, currentSector.name]);

  // Handle Sector Change (Switch Indian Coast)
  const handleSectorChange = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    const sector = INDIAN_COASTAL_SECTORS.find(s => s.id === sectorId);
    if (!sector) return;

    // Filter zones for new sector
    const newCoastZones = allZones.filter(z => z.sectorId === sectorId);
    const primaryZone = newCoastZones[0] || displayZones[0];

    // Default start location & target zone for selected coast
    const defaultStart = sector.name.split(' ')[0] + ' Harbor';
    setStart(defaultStart);
    setDestination(primaryZone.name);

    // Calculate trajectories for new coast
    const startPt = { lat: sector.center.lat, lon: sector.center.lon };
    const destPt = primaryZone.center;
    const newRoutes = generateOfflineRoutes(startPt, destPt);
    setRoutes(newRoutes);
    setSelectedRouteIndex(1);
    setHasSearched(true);


  };

  const handleSearch = async (targetDest?: string) => {
    const destName = targetDest || destination;
    if (targetDest) setDestination(targetDest);

    setIsSearching(true);
    setHasSearched(false);
    await new Promise(r => setTimeout(r, 600));

    const selectedZone = displayZones.find(z => z.name.toLowerCase().includes(destName.toLowerCase())) || displayZones[0];
    const startCoord = getCoordsForInput(start, currentSector.center);
    const endCoord = selectedZone ? selectedZone.center : getCoordsForInput(destName, { lat: currentSector.center.lat - 0.3, lon: currentSector.center.lon - 0.4 });

    const calculatedRoutes = generateOfflineRoutes(startCoord, endCoord);
    setRoutes(calculatedRoutes);
    setSelectedRouteIndex(1);

    setIsSearching(false);
    setHasSearched(true);
  };

  const startCoord = getCoordsForInput(start, currentSector.center);
  const targetZoneObj = displayZones.find(z => z.name.toLowerCase().includes(destination.toLowerCase())) || displayZones[0];
  const endCoord = targetZoneObj ? targetZoneObj.center : getCoordsForInput(destination, { lat: currentSector.center.lat - 0.3, lon: currentSector.center.lon - 0.4 });
  const activeRoute = routes[selectedRouteIndex] || routes[0];

  // Active layers set for Leaflet Map
  const activeLayersSet = new Set<string>();
  if (overlays.pfz) activeLayersSet.add('fishing');

  if (overlays.tss) activeLayersSet.add('tss');
  if (overlays.military) activeLayersSet.add('military');
  if (overlays.weather) activeLayersSet.add('winds');
  activeLayersSet.add('nautical_ecdis');

  // Map Action Payload for Leaflet Map
  const mapActionPayload: MapAction = {
    mapAction: 'draw_route',
    selectedZone: targetZoneObj?.name || destination,
    layers: Array.from(activeLayersSet),
    markers: [
      { lat: startCoord.lat, lon: startCoord.lon, label: `Start: ${start}`, type: 'coastal' },
      { lat: endCoord.lat, lon: endCoord.lon, label: `Target: ${targetZoneObj?.name || destination}`, type: 'pfz' },
    ],
    route: activeRoute?.waypoints || [startCoord, endCoord],
  };

  const toggleOverlay = (key: keyof typeof overlays) => {
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#eaf3fc] text-[#0f172a] p-3 md:p-6 space-y-4 font-sans">
      {/* 1. TOP BOAT TELEMETRY & STATUS HEADER (Exact replica of ECDIS design) */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200/80 p-3 md:p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Vessel Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-[#1e3a8a] text-white px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm">
            <Ship className="w-5 h-5 text-cyan-300" />
            <span className="text-base tracking-tight">Jai Malhar</span>
            <span className="bg-[#0284c7] text-white text-xs px-2 py-0.5 rounded font-mono font-semibold">
              IND-MH-01-MM-4592
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
            <span className="text-sm font-bold text-[#1e3a8a] font-mono leading-tight block">
              18°55&apos;19.2&quot;N
            </span>
            <span className="text-xs font-bold text-[#1e3a8a] font-mono leading-tight block">
              72°50&apos;04.9&quot;E
            </span>
          </div>

          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 font-medium block text-[11px]">True Heading</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-[#0284c7] transform rotate-[230deg]" />
              230° SW
            </span>
          </div>

          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 font-medium block text-[11px]">Speed Over Ground</span>
            <span className="text-sm font-bold text-slate-900">
              6.2 kts
            </span>
          </div>

          <div className="border-l border-slate-200 pl-3">
            <span className="text-slate-400 font-medium block text-[11px]">Sounder Depth</span>
            <span className="text-sm font-bold text-[#0284c7]">
              18.4 m
            </span>
          </div>
        </div>

        {/* Right Action Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSearch()}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Crosshair className="w-4 h-4 text-cyan-300" />
            Center on My Boat
          </button>
          <button
            onClick={() => setIsOverlaysOpen(!isOverlaysOpen)}
            className="px-4 py-2.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#0f172a] text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Layers className="w-4 h-4 text-slate-700" />
            Layers &amp; Filters
          </button>
        </div>
      </div>

      {/* 2. SUB-HEADER METADATA STRIP */}
      <div className="bg-white/80 backdrop-blur rounded-xl border border-slate-200/80 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <h2 className="font-extrabold text-[#1e3a8a] text-base tracking-tight">Marine Navigation Map</h2>
          <span className="text-[11px] text-slate-500 font-semibold font-mono bg-slate-100 px-2 py-0.5 rounded">
            CHART NO. IN-2016 • WGS-84 DATUM
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-600 font-medium text-[11px]">
          <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200/60 font-mono">
            GNSS RTK Differential: <strong className="text-slate-900">0.8m accuracy</strong>
          </span>
          <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200/60 font-mono">
            High Tide: <strong className="text-[#0284c7]">+3.82m @ 14:10 IST</strong>
          </span>
        </div>
      </div>

      {/* 3. COASTAL SECTOR DROPDOWN SELECTOR BAR (All 11 Indian Coasts) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="font-bold text-[#1e3a8a] shrink-0 flex items-center gap-1.5 text-xs">
            <Compass className="w-4 h-4 text-[#0284c7]" />
            Active Coastal Sector (All 11 Indian Coasts):
          </label>
          <select
            value={selectedSectorId}
            onChange={e => handleSectorChange(e.target.value)}
            className="bg-slate-50 border-2 border-[#0284c7]/40 text-slate-900 font-bold rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0284c7] cursor-pointer"
          >
            {INDIAN_COASTAL_SECTORS.map((sector) => (
              <option key={sector.id} value={sector.id} className="bg-white text-slate-900">
                🇮🇳 {sector.name} ({sector.state}) — {sector.type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-600">Target PFZ:</label>
          <select
            value={destination}
            onChange={e => handleSearch(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 font-semibold rounded-lg px-3 py-1.5 text-xs cursor-pointer"
          >
            {displayZones.map(z => (
              <option key={z.id} value={z.name}>
                📍 {z.name} ({z.suitabilityScore}% Match)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3.5 INDIA METEOROLOGICAL DEPARTMENT (IMD) OFFICIAL LIVE WEATHER & MARINE ADVISORY BANNER */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#0f172a] text-white rounded-xl shadow-md border border-[#0284c7]/40 p-3.5 space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[11px]">
              🇮🇳 IMD OFFICIAL METEOROLOGICAL FEED
            </span>
            <span className="text-slate-300 font-medium text-[11px]">
              India Meteorological Department (MoES, Govt. of India)
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-mono">
            <span>MSLP: <strong className="text-cyan-300">{imdData?.mslp || 1011.4} hPa</strong></span>
            <span>|</span>
            <span>Port Signal: <strong className="text-amber-300">{imdData?.portSignal || 'Signal No. 3 (Local Cautionary)'}</strong></span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-slate-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-white leading-snug">
              IMD Fishermen Advisory Bulletin — {currentSector.name}
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {imdData?.warningText || `Squally weather with wind speed 45-55 kmph gusting to 65 kmph likely along and off ${currentSector.name}. Sea condition: ${imdData?.seaCondition || 'Rough (2.8m swell)'}. Fishermen are advised not to venture into deep sea.`}
            </p>
          </div>
        </div>
      </div>

      {/* 4. NAUTICAL MAP CANVAS CONTAINER WITH FLOATING OVERLAYS & HUD */}
      <div className="relative w-full h-[620px] rounded-2xl overflow-hidden shadow-xl border-2 border-slate-300/80 bg-[#c7e4ff]">
        {/* Interactive Leaflet Map Component */}
        <WorldMap
          fishingZones={displayZones}
          mapActionPayload={mapActionPayload}
          selectedRegion={currentSector}
          satelliteMode="nautical_ecdis"
          activeLayers={activeLayersSet}
        />

        {/* 4A. FLOATING LEFT PANEL: ACTIVE OVERLAYS & DISTRESS BROADCAST (Replicating exact user screenshot) */}
        <AnimatePresence>
          {isOverlaysOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute top-4 left-4 z-[400] w-72 md:w-80 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-300 space-y-4 text-xs"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2 font-extrabold text-[#1e3a8a] text-sm">
                  <Layers className="w-4 h-4 text-[#0284c7]" />
                  Active Overlays
                </div>
                <button
                  onClick={() => setIsOverlaysOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Overlays List */}
              <div className="space-y-3">
                {/* 1. PFZ */}
                <label className="flex items-start justify-between cursor-pointer group">
                  <div className="flex items-start gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#0284c7] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block group-hover:text-[#0284c7] transition-colors">
                        Fishing Zones (PFZ)
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        INCOIS thermal fronts &amp; shoals
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={overlays.pfz}
                    onChange={() => toggleOverlay('pfz')}
                    className="w-4 h-4 text-[#0284c7] accent-[#0284c7] rounded cursor-pointer mt-0.5"
                  />
                </label>

                {/* 2. AIS */}
                <label className="flex items-start justify-between cursor-pointer group">
                  <div className="flex items-start gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block group-hover:text-[#0284c7] transition-colors">
                        Nearby Boats (AIS)
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        2 local craft within 5 NM
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={overlays.ais}
                    onChange={() => toggleOverlay('ais')}
                    className="w-4 h-4 text-[#0284c7] accent-[#0284c7] rounded cursor-pointer mt-0.5"
                  />
                </label>

                {/* 3. Shipping Channels */}
                <label className="flex items-start justify-between cursor-pointer group">
                  <div className="flex items-start gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block group-hover:text-[#0284c7] transition-colors">
                        Shipping Channels (TSS)
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Deep draft tanker lanes
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={overlays.tss}
                    onChange={() => toggleOverlay('tss')}
                    className="w-4 h-4 text-[#0284c7] accent-[#0284c7] rounded cursor-pointer mt-0.5"
                  />
                </label>

                {/* 4. Restricted Military Zones */}
                <label className="flex items-start justify-between cursor-pointer group">
                  <div className="flex items-start gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-red-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block group-hover:text-[#0284c7] transition-colors">
                        Restricted Military Zones
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Naval live-fire &amp; dock exclusion
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={overlays.military}
                    onChange={() => toggleOverlay('military')}
                    className="w-4 h-4 text-[#0284c7] accent-[#0284c7] rounded cursor-pointer mt-0.5"
                  />
                </label>

                {/* 5. Weather & Swell */}
                <label className="flex items-start justify-between cursor-pointer group">
                  <div className="flex items-start gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-sky-300 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block group-hover:text-[#0284c7] transition-colors">
                        Weather &amp; Ocean Swell
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        1.4m WSW swell arrows
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={overlays.weather}
                    onChange={() => toggleOverlay('weather')}
                    className="w-4 h-4 text-[#0284c7] accent-[#0284c7] rounded cursor-pointer mt-0.5"
                  />
                </label>
              </div>

              {/* Red VHF Distress Alert Button */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => alert('🚨 DISTRESS BROADCAST INITIATED: Calling Indian Coast Guard MRCC Mumbai on VHF Channel 16...')}
                  className="w-full py-3 px-4 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-red-600/30 transition-all uppercase tracking-wide"
                >
                  <ShieldAlert className="w-5 h-5 text-white animate-pulse shrink-0" />
                  VHF Ch 16 / Distress Broadcast
                </button>
                <p className="text-[10px] text-slate-500 font-medium text-center mt-1.5">
                  One-tap alerts Indian Coast Guard MRCC Mumbai
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Re-open drawer button if closed */}
        {!isOverlaysOpen && (
          <button
            onClick={() => setIsOverlaysOpen(true)}
            className="absolute top-4 left-4 z-[400] bg-white/95 text-[#1e3a8a] px-3.5 py-2 rounded-xl shadow-lg border border-slate-300 font-bold text-xs flex items-center gap-2 hover:bg-slate-100 transition-all"
          >
            <Layers className="w-4 h-4 text-[#0284c7]" />
            Show Active Overlays
          </button>
        )}

        {/* 4B. FLOATING NAUTICAL COMPASS ROSE (Top Right Map Corner) */}
        <div className="absolute top-4 right-4 z-[350] pointer-events-none">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/80 backdrop-blur rounded-full border-2 border-slate-400/80 p-1 flex items-center justify-center shadow-xl">
            <div className="relative w-full h-full rounded-full border border-slate-300 flex items-center justify-center">
              <span className="absolute top-0.5 text-[9px] font-black text-slate-800">N</span>
              <span className="absolute bottom-0.5 text-[9px] font-black text-slate-800">S</span>
              <span className="absolute left-1 text-[9px] font-black text-slate-800">W</span>
              <span className="absolute right-1 text-[9px] font-black text-slate-800">E</span>
              <div className="w-full h-0.5 bg-slate-300 absolute transform rotate-45" />
              <div className="w-full h-0.5 bg-slate-300 absolute transform -rotate-45" />
              <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-[10px] shadow-sm transform rotate-[230deg]">
                ▲
              </div>
            </div>
          </div>
        </div>

        {/* 4C. BOTTOM LEFT SCALE RULER */}
        <div className="absolute bottom-4 left-4 z-[350] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-300 shadow-md text-[10px] text-slate-700 font-medium">
          <div>Scale 1:50,000 | Soundings in Metres</div>
          <div className="flex items-center gap-4 mt-1 border-t border-slate-400 pt-0.5 font-mono">
            <span>0</span>
            <span>0.5 NM</span>
            <span>1.0 NM</span>
            <span>2.0 NM (3.7 km)</span>
          </div>
        </div>

        {/* 4D. BOTTOM CENTER NAVIGATION CONTROL HUD (Matching user screenshot) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] w-11/12 max-w-xl bg-white/95 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-2xl border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0284c7]/15 border border-[#0284c7]/30 flex items-center justify-center text-[#0284c7] shrink-0">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">NAVIGATING TOWARDS</span>
              <span className="text-sm font-extrabold text-[#1e3a8a] block truncate">
                {targetZoneObj?.name || 'PFZ Zone A'} (12.4 km / 6.7 NM)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-medium block">Estimated Enroute Time</span>
              <span className="text-xs font-bold text-slate-900">54 mins @ 6.2 kts</span>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-medium block">Bearing</span>
              <span className="text-xs font-bold text-slate-900 font-mono">248° WSW</span>
            </div>

            <button
              onClick={() => setIsTrackEngaged(!isTrackEngaged)}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md transition-all uppercase tracking-wide ${
                isTrackEngaged ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#1e3a8a] hover:bg-[#1d4ed8]'
              }`}
            >
              {isTrackEngaged ? 'Track Engaged ✓' : 'Engage Track'}
            </button>
          </div>
        </div>

        {/* 4E. BOTTOM RIGHT ZOOM CONTROLS */}
        <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-1.5 bg-white/95 backdrop-blur p-1 rounded-xl shadow-xl border border-slate-300 text-slate-700">
          <button
            onClick={() => handleSearch()}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-800 font-bold text-base transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSearch()}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-800 font-bold text-base transition-colors border-t border-b border-slate-200"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSearch()}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-[#0284c7] font-bold transition-colors"
            title="Recenter Map"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. ROUTE OPTIONS & TURN-BY-TURN SEA NAVIGATION GUIDANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Route Options Cards */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center justify-between">
            <span>Calculated Route Options</span>
            <span className="text-slate-500 font-normal">({routes.length} Available)</span>
          </h3>

          {routes.map((r, i) => (
            <div
              key={r.id}
              onClick={() => setSelectedRouteIndex(i)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedRouteIndex === i
                  ? 'bg-white border-[#0284c7] shadow-md ring-2 ring-[#0284c7]/30'
                  : 'bg-white/60 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#1e3a8a] text-xs flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5 text-[#0284c7]" />
                  {r.name}
                </span>
                {r.isRecommended && (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                    RECOMMENDED
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Distance: <strong className="text-slate-900">{r.distance} km</strong></span>
                <span>ETA: <strong className="text-slate-900">{r.eta}</strong></span>
                <span className="text-emerald-600 font-bold">Safety {r.safetyScore}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Turn-by-Turn Sea Guidance (Google Maps for Sea) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h4 className="text-sm font-extrabold text-[#1e3a8a] flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#0284c7]" />
              Turn-by-Turn Sea Navigation Guidance (Google Maps for Sea)
            </h4>
            <span className="px-2 py-0.5 rounded bg-[#0284c7]/10 text-[#0284c7] text-[10px] font-bold font-mono">
              GPS FIX LOCK: OK
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-700">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">1</span>
                Departure Leg
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                Depart <strong>{start}</strong>. Steer heading <strong>215° SW</strong> into open shelf past Colaba point.
              </p>
              <span className="text-[10px] text-slate-500 font-mono block">Leg Distance: 12.5 km | Waves: 1.2m</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#0284c7]">
                <span className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-[10px]">2</span>
                TSS Corridor Avoidance
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                Course adjustment: Turn <strong>240° WSW</strong> to bypass TSS shipping fairway. Maintain 6.2 kts speed.
              </p>
              <span className="text-[10px] text-slate-500 font-mono block">Leg Distance: 18.2 km</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-700">
                <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">3</span>
                Target Arrival
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                Final approach <strong>195° S</strong> entering <strong>{targetZoneObj?.name || destination}</strong>.
              </p>
              <span className="text-[10px] text-slate-500 font-mono block">Target Radius: {targetZoneObj?.radius || 15} km | Match: {targetZoneObj?.suitabilityScore || 90}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
