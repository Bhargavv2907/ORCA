'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Route, MapPin, Navigation, Search, WifiOff, Wifi, Ship, ExternalLink } from 'lucide-react';
import { RouteCard, DemoModeBanner } from '@/components/cards';
import { getMockRoutes } from '@/data/mock-data';
import { RouteOption, Coordinates } from '@/types/marine';
import { generateOfflineRoutes } from '@/lib/offline-routing';

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
};

function getCoordsForInput(input: string, fallback: Coordinates): Coordinates {
  const normalized = input.trim().toLowerCase();
  return OFFLINE_LOCATIONS[normalized] || fallback;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [start, setStart] = useState('Mumbai Coast');
  const [destination, setDestination] = useState('Fishing Zone A');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Set initial online/offline status
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial search
    setRoutes(getMockRoutes());
    setHasSearched(true);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(false);
    await new Promise(r => setTimeout(r, 1200));

    if (isOffline) {
      const startCoord = getCoordsForInput(start, { lat: 18.95, lon: 72.82 });
      const endCoord = getCoordsForInput(destination, { lat: 18.62, lon: 72.15 });
      const offlineRoutes = generateOfflineRoutes(startCoord, endCoord);
      setRoutes(offlineRoutes);
    } else {
      setRoutes(getMockRoutes());
    }
    
    setIsSearching(false);
    setHasSearched(true);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Route className="w-7 h-7 text-teal-400" />
            Safe Route Planner
          </h1>
          <p className="text-sm text-slate-400 mt-1">Plan the safest and most efficient route with live MarineTraffic AIS shipping data.</p>
        </div>
        <div className="flex items-center gap-3">
          {isOffline ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
              <WifiOff className="w-3.5 h-3.5" />
              OFFLINE MODE
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Wifi className="w-3.5 h-3.5" />
              ONLINE (MarineTraffic AIS Live)
            </div>
          )}
          <DemoModeBanner />
        </div>
      </motion.div>

      {/* MarineTraffic AIS Live Data Banner */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              MarineTraffic AIS Route & Shipping Lane Integration
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-medium">AIS Live</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Routes are calculated by synthesizing INCOIS wave forecasts with live MarineTraffic AIS vessel tracking & shipping lane corridors.
            </p>
          </div>
        </div>
        <a
          href="https://www.marinetraffic.com/en/ais/home/centerx:-12.0/centery:25.0/zoom:4"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all whitespace-nowrap"
        >
          Open MarineTraffic AIS Map
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
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

      {/* Route Input */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-navy-600/20 bg-card p-6">
        <div className="grid md:grid-cols-[1fr,auto,1fr,auto] items-end gap-4">
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
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Destination</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-navy-800/50 border border-navy-700/30 focus-within:border-teal-500/40 transition-colors">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <input value={destination} onChange={e => setDestination(e.target.value)} className="bg-transparent text-white text-sm outline-none flex-1" placeholder="Enter destination" />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50"
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Find Safe Route
          </button>
        </div>
        {isOffline && (
          <p className="text-[10px] text-slate-500 mt-2">
            Try typing: &quot;Mumbai Coast&quot;, &quot;Zone A&quot;, &quot;Vasai&quot;, or &quot;Alibag&quot; to test offline location coordinates.
          </p>
        )}
      </motion.div>

      {/* Route Map Visualization */}
      {hasSearched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-navy-600/20 bg-card overflow-hidden">
          <div className="relative h-52 md:h-64 bg-navy-900 overflow-hidden">
            <div className="absolute inset-0 ocean-gradient-animated opacity-40" />
            <svg className="absolute inset-0 w-full h-full opacity-10">
              {Array.from({ length: 15 }).map((_, i) => (
                <React.Fragment key={i}>
                  <line x1={`${i * 7}%`} y1="0" x2={`${i * 7}%`} y2="100%" stroke="#2dd4bf" strokeWidth="0.5" strokeDasharray="4,8" />
                </React.Fragment>
              ))}
            </svg>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
              {/* Route C - Offshore */}
              <motion.path d="M85,10 Q60,25 20,40" fill="none" stroke="#ef4444" strokeWidth="0.3" strokeDasharray="2,2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.3 }} />
              {/* Route A - Direct */}
              <motion.path d="M85,10 Q65,20 45,30 Q30,37 20,40" fill="none" stroke="#f59e0b" strokeWidth="0.3" strokeDasharray="1,1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.6 }} />
              {/* Route B - Recommended */}
              <motion.path d="M85,10 Q80,15 70,20 Q60,28 50,33 Q40,38 30,40 Q25,41 20,40" fill="none" stroke="#2dd4bf" strokeWidth="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.9 }} />
              {/* Start */}
              <circle cx="85" cy="10" r="1.5" fill="#2dd4bf" />
              <text x="85" y="7" fill="#94a3b8" fontSize="2.5" textAnchor="middle">Start</text>
              {/* End */}
              <circle cx="20" cy="40" r="1.5" fill="#10b981" />
              <text x="20" y="45" fill="#94a3b8" fontSize="2.5" textAnchor="middle">Destination</text>
              {/* Route labels */}
              <text x="68" y="17" fill="#2dd4bf" fontSize="2" fontWeight="bold">B (Rec.)</text>
              <text x="55" y="22" fill="#f59e0b" fontSize="1.8">A</text>
              <text x="50" y="30" fill="#ef4444" fontSize="1.8">C</text>
            </svg>
          </div>
        </motion.div>
      )}

      {/* Route Cards */}
      {hasSearched && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            {isOffline ? 'Offline Route Options (A* Computed)' : 'Route Options'}
          </h3>
          {routes.map((route, i) => (
            <RouteCard key={route.id} route={route} index={i} />
          ))}
        </div>
      )}

      {/* Scoring factors */}
      {hasSearched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-navy-600/20 bg-card p-5">
          <h4 className="text-sm font-semibold text-white mb-3">Route Safety Scoring Considers</h4>
          <div className="flex flex-wrap gap-2">
            {['Distance', 'Wind', 'Waves', 'Ocean currents', 'Vessel traffic', 'Water depth', 'Restricted areas', 'Storms', 'Fishing activity', 'Fuel efficiency'].map((p) => (
              <span key={p} className="text-xs px-2.5 py-1 rounded-lg bg-navy-700/30 text-slate-400 border border-navy-600/20">{p}</span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
