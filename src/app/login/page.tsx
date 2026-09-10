'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Lock, Mail, Shield, CheckCircle, Ship, MapPin,
  LogOut, Database, Compass, ArrowRight, Anchor, Radio, Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const {
    user,
    loading,
    isFirebaseConfigured,
    loginWithEmail,
    signUpWithEmail,
    loginWithDemo,
    logout,
    favoriteZones,
  } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (isRegister) {
        if (!email || !password || !name) {
          setMessage({ text: 'Please fill in all required fields.', type: 'error' });
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, name);
        setMessage({ text: 'Account created & logged in!', type: 'success' });
      } else {
        if (!email || !password) {
          setMessage({ text: 'Please enter your email and password.', type: 'error' });
          setIsSubmitting(false);
          return;
        }
        await loginWithEmail(email, password);
        setMessage({ text: 'Welcome back to JalSaathi!', type: 'success' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Authentication error.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6 text-teal-400">
        <Radio className="w-10 h-10 animate-spin mb-3" />
        <p className="text-sm font-semibold tracking-wide">Initializing JalSaathi Firebase Auth...</p>
      </div>
    );
  }

  // ---- Authenticated Profile View ----
  if (user) {
    return (
      <div className="min-h-screen bg-navy-950 text-slate-100 p-4 sm:p-8 pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-navy-900/80 border border-teal-500/30 rounded-3xl p-6 glass shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-1 flex items-center justify-center shadow-lg">
                <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
                  <User className="w-10 h-10 text-teal-300" />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">{user.displayName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-semibold uppercase tracking-wider">
                    {user.role || 'Navigator'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">{user.email}</p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5"><Ship className="w-4 h-4 text-amber-400" /> {user.vesselName || 'Sagar Mitra'}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-cyan-400" /> {user.homePort || 'Mumbai Port'}</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-all shadow"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Database & Sync Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-navy-900/60 border border-navy-700/40 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-teal-400" />
                <div>
                  <h3 className="text-xs font-bold text-white">Firestore Cloud Database</h3>
                  <p className="text-[11px] text-slate-400">
                    {isFirebaseConfigured ? 'Connected to Firebase Firestore Cloud' : 'Running in Offline / Local Sync Mode'}
                  </p>
                </div>
              </div>
              <span className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase',
                isFirebaseConfigured
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              )}>
                {isFirebaseConfigured ? 'LIVE FIREBASE' : 'LOCAL SYNC'}
              </span>
            </div>

            <div className="bg-navy-900/60 border border-navy-700/40 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-xs font-bold text-white">ISRO MOSDAC Live Session</h3>
                  <p className="text-[11px] text-slate-400">Authenticated user session active</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Stored Favorite Fishing Zones */}
          <div className="bg-navy-900/60 border border-navy-700/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-navy-700/40 pb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Anchor className="w-4 h-4 text-teal-400" />
                Saved Fishing Zones (Firestore Persistence)
              </h2>
              <span className="text-xs text-teal-300 font-mono">{favoriteZones.length} Saved</span>
            </div>

            {favoriteZones.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs space-y-1">
                <p>No saved fishing zones yet.</p>
                <p className="text-slate-500">Click on any fishing zone on the World Map to bookmark it to your account.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoriteZones.map((zone) => (
                  <div key={zone.id} className="p-3 rounded-xl bg-navy-950/80 border border-teal-500/30 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{zone.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        SST: {zone.sst}°C | Chl-a: {zone.chlorophyll} mg/m³
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
                      {zone.suitabilityScore}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- Login & Registration Screen ----
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 pb-24 md:pb-6">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            <img src="/logo.jpg" alt="JalSaathi Logo" className="w-16 h-16 rounded-2xl object-cover shadow-xl border border-teal-500/40" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">JalSaathi Mobile Portal</h1>
          <p className="text-xs text-slate-400">AI-Powered Marine Intelligence & Firebase Sync</p>
        </div>

        {/* Form Container */}
        <div className="bg-navy-900/80 border border-teal-500/30 rounded-3xl p-6 glass shadow-2xl space-y-5">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-navy-950 border border-navy-700/40 text-xs font-semibold">
            <button
              onClick={() => setIsRegister(false)}
              className={cn(
                'py-2 rounded-lg transition-all',
                !isRegister ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow' : 'text-slate-400'
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={cn(
                'py-2 rounded-lg transition-all',
                isRegister ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow' : 'text-slate-400'
              )}
            >
              Create Account
            </button>
          </div>

          {message && (
            <div className={cn(
              'p-3 rounded-xl text-xs font-medium border flex items-center gap-2',
              message.type === 'error' ? 'bg-red-500/10 text-red-300 border-red-500/30' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            )}>
              {message.type === 'error' ? <Shield className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Capt. Tanvi Sharma"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700/50 text-xs text-white placeholder-slate-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="navigator@jalsaathi-marine.isro"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700/50 text-xs text-white placeholder-slate-500 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700/50 text-xs text-white placeholder-slate-500 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-navy-950 font-extrabold text-xs tracking-wider uppercase hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Radio className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-navy-700/40 text-center">
            <button
              type="button"
              onClick={() => loginWithDemo('fisherman')}
              className="w-full py-2.5 px-4 rounded-xl bg-navy-950 hover:bg-navy-800 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>One-Click Demo Navigator Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
