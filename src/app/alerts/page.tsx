'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Filter } from 'lucide-react';
import { AlertCard, DemoModeBanner } from '@/components/cards';
import { getMockAlerts } from '@/data/mock-data';
import { Alert } from '@/types/marine';
import { cn } from '@/lib/utils';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setAlerts(getMockAlerts());
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
            Alerts &amp; Safety
          </h1>
          <p className="text-sm text-slate-400 mt-1">Active weather and safety alerts for your region.</p>
        </div>
        <DemoModeBanner />
      </motion.div>

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
        <div className="text-center py-16">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No alerts match this filter.</p>
        </div>
      )}
    </div>
  );
}
