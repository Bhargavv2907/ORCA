'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, X, MapPin, Wind, Waves, Navigation, Thermometer,
  Fish, Ship, Route, Eye, Anchor, Globe, Radio, Shield, RefreshCw,
  Droplets, CheckCircle2, ChevronRight, Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMockVessels, getMockFishingZones, getMockRoutes } from '@/data/mock-data';
import { DemoModeBanner } from '@/components/cards';
import { Vessel, FishingZone, MarineConditions } from '@/types/marine';
import { MapAction } from '@/lib/agents/schemas';
import { INDIAN_COASTAL_SECTORS } from '@/components/world-map';
import { getSelectedLocation, marineApiUrl } from '@/lib/location-store';

// Dynamic Import for Leaflet World Map (SSR Disabled)
const WorldMap = dynamic(() => import('@/components/world-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[600px] bg-navy-950 flex flex-col items-center justify-center gap-3 text-teal-400">
      <RefreshCw className="w-8 h-8 animate-spin" />
      <p className="text-sm font-semibold tracking-wide">Loading Interactive World Satellite Map & Indian Coastlines...</p>
    </div>
  ),
});

// Region Presets including Global World Map & All 11 Indian Coastal Sectors
const REGIONS = [
  { id: 'world', name: '🌍 Global World Map', bounds: { minLat: -60, maxLat: 85, minLon: -180, maxLon: 180 }, zoom: 2.5, center: { lat: 20.0, lon: 10.0 } },
  { id: 'all_india', name: '🇮🇳 Pan-India All Coasts', bounds: { minLat: 6.0, maxLat: 36.0, minLon: 68.0, maxLon: 97.0 }, zoom: 5, center: { lat: 18.0, lon: 80.0 } },
  ...INDIAN_COASTAL_SECTORS.map((s) => ({
    id: s.id,
    name: s.name,
    bounds: s.bounds,
    zoom: 7.5,
    center: s.center,
    state: s.state,
    type: s.type,
    description: s.description,
  })),
];

const SATELLITE_MODES = [
  { id: 'esri_satellite', name: 'True Color Satellite', description: 'Esri World High-Res Satellite Imagery' },
  { id: 'dark_nautical', name: 'Dark Marine Radar', description: 'High-Contrast Nautical Radar Mode' },
  { id: 'mosdac_sst', name: 'MOSDAC INSAT-3D SST', description: 'ISRO Sea Surface Temperature Thermal Overlay' },
  { id: 'osm', name: 'OpenStreetMap Hydro', description: 'Street & Maritime Boundaries' },
];

const LAYERS = [
  { id: 'coastal_detect', label: 'India Coastline Detector (11 Sectors)', icon: Shield, color: 'text-emerald-400' },
  { id: 'fishing', label: 'Potential Fishing Zones (PFZ)', icon: Fish, color: 'text-teal-400' },
  { id: 'vessels', label: 'Live Vessel Positions (AIS)', icon: Ship, color: 'text-amber-400' },
  { id: 'winds', label: 'Scatterometer Wind Vectors', icon: Wind, color: 'text-blue-400' },
  { id: 'routes', label: 'Safe Navigation Routes', icon: Route, color: 'text-violet-400' },
];

export default function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [satelliteMode, setSatelliteMode] = useState('esri_satellite');
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(['coastal_detect', 'fishing', 'vessels', 'winds']));
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showCoastListPanel, setShowCoastListPanel] = useState(true);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [zones, setZones] = useState<FishingZone[]>([]);
  const [liveConditions, setLiveConditions] = useState<MarineConditions | null>(null);
  const [mapActionPayload, setMapActionPayload] = useState<MapAction | undefined>(undefined);

  useEffect(() => {
    setVessels(getMockVessels());
    setZones(getMockFishingZones());

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      if (action) {
        setMapActionPayload({
          mapAction: action as any,
          selectedZone: params.get('zone') || 'Zone A',
        });
      }
    }

    // Fetch initial live marine snapshot from ISRO MOSDAC & Open-Meteo
    fetch(marineApiUrl(getSelectedLocation()))
      .then((res) => res.json())
      .then((data) => setLiveConditions(data))
      .catch(() => null);
  }, []);

  const toggleLayer = (id: string) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="relative h-[calc(100vh-56px)] lg:h-screen overflow-hidden flex flex-col bg-navy-950">
      {/* Top Header Controls Bar */}
      <div className="z-20 bg-navy-950/95 backdrop-blur border-b border-navy-700/40 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs sm:text-sm">
            <Globe className="w-5 h-5 text-teal-400 animate-pulse" />
            <span className="hidden sm:inline">ISRO MOSDAC World Satellite & Coastline Map</span>
            <span className="sm:hidden">MOSDAC World Map</span>
          </div>
          <span className="text-slate-600 hidden md:inline">|</span>
          <DemoModeBanner />
        </div>

        {/* Region & Presets Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRegion(r)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                selectedRegion.id === r.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-md'
                  : 'bg-navy-800/40 text-slate-400 border border-navy-700/30 hover:text-white'
              )}
            >
              <span>{r.name}</span>
            </button>
          ))}
        </div>

        {/* Satellite Mode & Overlay Controls */}
        <div className="flex items-center gap-2">
          <select
            value={satelliteMode}
            onChange={(e) => setSatelliteMode(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-navy-800 border border-navy-600/50 text-xs font-semibold text-teal-300 outline-none cursor-pointer"
          >
            {SATELLITE_MODES.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCoastListPanel(!showCoastListPanel)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
              showCoastListPanel
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-navy-800/60 text-slate-300 border-navy-600/40 hover:text-white'
            )}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Coasts (11)</span>
          </button>

          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800/60 border border-navy-600/40 text-xs font-semibold text-white hover:bg-navy-700 transition-colors"
          >
            <Layers className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">Layers</span>
          </button>
        </div>
      </div>

      {/* AI-Controlled Map Actions Bar (Phase 6) */}
      <div className="z-10 bg-navy-900/90 border-b border-navy-700/30 px-3 py-1.5 flex items-center gap-2 overflow-x-auto text-xs font-semibold scrollbar-none">
        <span className="text-teal-400 font-mono text-[11px] shrink-0 uppercase tracking-wider">AI Map Actions:</span>
        <button
          onClick={() => setMapActionPayload({ mapAction: 'highlight_pfz', selectedZone: 'Zone A' })}
          className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0 transition-colors"
        >
          🎯 Highlight PFZ (Zone A)
        </button>
        <button
          onClick={() => setMapActionPayload({ mapAction: 'draw_route', selectedZone: 'Zone A' })}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 transition-colors"
        >
          ✨ Draw Safe Route
        </button>
        <button
          onClick={() => setMapActionPayload({ mapAction: 'show_geofence' })}
          className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 shrink-0 transition-colors"
        >
          ⚠️ Show Geofence (IMBL)
        </button>
        <button
          onClick={() => setMapActionPayload({ mapAction: 'compare_routes' })}
          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 transition-colors"
        >
          ⚖️ Compare Routes (Shortest vs Safest)
        </button>
      </div>

      {/* Main Interactive World Map Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <WorldMap
          vessels={vessels}
          fishingZones={zones}
          satelliteMode={satelliteMode}
          activeLayers={activeLayers}
          highlightCoasts={activeLayers.has('coastal_detect')}
          mapActionPayload={mapActionPayload}
          selectedRegion={selectedRegion}
          onPointClick={(lat, lon, data) => {
            if (data) setLiveConditions(data);
          }}
        />
      </div>

      {/* Indian Coastline Detector Drawer (Shows all 11 detected sectors) */}
      <AnimatePresence>
        {showCoastListPanel && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="absolute top-16 left-4 z-30 w-80 max-h-[calc(100vh-140px)] flex flex-col rounded-2xl glass border border-emerald-500/30 p-4 shadow-2xl bg-navy-950/95"
          >
            <div className="flex items-center justify-between mb-3 border-b border-navy-700/40 pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                  Indian Coastline Detector
                </h3>
              </div>
              <button onClick={() => setShowCoastListPanel(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>11 / 11 Coastal Sectors Active</span>
              </div>
              <span className="text-[10px] text-teal-300 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20">
                7,516 km
              </span>
            </div>

            {/* List of all 11 Indian Coastal Sectors */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-navy-700">
              {INDIAN_COASTAL_SECTORS.map((sector, i) => (
                <div
                  key={sector.id}
                  onClick={() => setSelectedRegion({
                    id: sector.id,
                    name: sector.name,
                    bounds: sector.bounds,
                    zoom: 7.5,
                    center: sector.center,
                  })}
                  className={cn(
                    'p-2.5 rounded-xl border transition-all cursor-pointer group',
                    selectedRegion.id === sector.id
                      ? 'bg-teal-500/15 border-teal-500/50 text-white shadow-md'
                      : 'bg-navy-900/60 border-navy-700/30 text-slate-300 hover:border-teal-500/30 hover:bg-navy-800/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <MapPin className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
                      <span>{sector.name}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-navy-800 text-teal-300 font-medium">
                      {sector.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mb-1.5">{sector.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{sector.state}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRegion({
                          id: sector.id,
                          name: sector.name,
                          bounds: sector.bounds,
                          zoom: 7.5,
                          center: sector.center,
                        });
                      }}
                      className="text-teal-300 hover:text-white px-2 py-0.5 rounded bg-teal-500/20 hover:bg-teal-500/40 border border-teal-500/30 transition-all flex items-center gap-1 font-sans font-semibold text-[10px]"
                    >
                      <Eye className="w-3 h-3" />
                      Inspect Live <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer Control Panel */}
      <AnimatePresence>
        {showLayerPanel && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-16 right-4 z-30 w-72 rounded-2xl glass border border-navy-600/40 p-4 shadow-2xl bg-navy-950/95"
          >
            <div className="flex items-center justify-between mb-3 border-b border-navy-700/40 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                World Map Satellite Layers
              </h3>
              <button onClick={() => setShowLayerPanel(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              {LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                    activeLayers.has(layer.id)
                      ? 'bg-teal-500/10 text-white border border-teal-500/30'
                      : 'text-slate-400 hover:bg-navy-800/40'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <layer.icon className={cn('w-4 h-4', layer.color)} />
                    <span>{layer.label}</span>
                  </div>
                  <div
                    className={cn(
                      'w-7 h-4 rounded-full transition-colors relative',
                      activeLayers.has(layer.id) ? 'bg-teal-500' : 'bg-navy-700'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all',
                        activeLayers.has(layer.id) ? 'left-3.5' : 'left-0.5'
                      )}
                    />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Bar */}
      <div className="z-20 bg-navy-950/95 border-t border-navy-700/40 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Fishing Vessel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Commercial Cargo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span>Indian Coast Detector (11 Sectors)</span>
          </div>
        </div>
        <div className="font-mono text-slate-400 flex items-center gap-2">
          <span>Source: <strong className="text-teal-300 font-semibold">ISRO MOSDAC Satellite & Esri World Imagery</strong></span>
          <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">REAL-TIME</span>
        </div>
      </div>
    </div>
  );
}
