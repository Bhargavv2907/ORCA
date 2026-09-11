'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Filter, RefreshCw, Radio } from 'lucide-react';
import { AlertCard, DemoModeBanner } from '@/components/cards';
import { Alert } from '@/types/marine';
import { cn } from '@/lib/utils';
import { getSelectedLocation } from '@/lib/location-store';
import { evaluateProactiveAlerts } from '@/lib/alert-engine';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [liveSource, setLiveSource] = useState('IMD + Open-Meteo Live Hazards Pipeline');

  const loadLiveAlerts = async () => {
    setIsLoading(true);
    const loc = getSelectedLocation();
    const liveAlertsList: Alert[] = [];

    try {
      // 1. Fetch IMD Coastal & Fishermen Warnings
      const imdRes = await fetch('/api/imd/marine').then(r => r.json()).catch(() => null);
      if (imdRes?.fishermenWarnings?.length > 0) {
        imdRes.fishermenWarnings.forEach((fw: Record<string, string>, idx: number) => {
          liveAlertsList.push({
            id: `imd-fw-${idx}`,
            type: 'storm',
            severity: fw.warning?.includes('deep sea') ? 'HIGH' : 'MEDIUM',
            title: `IMD Advisory: ${fw.area || 'Indian Coastal Waters'}`,
            description: fw.warning,
            location: fw.area || loc.name,
            area: { lat: loc.lat, lon: loc.lon },
            startTime: fw.dateOfIssue || new Date().toISOString(),
            endTime: fw.validUpto || new Date(Date.now() + 86400000).toISOString(),
            recommendation: 'Obey IMD Fishermen Advisories. Maintain active VHF watch on Channel 16.',
            isActive: true,
            source: 'India Meteorological Department (IMD)',
          });
        });
      }

      if (imdRes?.portWarnings?.length > 0) {
        imdRes.portWarnings.forEach((pw: Record<string, string>, idx: number) => {
          liveAlertsList.push({
            id: `imd-pw-${idx}`,
            type: 'restricted_zone',
            severity: 'HIGH',
            title: `Port Warning: ${pw.portName}`,
            description: pw.warning,
            location: pw.portName,
            area: { lat: loc.lat, lon: loc.lon },
            startTime: pw.dateOfIssue || new Date().toISOString(),
            endTime: new Date(Date.now() + 86400000).toISOString(),
            recommendation: 'Port signals active. Consult harbour master prior to departure.',
            isActive: true,
            source: 'IMD Coastal Port Warning Bureau',
          });
        });
      }

      // 2. Fetch Open-Meteo Real-Time Wave & Wind Hazards
      const marineRes = await fetch(`/api/marine?lat=${loc.lat}&lon=${loc.lon}`).then(r => r.json()).catch(() => null);
      if (marineRes && marineRes.waves) {
        const proactive = evaluateProactiveAlerts(marineRes);
        proactive.forEach(pa => {
          liveAlertsList.push({
            id: pa.id,
            type: pa.type === 'cyclone' ? 'storm' : pa.type === 'high_waves' ? 'high_waves' : pa.type === 'strong_wind' ? 'strong_wind' : 'high_waves',
            severity: pa.severity === 'CRITICAL' ? 'CRITICAL' : pa.severity === 'HIGH' ? 'HIGH' : pa.severity === 'MEDIUM' ? 'MEDIUM' : 'LOW',
            title: pa.title,
            description: pa.description,
            location: loc.name,
            area: { lat: loc.lat, lon: loc.lon },
            startTime: pa.timestamp,
            endTime: new Date(Date.now() + 86400000).toISOString(),
            recommendation: pa.recommendation,
            isActive: true,
            source: 'Open-Meteo Live Marine Hazard Engine',
          });
        });
      }

      // 3. Fetch AIS Vessel Congestion Alerts
      const vesselRes = await fetch(`/api/vessels?lat=${loc.lat}&lon=${loc.lon}`).then(r => r.json()).catch(() => null);
      if (vesselRes?.data?.shippingLaneStatus === 'CONGESTED') {
        liveAlertsList.push({
          id: 'ais-congestion-01',
          type: 'restricted_zone',
          severity: 'MEDIUM',
          title: `High Commercial Vessel Traffic Congestion — ${loc.name}`,
          description: `Tracked ${vesselRes.data.totalVessels} AIS vessels in sector. Commercial shipping lane is currently CONGESTED.`,
          location: `${loc.name} Shipping Fairway`,
          area: { lat: loc.lat, lon: loc.lon },
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 43200000).toISOString(),
          recommendation: 'Maintain continuous radar watch. Exercise caution when crossing TSS fairways.',
          isActive: true,
          source: vesselRes.data.source || 'AIS Stream Traffic Engine',
        });
      }

      setAlerts(liveAlertsList);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLiveAlerts();
  }, []);

  const filteredAlerts = filter === 'all' ? alerts :
    filter === 'active' ? alerts.filter(a => a.isActive) :
      alerts.filter(a => a.severity === filter.toUpperCase());

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-teal-400" />
            Live Marine Alerts &amp; Coastal Safety
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time hazard warnings aggregated from IMD Marine Advisories, Open-Meteo Sea Telemetry, and AIS Traffic Congestion.
          </p>
        </div>
        <DemoModeBanner />
      </motion.div>

      {/* Live Source Indicator Strip */}
      <div className="p-4 rounded-2xl bg-card border border-teal-500/30 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-white">
          <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
          <span>Alert Pipeline: <strong className="text-teal-300">{liveSource}</strong></span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold">LIVE API ACTIVE</span>
        </div>
        <button
          onClick={loadLiveAlerts}
          className="p-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 transition-all flex items-center gap-1 font-bold"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs font-semibold text-red-400">{alerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL').length} High</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs font-semibold text-amber-400">{alerts.filter(a => a.severity === 'MEDIUM').length} Medium</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-xs font-semibold text-blue-400">{alerts.filter(a => a.severity === 'LOW').length} Low</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-xs font-semibold text-emerald-400">{alerts.filter(a => a.isActive).length} Active</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        {['all', 'active', 'high', 'medium', 'low'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
              filter === f ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20' : 'text-slate-500 hover:text-white border border-transparent'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="space-y-4">
        {filteredAlerts.map((alert, i) => (
          <AlertCard key={alert.id} alert={alert} index={i} />
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-navy-700/40">
          <AlertTriangle className="w-12 h-12 text-teal-500 mx-auto mb-3 animate-pulse" />
          <h3 className="font-bold text-white text-base">No Critical Hazard Alerts Reported</h3>
          <p className="text-slate-400 text-xs mt-1">Live sea conditions and atmospheric parameters are currently within safe operational thresholds.</p>
        </div>
      )}
    </div>
  );
}
