'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Anchor, Fish, Shield, Clock, Navigation, AlertTriangle, HelpCircle, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { EvidencePayload, MissionPlannerPayload } from '@/types/marine';
export type { MissionPlannerPayload };

interface MissionPlannerCardProps {
  mission: MissionPlannerPayload;
  onOpenWhy: () => void;
}

export function MissionPlannerCard({ mission, onOpenWhy }: MissionPlannerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-teal-500/40 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 p-5 space-y-4 shadow-2xl glow-teal"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-navy-700/40 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-navy-950 font-bold">
            <Anchor className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block font-bold">
              Flagship Mission Plan
            </span>
            <h2 className="text-base font-bold text-white">Fishing Voyage Plan — Mumbai Coast</h2>
          </div>
        </div>
        <button
          onClick={onOpenWhy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-xs font-semibold text-teal-300 border border-teal-500/30 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-teal-400" />
          <span>Why? (View Evidence)</span>
        </button>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Recommended Zone */}
        <div className="p-3 rounded-xl bg-card border border-navy-700/30 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Fish className="w-3.5 h-3.5 text-teal-400" />
            <span className="uppercase text-[10px] tracking-wider">Target Zone</span>
          </div>
          <p className="text-sm font-bold text-white">{mission.recommendedZone}</p>
          <p className="text-[10px] text-teal-400 font-semibold">{mission.suitabilityScore}% Suitability Match</p>
        </div>

        {/* Marine Safety */}
        <div className="p-3 rounded-xl bg-card border border-navy-700/30 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="uppercase text-[10px] tracking-wider">Marine Safety</span>
          </div>
          <p className="text-sm font-bold text-emerald-400">{mission.safetyScore}/100</p>
          <p className="text-[10px] text-slate-400">{mission.safetyLabel}</p>
        </div>

        {/* Departure Time */}
        <div className="p-3 rounded-xl bg-card border border-navy-700/30 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase text-[10px] tracking-wider">Optimal Time</span>
          </div>
          <p className="text-sm font-bold text-white">{mission.recommendedTime}</p>
          <p className="text-[10px] text-amber-400 font-semibold">Calmest sea state</p>
        </div>

        {/* Recommended Route */}
        <div className="p-3 rounded-xl bg-card border border-navy-700/30 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase text-[10px] tracking-wider">Safe Route</span>
          </div>
          <p className="text-sm font-bold text-white">{mission.recommendedRoute}</p>
          <p className="text-[10px] text-slate-400">{mission.distanceKm} km via shelf</p>
        </div>
      </div>

      {/* Warnings */}
      {mission.warnings.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-400">Navigational Advisory: </span>
            <span className="text-slate-300">{mission.warnings.join(' ')}</span>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-navy-700/30 text-xs">
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span>Data: <strong className="text-teal-300">ISRO MOSDAC + Open-Meteo + IMD</strong></span>
        </div>
        <a
          href={`/map?action=${encodeURIComponent(mission.mapAction)}`}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all text-xs"
        >
          <span>🗺️ View AI Map Action ({mission.mapAction})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
