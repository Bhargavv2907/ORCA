'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, AlertTriangle, ShieldAlert, X, Volume2, ArrowRight, Eye } from 'lucide-react';
import { getMarineConditions } from '@/services/marine/unified';
import { checkGeofenceProximity } from '@/lib/geofence-engine';
import {
  ProactiveAlert,
  evaluateProactiveAlerts,
  deduplicateAlerts,
  acknowledgeAlert,
} from '@/lib/alert-engine';
import { speakVernacularAdvisory } from '@/lib/i18n-engine';

export function ProactiveAlertBanner() {
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const conditions = await getMarineConditions(18.95, 72.82);
        const geo = checkGeofenceProximity({ lat: 18.95, lon: 72.82 });
        const rawAlerts = evaluateProactiveAlerts(conditions, geo);
        const filtered = deduplicateAlerts(rawAlerts);
        setAlerts(filtered);
      } catch {
        // Fallback or quiet fail if offline
      }
    }

    loadAlerts();
    const interval = setInterval(loadAlerts, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (alerts.length === 0) return null;

  const currentAlert = alerts[activeIdx] || alerts[0];
  const isCritical = currentAlert.severity === 'CRITICAL';
  const isHigh = currentAlert.severity === 'HIGH';

  const bannerStyle = isCritical
    ? 'bg-gradient-to-r from-red-950 via-red-900 to-navy-950 border-red-500/50 glow-danger'
    : isHigh
    ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-navy-950 border-amber-500/40 glow-warning'
    : 'bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 border-teal-500/30';

  const Icon = isCritical ? ShieldAlert : isHigh ? AlertOctagon : AlertTriangle;

  const handleDismiss = (hash: string) => {
    acknowledgeAlert(hash);
    setAlerts(prev => prev.filter(a => a.hash !== hash));
    if (activeIdx > 0) setActiveIdx(0);
  };

  const handleSpeak = () => {
    speakVernacularAdvisory(currentAlert.description, 'English');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className={`w-full border-b p-3 shadow-xl ${bannerStyle}`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isCritical
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : isHigh
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-teal-500/20 text-teal-400'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs truncate">{currentAlert.title}</span>
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isCritical
                      ? 'bg-red-500/30 text-red-300'
                      : isHigh
                      ? 'bg-amber-500/30 text-amber-300'
                      : 'bg-teal-500/30 text-teal-300'
                  }`}
                >
                  {currentAlert.severity}
                </span>
                {alerts.length > 1 && (
                  <span className="text-[10px] text-slate-400">
                    ({activeIdx + 1}/{alerts.length})
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-[11px] truncate">{currentAlert.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSpeak}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="Listen Alert Speech"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            <a
              href="/map?action=show_geofence"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-semibold text-[11px] border border-teal-500/30 transition-colors"
            >
              <span>View Map</span>
              <ArrowRight className="w-3 h-3" />
            </a>

            <button
              onClick={() => handleDismiss(currentAlert.hash)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
