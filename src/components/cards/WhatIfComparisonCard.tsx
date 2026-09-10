'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingDown, TrendingUp, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export interface WhatIfComparisonPayload {
  baselineTime: string;
  alternativeTime: string;
  baselineScore: number;
  alternativeScore: number;
  baselineWaveHeight: number;
  alternativeWaveHeight: number;
  baselineWindSpeed: number;
  alternativeWindSpeed: number;
  recommendation: string;
}

interface WhatIfComparisonCardProps {
  comparison: WhatIfComparisonPayload;
}

export function WhatIfComparisonCard({ comparison }: WhatIfComparisonCardProps) {
  const scoreDelta = comparison.alternativeScore - comparison.baselineScore;
  const waveDelta = +(comparison.alternativeWaveHeight - comparison.baselineWaveHeight).toFixed(1);
  const windDelta = Math.round(comparison.alternativeWindSpeed - comparison.baselineWindSpeed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-teal-500/30 bg-navy-950/80 p-5 space-y-4 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-navy-700/30 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">What-If Scenario Recalculation</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
          Dynamic Risk Engine Calculation
        </span>
      </div>

      {/* Side-by-Side Table */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Baseline Scenario */}
        <div className="p-3.5 rounded-xl bg-card border border-navy-700/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-slate-300">Baseline</span>
            <span className="font-mono text-[10px] bg-navy-800 px-1.5 py-0.5 rounded">{comparison.baselineTime}</span>
          </div>
          <div className="text-xl font-bold text-white flex items-baseline gap-1">
            {comparison.baselineScore}
            <span className="text-xs text-slate-400 font-normal">/100 Safety</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-400">
            <p>Wave Height: <strong className="text-white">{comparison.baselineWaveHeight} m</strong></p>
            <p>Wind Speed: <strong className="text-white">{comparison.baselineWindSpeed} km/h</strong></p>
          </div>
        </div>

        {/* Alternative Scenario */}
        <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-2">
          <div className="flex items-center justify-between text-teal-300">
            <span className="font-semibold text-teal-400">Alternative</span>
            <span className="font-mono text-[10px] bg-teal-950 px-1.5 py-0.5 rounded border border-teal-500/30 text-teal-300">
              {comparison.alternativeTime}
            </span>
          </div>
          <div className="text-xl font-bold text-teal-300 flex items-baseline gap-1">
            {comparison.alternativeScore}
            <span className="text-xs text-teal-400 font-normal">/100 Safety</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-300">
            <p>Wave Height: <strong className="text-white">{comparison.alternativeWaveHeight} m</strong></p>
            <p>Wind Speed: <strong className="text-white">{comparison.alternativeWindSpeed} km/h</strong></p>
          </div>
        </div>
      </div>

      {/* Calculated Real Deltas */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
        <div className="p-2 rounded-lg bg-navy-800/40 border border-navy-700/20">
          <p className="text-[10px] text-slate-500 uppercase">Safety Delta</p>
          <p className={`font-bold ${scoreDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pts
          </p>
        </div>
        <div className="p-2 rounded-lg bg-navy-800/40 border border-navy-700/20">
          <p className="text-[10px] text-slate-500 uppercase">Wave Delta</p>
          <p className={`font-bold ${waveDelta <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {waveDelta <= 0 ? `${waveDelta} m` : `+${waveDelta} m`}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-navy-800/40 border border-navy-700/20">
          <p className="text-[10px] text-slate-500 uppercase">Wind Delta</p>
          <p className={`font-bold ${windDelta <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {windDelta <= 0 ? `${windDelta} km/h` : `+${windDelta} km/h`}
          </p>
        </div>
      </div>

      {/* Dynamic Recommendation Banner */}
      <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="text-xs text-white leading-relaxed">{comparison.recommendation}</p>
      </div>
    </motion.div>
  );
}
