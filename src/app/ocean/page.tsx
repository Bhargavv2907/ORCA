'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Waves, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DemoModeBanner, LocationBadge } from '@/components/cards';
import { getMockOceanParameters, OceanParameter } from '@/data/mock-data';
import { cn, getMetricStatusColor, getMetricBgColor } from '@/lib/utils';
import { getSelectedLocation, marineApiUrl } from '@/lib/location-store';
import type { CoastalLocation } from '@/lib/orchestrator';

const TIME_OPTIONS = ['Current', '+6h', '+12h', '+24h', '+48h'];

export default function OceanPage() {
  const [params, setParams] = useState<OceanParameter[]>([]);
  const [selectedTime, setSelectedTime] = useState('Current');

  const loadData = useCallback(async (loc?: CoastalLocation) => {
    try {
      const res = await fetch(marineApiUrl(loc ?? getSelectedLocation()));
      if (res.ok) {
        const live = await res.json();
        const baseParams = getMockOceanParameters();
        if (live.ocean) {
          baseParams.forEach(p => {
            if (p.id === 'sst') p.value = +live.ocean.sst.toFixed(1);
            if (p.id === 'chlorophyll') p.value = +live.ocean.chlorophyll.toFixed(2);
            if (p.id === 'salinity') p.value = +live.ocean.salinity.toFixed(1);
            if (p.id === 'current_speed') p.value = +live.ocean.currentSpeed.toFixed(1);
          });
        }
        setParams(baseParams);
      } else {
        setParams(getMockOceanParameters());
      }
    } catch {
      setParams(getMockOceanParameters());
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getTimeValue = (param: OceanParameter) => {
    if (selectedTime === 'Current') return param.value;
    const forecast = param.forecast.find(f => f.time === selectedTime);
    return forecast?.value ?? param.value;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Waves className="w-7 h-7 text-teal-400" />
            Ocean Conditions
          </h1>
          <p className="text-sm text-slate-400 mt-1">Comprehensive ocean parameter monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <LocationBadge onLocationChange={loadData} />
          <DemoModeBanner />
        </div>
      </motion.div>

      {/* Time selector */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-400 mr-2">Forecast:</span>
        {TIME_OPTIONS.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTime(t)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              selectedTime === t ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20' : 'text-slate-500 hover:text-white border border-transparent'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Parameters grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {params.map((param, i) => {
          const currentValue = getTimeValue(param);
          const TrendIcon = param.trend === 'up' ? TrendingUp : param.trend === 'down' ? TrendingDown : Minus;
          return (
            <motion.div
              key={param.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn('rounded-2xl border p-5 transition-all hover:scale-[1.02]', getMetricBgColor(param.status))}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-slate-400">{param.name}</p>
                <TrendIcon className={cn('w-3.5 h-3.5',
                  param.trend === 'up' ? 'text-amber-400' : param.trend === 'down' ? 'text-emerald-400' : 'text-slate-500'
                )} />
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className={cn('text-2xl font-bold', getMetricStatusColor(param.status))}>
                  {typeof currentValue === 'number' ? currentValue.toFixed(1) : currentValue}
                </span>
                <span className="text-sm text-slate-500">{param.unit}</span>
              </div>
              <p className="text-xs text-slate-500">{param.description}</p>
              {/* Mini sparkline */}
              <div className="mt-3 flex items-end gap-1 h-8">
                {param.forecast.map((f, fi) => (
                  <div
                    key={fi}
                    className={cn('flex-1 rounded-t transition-all', f.time === selectedTime ? 'bg-teal-400' : 'bg-navy-600/50')}
                    style={{ height: `${Math.max(10, (f.value / (param.value * 1.5)) * 100)}%` }}
                    title={`${f.time}: ${f.value}`}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
