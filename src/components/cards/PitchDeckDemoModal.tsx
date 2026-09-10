'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Trophy, Bot, Shield, Waves, MapPin,
  Volume2, WifiOff, ArrowRight, Anchor, Fish, Cpu, CheckCircle2
} from 'lucide-react';

interface PitchDeckDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PitchDeckDemoModal({ isOpen, onClose }: PitchDeckDemoModalProps) {
  const [slide, setSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Problem Statement & SIH Background',
      subtitle: 'Translating Complex Satellite Oceanography into Actionable Marine Guidance',
      icon: Anchor,
      content: (
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-teal-500/30 space-y-2">
            <h4 className="font-bold text-teal-400 text-sm flex items-center gap-2">
              <span>🌊 The Marine Data Challenge</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Every day, ISRO MOSDAC and global oceanographic agencies generate vast streams of Sea Surface Temperature (SST), Chlorophyll-a, wave heights, and weather forecasts. However, traditional raw data remains complex and inaccessible to local fishermen operating at sea.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-card border border-navy-700/40 space-y-1">
              <span className="text-teal-400 font-bold block">Objective</span>
              <p className="text-slate-300 text-[11px]">Deliver an intelligent agentic AI platform that synthesizes satellite observations into natural, evidence-backed fishing & route advisories.</p>
            </div>
            <div className="p-3 rounded-xl bg-card border border-navy-700/40 space-y-1">
              <span className="text-cyan-400 font-bold block">Key Innovation</span>
              <p className="text-slate-300 text-[11px]">5-Agent architecture, deterministic zero-hallucination risk scoring, AI map control, 9 vernacular Indian voice languages, and offline PWA.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Target 5-Agent Architecture',
      subtitle: 'Specialized Multi-Agent Coordination with Zod Output Schemas',
      icon: Bot,
      content: (
        <div className="space-y-3 text-xs">
          <p className="text-slate-300">
            JalSaathi coordinates 5 dedicated specialized agents to analyze marine conditions:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-navy-900/80 border border-teal-500/30 flex items-start gap-2">
              <Cpu className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">1. Orchestrator Agent</span>
                <p className="text-slate-400">Classifies intent, parses location/language & routes work</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-navy-900/80 border border-teal-500/30 flex items-start gap-2">
              <Fish className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">2. Ocean/PFZ Agent</span>
                <p className="text-slate-400">Evaluates ISRO MOSDAC SST, Chlorophyll-a & PFZ suitability</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-navy-900/80 border border-teal-500/30 flex items-start gap-2">
              <Waves className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">3. Weather/Hazard Agent</span>
                <p className="text-slate-400">Monitors wind, waves, cyclones & IMD port bulletins</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-navy-900/80 border border-teal-500/30 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">4. GIS/Navigation Agent</span>
                <p className="text-slate-400">Calculates distances, IMBL geofencing & map action payloads</p>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400 shrink-0" />
            <span>5. Safety/Decision Agent: Evaluates deterministic Marine Risk Scoring Engine (0-100).</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Deterministic Risk Engine (Zero Hallucinations)',
      subtitle: 'Strict Safety Scoring & Missing Data Confidence Penalties',
      icon: Shield,
      content: (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-navy-900/80 border border-teal-500/30 space-y-2">
            <h4 className="font-bold text-emerald-400 text-sm">Formula Weight Breakdown</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-lg bg-card border border-navy-700/40">
                <span className="text-slate-400 block">Waves</span>
                <span className="font-bold text-white">30%</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-navy-700/40">
                <span className="text-slate-400 block">Wind</span>
                <span className="font-bold text-white">25%</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-navy-700/40">
                <span className="text-slate-400 block">Currents</span>
                <span className="font-bold text-white">15%</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-navy-700/40">
                <span className="text-slate-400 block">Storms</span>
                <span className="font-bold text-white">15%</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-navy-700/40">
                <span className="text-slate-400 block">Geofence</span>
                <span className="font-bold text-white">10%</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-navy-700/40">
                <span className="text-slate-400 block">Traffic</span>
                <span className="font-bold text-white">5%</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-2 text-amber-300">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span><strong>Confidence Penalty:</strong> Missing core parameters drops confidence below 60% and caps status to CAUTION.</span>
            </div>
            <div className="flex items-center gap-2 text-red-300">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span><strong>Hazard Overrides:</strong> Cyclone alerts or waves ≥4m force immediate AVOID status regardless of other metrics.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'AI Map Actions & Vernacular Voice',
      subtitle: 'Controlling Leaflet Maps & 9 Coastal Indian Speech Languages',
      icon: Volume2,
      content: (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-card border border-navy-700/40 space-y-1.5">
              <span className="text-teal-400 font-bold block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> AI Map Actions
              </span>
              <p className="text-slate-300 text-[11px]">
                The AI orchestrator emits structured MapAction payloads (<code className="text-teal-300 font-mono">highlight_pfz</code>, <code className="text-teal-300 font-mono">draw_route</code>, <code className="text-teal-300 font-mono">show_geofence</code>) driving live Leaflet map rendering.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-card border border-navy-700/40 space-y-1.5">
              <span className="text-cyan-400 font-bold block flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> Vernacular Voice
              </span>
              <p className="text-slate-300 text-[11px]">
                Supports speech synthesis and recognition in 9 coastal Indian languages: English, Hindi, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Bengali.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-navy-900/80 border border-teal-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-300">PWA Offline Caching (`sw.js`) active for deep sea connectivity loss.</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[9px]">PWA Ready</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Business Impact & Blue Economy Scale',
      subtitle: 'Enhancing Livelihoods, Safety & Marine Operations across India',
      icon: Trophy,
      content: (
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/10 border border-teal-500/30 text-center space-y-2">
            <h4 className="text-base font-bold text-white">Empowering Indian Coastal Communities</h4>
            <p className="text-slate-300 text-xs max-w-md mx-auto">
              JalSaathi bridges satellite oceanography with artisanal and commercial fishermen, reducing vessel fuel consumption by up to 25% while saving lives in hazardous sea conditions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-card border border-navy-700/40">
              <span className="text-xl font-bold text-teal-400">11</span>
              <span className="text-[10px] text-slate-400 block uppercase">Coastal Sectors</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-navy-700/40">
              <span className="text-xl font-bold text-cyan-400">9</span>
              <span className="text-[10px] text-slate-400 block uppercase">Languages</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-navy-700/40">
              <span className="text-xl font-bold text-emerald-400">100%</span>
              <span className="text-[10px] text-slate-400 block uppercase">Offline Capable</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const CurrentIcon = slides[slide].icon;

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-2xl border border-teal-500/40 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 p-6 space-y-5 shadow-2xl glow-teal text-white relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy-700/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-navy-950 font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block font-bold">
                SIH Presentation Mode (Slide {slide + 1}/5)
              </span>
              <h2 className="text-base font-bold text-white">{slides[slide].title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-navy-800/60 hover:bg-navy-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-teal-300/80 font-medium italic">{slides[slide].subtitle}</p>

        {/* Slide Content */}
        <div className="min-h-[220px]">{slides[slide].content}</div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-navy-700/40">
          <button
            onClick={() => setSlide(prev => Math.max(0, prev - 1))}
            disabled={slide === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              slide === 0
                ? 'opacity-30 cursor-not-allowed bg-navy-800 text-slate-500'
                : 'bg-navy-800 hover:bg-navy-700 text-slate-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === slide ? 'bg-teal-400 w-6' : 'bg-navy-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {slide < slides.length - 1 ? (
            <button
              onClick={() => setSlide(prev => Math.min(slides.length - 1, prev + 1))}
              className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-teal-500 text-navy-950 font-bold hover:bg-teal-400 transition-all text-xs"
            >
              <span>Next Slide</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 font-bold hover:shadow-lg transition-all text-xs"
            >
              <span>Launch Live App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
