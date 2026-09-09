'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Fish, Info, MapPin, Thermometer, Droplets, Navigation, Anchor, BarChart3 } from 'lucide-react';
import { FishingZoneCard, DemoModeBanner, LocationBadge } from '@/components/cards';
import { getMockFishingZones } from '@/data/mock-data';
import { FishingZone } from '@/types/marine';
import { getSelectedLocation, marineApiUrl } from '@/lib/location-store';

const PARAMETERS = [
  'Sea Surface Temperature', 'Chlorophyll-a', 'Salinity', 'Ocean currents',
  'Water temperature at depth', 'Bathymetry', 'Depth', 'Historical fishing activity',
  'Fishing effort', 'Season', 'Distance from coast',
];

export default function FishingZonesPage() {
  const [zones, setZones] = useState<FishingZone[]>([]);

  const loadZones = useCallback(async () => {
    try {
      const res = await fetch(marineApiUrl(getSelectedLocation()));
      if (res.ok) {
        const live = await res.json();
        const baseZones = getMockFishingZones();
        if (live.ocean) {
          baseZones.forEach(z => {
            z.sst = +live.ocean.sst.toFixed(1);
            z.chlorophyll = +live.ocean.chlorophyll.toFixed(2);
          });
        }
        setZones(baseZones);
      } else {
        setZones(getMockFishingZones());
      }
    } catch {
      setZones(getMockFishingZones());
    }
  }, []);

  useEffect(() => { loadZones(); }, [loadZones]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Fish className="w-7 h-7 text-teal-400" />
            Fishing Zones
          </h1>
          <p className="text-sm text-slate-400 mt-1">AI-predicted fishing suitability based on environmental and historical indicators.</p>
        </div>
        <div className="flex items-center gap-3">
          <LocationBadge onLocationChange={loadZones} />
          <DemoModeBanner />
        </div>
      </motion.div>

      {/* Map with zones */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-navy-600/20 bg-card overflow-hidden">
        <div className="relative h-64 md:h-80 bg-navy-900 overflow-hidden">
          <div className="absolute inset-0 ocean-gradient-animated opacity-50" />
          <svg className="absolute inset-0 w-full h-full opacity-10">
            {Array.from({ length: 15 }).map((_, i) => (
              <React.Fragment key={i}>
                <line x1={`${i * 7}%`} y1="0" x2={`${i * 7}%`} y2="100%" stroke="#2dd4bf" strokeWidth="0.5" strokeDasharray="4,8" />
                <line x1="0" y1={`${i * 7}%`} x2="100%" y2={`${i * 7}%`} stroke="#2dd4bf" strokeWidth="0.5" strokeDasharray="4,8" />
              </React.Fragment>
            ))}
          </svg>
          {/* Zone overlays */}
          {zones.map((zone, i) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="absolute"
              style={{ left: `${20 + i * 25}%`, top: `${30 + i * 12}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center"
                style={{ borderColor: zone.color, backgroundColor: `${zone.color}10` }}>
                <div className="text-center">
                  <p className="text-xs font-bold text-white">{zone.name.split('—')[0].trim()}</p>
                  <p className="text-2xl font-black" style={{ color: zone.color }}>{zone.suitabilityScore}%</p>
                  <p className="text-[10px] text-slate-400">{zone.suitabilityScore >= 70 ? 'HIGH' : zone.suitabilityScore >= 50 ? 'MEDIUM' : 'LOW'}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {/* Legend */}
          <div className="absolute bottom-3 right-3 flex items-center gap-3 px-3 py-1.5 rounded-lg glass text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-1.5 rounded bg-emerald-500" /><span className="text-slate-400">High</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-1.5 rounded bg-amber-500" /><span className="text-slate-400">Medium</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-1.5 rounded bg-red-500" /><span className="text-slate-400">Low</span></div>
          </div>
        </div>
      </motion.div>

      {/* Zone Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {zones.map((zone, i) => (
          <FishingZoneCard key={zone.id} zone={zone} index={i} />
        ))}
      </div>

      {/* Factor breakdown */}
      {zones[0] && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-navy-600/20 bg-card p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            Zone A — Factor Breakdown
          </h3>
          <div className="space-y-3">
            {zones[0].factors.map((factor) => (
              <div key={factor.name} className="flex items-center gap-4">
                <span className="text-sm text-slate-400 w-40 shrink-0">{factor.name}</span>
                <div className="flex-1 h-2 bg-navy-700/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.score}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: factor.score >= 70 ? '#10b981' : factor.score >= 50 ? '#f59e0b' : '#ef4444' }}
                  />
                </div>
                <span className="text-sm font-semibold text-white w-16 text-right">{factor.score}%</span>
                <span className="text-xs text-slate-500 w-20 text-right">{factor.value} {factor.unit}</span>
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
