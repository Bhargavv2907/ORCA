'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle2, Navigation, ArrowRight, Shield } from 'lucide-react';
import { GeofenceResult } from '@/types/marine';

interface GeofenceAlertCardProps {
  geofence: GeofenceResult;
}

export function GeofenceAlertCard({ geofence }: GeofenceAlertCardProps) {
  const isInside = geofence.status === 'INSIDE';
  const isWarning = geofence.status === 'WARNING';

  const cardStyle = isInside
    ? 'border-red-500/50 bg-gradient-to-br from-navy-950 via-red-950/20 to-navy-950 glow-danger'
    : isWarning
    ? 'border-amber-500/40 bg-gradient-to-br from-navy-950 via-amber-950/20 to-navy-950 glow-warning'
    : 'border-emerald-500/30 bg-card';

  const badgeStyle = isInside
    ? 'bg-red-500/20 text-red-400 border-red-500/30'
    : isWarning
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

  const Icon = isInside ? ShieldAlert : isWarning ? AlertTriangle : CheckCircle2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl border p-4 space-y-3 transition-all ${cardStyle}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isInside
                ? 'bg-red-500/20 text-red-400'
                : isWarning
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-semibold">
              Maritime Geofence Safeguard
            </span>
            <h3 className="text-sm font-bold text-white">{geofence.nearestZone}</h3>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${badgeStyle}`}>
          {geofence.status === 'INSIDE' ? '⛔ RESTRICTED AREA' : geofence.status === 'WARNING' ? '⚠️ BOUNDARY ALERT' : '✓ CLEAR'}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-navy-900/60 border border-navy-700/30">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Zone Type</span>
          <span className="font-semibold text-teal-300">{geofence.zoneType}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-navy-900/60 border border-navy-700/30">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Boundary Distance</span>
          <span className={`font-semibold ${isInside ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
            {geofence.status === 'INSIDE' ? '0 km (Inside Zone)' : `${geofence.distanceKm} km`}
          </span>
        </div>
      </div>

      {/* Advisory Text */}
      <div
        className={`p-3 rounded-xl text-xs ${
          isInside
            ? 'bg-red-500/10 border border-red-500/20 text-red-200'
            : isWarning
            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200'
            : 'bg-navy-800/40 border border-navy-700/30 text-slate-300'
        }`}
      >
        <span className="font-semibold block mb-0.5">Navigational Advisory:</span>
        <p>{geofence.advisory}</p>
      </div>

      {/* Map Action Button */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Navigation className="w-3.5 h-3.5 text-teal-400" />
          <span>Boundary Source: <strong>IN-HO-IMBL Safeguard Layer</strong></span>
        </div>
        <a
          href="/map?action=show_geofence"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 font-semibold border border-teal-500/30 transition-all text-xs"
        >
          <span>View Map Action (show_geofence)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
