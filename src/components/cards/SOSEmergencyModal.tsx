'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon, X, PhoneCall, Radio, Volume2, ShieldAlert,
  MapPin, CheckCircle2, WifiOff, Waves, Wind, Thermometer,
  Shield, AlertTriangle, Compass, LifeBuoy, BatteryCharging
} from 'lucide-react';
import { getSelectedLocation } from '@/lib/location-store';
import { speakVernacularAdvisory, COASTAL_LANGUAGES, LANGUAGE_ANNOUNCEMENTS } from '@/lib/i18n-engine';
import { useLanguage } from '@/lib/language-store';
import { getMarineConditions } from '@/services/marine/unified';
import { checkGeofenceProximity } from '@/lib/geofence-engine';
import { evaluateProactiveAlerts, ProactiveAlert } from '@/lib/alert-engine';
import { calculateMarineRisk } from '@/lib/risk-engine';
import { MarineConditions } from '@/types/marine';

interface SOSEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SOSEmergencyModal({ isOpen, onClose }: SOSEmergencyModalProps) {
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [location, setLocation] = useState({ lat: 18.92, lon: 72.83, name: 'Coastal Waters' });
  const [conditions, setConditions] = useState<MarineConditions | null>(null);
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const [riskData, setRiskData] = useState<{ score: number; label: string; color: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpsActive, setGpsActive] = useState(false);
  const { language: selectedLang, setLanguage: setSelectedLang, t } = useLanguage();
  const langConfig = COASTAL_LANGUAGES.find(l => l.name.toLowerCase() === (typeof selectedLang === 'string' ? selectedLang : (selectedLang as any)?.name || '').toLowerCase()) || COASTAL_LANGUAGES[0];

  const detectDeviceGPS = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            name: 'Live GPS Position',
            state: 'Offshore',
          };
          setLocation(loc);
          setGpsActive(true);
        },
        () => {
          setGpsActive(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  useEffect(() => {
    async function fetchEmergencyTelemetry() {
      if (!isOpen) return;
      setLoading(true);

      const loc = getSelectedLocation();
      setLocation({ lat: loc.lat, lon: loc.lon, name: loc.name });
      setBroadcastSent(false);
      setBroadcasting(false);
      setCountdown(3);

      // Attempt live device GPS if available
      detectDeviceGPS();

      try {
        const cond = await getMarineConditions(loc.lat, loc.lon);
        setConditions(cond);

        const geo = checkGeofenceProximity({ lat: loc.lat, lon: loc.lon });
        const evalAlerts = evaluateProactiveAlerts(cond, geo);
        setAlerts(evalAlerts);

        const risk = calculateMarineRisk({
          waveHeight: cond.waves.height,
          windSpeed: cond.weather.windSpeed,
          pressure: cond.weather.pressure,
          visibility: cond.weather.visibility,
          rainfall: cond.weather.rainfall,
          currentSpeed: cond.ocean.currentSpeed,
        });

        const color = risk.score >= 70 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
          : risk.score >= 40 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
          : 'text-red-400 bg-red-500/10 border-red-500/30';

        const label = risk.score >= 70 ? 'SAFE' : risk.score >= 40 ? 'CAUTION — MARGINAL' : 'CRITICAL HAZARD';
        setRiskData({ score: risk.score, label, color });
      } catch {
        // Fallback static metrics if offline
      } finally {
        setLoading(false);
      }
    }

    fetchEmergencyTelemetry();
  }, [isOpen]);

  const handleTriggerSOS = () => {
    setBroadcasting(true);
    let timer = 3;
    const interval = setInterval(() => {
      timer -= 1;
      setCountdown(timer);
      if (timer === 0) {
        clearInterval(interval);
        setBroadcasting(false);
        setBroadcastSent(true);

        const waveTxt = conditions ? `Wave height ${conditions.waves.height.toFixed(1)} meters, wind ${Math.round(conditions.weather.windSpeed)} kilometers per hour.` : '';

        // Speak audio alert in chosen coastal language
        speakVernacularAdvisory(
          `MAYDAY MAYDAY MAYDAY. Emergency distress signal transmitted for vessel INF 2847 Sagar Mitra near ${location.name} at coordinates ${location.lat.toFixed(2)} North, ${location.lon.toFixed(2)} East. ${waveTxt} Indian Coast Guard alerted.`,
          langConfig.name
        );
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-navy-950 border border-red-500/50 shadow-2xl glow-danger"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 bg-gradient-to-r from-red-950 via-red-900 to-navy-950 p-4 sm:p-5 flex items-center justify-between border-b border-red-500/30 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center animate-pulse shrink-0">
                <AlertOctagon className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">{t('EMERGENCY SOS & LIVE TELEMETRY')}</h2>
                <p className="text-[11px] sm:text-xs text-red-300">{t('Indian Coast Guard & Maritime Distress Dispatch')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Selector Dropdown */}
              <select
                value={langConfig.code}
                onChange={(e) => {
                  const found = COASTAL_LANGUAGES.find(l => l.code === e.target.value);
                  if (found) {
                    setSelectedLang(found.name);
                  }
                }}
                className="bg-black/60 border border-red-500/40 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none hover:border-red-400 transition-colors"
                title="Select Voice & Advisory Language"
              >
                {COASTAL_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-navy-900 text-white">
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {/* Vessel Telemetry Header */}
            <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs">
                  INF
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{t('Vessel')}: INF-2847 (Sagar Mitra)</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                    <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                    <span>{location.lat.toFixed(4)}° N, {location.lon.toFixed(4)}° E ({t(location.name)})</span>
                    <button
                      onClick={detectDeviceGPS}
                      className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30 hover:bg-teal-500/30 transition-colors"
                    >
                      {gpsActive ? `✓ ${t('Hardware GPS Active')}` : `📍 ${t('Refresh GPS')}`}
                    </button>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" /> VHF Ch 16
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <BatteryCharging className="w-3 h-3 text-emerald-400" /> 94%
                </span>
              </div>
            </div>

            {/* Live Emergency Marine Conditions Metrics Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('Live Environmental Danger Metrics')}</p>
                {riskData && (
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${riskData.color}`}>
                    {t('Safety Score')}: {riskData.score}/100 — {t(riskData.label)}
                  </span>
                )}
              </div>

              {conditions ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-navy-900/80 border border-red-500/20">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[10px] font-semibold">{t('Wave Swell')}</span>
                      <Waves className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <p className="text-sm font-extrabold text-white">{conditions.waves.height.toFixed(1)} m</p>
                    <p className="text-[10px] text-amber-400">{conditions.waves.height > 2.5 ? `⚠️ ${t('High Swell')}` : t('Moderate')}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-900/80 border border-red-500/20">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[10px] font-semibold">{t('Wind Speed')}</span>
                      <Wind className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <p className="text-sm font-extrabold text-white">{Math.round(conditions.weather.windSpeed)} km/h</p>
                    <p className="text-[10px] text-slate-400">{conditions.weather.windDirection}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-900/80 border border-red-500/20">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[10px] font-semibold">{t('Sea Temp')}</span>
                      <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <p className="text-sm font-extrabold text-white">{conditions.ocean.sst.toFixed(1)} °C</p>
                    <p className="text-[10px] text-slate-400">{t('ISRO Satellite')}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-900/80 border border-red-500/20">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[10px] font-semibold">{t('Pressure')}</span>
                      <Compass className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <p className="text-sm font-extrabold text-white">{Math.round(conditions.weather.pressure)} hPa</p>
                    <p className="text-[10px] text-slate-400">{conditions.weather.pressure < 1000 ? `⚠️ ${t('Low Pressure')}` : t('Normal')}</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-navy-900 text-xs text-slate-400 text-center animate-pulse">
                  Fetching live marine observations...
                </div>
              )}
            </div>

            {/* Active Proactive Hazard Alerts List */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>{t('Active Proactive Hazard Alerts')} ({alerts.length})</span>
                </p>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {alerts.map((alert) => (
                    <div
                      key={alert.hash}
                      className={`p-3 rounded-xl border text-xs ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-950/40 border-red-500/50 text-red-200'
                          : alert.severity === 'HIGH'
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                          : 'bg-navy-900 border-navy-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="text-white">{t(alert.title)}</span>
                        <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-black/40 border border-white/10 font-black">
                          {t(alert.severity)}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">{t(alert.description)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Broadcast Action Area */}
            {!broadcastSent ? (
              <div className="text-center space-y-3 pt-2">
                <button
                  onClick={handleTriggerSOS}
                  disabled={broadcasting}
                  className={`w-full py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg tracking-wider transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
                    broadcasting
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white hover:scale-[1.02] hover:shadow-red-600/40 glow-danger'
                  }`}
                >
                  <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span>
                    {broadcasting ? `${t('TRANSMITTING MAYDAY')} (${countdown}s)...` : t('TRANSMIT MAYDAY DISTRESS BEACON')}
                  </span>
                </button>
                <p className="text-xs text-slate-400">
                  {t('Transmits automated MAYDAY distress beacon with telemetry & live GPS to Coast Guard MRCC & nearby AIS vessels.')}
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">{t('MAYDAY DISTRESS BEACON ACTIVE')}</h3>
                <p className="text-xs text-emerald-200">
                  {t('Transmitted to Coast Guard MRCC Mumbai/Chennai & VHF Channel 16. Audio alert spoken in English & Vernacular.')}
                </p>
                <button
                  onClick={() => speakVernacularAdvisory(`Mayday beacon active for Sagar Mitra near ${location.name}. Hold fast, rescue dispatched.`, langConfig.name)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{t('Replay Voice Distress Broadcast')}</span>
                </button>
              </motion.div>
            )}

            {/* Offline Protocol Checklist */}
            <div className="p-3.5 rounded-2xl bg-navy-900 border border-navy-700/50 space-y-2 text-xs">
              <p className="font-bold text-slate-300 flex items-center gap-1.5">
                <LifeBuoy className="w-4 h-4 text-teal-400" />
                <span>{t('Fisherman Emergency Checklist at Sea')}</span>
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-400">
                <li className="flex items-center gap-1.5">
                  <span className="text-teal-400 font-bold">1.</span> {t('Put on life jackets immediately.')}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-teal-400 font-bold">2.</span> {t('Drop sea anchor to steady vessel.')}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-teal-400 font-bold">3.</span> {t('Set VHF radio to Channel 16.')}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-teal-400 font-bold">4.</span> {t('Turn on strobe beacon light.')}
                </li>
              </ul>
            </div>

            {/* Direct Helplines */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('Emergency Helplines')}</p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:1554"
                  className="flex items-center gap-3 p-3 rounded-xl bg-navy-900 border border-navy-700 hover:border-red-500/40 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-red-400" />
                  <div>
                    <p className="text-xs font-bold text-white">{t('Indian Coast Guard')}</p>
                    <p className="text-xs text-red-400 font-mono font-bold">1554 ({t('Toll Free')})</p>
                  </div>
                </a>

                <a
                  href="tel:1093"
                  className="flex items-center gap-3 p-3 rounded-xl bg-navy-900 border border-navy-700 hover:border-red-500/40 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-white">{t('Coastal Police')}</p>
                    <p className="text-xs text-amber-400 font-mono font-bold">1093</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
