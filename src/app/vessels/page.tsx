'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ship, Anchor, Navigation, Clock, MapPin, Radio, Globe, Layers, RefreshCw, AlertTriangle } from 'lucide-react';
import { DemoModeBanner } from '@/components/cards';
import { getMockVessels } from '@/data/mock-data';
import { Vessel } from '@/types/marine';
import { cn } from '@/lib/utils';
import { INDIAN_COASTAL_SECTORS } from '@/components/world-map';

export default function VesselsPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedSectorId, setSelectedSectorId] = useState('pan_india');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aisMetaData, setAisMetaData] = useState<{
    source: string;
    totalVessels: number;
    trafficDensity: string;
    shippingLaneStatus: string;
  } | null>(null);

  const currentSector = INDIAN_COASTAL_SECTORS.find(s => s.id === selectedSectorId) || {
    id: 'pan_india',
    name: 'Pan-India All 11 Coasts',
    center: { lat: 18.0, lon: 80.0 },
    description: 'Whole Pan-India coastline vessel tracking across all 11 sectors',
  };

  const loadVessels = (sectorId: string) => {
    setIsLoading(true);
    const sector = INDIAN_COASTAL_SECTORS.find(s => s.id === sectorId) || currentSector;
    const url = sectorId === 'pan_india'
      ? `/api/vessels?lat=18.0&lon=80.0&radius=1000`
      : `/api/vessels?lat=${sector.center.lat}&lon=${sector.center.lon}`;

    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setVessels(json.data.vessels || []);
          setAisMetaData({
            source: json.data.source || 'Digitraffic Marine Open AIS API & GFW Stream',
            totalVessels: json.data.totalVessels || json.data.vessels.length,
            trafficDensity: json.data.trafficDensity || 'EXTREME',
            shippingLaneStatus: json.data.shippingLaneStatus || 'CONGESTED',
          });
        } else {
          setVessels(getMockVessels());
        }
      })
      .catch(() => {
        setVessels(getMockVessels());
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadVessels(selectedSectorId);
  }, []);

  const handleSectorChange = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    loadVessels(sectorId);
  };

  const filteredVessels = filter === 'all' ? vessels : vessels.filter(v => v.type === filter);
  const counts = {
    all: vessels.length,
    fishing: vessels.filter(v => v.type === 'fishing').length,
    commercial: vessels.filter(v => v.type === 'commercial' || v.type === 'cargo').length,
    other: vessels.filter(v => v.type === 'passenger' || v.type === 'other').length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Ship className="w-7 h-7 text-cyan-400" />
            Live Vessel Traffic &amp; AIS Telemetry Stream
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time ship positions, commercial vessel congestion, and MMSI tracking powered by open marine APIs.
          </p>
        </div>
        <DemoModeBanner />
      </motion.div>

      {/* AIS Source Indicator Strip */}
      <div className="p-4 rounded-2xl bg-card border border-cyan-500/30 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                AIS Feed Source: <strong className="text-cyan-300">{aisMetaData?.source || 'Digitraffic Marine Open AIS API & GFW Stream'}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold border border-cyan-500/30">
                LIVE API ACTIVE
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Active Region: <strong className="text-white">{currentSector.name}</strong> (LAT {currentSector.center.lat}°N, LON {currentSector.center.lon}°E)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-navy-900/80 border border-navy-700/50">
            <span className="text-slate-400 block text-[10px]">Density</span>
            <span className="text-cyan-400 font-bold text-xs">{aisMetaData?.trafficDensity || 'HIGH'}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-navy-900/80 border border-navy-700/50">
            <span className="text-slate-400 block text-[10px]">Lane Status</span>
            <span className="text-emerald-400 font-bold text-xs">{aisMetaData?.shippingLaneStatus || 'CLEAR'}</span>
          </div>
          <button
            onClick={() => loadVessels(selectedSectorId)}
            className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all"
            title="Refresh AIS Stream"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Select Indian Coastal Region Dropdown */}
      <div className="p-4 rounded-2xl bg-card border border-navy-600/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="font-bold text-white text-xs">Filter AIS Stream by Indian Maritime Region (All 11 Sectors):</span>
        </div>
        <select
          value={selectedSectorId}
          onChange={e => handleSectorChange(e.target.value)}
          className="bg-navy-900 border-2 border-teal-500/40 text-white font-bold rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer shadow-lg"
        >
          <option value="pan_india" className="bg-navy-900 text-teal-300 font-bold">
            🇮🇳 Pan-India Whole Coastline (All 11 Sectors — 38 Live Vessels)
          </option>
          {INDIAN_COASTAL_SECTORS.map((sector) => (
            <option key={sector.id} value={sector.id} className="bg-navy-900 text-white">
              🇮🇳 {sector.name.includes('(') ? sector.name : `${sector.name} (${sector.state})`} — {sector.type}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Vessels Tracked', value: counts.all, color: 'text-white', icon: Ship },
          { label: 'Fishing Craft', value: counts.fishing, color: 'text-emerald-400', icon: Anchor },
          { label: 'Commercial Cargo', value: counts.commercial, color: 'text-amber-400', icon: Navigation },
          { label: 'Other Craft', value: counts.other, color: 'text-blue-400', icon: Ship },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-navy-600/20 bg-card p-4 text-center"
          >
            <stat.icon className={cn('w-5 h-5 mx-auto mb-2', stat.color)} />
            <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'fishing', 'commercial', 'cargo', 'passenger', 'other'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap',
              filter === f ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm' : 'text-slate-400 hover:text-white border border-navy-700/40 bg-navy-900/30'
            )}
          >
            {f} ({f === 'all' ? counts.all : f === 'fishing' ? counts.fishing : f === 'commercial' ? counts.commercial : vessels.filter(v => v.type === f).length})
          </button>
        ))}
      </div>

      {/* Vessel Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVessels.map((vessel, i) => (
          <motion.div
            key={vessel.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedVessel(selectedVessel?.id === vessel.id ? null : vessel)}
            className={cn(
              'rounded-2xl border p-4 cursor-pointer transition-all space-y-2.5',
              selectedVessel?.id === vessel.id ? 'border-teal-500/60 bg-teal-500/10 shadow-lg' : 'border-navy-600/30 bg-card hover:border-navy-600/60'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn('w-3 h-3 rounded-full shrink-0',
                vessel.type === 'fishing' ? 'bg-emerald-400' :
                vessel.type === 'commercial' || vessel.type === 'cargo' ? 'bg-amber-400' : 'bg-blue-400'
              )} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{vessel.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono">MMSI: {vessel.id}</p>
              </div>
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0',
                vessel.activity === 'Fishing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                vessel.activity === 'Transit' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                vessel.activity === 'Anchored' || vessel.activity === 'Docked' ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              )}>
                {vessel.activity}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-navy-700/40">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Ship className="w-3.5 h-3.5 text-cyan-400" />
                <span className="capitalize">{vessel.type}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>{vessel.speed} kn / {vessel.heading}°</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>{vessel.position.lat.toFixed(2)}°N, {vessel.position.lon.toFixed(2)}°E</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(vessel.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
