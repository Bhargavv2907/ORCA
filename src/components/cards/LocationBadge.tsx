'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSelectedLocation, setSelectedLocation, DEFAULT_LOCATION } from '@/lib/location-store';
import { INDIAN_COASTAL_LOCATIONS, CoastalLocation } from '@/lib/orchestrator';
import { cn } from '@/lib/utils';

interface LocationBadgeProps {
  /** Called after user picks a new location so parent can re-fetch data */
  onLocationChange?: (loc: CoastalLocation) => void;
  className?: string;
}

export function LocationBadge({ onLocationChange, className }: LocationBadgeProps) {
  const [location, setLocation] = useState<CoastalLocation>(DEFAULT_LOCATION);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Sync initial location from localStorage on mount (prevents SSR hydration mismatch)
  useEffect(() => {
    setLocation(getSelectedLocation());
  }, []);

  // Sync when chatbot changes the location from another page
  useEffect(() => {
    const handler = (e: Event) => {
      const loc = (e as CustomEvent<CoastalLocation>).detail;
      setLocation(loc);
      onLocationChange?.(loc);
    };
    window.addEventListener('orca-location-changed', handler);
    return () => window.removeEventListener('orca-location-changed', handler);
  }, [onLocationChange]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = INDIAN_COASTAL_LOCATIONS.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.state.toLowerCase().includes(search.toLowerCase())
  );

  const pick = (loc: CoastalLocation) => {
    setLocation(loc);
    setSelectedLocation(loc);
    onLocationChange?.(loc);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800/60 hover:bg-navy-700/60 border border-navy-700/40 hover:border-teal-500/30 transition-all group"
      >
        <MapPin className="w-3.5 h-3.5 text-teal-400" />
        <span className="text-sm font-medium text-white" suppressHydrationWarning>{location.name}</span>
        <span className="text-xs text-slate-500" suppressHydrationWarning>{location.state}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 z-50 rounded-2xl border border-navy-700/40 bg-navy-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Search */}
            <div className="p-3 border-b border-navy-700/30">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-navy-800/60 border border-navy-700/30">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search city or state..."
                  className="bg-transparent text-sm text-white placeholder:text-slate-500 outline-none w-full"
                />
              </div>
            </div>

            {/* City list */}
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No cities found</p>
              ) : (
                filtered.map(loc => (
                  <button
                    key={loc.name}
                    onClick={() => pick(loc)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-2.5 hover:bg-teal-500/10 transition-colors text-left group',
                      location.name === loc.name && 'bg-teal-500/10'
                    )}
                  >
                    <div>
                      <p className={cn('text-sm font-medium', location.name === loc.name ? 'text-teal-300' : 'text-white group-hover:text-teal-200')}>
                        {loc.name}
                      </p>
                      <p className="text-xs text-slate-500">{loc.state}</p>
                    </div>
                    {location.name === loc.name && (
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="px-4 py-2 border-t border-navy-700/30">
              <p className="text-[10px] text-slate-600">All pages update when you select a city</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
