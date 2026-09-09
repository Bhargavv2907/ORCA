'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Wind, Waves, Thermometer, Navigation, Eye, Anchor,
  TrendingUp, TrendingDown, Minus, Fish, CloudSun, ShieldCheck,
  Map as MapIcon, Languages, Gauge, Droplets, CloudLightning,
  Ship, AlertTriangle, Globe, Database, Brain, BarChart3, Compass
} from 'lucide-react';
import { cn, getMetricStatusColor, getMetricBgColor } from '@/lib/utils';
import { OceanMetric, FishingZone, RouteOption, Alert, Agent, DataSource } from '@/types/marine';

export { AgentTracePanel } from './AgentTracePanel';
export { WhyEvidenceModal } from './WhyEvidenceModal';
export { WhatIfComparisonCard } from './WhatIfComparisonCard';
export { MissionPlannerCard } from './MissionPlannerCard';

// ---- Icon Map ----
const ICON_MAP: Record<string, React.ElementType> = {
  wind: Wind, waves: Waves, thermometer: Thermometer, navigation: Navigation,
  eye: Eye, anchor: Anchor, fish: Fish, 'cloud-sun': CloudSun,
  'shield-check': ShieldCheck, map: MapIcon, languages: Languages,
  gauge: Gauge, droplets: Droplets, 'cloud-lightning': CloudLightning,
  ship: Ship, 'alert-triangle': AlertTriangle, globe: Globe,
  database: Database, brain: Brain, 'bar-chart': BarChart3, compass: Compass,
};

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] || Anchor;
}

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-amber-400" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
  return <Minus className="w-3.5 h-3.5 text-slate-500" />;
};

// ============================================================
// OceanMetricCard
// ============================================================
export function OceanMetricCard({ metric, index = 0 }: { metric: OceanMetric; index?: number }) {
  const Icon = getIcon(metric.icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn(
        'rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] cursor-default',
        getMetricBgColor(metric.status)
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', 
          metric.status === 'good' ? 'bg-emerald-500/20' :
          metric.status === 'moderate' ? 'bg-amber-500/20' :
          metric.status === 'warning' ? 'bg-orange-500/20' : 'bg-red-500/20'
        )}>
          <Icon className={cn('w-5 h-5', getMetricStatusColor(metric.status))} />
        </div>
        <TrendIcon trend={metric.trend} />
      </div>
      <p className="text-sm text-slate-400 mb-1">{metric.label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-white">{metric.value}</span>
        <span className="text-sm text-slate-400">{metric.unit}</span>
      </div>
      {metric.description && (
        <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
      )}
    </motion.div>
  );
}

// ============================================================
// FishingZoneCard
// ============================================================
export function FishingZoneCard({ zone, index = 0 }: { zone: FishingZone; index?: number }) {
  const color = zone.suitabilityScore >= 70 ? '#10b981' : zone.suitabilityScore >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="rounded-2xl border border-navy-600/30 bg-card p-5 hover:border-teal-500/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">{zone.name}</h3>
        <div className="flex items-center gap-2">
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#1e3a5f" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke={color} strokeWidth="3"
                strokeDasharray={`${zone.suitabilityScore}, 100`}
                className="transition-all duration-1000" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>
              {zone.suitabilityScore}%
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex justify-between"><span className="text-slate-400">SST</span><span className="text-white font-medium">{zone.sst}°C</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Chlorophyll</span><span className="text-white font-medium">{zone.chlorophyll > 2.5 ? 'High' : 'Moderate'}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Current</span><span className="text-white font-medium">{zone.currentSpeed} kn</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Depth</span><span className="text-white font-medium">{zone.depth} m</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Activity</span><span className="text-white font-medium">{zone.historicalActivity}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Distance</span><span className="text-white font-medium">{zone.distanceFromCoast} km</span></div>
      </div>
    </motion.div>
  );
}

// ============================================================
// RouteCard
// ============================================================
export function RouteCard({ route, index = 0 }: { route: RouteOption; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        'rounded-2xl border p-5 transition-all duration-300 relative',
        route.isRecommended
          ? 'border-teal-500/40 bg-teal-500/5 glow-teal'
          : 'border-navy-600/30 bg-card hover:border-navy-600/50'
      )}
    >
      {route.isRecommended && (
        <div className="absolute -top-3 left-4 px-3 py-0.5 bg-teal-500 text-navy-950 text-xs font-bold rounded-full uppercase tracking-wider">
          Recommended
        </div>
      )}
      <h3 className="text-base font-semibold text-white mb-3">{route.name}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Distance</p>
          <p className="text-lg font-bold text-white">{route.distance} km</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">ETA</p>
          <p className="text-lg font-bold text-white">{route.eta}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Safety</p>
          <p className={cn('text-lg font-bold', route.safetyScore >= 90 ? 'text-emerald-400' : route.safetyScore >= 70 ? 'text-amber-400' : 'text-red-400')}>
            {route.safetyScore}%
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Fuel</p>
          <p className={cn('text-lg font-bold', route.fuelEfficiency === 'High' ? 'text-emerald-400' : route.fuelEfficiency === 'Medium' ? 'text-amber-400' : 'text-red-400')}>
            {route.fuelEfficiency}
          </p>
        </div>
      </div>
      {route.reason && (
        <p className="text-sm text-teal-300/80 italic">"{route.reason}"</p>
      )}
      {route.risks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {route.risks.map((risk, i) => (
            <span key={i} className={cn(
              'text-xs px-2 py-1 rounded-lg font-medium',
              risk.severity === 'HIGH' ? 'bg-red-500/15 text-red-400' :
              risk.severity === 'MEDIUM' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'
            )}>
              {risk.type}: {risk.severity}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// AlertCard
// ============================================================
export function AlertCard({ alert, index = 0 }: { alert: Alert; index?: number }) {
  const severityStyles: Record<string, string> = {
    LOW: 'border-blue-500/30 bg-blue-500/5',
    MEDIUM: 'border-amber-500/30 bg-amber-500/5',
    HIGH: 'border-red-500/30 bg-red-500/5 glow-danger',
    CRITICAL: 'border-red-600/40 bg-red-600/10 glow-danger',
  };
  const severityText: Record<string, string> = {
    LOW: 'text-blue-400', MEDIUM: 'text-amber-400', HIGH: 'text-red-400', CRITICAL: 'text-red-500',
  };
  const typeIcons: Record<string, React.ElementType> = {
    storm: CloudLightning, high_waves: Waves, strong_wind: Wind,
    dangerous_current: Navigation, low_visibility: Eye,
    restricted_zone: AlertTriangle, high_traffic: Ship,
  };
  const TypeIcon = typeIcons[alert.type] || AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={cn('rounded-2xl border p-5', severityStyles[alert.severity])}
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? 'bg-red-500/20' : 
          alert.severity === 'MEDIUM' ? 'bg-amber-500/20' : 'bg-blue-500/20'
        )}>
          <TypeIcon className={cn('w-5 h-5', severityText[alert.severity])} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-white">{alert.title}</h3>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
              alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
              alert.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
            )}>
              {alert.severity}
            </span>
            {alert.isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          </div>
          <p className="text-sm text-slate-300 mb-2">{alert.description}</p>
          <div className="text-xs text-slate-500 space-y-1">
            <p>📍 {alert.location}</p>
            <p>⏰ {new Date(alert.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} — {new Date(alert.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-navy-800/50 border border-navy-700/20">
            <p className="text-xs text-slate-400"><span className="text-teal-400 font-medium">Recommendation:</span> {alert.recommendation}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// AgentCard
// ============================================================
export function AgentCard({ agent, index = 0, data }: { agent: Agent; index?: number; data?: Record<string, unknown> }) {
  const Icon = getIcon(agent.icon);
  const statusColors: Record<string, string> = {
    idle: 'border-slate-700/30 bg-slate-800/30',
    running: 'border-cyan-500/40 bg-cyan-500/5 glow-ocean',
    completed: 'border-emerald-500/30 bg-emerald-500/5 glow-safe',
    error: 'border-red-500/30 bg-red-500/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      className={cn('rounded-2xl border p-4 transition-all duration-500', statusColors[agent.status])}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center',
          agent.status === 'completed' ? 'bg-emerald-500/20' :
          agent.status === 'running' ? 'bg-cyan-500/20' : 'bg-slate-700/30'
        )}>
          <Icon className={cn('w-5 h-5',
            agent.status === 'completed' ? 'text-emerald-400' :
            agent.status === 'running' ? 'text-cyan-400 animate-pulse' : 'text-slate-500'
          )} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white">{agent.name}</h4>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            {agent.status === 'running' ? 'Analyzing...' : agent.status === 'completed' ? 'Complete' : 'Standby'}
          </p>
        </div>
        {agent.status === 'completed' && <span className="text-emerald-400 text-lg">✓</span>}
        {agent.status === 'running' && (
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      {data && agent.status === 'completed' && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-2 pt-2 border-t border-navy-700/20">
          <div className="text-xs text-slate-400 space-y-0.5 font-mono">
            {Object.entries(data).slice(0, 4).map(([key, val]) => (
              <div key={key} className="flex justify-between">
                <span className="text-slate-500">{key}:</span>
                <span className="text-teal-300">{typeof val === 'number' ? (val as number).toFixed?.(1) ?? val : String(val)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================
// RiskScore
// ============================================================
export function RiskScore({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const dims = size === 'lg' ? 'w-32 h-32' : size === 'md' ? 'w-24 h-24' : 'w-16 h-16';
  const textSize = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg';
  const label = score >= 70 ? 'SAFE' : score >= 50 ? 'MODERATE' : 'DANGER';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', dims)}>
        <svg viewBox="0 0 36 36" className={cn(dims, '-rotate-90')}>
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="#1e3a5f" strokeWidth="2.5" />
          <motion.path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
            initial={{ strokeDasharray: '0, 100' }}
            animate={{ strokeDasharray: `${score}, 100` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <span className={cn('absolute inset-0 flex items-center justify-center font-bold', textSize)} style={{ color }}>
          {score}
        </span>
      </div>
      <span className="text-xs font-bold tracking-wider uppercase" style={{ color }}>{label}</span>
    </div>
  );
}

// ============================================================
// DataSourceBadge
// ============================================================
export function DataSourceBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    LIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    NEAR_REAL_TIME: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    FORECAST: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    HISTORICAL: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    MOCK: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  };
  return (
    <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border', styles[status] || styles.MOCK)}>
      {status === 'NEAR_REAL_TIME' ? 'Near Real-Time' : status}
    </span>
  );
}

// ============================================================
// LiveDataBanner (replaces DemoModeBanner)
// ============================================================
export function DemoModeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
    >
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Real-Time Data</span>
    </motion.div>
  );
}

// ============================================================
// Loading / Skeleton / Error states
// ============================================================
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-navy-600/20 bg-card p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-navy-700/50" />
        <div className="w-4 h-4 rounded bg-navy-700/50" />
      </div>
      <div className="w-20 h-3 bg-navy-700/50 rounded mb-2" />
      <div className="w-24 h-7 bg-navy-700/50 rounded" />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading ocean data...</p>
      </div>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-3 text-center p-8">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Unable to Load Data</h3>
        <p className="text-sm text-slate-400 max-w-md">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({ title = 'No data available', description = '' }: { title?: string; description?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[30vh]">
      <div className="flex flex-col items-center gap-3 text-center p-8">
        <Waves className="w-12 h-12 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-300">{title}</h3>
        {description && <p className="text-sm text-slate-500 max-w-md">{description}</p>}
      </div>
    </div>
  );
}
