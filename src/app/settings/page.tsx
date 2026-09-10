'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Globe,
  MapPin,
  Bell,
  Layers,
  Shield,
  Database,
  Gauge,
  Check,
  Volume2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSettings,
  formatSpeed,
  formatDistance,
  formatTemperature,
  SupportedLanguage,
  SpeedUnit,
  DistanceUnit,
  TemperatureUnit,
} from '@/lib/settings-store';
import {
  COASTAL_LANGUAGES,
  t,
  translateAdvisory,
  speakVernacularAdvisory,
  stopVernacularAdvisory,
} from '@/lib/i18n-engine';

const LAYER_NAMES: Record<string, string> = {
  weather: 'Weather',
  waves: 'Waves',
  currents: 'Currents',
  fishingActivity: 'Fishing Activity',
  vessels: 'Vessels',
  routes: 'Safe Routes',
  depth: 'Depth',
};

export default function SettingsPage() {
  const { settings, setSetting, updateSettings } = useSettings();
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const showSavedIndicator = (msg: string) => {
    setSaveBanner(msg);
    setTimeout(() => {
      setSaveBanner(null);
    }, 2800);
  };

  const handleLanguageChange = (langName: SupportedLanguage) => {
    setSetting('language', langName);
    showSavedIndicator(`Language updated to ${langName}`);
  };

  const handleSpeedUnitChange = (u: SpeedUnit) => {
    setSetting('speedUnit', u);
    showSavedIndicator(`Speed unit set to ${u}`);
  };

  const handleDistanceUnitChange = (u: DistanceUnit) => {
    setSetting('distanceUnit', u);
    showSavedIndicator(`Distance unit set to ${u}`);
  };

  const handleTempUnitChange = (u: TemperatureUnit) => {
    setSetting('tempUnit', u);
    showSavedIndicator(`Temperature unit set to ${u}`);
  };

  const sampleAdvisory =
    'Fishing is safe with standard caution. Return before evening as wind speeds may increase.';

  const handleTestVoice = () => {
    if (isSpeaking) {
      stopVernacularAdvisory();
      setIsSpeaking(false);
    } else {
      const ok = speakVernacularAdvisory(sampleAdvisory, settings.language, 1.0, () =>
        setIsSpeaking(false)
      );
      if (ok) setIsSpeaking(true);
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none',
        checked ? 'bg-teal-500' : 'bg-navy-700'
      )}
    >
      <div
        className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm',
          checked ? 'left-6' : 'left-1'
        )}
      />
    </button>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-teal-400" />
            {t('Settings', settings.language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('Customize your ORCA experience.', settings.language)}
          </p>
        </div>

        {/* Live Auto-save Toast Indicator */}
        <AnimatePresence>
          {saveBanner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold shadow-lg shadow-teal-500/10"
            >
              <Check className="w-3.5 h-3.5 text-teal-400" />
              <span>{saveBanner}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Language Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-navy-600/30 bg-card p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-400" /> {t('Language', settings.language)}
          </h3>
          <span className="text-xs text-teal-400 font-medium">
            Active: <strong className="text-white">{settings.language}</strong>
          </span>
        </div>

        {/* 9 Coastal Languages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {COASTAL_LANGUAGES.map((lang) => {
            const isSelected = settings.language === lang.name;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.name as SupportedLanguage)}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-left',
                  isSelected
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 font-bold shadow-md shadow-teal-500/25 ring-2 ring-teal-400/40'
                    : 'bg-navy-800/80 text-slate-300 hover:text-white hover:bg-navy-700/80 border border-navy-600/30'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{lang.flag}</span>
                  <div className="truncate">
                    <p className="truncate font-semibold">{lang.name}</p>
                    <p className={cn('text-[11px] truncate', isSelected ? 'text-navy-900/80 font-medium' : 'text-slate-400')}>
                      {lang.nativeName}
                    </p>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-navy-950 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Real-time Vernacular Audio & Advisory Preview */}
        <div className="p-3 rounded-xl bg-navy-900/90 border border-teal-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5 max-w-md">
            <p className="text-slate-400 font-medium">
              Sample Marine Advisory ({settings.language}):
            </p>
            <p className="text-teal-300 font-semibold italic">
              &quot;{translateAdvisory(sampleAdvisory, settings.language)}&quot;
            </p>
          </div>
          <button
            type="button"
            onClick={handleTestVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 font-semibold transition-all cursor-pointer shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5" />
            {isSpeaking ? 'Stop Audio' : `Test Voice (${settings.language})`}
          </button>
        </div>
      </motion.div>

      {/* Units Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-navy-600/30 bg-card p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Gauge className="w-4 h-4 text-teal-400" /> {t('Units', settings.language)}
          </h3>
          <span className="text-xs text-slate-400">Automatic real-time conversion</span>
        </div>

        <div className="space-y-4">
          {/* Speed Unit */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-800/40 border border-navy-700/30">
            <div>
              <span className="text-sm font-medium text-slate-200 block">
                {t('Speed', settings.language)}
              </span>
              <span className="text-[11px] text-slate-500">Wind, vessel, and current speeds</span>
            </div>
            <div className="flex gap-1.5 bg-navy-900/80 p-1 rounded-xl border border-navy-700/50">
              {(['km/h', 'knots', 'mph'] as SpeedUnit[]).map((u) => {
                const active = settings.speedUnit === u;
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleSpeedUnitChange(u)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                      active
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 shadow-md shadow-teal-500/20 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-navy-800'
                    )}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance Unit */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-800/40 border border-navy-700/30">
            <div>
              <span className="text-sm font-medium text-slate-200 block">
                {t('Distance', settings.language)}
              </span>
              <span className="text-[11px] text-slate-500">Coastline offset, routes, and radar</span>
            </div>
            <div className="flex gap-1.5 bg-navy-900/80 p-1 rounded-xl border border-navy-700/50">
              {(['km', 'nm', 'miles'] as DistanceUnit[]).map((u) => {
                const active = settings.distanceUnit === u;
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleDistanceUnitChange(u)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                      active
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 shadow-md shadow-teal-500/20 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-navy-800'
                    )}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temperature Unit */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-800/40 border border-navy-700/30">
            <div>
              <span className="text-sm font-medium text-slate-200 block">
                {t('Temperature', settings.language)}
              </span>
              <span className="text-[11px] text-slate-500">Air temperature and Sea Surface Temp (SST)</span>
            </div>
            <div className="flex gap-1.5 bg-navy-900/80 p-1 rounded-xl border border-navy-700/50">
              {(['°C', '°F'] as TemperatureUnit[]).map((u) => {
                const active = settings.tempUnit === u;
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleTempUnitChange(u)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                      active
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 shadow-md shadow-teal-500/20 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-navy-800'
                    )}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Conversion Preview Card */}
        <div className="p-3.5 rounded-xl bg-navy-900/80 border border-navy-700/40">
          <p className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Live Unit Conversion Preview
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-navy-800/60 border border-navy-700/30">
              <span className="text-slate-400 text-[10px] block">Wind Speed (28 km/h)</span>
              <span className="text-white font-bold text-sm mt-0.5 block">
                {formatSpeed(28, settings.speedUnit)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-navy-800/60 border border-navy-700/30">
              <span className="text-slate-400 text-[10px] block">Zone Distance (35 km)</span>
              <span className="text-white font-bold text-sm mt-0.5 block">
                {formatDistance(35, settings.distanceUnit)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-navy-800/60 border border-navy-700/30">
              <span className="text-slate-400 text-[10px] block">Sea Temp (28.4 °C)</span>
              <span className="text-white font-bold text-sm mt-0.5 block">
                {formatTemperature(28.4, settings.tempUnit)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map Layers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-navy-600/30 bg-card p-5"
      >
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" /> {t('Default Map Layers', settings.language)}
        </h3>
        <div className="space-y-3">
          {Object.entries(settings.layers).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                {t(LAYER_NAMES[key] || key, settings.language)}
              </span>
              <Toggle
                checked={value}
                onChange={() => {
                  const updatedLayers = { ...settings.layers, [key]: !value };
                  setSetting('layers', updatedLayers);
                  showSavedIndicator(`${t(LAYER_NAMES[key] || key, settings.language)} layer toggled`);
                }}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risk Sensitivity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-navy-600/30 bg-card p-5"
      >
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-400" /> {t('Risk Sensitivity', settings.language)}
        </h3>
        <div className="flex gap-3">
          {(['low', 'medium', 'high'] as const).map((s) => {
            const label = s === 'low' ? 'Low' : s === 'medium' ? 'Medium' : 'High';
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSetting('riskSensitivity', s);
                  showSavedIndicator(`Risk sensitivity set to ${s}`);
                }}
                className={cn(
                  'flex-1 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer',
                  settings.riskSensitivity === s
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 font-bold shadow-md shadow-teal-500/20'
                    : 'text-slate-400 bg-navy-800/60 border border-navy-600/30 hover:text-white'
                )}
              >
                {t(label, settings.language)}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {t('Higher sensitivity triggers marine advisories and cyclone alerts at lower thresholds.', settings.language)}
        </p>
      </motion.div>

      {/* Toggles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-navy-600/30 bg-card p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-400" />
            <span className="text-sm text-white font-medium">{t('Notifications', settings.language)}</span>
          </div>
          <Toggle
            checked={settings.notifications}
            onChange={() => {
              setSetting('notifications', !settings.notifications);
              showSavedIndicator(
                `Notifications ${!settings.notifications ? 'enabled' : 'disabled'}`
              );
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-sm text-white font-medium">{t('Real-Time Data Pipeline', settings.language)}</span>
              <p className="text-xs text-slate-400">
                Stream live ISRO MOSDAC satellite and Open-Meteo weather data.
              </p>
            </div>
          </div>
          <Toggle
            checked={!settings.demoMode}
            onChange={() => {
              setSetting('demoMode', !settings.demoMode);
              showSavedIndicator(
                `Data mode: ${!settings.demoMode ? 'Demo mode' : 'Real-time pipeline'}`
              );
            }}
          />
        </div>
      </motion.div>

      {/* Location */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl border border-navy-600/30 bg-card p-5"
      >
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-teal-400" /> {t('Location', settings.language)}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Latitude</label>
            <input
              defaultValue="18.95"
              className="w-full px-3 py-2 rounded-lg bg-navy-800/50 border border-navy-700/30 text-white text-sm outline-none focus:border-teal-500/40"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Longitude</label>
            <input
              defaultValue="72.82"
              className="w-full px-3 py-2 rounded-lg bg-navy-800/50 border border-navy-700/30 text-white text-sm outline-none focus:border-teal-500/40"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">Mumbai Coast, Arabian Sea</p>
      </motion.div>
    </div>
  );
}
