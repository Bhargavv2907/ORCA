'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ship, Anchor, Navigation, Clock, MapPin } from 'lucide-react';
import { DemoModeBanner } from '@/components/cards';
import { getMockVessels } from '@/data/mock-data';
import { Vessel } from '@/types/marine';
import { cn } from '@/lib/utils';

export default function VesselsPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

  useEffect(() => {
    setVessels(getMockVessels());
  }, []);

  const filteredVessels = filter === 'all' ? vessels : vessels.filter(v => v.type === filter);
  const counts = {
    all: vessels.length,
    fishing: vessels.filter(v => v.type === 'fishing').length,
    commercial: vessels.filter(v => v.type === 'commercial' || v.type === 'cargo').length,
    other: vessels.filter(v => v.type === 'passenger' || v.type === 'other').length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Ship className="w-7 h-7 text-teal-400" />
            Vessel Activity
          </h1>
          <p className="text-sm text-slate-400 mt-1">Monitor vessel positions and maritime traffic in the region.</p>
        </div>
        <DemoModeBanner />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Vessels', value: counts.all, color: 'text-white', icon: Ship },
          { label: 'Fishing', value: counts.fishing, color: 'text-emerald-400', icon: Anchor },
          { label: 'Commercial', value: counts.commercial, color: 'text-amber-400', icon: Navigation },
          { label: 'Other', value: counts.other, color: 'text-blue-400', icon: Ship },
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

      {/* Filter */}
      <div className="flex items-center gap-2">
        {['all', 'fishing', 'commercial', 'cargo', 'passenger', 'other'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
              filter === f ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20' : 'text-slate-500 hover:text-white border border-transparent'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Vessel grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVessels.map((vessel, i) => (
          <motion.div
            key={vessel.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedVessel(selectedVessel?.id === vessel.id ? null : vessel)}
            className={cn(
              'rounded-2xl border p-4 cursor-pointer transition-all',
              selectedVessel?.id === vessel.id ? 'border-teal-500/40 bg-teal-500/5' : 'border-navy-600/20 bg-card hover:border-navy-600/40'
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('w-3 h-3 rounded-full',
                vessel.type === 'fishing' ? 'bg-emerald-400' :
                vessel.type === 'commercial' || vessel.type === 'cargo' ? 'bg-amber-400' : 'bg-blue-400'
              )} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{vessel.name}</h3>
                <p className="text-[10px] text-slate-500 font-mono">{vessel.id}</p>
              </div>
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase',
                vessel.activity === 'Fishing' ? 'bg-emerald-500/15 text-emerald-400' :
                vessel.activity === 'Transit' ? 'bg-blue-500/15 text-blue-400' :
                vessel.activity === 'Anchored' || vessel.activity === 'Docked' ? 'bg-slate-500/15 text-slate-400' : 'bg-amber-500/15 text-amber-400'
              )}>
                {vessel.activity}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Ship className="w-3 h-3" />
                <span className="capitalize">{vessel.type}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Navigation className="w-3 h-3" />
                <span>{vessel.speed} kn / {vessel.heading}°</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3 h-3" />
                <span>{vessel.position.lat.toFixed(2)}°N</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{new Date(vessel.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
