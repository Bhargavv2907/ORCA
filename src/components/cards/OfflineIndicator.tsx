'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, Database, Clock } from 'lucide-react';
import { getOfflineMarineData, getOfflineDataFreshnessLabel } from '@/lib/offline-storage';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [freshness, setFreshness] = useState<string>('');

  useEffect(() => {
    function updateOnlineStatus() {
      const offline = !navigator.onLine;
      setIsOffline(offline);
      if (offline) {
        const cache = getOfflineMarineData();
        if (cache) {
          setFreshness(getOfflineDataFreshnessLabel(cache.cachedAt));
        }
      }
    }

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);

      const cache = getOfflineMarineData();
      if (cache) {
        setFreshness(getOfflineDataFreshnessLabel(cache.cachedAt));
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      }
    };
  }, []);

  if (!isOffline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-bold">Offline Mode Active:</span>
            <span className="text-slate-300 hidden sm:inline">
              No cellular signal detected. Serving cached satellite & marine observations.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-[11px] text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{freshness || 'Offline Cache Active'}</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase text-[9px]">
              Offline Ready
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
