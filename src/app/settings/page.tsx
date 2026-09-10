'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, MapPin, Bell, Layers, Shield, Database, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [language, setLanguage] = useState('English');
  const [speedUnit, setSpeedUnit] = useState('km/h');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [tempUnit, setTempUnit] = useState('°C');
  const [demoMode, setDemoMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [riskSensitivity, setRiskSensitivity] = useState('medium');
  const [layers, setLayers] = useState({
    weather: true, waves: true, currents: true, fishingActivity: true, vessels: true, routes: true, depth: false,
  });

  const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali'];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={cn('w-11 h-6 rounded-full transition-colors relative', checked ? 'bg-teal-500' : 'bg-navy-700')}
    >
      <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-all', checked ? 'left-6' : 'left-1')} />
    </button>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-teal-400" />
          Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">Customize your ORCA experience.</p>
      </motion.div>

      {/* Language */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-navy-600/20 bg-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-teal-400" /> Language</h3>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button key={lang} onClick={() => setLanguage(lang)}
              className={cn('px-3 py-1.5 rounded-lg text-sm transition-all',
                language === lang ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20' : 'text-slate-500 hover:text-white border border-navy-600/20'
              )}>
              {lang}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Units */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-navy-600/20 bg-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Gauge className="w-4 h-4 text-teal-400" /> Units</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Speed</span>
            <div className="flex gap-2">
              {['km/h', 'knots', 'mph'].map(u => (
                <button key={u} onClick={() => setSpeedUnit(u)} className={cn('px-3 py-1 rounded-lg text-xs', speedUnit === u ? 'bg-teal-500/15 text-teal-300' : 'text-slate-500 bg-navy-800/50')}>{u}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Distance</span>
            <div className="flex gap-2">
              {['km', 'nm', 'miles'].map(u => (
                <button key={u} onClick={() => setDistanceUnit(u)} className={cn('px-3 py-1 rounded-lg text-xs', distanceUnit === u ? 'bg-teal-500/15 text-teal-300' : 'text-slate-500 bg-navy-800/50')}>{u}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Temperature</span>
            <div className="flex gap-2">
              {['°C', '°F'].map(u => (
                <button key={u} onClick={() => setTempUnit(u)} className={cn('px-3 py-1 rounded-lg text-xs', tempUnit === u ? 'bg-teal-500/15 text-teal-300' : 'text-slate-500 bg-navy-800/50')}>{u}</button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map Layers */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-navy-600/20 bg-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-teal-400" /> Default Map Layers</h3>
        <div className="space-y-3">
          {Object.entries(layers).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <Toggle checked={value} onChange={() => setLayers(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risk Sensitivity */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="rounded-2xl border border-navy-600/20 bg-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-teal-400" /> Risk Sensitivity</h3>
        <div className="flex gap-3">
          {['low', 'medium', 'high'].map(s => (
            <button key={s} onClick={() => setRiskSensitivity(s)} className={cn('flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all',
              riskSensitivity === s ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20' : 'text-slate-500 bg-navy-800/30 border border-navy-600/20'
            )}>{s}</button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">Higher sensitivity triggers alerts at lower risk thresholds.</p>
      </motion.div>

      {/* Toggles */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-navy-600/20 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-400" />
            <span className="text-sm text-white font-medium">Notifications</span>
          </div>
          <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-sm text-white font-medium">Real-Time Data Pipeline</span>
              <p className="text-xs text-slate-400">Stream live ISRO MOSDAC satellite and Open-Meteo weather data.</p>
            </div>
          </div>
          <Toggle checked={!demoMode} onChange={() => setDemoMode(!demoMode)} />
        </div>
      </motion.div>

      {/* Location */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="rounded-2xl border border-navy-600/20 bg-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-teal-400" /> Location</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Latitude</label>
            <input defaultValue="18.95" className="w-full px-3 py-2 rounded-lg bg-navy-800/50 border border-navy-700/30 text-white text-sm outline-none focus:border-teal-500/40" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Longitude</label>
            <input defaultValue="72.82" className="w-full px-3 py-2 rounded-lg bg-navy-800/50 border border-navy-700/30 text-white text-sm outline-none focus:border-teal-500/40" />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">Mumbai Coast, Arabian Sea</p>
      </motion.div>
    </div>
  );
}
