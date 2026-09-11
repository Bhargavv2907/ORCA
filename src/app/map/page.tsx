'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, X, MapPin, Wind, Waves, Navigation, Thermometer,
  Fish, Route, Eye, Anchor, Globe, Radio, Shield, RefreshCw,
  Droplets, CheckCircle2, ChevronRight, Compass, Ship, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMockFishingZones, getMockRoutes, getMockVessels } from '@/data/mock-data';
import { ALL_INDIAN_PORTS } from '@/data/indian-ports';
import { DemoModeBanner } from '@/components/cards';
import { FishingZone, MarineConditions, Vessel } from '@/types/marine';
import { MapAction } from '@/lib/agents/schemas';
import { INDIAN_COASTAL_SECTORS } from '@/components/world-map';
import { getSelectedLocation, marineApiUrl } from '@/lib/location-store';
import { generateRealTimeFishingZones, generatePanIndiaFishingZones } from '@/services/marine/pfz';

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

// Major Indian Port Presets with nearby Fishing Zones
const MAJOR_PORT_PRESETS = [
  { id: 'port-mumbai', name: '⚓ Mumbai Port (MH)', center: { lat: 18.9500, lon: 72.8350 }, zoom: 8.5 },
  { id: 'port-veraval', name: '⚓ Veraval Port (GJ)', center: { lat: 20.9000, lon: 70.3600 }, zoom: 8.5 },
  { id: 'port-cochin', name: '⚓ Cochin Port (KL)', center: { lat: 9.9680, lon: 76.2670 }, zoom: 8.5 },
  { id: 'port-paradip', name: '⚓ Paradip Port (OD)', center: { lat: 20.2660, lon: 86.6700 }, zoom: 8.5 },
  { id: 'port-chennai', name: '⚓ Chennai Port (TN)', center: { lat: 13.0900, lon: 80.2900 }, zoom: 8.5 },
  { id: 'port-visakhapatnam', name: '⚓ Visakhapatnam Port (AP)', center: { lat: 17.6940, lon: 83.2860 }, zoom: 8.5 },
  { id: 'port-mangalore', name: '⚓ New Mangalore Port (KA)', center: { lat: 12.9180, lon: 74.8090 }, zoom: 8.5 },
  { id: 'port-mormugao', name: '⚓ Mormugao Port (GA)', center: { lat: 15.4070, lon: 73.8000 }, zoom: 8.5 },
  { id: 'port-kandla', name: '⚓ Kandla Port (GJ)', center: { lat: 23.0100, lon: 70.2100 }, zoom: 8.5 },
  { id: 'port-portblair', name: '⚓ Port Blair (AN)', center: { lat: 11.6800, lon: 92.7460 }, zoom: 8.5 },
];

// Region Presets for Major Ports, Indian Coastal Sectors & Pan-India
const REGIONS = [
  { id: 'all_india', name: '🇮🇳 Pan-India All Coasts', bounds: { minLat: 6.0, maxLat: 36.0, minLon: 68.0, maxLon: 97.0 }, zoom: 5, center: { lat: 18.0, lon: 80.0 } },
  ...MAJOR_PORT_PRESETS,
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
  { id: 'vessels', label: 'Live AIS Vessels & MMSI Stream', icon: Ship, color: 'text-cyan-400' },
  { id: 'ports', label: 'Indian Major & Minor Ports (70+ Ports)', icon: Anchor, color: 'text-amber-400' },
  { id: 'coastal_detect', label: 'India Coastline Detector (11 Sectors)', icon: Shield, color: 'text-emerald-400' },
  { id: 'fishing', label: 'Potential Fishing Zones (PFZ)', icon: Fish, color: 'text-teal-400' },
  { id: 'winds', label: 'Scatterometer Wind Vectors', icon: Wind, color: 'text-blue-400' },
];

export default function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [satelliteMode, setSatelliteMode] = useState('esri_satellite');
  const [selectedPortId, setSelectedPortId] = useState<string>('');
  const [selectedCoastId, setSelectedCoastId] = useState<string>('all_india');
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(['vessels', 'ports', 'coastal_detect', 'fishing', 'winds']));
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showCoastListPanel, setShowCoastListPanel] = useState(false);
  const [showPortListPanel, setShowPortListPanel] = useState(true);
  const [portSearchQuery, setPortSearchQuery] = useState('');

  const [zones, setZones] = useState<FishingZone[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [liveConditions, setLiveConditions] = useState<MarineConditions | null>(null);
  const [mapActionPayload, setMapActionPayload] = useState<MapAction | undefined>(undefined);

  const handlePointClick = useCallback((_lat: number, _lon: number, data: MarineConditions | null) => {
    if (data) setLiveConditions(data);
  }, []);

  useEffect(() => {
    // Real-time fishing zones generation
    if (selectedRegion.id === 'all_india') {
      setZones(generatePanIndiaFishingZones(liveConditions || undefined));
    } else {
      const center = selectedRegion.center || getSelectedLocation();
      setZones(generateRealTimeFishingZones(center.lat, center.lon, liveConditions || undefined, selectedRegion.name));
    }

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

    // Fetch initial live marine snapshot & real-time fishing zones
    const pfzApiUrl = selectedRegion.id === 'all_india'
      ? `/api/fishing-zones?region=all_india`
      : `/api/fishing-zones?lat=${selectedRegion.center?.lat || 18.95}&lon=${selectedRegion.center?.lon || 72.82}&name=${encodeURIComponent(selectedRegion.name)}`;

    fetch(pfzApiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.zones && data.zones.length > 0) setZones(data.zones);
      })
      .catch(() => null);

    // Fetch live vessel data from marine map API
    const center = selectedRegion.center || getSelectedLocation();
    fetch(`/api/vessels?lat=${center.lat}&lon=${center.lon}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.vessels) {
          setVessels(json.data.vessels);
        } else {
          setVessels(getMockVessels());
        }
      })
      .catch(() => setVessels(getMockVessels()));
  }, [selectedRegion, liveConditions]);

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
            <span className="hidden sm:inline">ISRO MOSDAC Coastal & Marine Map</span>
            <span className="sm:hidden">MOSDAC Coastal Map</span>
          </div>
          <span className="text-slate-600 hidden md:inline">|</span>
          <DemoModeBanner />
        </div>

        {/* Dropdown Section 1: Ports & Dropdown Section 2: Coastal Sectors */}
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          {/* Dropdown 1: Select Indian Port */}
          <div className="flex items-center gap-1.5 bg-navy-900/90 border border-amber-500/40 rounded-xl px-2.5 py-1.5 text-xs shadow-md">
            <Anchor className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={selectedPortId}
              onChange={(e) => {
                const portId = e.target.value;
                setSelectedPortId(portId);
                if (portId === 'all' || !portId) {
                  setSelectedRegion(REGIONS[0]);
                } else {
                  const port = ALL_INDIAN_PORTS.find((p) => p.id === portId);
                  if (port) {
                    setSelectedRegion({
                      id: `port-${port.id}`,
                      name: port.name,
                      center: { lat: port.lat, lon: port.lon },
                      zoom: 8.5,
                    });
                    setSelectedCoastId('');
                  }
                }
              }}
              className="bg-transparent text-amber-300 font-semibold outline-none cursor-pointer text-xs pr-1 max-w-[170px] sm:max-w-[210px] truncate"
            >
              <option value="" className="bg-navy-900 text-slate-400">⚓ Select Indian Port...</option>
              <optgroup label="Major Indian Ports" className="bg-navy-900 text-amber-400 font-bold">
                {ALL_INDIAN_PORTS.filter(p => p.type === 'major').map(port => (
                  <option key={port.id} value={port.id} className="bg-navy-900 text-slate-200 font-medium">
                    ⚓ {port.name.split('(')[0].trim()} ({port.state})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Deepwater & Private Ports" className="bg-navy-900 text-emerald-400 font-bold">
                {ALL_INDIAN_PORTS.filter(p => p.type === 'private' || p.type === 'deepwater').map(port => (
                  <option key={port.id} value={port.id} className="bg-navy-900 text-slate-200 font-medium">
                    ⚓ {port.name.split('(')[0].trim()} ({port.state})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Minor & Fishing Harbours" className="bg-navy-900 text-cyan-400 font-bold">
                {ALL_INDIAN_PORTS.filter(p => p.type === 'minor').map(port => (
                  <option key={port.id} value={port.id} className="bg-navy-900 text-slate-200 font-medium">
                    ⚓ {port.name.split('(')[0].trim()} ({port.state})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Dropdown 2: Select Coastal Sector */}
          <div className="flex items-center gap-1.5 bg-navy-900/90 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-xs shadow-md">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedCoastId}
              onChange={(e) => {
                const coastId = e.target.value;
                setSelectedCoastId(coastId);
                if (coastId === 'all_india') {
                  setSelectedRegion(REGIONS[0]);
                  setSelectedPortId('');
                } else {
                  const sector = INDIAN_COASTAL_SECTORS.find((s) => s.id === coastId);
                  if (sector) {
                    setSelectedRegion({
                      id: sector.id,
                      name: sector.name,
                      bounds: sector.bounds,
                      zoom: 7.5,
                      center: sector.center,
                    });
                    setSelectedPortId('');
                  }
                }
              }}
              className="bg-transparent text-emerald-300 font-semibold outline-none cursor-pointer text-xs pr-1 max-w-[170px] sm:max-w-[210px] truncate"
            >
              <option value="all_india" className="bg-navy-900 text-white font-bold">🇮🇳 Pan-India All Coasts</option>
              {INDIAN_COASTAL_SECTORS.map((sector) => (
                <option key={sector.id} value={sector.id} className="bg-navy-900 text-slate-200 font-medium">
                  🛡️ {sector.name} ({sector.type})
                </option>
              ))}
            </select>
          </div>
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
            onClick={() => {
              setShowPortListPanel(!showPortListPanel);
              if (!showPortListPanel) setShowCoastListPanel(false);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
              showPortListPanel
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-navy-800/60 text-slate-300 border-navy-600/40 hover:text-white'
            )}
          >
            <Anchor className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Ports & PFZs</span>
          </button>

          <button
            onClick={() => {
              setShowCoastListPanel(!showCoastListPanel);
              if (!showCoastListPanel) setShowPortListPanel(false);
            }}
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



      {/* Main Interactive World Map Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <WorldMap
          fishingZones={zones}
          vessels={vessels}
          satelliteMode={satelliteMode}
          activeLayers={activeLayers}
          highlightCoasts={activeLayers.has('coastal_detect')}
          mapActionPayload={mapActionPayload}
          selectedRegion={selectedRegion}
          onPointClick={handlePointClick}
        />
      </div>

      {/* Port-Adjacent Fishing Zones Drawer (Shows fishing zones near Indian Ports) */}
      <AnimatePresence>
        {showPortListPanel && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="absolute top-16 left-4 z-30 w-84 sm:w-96 max-h-[calc(100vh-140px)] flex flex-col rounded-2xl glass border border-amber-500/40 p-4 shadow-2xl bg-navy-950/95"
          >
            <div className="flex items-center justify-between mb-3 border-b border-navy-700/40 pb-2">
              <div className="flex items-center gap-2">
                <Anchor className="w-4 h-4 text-amber-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                  Fishing Zones Near Ports
                </h3>
              </div>
              <button onClick={() => setShowPortListPanel(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Port Search Bar */}
            <div className="relative mb-3">
              <input
                type="text"
                value={portSearchQuery}
                onChange={(e) => setPortSearchQuery(e.target.value)}
                placeholder="Search port (e.g. Mumbai, Cochin, Paradip, Veraval...)"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {/* List of Ports with Nearby PFZ info */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-navy-700">
              {ALL_INDIAN_PORTS
                .filter(p =>
                  p.name.toLowerCase().includes(portSearchQuery.toLowerCase()) ||
                  p.state.toLowerCase().includes(portSearchQuery.toLowerCase()) ||
                  p.coast.toLowerCase().includes(portSearchQuery.toLowerCase())
                )
                .map((port) => {
                  const isSelected = selectedRegion.id === `port-${port.id}` || selectedRegion.name.includes(port.name.split(' ')[0]);
                  return (
                    <div
                      key={port.id}
                      onClick={() => {
                        setSelectedRegion({
                          id: `port-${port.id}`,
                          name: `${port.name}`,
                          bounds: undefined,
                          zoom: 8.5,
                          center: { lat: port.lat, lon: port.lon },
                        });
                      }}
                      className={cn(
                        'p-3 rounded-xl border transition-all cursor-pointer group',
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
                          : 'bg-navy-900/60 border-navy-700/30 text-slate-300 hover:border-amber-500/30 hover:bg-navy-800/50'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Anchor className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate">{port.name}</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono font-bold uppercase shrink-0">
                          {port.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-1.5">{port.state} ({port.coast}) • {port.cargoType || 'Commercial Cargo'}</p>

                      {/* Nearby PFZ Summary Tag */}
                      <div className="bg-navy-950/80 p-2 rounded-lg border border-teal-500/30 mb-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-teal-300 font-semibold">
                          <span className="flex items-center gap-1">
                            <Fish className="w-3 h-3 text-teal-400" />
                            Nearby PFZ Target
                          </span>
                          <span className="text-emerald-400 font-bold">High Match (92%)</span>
                        </div>
                        <p className="text-[10px] text-slate-300 truncate font-mono">
                          Zone A — {port.name.split(' ')[0]} Estuarine Plume (~15-18 km offshore)
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRegion({
                            id: `port-${port.id}`,
                            name: `${port.name}`,
                            bounds: undefined,
                            zoom: 8.5,
                            center: { lat: port.lat, lon: port.lon },
                          });
                        }}
                        className="w-full py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 border border-amber-500/30 text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Eye className="w-3 h-3 text-amber-300" />
                        <span>Fly to Port & Map Nearby PFZs</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span>Fishing Zones (PFZ)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
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
