'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Cpu, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { AgentTraceEvent } from '@/types/marine';

interface AgentTracePanelProps {
  trace?: AgentTraceEvent[];
}

export function AgentTracePanel({ trace }: AgentTracePanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!trace || trace.length === 0) return null;

  return (
    <div className="rounded-xl border border-navy-700/30 bg-navy-950/40 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2 font-mono">
          <Cpu className="w-3.5 h-3.5 text-teal-400" />
          <span>AI Agent Execution Trace ({trace.length} Steps)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Real Execution Log
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-navy-700/20 px-4 py-3 space-y-2.5 bg-navy-950/70 text-xs"
          >
            {trace.map((evt) => (
              <div key={evt.step} className="p-2.5 rounded-lg bg-card/60 border border-navy-700/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <span className="text-[10px] font-mono text-teal-400">Step {evt.step}</span>
                    <span>{evt.agentName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{evt.durationMs}ms</span>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>

                <p className="text-slate-300 text-[11px]">{evt.summary}</p>

                {evt.toolsCalled.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <Wrench className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="text-[10px] text-slate-500 uppercase">Tools Invoked:</span>
                    {evt.toolsCalled.map((tool) => (
                      <span
                        key={tool}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      >
                        {tool}()
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
