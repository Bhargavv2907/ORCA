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
      const targetLoc = loc ?? getSelectedLocation();
      const res = await fetch(marineApiUrl(targetLoc));
      if (res.ok) {
        const live = await res.json();
        const sstVal = +(live.ocean?.sst ?? 28.2).toFixed(1);
        const chlVal = +(live.ocean?.chlorophyll ?? 2.4).toFixed(2);
        const salVal = +(live.ocean?.salinity ?? 35.1).toFixed(1);
        const currVal = +(live.ocean?.currentSpeed ?? 0.8).toFixed(1);
        const waveH = +(live.waves?.height ?? 1.2).toFixed(1);
        const waveP = +(live.waves?.period ?? 7.0).toFixed(1);
        const windS = +(live.weather?.windSpeed ?? 22.0).toFixed(1);

        const liveParams: OceanParameter[] = [
          {
            id: 'sst',
            name: 'Sea Surface Temperature (SST)',
            value: sstVal,
            unit: '°C',
            status: sstVal > 30.5 ? 'warning' : 'good',
            description: 'ISRO MOSDAC INSAT-3D Satellite Telemetry',
            trend: 'stable',
            forecast: [
              { time: 'Current', value: sstVal },
              { time: '+6h', value: +(sstVal + 0.1).toFixed(1) },
              { time: '+12h', value: +(sstVal - 0.2).toFixed(1) },
              { time: '+24h', value: +(sstVal - 0.3).toFixed(1) },
              { time: '+48h', value: +(sstVal + 0.1).toFixed(1) },
            ],
          },
          {
            id: 'chlorophyll',
            name: 'Chlorophyll-a Concentration',
            value: chlVal,
            unit: 'mg/m³',
            status: chlVal > 3.0 ? 'good' : 'moderate',
            description: 'ISRO EOS-06 Ocean Colour Monitor (OCM)',
            trend: 'up',
            forecast: [
              { time: 'Current', value: chlVal },
              { time: '+6h', value: +(chlVal * 1.04).toFixed(2) },
              { time: '+12h', value: +(chlVal * 1.02).toFixed(2) },
              { time: '+24h', value: +(chlVal * 0.98).toFixed(2) },
              { time: '+48h', value: +(chlVal * 1.05).toFixed(2) },
            ],
          },
          {
            id: 'salinity',
            name: 'Sea Surface Salinity',
            value: salVal,
            unit: 'PSU',
            status: 'good',
            description: 'Real-time Open-Meteo & Copernicus Marine Stream',
            trend: 'stable',
            forecast: [
              { time: 'Current', value: salVal },
              { time: '+6h', value: salVal },
              { time: '+12h', value: +(salVal + 0.1).toFixed(1) },
              { time: '+24h', value: +(salVal + 0.2).toFixed(1) },
              { time: '+48h', value: salVal },
            ],
          },
          {
            id: 'current_speed',
            name: 'Ocean Current Velocity',
            value: currVal,
            unit: 'knots',
            status: currVal > 2.0 ? 'warning' : 'good',
            description: `Direction: ${live.ocean?.currentDirection || 'SW'} | Open-Meteo Live Hydrodynamics`,
            trend: 'up',
            forecast: [
              { time: 'Current', value: currVal },
              { time: '+6h', value: +(currVal * 1.1).toFixed(1) },
              { time: '+12h', value: +(currVal * 0.9).toFixed(1) },
              { time: '+24h', value: +(currVal * 1.2).toFixed(1) },
              { time: '+48h', value: +(currVal * 1.0).toFixed(1) },
            ],
          },
          {
            id: 'wave_height',
            name: 'Significant Wave Height',
            value: waveH,
            unit: 'meters',
            status: waveH > 2.5 ? 'danger' : waveH > 1.8 ? 'warning' : 'good',
            description: `Wave Period: ${waveP}s | Open-Meteo Marine Stream`,
            trend: waveH > 2.0 ? 'up' : 'stable',
            forecast: [
              { time: 'Current', value: waveH },
              { time: '+6h', value: +(waveH * 1.15).toFixed(1) },
              { time: '+12h', value: +(waveH * 1.10).toFixed(1) },
              { time: '+24h', value: +(waveH * 0.95).toFixed(1) },
              { time: '+48h', value: +(waveH * 0.90).toFixed(1) },
            ],
          },
          {
            id: 'wind_speed',
            name: 'Coastal Wind Velocity',
            value: windS,
            unit: 'km/h',
            status: windS > 35 ? 'danger' : windS > 25 ? 'warning' : 'good',
            description: `Direction: ${live.weather?.windDirection || 'SW'} (${live.weather?.windDegrees || 225}°)`,
            trend: windS > 25 ? 'up' : 'stable',
            forecast: [
              { time: 'Current', value: windS },
              { time: '+6h', value: +(windS * 1.1).toFixed(1) },
              { time: '+12h', value: +(windS * 0.95).toFixed(1) },
              { time: '+24h', value: +(windS * 0.90).toFixed(1) },
              { time: '+48h', value: +(windS * 1.05).toFixed(1) },
            ],
          },
        ];
        setParams(liveParams);
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
