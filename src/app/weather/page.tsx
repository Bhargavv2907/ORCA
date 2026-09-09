'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CloudSun, AlertTriangle, Clock, Wind, Waves, Thermometer, Droplets, Gauge } from 'lucide-react';
import { DemoModeBanner, LocationBadge } from '@/components/cards';
import { getMockForecast, getMock7DayForecast } from '@/data/mock-data';
import { ForecastPoint, WeatherForecast } from '@/types/marine';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getSelectedLocation, marineApiUrl } from '@/lib/location-store';

export default function WeatherPage() {
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [weekForecast, setWeekForecast] = useState<WeatherForecast[]>([]);
  const [activeChart, setActiveChart] = useState('wind');

  const loadLiveWeather = useCallback(async () => {
    try {
      const res = await fetch(marineApiUrl(getSelectedLocation()));
      if (res.ok) {
        const live = await res.json();
        const baseForecast = getMockForecast();
        if (baseForecast.length > 0 && live.weather && live.waves) {
          baseForecast[0].windSpeed = live.weather.windSpeed;
          baseForecast[0].windDirection = live.weather.windDirection;
          baseForecast[0].waveHeight = live.waves.height;
          baseForecast[0].wavePeriod = live.waves.period;
          baseForecast[0].temperature = live.weather.temperature;
          baseForecast[0].pressure = live.weather.pressure;
          baseForecast[0].rainfall = live.weather.rainfall;
        }
        setForecast(baseForecast);
      } else {
        setForecast(getMockForecast());
      }
    } catch {
      setForecast(getMockForecast());
    }
  }, []);

  useEffect(() => {
    loadLiveWeather();
    setWeekForecast(getMock7DayForecast());
  }, [loadLiveWeather]);

  const chartConfigs: Record<string, { key: string; color: string; label: string; unit: string }> = {
    wind: { key: 'windSpeed', color: '#60a5fa', label: 'Wind Speed', unit: 'km/h' },
    waves: { key: 'waveHeight', color: '#22d3ee', label: 'Wave Height', unit: 'm' },
    temp: { key: 'temperature', color: '#f59e0b', label: 'Temperature', unit: '°C' },
    pressure: { key: 'pressure', color: '#a78bfa', label: 'Pressure', unit: 'hPa' },
    rain: { key: 'rainfall', color: '#3b82f6', label: 'Rainfall', unit: 'mm' },
  };

  const dangerPeriods = forecast.filter(f => f.isDangerous);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload?.[0]) {
      const config = chartConfigs[activeChart];
      return (
        <div className="px-3 py-2 rounded-lg bg-navy-800 border border-navy-600/40 text-xs">
          <p className="text-slate-400">{label}</p>
          <p className="text-white font-semibold">{payload[0].value} {config.unit}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <CloudSun className="w-7 h-7 text-teal-400" />
            Marine Weather
          </h1>
          <p className="text-sm text-slate-400 mt-1">Detailed marine weather forecasts and conditions.</p>
        </div>
        <div className="flex items-center gap-3">
          <LocationBadge onLocationChange={loadLiveWeather} />
          <DemoModeBanner />
        </div>
      </motion.div>

      {/* Danger alerts */}
      {dangerPeriods.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-400">⚠️ High Wave &amp; Wind Risk Period</p>
            <p className="text-xs text-slate-400">Dangerous conditions expected from {dangerPeriods[0]?.label} — exercise extreme caution.</p>
          </div>
        </motion.div>
      )}

      {/* Chart selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {Object.entries(chartConfigs).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveChart(key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              activeChart === key ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20' : 'text-slate-400 hover:text-white border border-transparent'
            )}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-navy-600/20 bg-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">24-Hour Forecast — {chartConfigs[activeChart].label}</h3>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfigs[activeChart].color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartConfigs[activeChart].color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={chartConfigs[activeChart].key}
                stroke={chartConfigs[activeChart].color}
                fill="url(#chartGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Hourly timeline */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-navy-600/20 bg-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-400" />
          Hourly Timeline
        </h3>
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {forecast.slice(0, 12).map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-3 rounded-xl min-w-[80px] border text-center',
                  point.isDangerous ? 'border-red-500/30 bg-red-500/5' : 'border-navy-600/20 bg-navy-800/30'
                )}
              >
                <span className="text-xs text-slate-400">{point.label}</span>
                <Wind className={cn('w-4 h-4', point.isDangerous ? 'text-red-400' : 'text-blue-400')} />
                <span className="text-sm font-bold text-white">{point.windSpeed}</span>
                <span className="text-[10px] text-slate-500">km/h</span>
                <Waves className={cn('w-4 h-4 mt-1', point.isDangerous ? 'text-red-400' : 'text-cyan-400')} />
                <span className="text-sm font-bold text-white">{point.waveHeight}</span>
                <span className="text-[10px] text-slate-500">m</span>
                {point.isDangerous && <span className="text-[10px] text-red-400 font-bold mt-1">⚠️</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 7-day forecast */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-navy-600/20 bg-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">7-Day Forecast</h3>
        <div className="space-y-3">
          {weekForecast.map((day, i) => {
            const date = new Date(day.time);
            const isStormy = day.weather.windSpeed > 30 || day.waveHeight > 2.5;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-xl border transition-all',
                  isStormy ? 'border-red-500/20 bg-red-500/5' : 'border-navy-600/10 bg-navy-800/20 hover:bg-navy-800/30'
                )}
              >
                <div className="w-24 shrink-0">
                  <p className="text-sm font-medium text-white">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                  <p className="text-xs text-slate-500">{date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-6 flex-1 flex-wrap">
                  <div className="flex items-center gap-1.5 min-w-[80px]">
                    <Wind className={cn('w-3.5 h-3.5', isStormy ? 'text-red-400' : 'text-blue-400')} />
                    <span className="text-sm text-white">{Math.round(day.weather.windSpeed)} km/h</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-[70px]">
                    <Waves className={cn('w-3.5 h-3.5', isStormy ? 'text-red-400' : 'text-cyan-400')} />
                    <span className="text-sm text-white">{day.waveHeight.toFixed(1)} m</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-[60px]">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-sm text-white">{Math.round(day.weather.temperature)}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-[60px]">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm text-white">{day.weather.rainfall.toFixed(1)} mm</span>
                  </div>
                </div>
                {isStormy && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">⚠️ RISK</span>}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
