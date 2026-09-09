'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CloudSun, Fish, Route, Languages, ArrowRight, Anchor, Waves, Wind, ChevronDown, Zap, Shield, Globe, BarChart3 } from 'lucide-react';

const AGENTS = [
  { icon: CloudSun, title: 'Weather Agent', desc: 'Understands storms, wind and waves.', color: 'from-blue-500 to-cyan-500' },
  { icon: Fish, title: 'Fish Zone Agent', desc: 'Identifies areas with favorable marine conditions.', color: 'from-teal-500 to-emerald-500' },
  { icon: Route, title: 'Safe Route Agent', desc: 'Finds safer and more efficient routes.', color: 'from-violet-500 to-blue-500' },
  { icon: Languages, title: 'Language Agent', desc: 'Explains complex ocean data in your language.', color: 'from-amber-500 to-orange-500' },
];

const FLOW_STEPS = [
  { label: 'Fisherman question', icon: '🎣' },
  { label: 'Orchestrator', icon: '🧠' },
  { label: 'Specialist agents', icon: '⚡' },
  { label: 'Marine data sources', icon: '🌊' },
  { label: 'AI reasoning', icon: '🔬' },
  { label: 'Simple answer', icon: '✅' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center ocean-gradient-animated">
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => {
            // Deterministic pseudo-random values seeded from index — same on server & client
            const left = ((i * 37 + 11) % 97);
            const top  = ((i * 53 + 7)  % 93);
            const duration = 4 + (i % 5);
            const delay    = (i * 0.3) % 3;
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-teal-400/20"
                style={{ left: `${left}%`, top: `${top}%` }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay,
                }}
              />
            );
          })}
        </div>

        {/* Wave lines */}
        <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden">
          <svg viewBox="0 0 1440 200" className="absolute bottom-0 w-full opacity-10">
            <motion.path
              d="M0,100 C360,180 720,20 1080,100 C1260,140 1380,80 1440,100 L1440,200 L0,200 Z"
              fill="url(#waveGrad)"
              animate={{ d: [
                "M0,100 C360,180 720,20 1080,100 C1260,140 1380,80 1440,100 L1440,200 L0,200 Z",
                "M0,120 C360,40 720,160 1080,80 C1260,120 1380,60 1440,120 L1440,200 L0,200 Z",
                "M0,100 C360,180 720,20 1080,100 C1260,140 1380,80 1440,100 L1440,200 L0,200 Z",
              ]}}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-sm text-teal-300 font-medium">AI-Powered Marine Intelligence</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-4"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center glow-teal">
                <Anchor className="w-9 h-9 text-navy-950" />
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight mb-3">
              ORCA
            </h1>
            <p className="text-xl md:text-2xl text-teal-300 font-light italic">
              Your intelligent companion at sea.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI-powered ocean intelligence helping fishermen understand the sea, find promising fishing zones, plan safer routes, and make better decisions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 font-bold rounded-2xl text-lg hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105"
            >
              Launch ORCA
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-2 px-8 py-4 glass text-white font-semibold rounded-2xl text-lg hover:bg-white/10 transition-all duration-300"
            >
              <Globe className="w-5 h-5" />
              Explore the Ocean
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-slate-500 animate-bounce" />
        </motion.div>
      </section>

      {/* Agents Section */}
      <section className="relative py-24 px-6 bg-navy-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm text-teal-400 uppercase tracking-widest font-semibold mb-3">
              Intelligence Architecture
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold text-white mb-4">
              One ocean. Four intelligent agents.
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-400 max-w-2xl mx-auto">
              ORCA combines specialized AI agents that work together to analyze different aspects of the ocean and provide actionable insights.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AGENTS.map((agent, i) => (
              <motion.div
                key={agent.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 3}
                className="group rounded-2xl border border-navy-600/30 bg-card p-6 hover:border-teal-500/30 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <agent.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{agent.title}</h3>
                <p className="text-sm text-slate-400">{agent.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm text-teal-400 uppercase tracking-widest font-semibold mb-3">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powered by the ORCA Intelligence Engine
            </motion.h2>
          </motion.div>

          <div className="flex flex-col items-center gap-0">
            {FLOW_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="flex flex-col items-center"
              >
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl glass border border-navy-600/30 hover:border-teal-500/30 transition-all">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="text-sm font-semibold text-white">{step.label}</span>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <div className="w-px h-8 bg-gradient-to-b from-teal-500/50 to-transparent my-1" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="relative py-24 px-6 bg-navy-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h3 variants={fadeUp} custom={0} className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🌊</span> The Problem
              </motion.h3>
              <motion.div variants={fadeUp} custom={1} className="space-y-4">
                <p className="text-slate-400">The ocean is unpredictable. Fishermen often have fragmented weather, ocean and fishing information scattered across multiple sources.</p>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <p className="text-sm text-slate-300 font-mono">&quot;Significant wave height 2.7m, swell period 10s, wind 28km/h SW, pressure 1006hPa falling...&quot;</p>
                  <p className="text-xs text-red-400 mt-2">Complex. Fragmented. Hard to act on.</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h3 variants={fadeUp} custom={0} className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🐋</span> The Solution
              </motion.h3>
              <motion.div variants={fadeUp} custom={1} className="space-y-4">
                <p className="text-slate-400">ORCA brings it all together. Multiple specialized AI agents analyze different parts of the ocean and deliver simple, actionable answers.</p>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-sm text-white font-medium">⚠️ &quot;Conditions are becoming rough. It is safer to return before 6 PM.&quot;</p>
                  <p className="text-xs text-emerald-400 mt-2">Simple. Clear. Actionable.</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="py-16 px-6 border-t border-navy-700/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Zap, label: 'Real-time Data', value: 'Multi-source' },
              { icon: Shield, label: 'Safety First', value: 'Risk scoring' },
              { icon: BarChart3, label: 'AI Analysis', value: 'Multi-agent' },
              { icon: Globe, label: 'Languages', value: '9 supported' },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="text-center"
              >
                <f.icon className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                <p className="text-lg font-bold text-white">{f.value}</p>
                <p className="text-sm text-slate-500">{f.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-navy-700/20 text-center">
        <p className="text-sm text-slate-500">
          ORCA — The Ocean Helper • Real-time ocean intelligence. Safer journeys. Smarter fishing.
        </p>
      </footer>
    </div>
  );
}
