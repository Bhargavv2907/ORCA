'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Anchor, CloudSun, Fish, Route, Languages, Shield, Globe, Zap, Heart } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

export default function AboutPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
        <div className="mx-auto mb-6 flex justify-center">
          <img src="/logo.jpg" alt="JalSaathi Logo" className="w-24 h-24 rounded-3xl object-cover shadow-xl border-2 border-teal-400/50 glow-teal" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">JalSaathi</h1>
        <p className="text-xl text-teal-300 italic mb-2">Your intelligent companion at sea.</p>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Real-time ocean intelligence. Safer journeys. Smarter fishing.
        </p>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-2xl border border-navy-600/20 bg-card p-6">
        <motion.h2 variants={fadeUp} custom={0} className="text-xl font-bold text-white mb-4">What is JalSaathi?</motion.h2>
        <motion.p variants={fadeUp} custom={1} className="text-slate-400 leading-relaxed">
          JalSaathi is an AI-powered marine intelligence and decision-support platform designed primarily for fishermen. It combines real-time and near-real-time marine weather, ocean conditions, fishing activity, vessel information, maps, and AI reasoning to answer fishermen&apos;s questions in simple language.
        </motion.p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-2xl border border-navy-600/20 bg-card p-6">
          <motion.h3 variants={fadeUp} custom={0} className="text-lg font-semibold text-white mb-4">Intelligence Architecture</motion.h3>
          <div className="space-y-3">
            {[
              { icon: CloudSun, name: 'Weather Agent', desc: 'Atmospheric conditions analysis' },
              { icon: Fish, name: 'Fish Zone Agent', desc: 'Fishing area identification' },
              { icon: Route, name: 'Route Agent', desc: 'Safe route planning' },
              { icon: Shield, name: 'Safety Agent', desc: 'Risk assessment' },
              { icon: Globe, name: 'Ocean Agent', desc: 'Ocean conditions evaluation' },
              { icon: Languages, name: 'Language Agent', desc: 'Multilingual translation' },
            ].map((agent, i) => (
              <motion.div key={agent.name} variants={fadeUp} custom={i + 1} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                  <agent.icon className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{agent.name}</p>
                  <p className="text-xs text-slate-500">{agent.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-2xl border border-navy-600/20 bg-card p-6">
          <motion.h3 variants={fadeUp} custom={0} className="text-lg font-semibold text-white mb-4">Core Principles</motion.h3>
          <div className="space-y-4">
            {[
              { icon: Zap, title: 'Collect → Understand → Reason', desc: 'JalSaathi doesn\'t just display data — it correlates, reasons, and recommends.' },
              { icon: Shield, title: 'Safety First', desc: 'Every recommendation prioritizes the safety of fishermen and their vessels.' },
              { icon: Globe, title: 'Accessible Intelligence', desc: 'Complex ocean data explained in simple language, in 9 regional languages.' },
              { icon: Heart, title: 'Built for Communities', desc: 'Designed for fishermen, coastal communities, and marine researchers.' },
            ].map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i + 1} className="flex items-start gap-3">
                <item.icon className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center py-8 border-t border-navy-700/20">
        <p className="text-sm text-slate-500 mb-2">JalSaathi — The Ocean Helper</p>
        <p className="text-xs text-slate-600">Built with Next.js, TypeScript, and AI • Powered by open marine data</p>
      </motion.div>
    </div>
  );
}
