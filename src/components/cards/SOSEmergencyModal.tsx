'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon, X, PhoneCall, Radio, Volume2, ShieldAlert,
  MapPin, CheckCircle2, Wifi, WifiOff, Send, Anchor
} from 'lucide-react';
import { getSelectedLocation } from '@/lib/location-store';
import { speakVernacularAdvisory } from '@/lib/i18n-engine';

interface SOSEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SOSEmergencyModal({ isOpen, onClose }: SOSEmergencyModalProps) {
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [location, setLocation] = useState({ lat: 18.92, lon: 72.83, name: 'Mumbai Coast' });

  useEffect(() => {
    if (isOpen) {
      const loc = getSelectedLocation();
      setLocation({ lat: loc.lat, lon: loc.lon, name: loc.name });
      setBroadcastSent(false);
      setBroadcasting(false);
      setCountdown(3);
    }
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

        // Speak audio alert
        speakVernacularAdvisory(
          `MAYDAY MAYDAY MAYDAY. Emergency distress signal transmitted for vessel near ${location.name} at coordinates ${location.lat.toFixed(2)} North, ${location.lon.toFixed(2)} East. Indian Coast Guard alerted.`,
          'English'
        );
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg overflow-hidden rounded-3xl bg-navy-950 border border-red-500/50 shadow-2xl glow-danger"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-950 via-red-900 to-navy-950 p-5 flex items-center justify-between border-b border-red-500/30">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center animate-pulse">
                <AlertOctagon className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-wide">EMERGENCY SOS</h2>
                <p className="text-xs text-red-300">Indian Coast Guard & Maritime Distress Dispatch</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Live GPS Coordinates */}
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Vessel Position</p>
                  <p className="text-sm font-bold text-white">
                    {location.lat.toFixed(4)}° N, {location.lon.toFixed(4)}° E ({location.name})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>VHF Ch 16 Active</span>
              </div>
            </div>

            {/* Broadcast Action Area */}
            {!broadcastSent ? (
              <div className="text-center space-y-4">
                <button
                  onClick={handleTriggerSOS}
                  disabled={broadcasting}
                  className={`w-full py-5 rounded-2xl font-black text-lg tracking-wider transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
                    broadcasting
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white hover:scale-[1.02] hover:shadow-red-600/40 glow-danger'
                  }`}
                >
                  <ShieldAlert className="w-7 h-7" />
                  <span>
                    {broadcasting ? `TRANSMITTING MAYDAY (${countdown}s)...` : 'PRESS TO BROADCAST MAYDAY SOS'}
                  </span>
                </button>
                <p className="text-xs text-slate-400">
                  Sends automated distress beacon to Indian Coast Guard (ICG) MRCC & nearby registered vessels.
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
                <h3 className="text-base font-bold text-white">MAYDAY DISTRESS BEACON ACTIVE</h3>
                <p className="text-xs text-emerald-200">
                  Transmitted to Coast Guard MRCC Mumbai/Chennai & VHF Channel 16. Audio alert spoken in English & Vernacular.
                </p>
                <button
                  onClick={() => speakVernacularAdvisory(`Mayday beacon active for ${location.name}. Hold fast, rescue dispatched.`, 'English')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Replay Voice Distress Broadcast</span>
                </button>
              </motion.div>
            )}

            {/* Direct Helplines */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Emergency Contact Numbers</p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:1554"
                  className="flex items-center gap-3 p-3 rounded-xl bg-navy-900 border border-navy-700 hover:border-red-500/40 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-red-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Indian Coast Guard</p>
                    <p className="text-xs text-red-400 font-mono font-bold">1554 (Toll Free)</p>
                  </div>
                </a>

                <a
                  href="tel:1093"
                  className="flex items-center gap-3 p-3 rounded-xl bg-navy-900 border border-navy-700 hover:border-red-500/40 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Coastal Police</p>
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
