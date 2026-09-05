'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Bot, ArrowRight, Shield, Clock, Anchor } from 'lucide-react';
import { OceanMetricCard, DemoModeBanner, RiskScore } from '@/components/cards';
import { getMockDashboardMetrics, getMockSafety, getMockAlerts, DEFAULT_LOCATION } from '@/data/mock-data';
import { getGreeting, formatCoordinate } from '@/lib/utils';
import { OceanMetric, SafetyScore, Alert } from '@/types/marine';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<OceanMetric[]>([]);
  const [safety, setSafety] = useState<SafetyScore | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [time, setTime] = useState('');
  const [dataSource, setDataSource] = useState<string>('Live Data Pipeline');
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    async function loadLiveMarineData() {
      try {
        const res = await fetch('/api/marine?lat=18.95&lon=72.82');
        if (res.ok) {
          const data = await res.json();
          setSafety(data.safety);
          setDataSource(data.source);
          setIsLive(data.dataStatus !== 'MOCK');

          // Derive live ocean metrics from live weather/ocean/waves
          const liveMetrics: OceanMetric[] = [
            {
              id: 'wave',
              label: 'Wave Height',
              value: `${data.waves.height.toFixed(1)} m`,
              unit: 'm',
              trend: data.waves.height > 2 ? 'up' : 'stable',
              status: data.waves.height > 2.5 ? 'danger' : data.waves.height > 1.8 ? 'warning' : 'good',
              icon: 'waves',
              description: `Period: ${data.waves.period}s | Swell: ${data.waves.swellHeight.toFixed(1)}m`,
            },
            {
              id: 'wind',
              label: 'Wind Speed',
              value: `${data.weather.windSpeed.toFixed(1)} km/h`,
              unit: 'km/h',
              trend: data.weather.windSpeed > 25 ? 'up' : 'stable',
              status: data.weather.windSpeed > 35 ? 'danger' : data.weather.windSpeed > 22 ? 'moderate' : 'good',
              icon: 'wind',
              description: `Direction: ${data.weather.windDirection} (${data.weather.windDegrees}°)`,
            },
            {
              id: 'sst',
              label: 'Sea Surface Temp (SST)',
              value: `${data.ocean.sst.toFixed(1)} °C`,
              unit: '°C',
              trend: 'stable',
              status: 'good',
              icon: 'thermometer',
              description: 'MOSDAC INSAT-3D / EOS-06 Satellite Observation',
            },
            {
              id: 'chlorophyll',
              label: 'Chlorophyll-a',
              value: `${data.ocean.chlorophyll.toFixed(2)} mg/m³`,
              unit: 'mg/m³',
              trend: 'up',
              status: 'good',
              icon: 'droplets',
              description: 'MOSDAC EOS-06 Ocean Colour Monitor (OCM)',
            },
          ];
          setMetrics(liveMetrics);
        } else {
          setMetrics(getMockDashboardMetrics());
          setSafety(getMockSafety());
        }
      } catch {
        setMetrics(getMockDashboardMetrics());
        setSafety(getMockSafety());
      }
    }

    loadLiveMarineData();
    setAlerts(getMockAlerts().filter(a => a.isActive).slice(0, 3));
    setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));

    const interval = setInterval(() => {
      loadLiveMarineData();
      setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loc = DEFAULT_LOCATION;
  const statusColor = safety?.status === 'SAFE' ? 'bg-emerald-500' : safety?.status === 'MODERATE' ? 'bg-amber-500' : 'bg-red-500';
  const statusGlow = safety?.status === 'SAFE' ? 'pulse-safe' : safety?.status === 'MODERATE' ? '' : 'pulse-danger';

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {getGreeting()}, <span className="text-teal-400">Fisherman</span>
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-500" />
              <span>{formatCoordinate(loc.coordinates.lat, 'lat')}, {formatCoordinate(loc.coordinates.lon, 'lon')}</span>
            </div>
            <span className="text-slate-600">•</span>
            <span>{loc.region}</span>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{time}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DemoModeBanner />
          <Link
            href="/assistant"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 font-semibold rounded-xl text-sm hover:shadow-lg hover:shadow-teal-500/25 transition-all"
          >
            <Bot className="w-4 h-4" />
            Ask ORCA
          </Link>
        </div>
      </motion.div>

      {/* Safety Banner */}
      {safety && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-center gap-6 ${
            safety.status === 'SAFE' ? 'border-emerald-500/20 bg-emerald-500/5' :
            safety.status === 'MODERATE' ? 'border-amber-500/20 bg-amber-500/5' :
            'border-red-500/20 bg-red-500/5'
          }`}
        >
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-4 h-4 rounded-full ${statusColor} ${statusGlow}`} />
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {safety.label.toUpperCase()}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Ocean conditions are currently {safety.status === 'SAFE' ? 'favorable' : safety.status === 'MODERATE' ? 'moderate with some risks' : 'hazardous'} for maritime activities.
              </p>
            </div>
          </div>
          <RiskScore score={safety.overall} size="md" />
        </motion.div>
      )}

      {/* Metrics Grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Current Conditions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric, i) => (
            <OceanMetricCard key={metric.id} metric={metric} index={i} />
          ))}
        </div>
      </div>

      {/* Quick Actions + Alerts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
          {[
            { href: '/assistant', icon: Bot, label: 'Ask ORCA a question', color: 'from-teal-500 to-cyan-500' },
            { href: '/fishing-zones', icon: Anchor, label: 'View fishing zones', color: 'from-emerald-500 to-teal-500' },
            { href: '/routes', icon: ArrowRight, label: 'Plan a safe route', color: 'from-blue-500 to-cyan-500' },
            { href: '/map', icon: MapPin, label: 'Open marine map', color: 'from-violet-500 to-blue-500' },
          ].map((action, i) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <Link
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-navy-600/20 bg-card hover:border-teal-500/30 hover:bg-card-hover transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
                <ArrowRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Active Alerts */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</h3>
            <Link href="/alerts" className="text-xs text-teal-400 hover:underline">View all</Link>
          </div>
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`rounded-xl border p-4 ${
                alert.severity === 'HIGH' ? 'border-red-500/20 bg-red-500/5' :
                alert.severity === 'MEDIUM' ? 'border-amber-500/20 bg-amber-500/5' :
                'border-blue-500/20 bg-blue-500/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{
                  backgroundColor: alert.severity === 'HIGH' ? '#ef4444' : alert.severity === 'MEDIUM' ? '#f59e0b' : '#3b82f6'
                }} />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      alert.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>{alert.severity}</span>
                  </div>
                  <p className="text-xs text-slate-400">{alert.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
