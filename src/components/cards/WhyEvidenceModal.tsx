'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Database, Shield, AlertTriangle, CheckCircle, Activity, Bot } from 'lucide-react';
import { EvidencePayload } from '@/types/marine';

interface WhyEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence?: EvidencePayload;
}

export function WhyEvidenceModal({ isOpen, onClose, evidence }: WhyEvidenceModalProps) {
  if (!isOpen || !evidence) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-navy-900 border border-teal-500/30 p-6 space-y-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-navy-700/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Why This Recommendation?</h2>
                <p className="text-xs text-slate-400">Data provenance, risk component weights, and confidence proof.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Confidence Meter */}
          <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-teal-400" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Engine Confidence</p>
                <p className="text-sm font-bold text-white">{evidence.confidence}% Verified Precision</p>
              </div>
            </div>
            <div className="w-28 bg-navy-800 rounded-full h-2.5 overflow-hidden border border-navy-700">
              <div
                className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full"
                style={{ width: `${evidence.confidence}%` }}
              />
            </div>
          </div>

          {/* Raw Measurements Used */}
          <div className="space-y-3">
            <h3 className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-400" />
              Retrieved Satellite & Environmental Measurements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {evidence.measurements.map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-card border border-navy-700/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{m.metric}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                      m.status === 'live' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      m.status === 'cached' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {m.type} • {m.status}
                    </span>
                  </div>
                  <p className="text-base font-bold text-teal-300">
                    {m.value} {m.unit ?? ''}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Source: {m.source} | {new Date(m.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Factors Breakdown */}
          {evidence.riskFactors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400" />
                Deterministic Risk Engine Components
              </h3>
              <div className="space-y-2">
                {evidence.riskFactors.map((r) => (
                  <div key={r.name} className="p-3 rounded-xl bg-navy-800/40 border border-navy-700/20 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{r.name} (Weight: {r.weight}%)</span>
                      <span className={`font-mono font-bold ${
                        r.score >= 75 ? 'text-emerald-400' : r.score >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {r.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          r.score >= 75 ? 'bg-emerald-400' : r.score >= 50 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${r.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participating Agents */}
          <div className="flex items-center justify-between pt-2 border-t border-navy-700/20 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Bot className="w-4 h-4 text-teal-400" />
              <span>Participating Agents:</span>
              <div className="flex flex-wrap gap-1">
                {evidence.agentsInvolved.map((agent) => (
                  <span key={agent} className="px-2 py-0.5 rounded bg-navy-800 text-teal-300 font-mono text-[10px]">
                    {agent}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-teal-500 text-navy-950 font-bold rounded-xl text-xs hover:bg-teal-400 transition-colors"
            >
              Close Proof
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
