'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Fish, Info, MapPin, Thermometer, Droplets, Navigation, Anchor, BarChart3, RefreshCw, Compass, Shield, Radio, ArrowUpRight } from 'lucide-react';
import { FishingZoneCard, DemoModeBanner, LocationBadge } from '@/components/cards';
import { FishingZone, FishingFactor } from '@/types/marine';
import { getSelectedLocation } from '@/lib/location-store';
import { generateRealTimeFishingZones } from '@/services/marine/pfz';
import { MapAction } from '@/lib/agents/schemas';

// Dynamic Import for Leaflet World Map (SSR Disabled)
const WorldMap = dynamic(() => import('@/components/world-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-navy-950 flex flex-col items-center justify-center gap-3 text-teal-400 rounded-2xl border border-navy-700/50">
      <RefreshCw className="w-8 h-8 animate-spin" />
      <p className="text-sm font-semibold tracking-wide">Loading Interactive Ocean Satellite Map & PFZ Coordinates...</p>
    </div>
  ),
});

const PARAMETERS = [
  'Sea Surface Temperature', 'Chlorophyll-a', 'Salinity', 'Ocean currents',
  'Water temperature at depth', 'Bathymetry', 'Depth', 'Historical fishing activity',
  'Fishing effort', 'Season', 'Distance from coast',
];

export default function FishingZonesPage() {
  const [zones, setZones] = useState<FishingZone[]>([]);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number>(0);
  const [satelliteSource, setSatelliteSource] = useState<string>('ISRO MOSDAC + Open-Meteo Satellite Data');
  const [dataStatus, setDataStatus] = useState<string>('LIVE');
  const [mapActionPayload, setMapActionPayload] = useState<MapAction | undefined>(undefined);

  const currentLocation = getSelectedLocation();

  const loadZones = useCallback(async () => {
    const loc = getSelectedLocation();
    try {
      const res = await fetch(`/api/fishing-zones?lat=${loc.lat}&lon=${loc.lon}&name=${encodeURIComponent(loc.name)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.zones && data.zones.length > 0) {
          setZones(data.zones);
          if (data.conditions?.source) setSatelliteSource(data.conditions.source);
          if (data.conditions?.dataStatus) setDataStatus(data.conditions.dataStatus);
          return;
        }
      }
      setZones(generateRealTimeFishingZones(loc.lat, loc.lon, undefined, loc.name));
    } catch {
      setZones(generateRealTimeFishingZones(loc.lat, loc.lon, undefined, loc.name));
    }
  }, []);

  useEffect(() => { loadZones(); }, [loadZones]);

  const activeZone = zones[selectedZoneIndex] || zones[0];

  const handleSelectZone = (index: number) => {
    setSelectedZoneIndex(index);
    const z = zones[index];
    if (z) {
      setMapActionPayload({
        mapAction: 'highlight_pfz',
        selectedZone: z.name,
        layers: ['pfz_zones', 'vessels'],
        markers: [{ lat: z.center.lat, lon: z.center.lon, label: z.name, type: 'pfz' }],
      });
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Fish className="w-7 h-7 text-teal-400" />
            Potential Fishing Zones (5 Active PFZs)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time satellite ocean telemetry (ISRO MOSDAC INSAT-3D & EOS-06 OCM) mapped for <strong className="text-teal-300 font-semibold">{currentLocation.name}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LocationBadge onLocationChange={loadZones} />
          <DemoModeBanner />
        </div>
      </motion.div>

      {/* Interactive Satellite Leaflet Map with 5 PFZ Circles & Telemetry Overlay */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-teal-500/30 bg-card overflow-hidden shadow-2xl space-y-0">
        {/* Map Control & Live Source Banner */}
        <div className="p-4 bg-navy-900/90 border-b border-navy-700/60 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="font-bold text-white text-sm">Interactive Satellite Ocean Map ({currentLocation.name})</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
              {dataStatus} STREAM
            </span>
          </div>
          <div className="font-mono text-slate-300 flex items-center gap-2 text-[11px]">
            <span>Source: <strong className="text-teal-300 font-semibold">{satelliteSource}</strong></span>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="w-full h-[460px] relative z-0">
          <WorldMap
            fishingZones={zones}
            satelliteMode="esri_satellite"
            activeLayers={new Set(['mosdac_overlay', 'winds', 'fishing', 'vessels'])}
            selectedRegion={{
              id: 'active_sector',
              name: currentLocation.name,
              center: { lat: currentLocation.lat, lon: currentLocation.lon },
              zoom: 8.5,
            }}
            mapActionPayload={mapActionPayload}
          />

          {/* Floating Live Telemetry HUD Overlay */}
          {activeZone && (
            <div className="absolute top-4 left-4 z-[300] w-72 md:w-80 p-4 rounded-2xl bg-navy-950/85 backdrop-blur-md border border-teal-500/40 shadow-2xl space-y-2.5 text-xs text-white">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-300 flex items-center gap-1.5 text-xs truncate">
                  <Compass className="w-4 h-4 text-teal-400" />
                  {activeZone.name.split('—')[0].trim()} Target
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  {activeZone.suitabilityScore}% MATCH
                </span>
              </div>

              <div className="text-[11px] text-slate-300 font-mono">
                CENTER: {activeZone.center.lat}° N, {activeZone.center.lon}° E | {activeZone.distanceFromCoast} km offshore
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-navy-900/60 border border-navy-700/40">
                  <span className="text-slate-400 block font-mono">🌡️ INSAT-3D SST</span>
                  <strong className="text-amber-400 text-xs">{activeZone.sst} °C</strong>
                </div>
                <div className="p-2 rounded-lg bg-navy-900/60 border border-navy-700/40">
                  <span className="text-slate-400 block font-mono">🧪 Chlorophyll-a</span>
                  <strong className="text-emerald-400 text-xs">{activeZone.chlorophyll} mg/m³</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={`/routes?dest=${encodeURIComponent(activeZone.name)}`}
                  className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 font-bold text-[11px] flex items-center justify-center gap-1 hover:shadow-lg transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Plot Safe Route to {activeZone.name.split('—')[0].trim()}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Zone Selector Strip below map */}
        <div className="p-3 bg-navy-950/90 border-t border-navy-700/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs text-teal-400 font-mono font-bold shrink-0 uppercase tracking-wider px-2">
            Focus PFZ Zone:
          </span>
          {zones.map((z: FishingZone, idx: number) => (
            <button
              key={z.id}
              onClick={() => handleSelectZone(idx)}
              className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 flex items-center gap-2 ${
                selectedZoneIndex === idx
                  ? 'bg-teal-500/25 border-teal-400 text-white shadow-md'
                  : 'bg-navy-900/50 border-navy-700/40 text-slate-300 hover:bg-navy-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: z.color || '#10b981' }} />
              <span>{z.name.split('—')[0].trim()}</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                {z.suitabilityScore}%
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Zone Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {zones.map((zone: FishingZone, i: number) => (
          <div key={zone.id} onClick={() => setSelectedZoneIndex(i)} className="cursor-pointer">
            <FishingZoneCard zone={zone} index={i} />
          </div>
        ))}
      </div>

      {/* Factor breakdown with dynamic zone selector */}
      {activeZone && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-navy-600/20 bg-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-navy-700/40 pb-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-400" />
              {activeZone.name} — Satellite Factor Breakdown
            </h3>
            {/* Zone Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
              {zones.map((z: FishingZone, idx: number) => (
                <button
                  key={z.id}
                  onClick={() => setSelectedZoneIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedZoneIndex === idx
                      ? 'bg-teal-500 text-navy-950 shadow-md shadow-teal-500/20'
                      : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
                  }`}
                >
                  {z.name.split('—')[0].trim()} ({z.suitabilityScore}%)
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {activeZone.factors.map((factor: FishingFactor) => (
              <div key={factor.name} className="flex items-center gap-4">
                <span className="text-sm text-slate-300 w-44 shrink-0 font-medium">{factor.name}</span>
                <div className="flex-1 h-2 bg-navy-700/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.score}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: factor.score >= 70 ? '#10b981' : factor.score >= 50 ? '#f59e0b' : '#ef4444' }}
                  />
                </div>
                <span className="text-sm font-semibold text-white w-14 text-right font-mono">{factor.score}%</span>
                <span className="text-xs text-slate-400 w-24 text-right font-mono">{factor.value} {factor.unit}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Disclaimer & Parameters */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-400 mb-2">Prototype Prediction</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Fishing suitability is an AI-generated probability based on environmental and historical indicators. It does not guarantee fish presence. Always combine this data with local knowledge and current conditions.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="rounded-2xl border border-navy-600/20 bg-card p-5">
          <h4 className="text-sm font-semibold text-white mb-3">Parameters Considered</h4>
          <div className="flex flex-wrap gap-2">
            {PARAMETERS.map((p) => (
              <span key={p} className="text-xs px-2.5 py-1 rounded-lg bg-navy-700/30 text-slate-400 border border-navy-600/20">{p}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
