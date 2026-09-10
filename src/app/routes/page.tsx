'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Route, MapPin, Navigation, Search, WifiOff, Wifi, Ship, Layers, RefreshCw, Compass, Anchor } from 'lucide-react';
import { RouteCard, DemoModeBanner } from '@/components/cards';
import { getMockRoutes, getMockFishingZones, getMockVessels } from '@/data/mock-data';
import { RouteOption, Coordinates, FishingZone, Vessel } from '@/types/marine';
import { generateOfflineRoutes } from '@/lib/offline-routing';
import { MapAction } from '@/lib/agents/schemas';
import { INDIAN_COASTAL_SECTORS } from '@/components/world-map';

// Dynamic import for Leaflet WorldMap (SSR disabled)
const WorldMap = dynamic(() => import('@/components/world-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] rounded-2xl bg-navy-950 flex flex-col items-center justify-center gap-3 text-teal-400 border border-navy-700/50">
      <RefreshCw className="w-8 h-8 animate-spin" />
      <p className="text-sm font-semibold tracking-wide">Loading Interactive Ocean Navigation Map...</p>
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
  const [start, setStart] = useState('Mumbai Coast');
  const [destination, setDestination] = useState('Fishing Zone A — Mumbai High Shelf');
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(1); // Default to recommended
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [vesselData, setVesselData] = useState<{ totalVessels: number; trafficDensity: string; shippingLaneStatus: string; vessels: Vessel[] } | null>(null);
  const [showVesselDetails, setShowVesselDetails] = useState(false);

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

    // Initial search
    const defaultRoutes = getMockRoutes();
    setRoutes(defaultRoutes);
    setHasSearched(true);

    // Fetch direct live AIS vessel telemetry API
    fetch('/api/vessels?lat=' + currentSector.center.lat + '&lon=' + currentSector.center.lon)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setVesselData(json.data);
        }
      })
      .catch(() => null);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle Sector Change (Switch Indian Coast)
  const handleSectorChange = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    const sector = INDIAN_COASTAL_SECTORS.find(s => s.id === sectorId);
    if (!sector) return;

    // Filter zones for new sector
    const newCoastZones = allZones.filter(z => z.sectorId === sectorId);
    const primaryZone = newCoastZones[0] || displayZones[0];

    // Default start location & target zone for selected coast
    const defaultStart = sector.name.split(' ')[0] + ' Coast';
    setStart(defaultStart);
    setDestination(primaryZone.name);

    // Calculate trajectories for new coast
    const startPt = { lat: sector.center.lat, lon: sector.center.lon };
    const destPt = primaryZone.center;
    const newRoutes = generateOfflineRoutes(startPt, destPt);
    setRoutes(newRoutes);
    setSelectedRouteIndex(1);
    setHasSearched(true);

    // Refresh AIS vessels for new sector coordinates
    fetch(`/api/vessels?lat=${sector.center.lat}&lon=${sector.center.lon}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) setVesselData(json.data);
      })
      .catch(() => null);
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

  // Map Action Payload for Leaflet Map
  const mapActionPayload: MapAction = {
    mapAction: 'draw_route',
    selectedZone: targetZoneObj?.name || destination,
    layers: ['pfz_zones', 'vessels', 'recommended_route'],
    markers: [
      { lat: startCoord.lat, lon: startCoord.lon, label: `Start: ${start}`, type: 'coastal' },
      { lat: endCoord.lat, lon: endCoord.lon, label: `Target: ${targetZoneObj?.name || destination}`, type: 'pfz' },
    ],
    route: activeRoute?.waypoints || [startCoord, endCoord],
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Route className="w-7 h-7 text-teal-400" />
            Safe Route Planner — All 11 Indian Coasts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Google Maps-style ocean navigation & PFZ target trajectories filtered by Indian coastal sector.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isOffline ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
              <WifiOff className="w-3.5 h-3.5" />
              OFFLINE MODE
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Wifi className="w-3.5 h-3.5" />
              DIRECT AIS STREAM ACTIVE
            </div>
          )}
          <DemoModeBanner />
        </div>
      </motion.div>

      {/* Embedded Direct Live AIS Vessel Data Panel */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-card border border-cyan-500/30 space-y-3"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">Direct Live AIS Vessel Stream — {currentSector.name}</h3>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Live Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Real-time vessel positions, commercial shipping lane congestion, and collision avoidance vectors processed directly inside ORCA.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowVesselDetails(!showVesselDetails)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all whitespace-nowrap"
          >
            {showVesselDetails ? 'Hide Vessel Telemetry ▲' : 'Inspect Live Vessels (' + (vesselData?.totalVessels || 20) + ') ▼'}
          </button>
        </div>

        {/* Live AIS Telemetry Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-navy-700/60 text-xs">
          <div>
            <span className="text-slate-400 block">Vessels Tracked</span>
            <span className="text-sm font-bold text-white">{vesselData?.totalVessels || 20} Vessels</span>
          </div>
          <div>
            <span className="text-slate-400 block">Traffic Density</span>
            <span className="text-sm font-bold text-cyan-400">{vesselData?.trafficDensity || 'EXTREME'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Shipping Corridor</span>
            <span className="text-sm font-bold text-amber-400">{vesselData?.shippingLaneStatus || 'CONGESTED'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Active Sector</span>
            <span className="text-sm font-bold text-teal-300">{currentSector.name}</span>
          </div>
        </div>

        {/* Expandable Vessel Telemetry List */}
        {showVesselDetails && vesselData?.vessels && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-3 border-t border-navy-700/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
          >
            {vesselData.vessels.map((v, i) => (
              <div key={i} className="p-3 rounded-xl bg-navy-950/60 border border-navy-700/50 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Ship className="w-3 h-3 text-cyan-400" />
                    {v.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-mono uppercase">
                    {v.type}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Speed: <strong className="text-slate-200">{v.speed} kn</strong></span>
                  <span>Heading: <strong className="text-slate-200">{v.heading}°</strong></span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Pos: {v.position.lat.toFixed(2)}°N, {v.position.lon.toFixed(2)}°E | Flag: {v.flag}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Offline Status Alert */}
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-orange-500/15 border border-orange-500/25 text-sm text-slate-300"
        >
          <div className="flex items-center gap-2 font-semibold text-orange-400 mb-1">
            <WifiOff className="w-4 h-4" />
            No Internet Connection
          </div>
          ORCA is running in offline mode. The router will compute safe pathways using your browser&apos;s local memory and preloaded 2D shoreline bathymetry grids.
        </motion.div>
      )}

      {/* Route & Zone Target Input Controls with Coastal Sector Dropdown */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-navy-600/20 bg-card p-6 space-y-5">
        {/* 1. Indian Coastal Sector Dropdown Selector */}
        <div>
          <label className="text-xs text-teal-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            Select Coastal Sector in India (All 11 Sectors):
          </label>
          <select
            value={selectedSectorId}
            onChange={e => handleSectorChange(e.target.value)}
            className="w-full bg-navy-900 border-2 border-teal-500/50 text-white font-bold rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer shadow-lg"
          >
            {INDIAN_COASTAL_SECTORS.map((sector) => (
              <option key={sector.id} value={sector.id} className="bg-navy-900 text-white">
                🇮🇳 {sector.name} ({sector.state}) — {sector.type}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1.5">
            Region: <strong className="text-slate-200">{currentSector.description}</strong>
          </p>
        </div>

        {/* 2. Start & Target Destination Controls */}
        <div className="grid md:grid-cols-[1fr,auto,1fr,auto] items-end gap-4 pt-3 border-t border-navy-700/50">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Start Location</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-navy-800/50 border border-navy-700/30 focus-within:border-teal-500/40 transition-colors">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
              <input value={start} onChange={e => setStart(e.target.value)} className="bg-transparent text-white text-sm outline-none flex-1" placeholder="Enter start location" />
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-navy-700/30 self-end mb-1">
            <Navigation className="w-4 h-4 text-teal-400" />
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Target Destination Zone ({displayZones.length} PFZs near coast)</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-navy-800/50 border border-navy-700/30 focus-within:border-teal-500/40 transition-colors">
              <Anchor className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={destination}
                onChange={e => handleSearch(e.target.value)}
                className="bg-transparent text-white text-sm outline-none flex-1 cursor-pointer"
              >
                {displayZones.map(z => (
                  <option key={z.id} value={z.name} className="bg-navy-900 text-white">
                    📍 {z.name} ({z.suitabilityScore}% Match — {z.distanceFromCoast} km)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50"
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Calculate Safe Route
          </button>
        </div>

        {/* 3. Filtered PFZ Preset Chips for Selected Coast */}
        <div>
          <span className="text-xs text-slate-400 font-semibold block mb-2">
            Target Fishing Zones on {currentSector.name}:
          </span>
          <div className="flex flex-wrap gap-2">
            {displayZones.map((z) => (
              <button
                key={z.id}
                onClick={() => handleSearch(z.name)}
                className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-semibold flex items-center gap-2 ${
                  destination.toLowerCase().includes(z.name.toLowerCase()) || destination === z.name
                    ? 'bg-teal-500/20 text-teal-300 border-teal-400 shadow-md ring-1 ring-teal-400/50'
                    : 'bg-navy-800/40 text-slate-300 border-navy-700/40 hover:bg-navy-700/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color || '#10b981' }} />
                <span>{z.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                  {z.suitabilityScore}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Interactive Leaflet Navigation Map (Filtered for Selected Coast) */}
      {hasSearched && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-teal-500/30 bg-card overflow-hidden shadow-2xl space-y-0">
          {/* Map Header HUD Bar */}
          <div className="p-4 bg-navy-900/90 border-b border-navy-700/60 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-white text-sm">Interactive Route Map — {currentSector.name}</span>
              <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                {activeRoute?.name || 'Route B Coastal Safe'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <span>Distance: <strong className="text-white">{activeRoute?.distance || 38} km</strong></span>
              <span>ETA: <strong className="text-white">{activeRoute?.eta || '1h 40m'}</strong></span>
              <span>Safety Rating: <strong className="text-emerald-400">{activeRoute?.safetyScore || 96}%</strong></span>
            </div>
          </div>

          {/* Interactive Leaflet Map Canvas */}
          <div className="w-full h-[520px] relative z-0">
            <WorldMap
              vessels={vesselData?.vessels || getMockVessels()}
              fishingZones={displayZones}
              mapActionPayload={mapActionPayload}
              selectedRegion={currentSector}
              activeLayers={new Set(['mosdac_overlay', 'winds', 'fishing', 'vessels'])}
            />
          </div>

          {/* Turn-by-turn Route Selection Tabs directly below map */}
          <div className="p-4 bg-navy-950/80 border-t border-navy-700/60 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {routes.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setSelectedRouteIndex(i)}
                className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between gap-1 ${
                  selectedRouteIndex === i
                    ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg'
                    : 'bg-navy-900/40 border-navy-700/40 text-slate-400 hover:border-navy-600/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] truncate">{r.name}</span>
                  {r.isRecommended && <span className="px-1.5 py-0.2 bg-teal-500 text-navy-950 text-[9px] font-extrabold rounded">REC</span>}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-300">{r.distance} km ({r.eta})</span>
                  <span className={`font-bold ${r.safetyScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{r.safetyScore}%</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Detailed Route Cards */}
      {hasSearched && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            {isOffline ? 'Offline Route Options (A* Pathfinder Computed)' : `Detailed Route Options for ${currentSector.name}`}
          </h3>
          {routes.map((route, i) => (
            <div
              key={route.id}
              onClick={() => setSelectedRouteIndex(i)}
              className={`cursor-pointer transition-transform ${selectedRouteIndex === i ? 'ring-2 ring-teal-400 rounded-2xl' : ''}`}
            >
              <RouteCard route={route} index={i} />
            </div>
          ))}
        </div>
      )}

      {/* Safety Engine Factors */}
      {hasSearched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-navy-600/20 bg-card p-5">
          <h4 className="text-sm font-semibold text-white mb-3">Deterministic Safety Engine Parameters ({currentSector.name})</h4>
          <div className="flex flex-wrap gap-2">
            {['Distance', 'Wind Speed & Dir', 'Wave Swell & Height', 'Ocean currents', 'Live AIS Vessels', 'Bathymetry Depth', 'IMBL Geofencing', 'Cyclone Alerts', 'PFZ Thermal Gradient', 'Fuel Efficiency'].map((p) => (
              <span key={p} className="text-xs px-2.5 py-1 rounded-lg bg-navy-700/30 text-slate-400 border border-navy-600/20">{p}</span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
