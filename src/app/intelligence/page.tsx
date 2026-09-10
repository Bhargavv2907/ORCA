'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, User, Zap, Lightbulb, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { orchestrate, classifyQuery, AgentOutput } from '@/lib/orchestrator';
import { AgentCard, DemoModeBanner, RiskScore } from '@/components/cards';
import { Agent, AgentType, OrcaResponse } from '@/types/marine';
import { getMockAgents } from '@/data/mock-data';

const DEMO_QUERIES = [
  'Where should I go fishing tomorrow?',
  'Is it safe to sail today?',
  'Which route is safest to Zone A?',
  'What is the weather forecast?',
  'Will the waves increase tonight?',
];

type Stage = 'idle' | 'query' | 'orchestrating' | 'agents' | 'reasoning' | 'complete';

export default function IntelligencePage() {
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [agents, setAgents] = useState<Agent[]>(getMockAgents());
  const [agentOutputs, setAgentOutputs] = useState<Map<string, Record<string, unknown>>>(new Map());
  const [response, setResponse] = useState<OrcaResponse | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>([]);

  const runDemo = useCallback(async (q?: string) => {
    const question = q || query.trim();
    if (!question) return;

    setQuery(question);
    setStage('query');
    setAgentOutputs(new Map());
    setResponse(null);

    // Reset agents
    setAgents(getMockAgents());

    await new Promise(r => setTimeout(r, 800));
    setStage('orchestrating');

    // Classify query
    const classification = classifyQuery(question);
    setSelectedAgents(classification.agents);

    await new Promise(r => setTimeout(r, 1200));
    setStage('agents');

    // Run orchestrator
    const result = await orchestrate(
      question,
      (agentType: AgentType) => {
        setAgents(prev => prev.map(a =>
          a.id === agentType ? { ...a, status: 'running' as const } : a
        ));
      },
      (agentType: AgentType, output: AgentOutput) => {
        setAgents(prev => prev.map(a =>
          a.id === agentType ? { ...a, status: 'completed' as const } : a
        ));
        setAgentOutputs(prev => new Map(prev).set(agentType, output.data));
      },
    );

    await new Promise(r => setTimeout(r, 600));
    setStage('reasoning');

    await new Promise(r => setTimeout(r, 1000));
    setResponse(result);
    setStage('complete');
  }, [query]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-teal-400" />
            JalSaathi Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">Watch the multi-agent orchestration engine in action.</p>
        </div>
        <DemoModeBanner />
      </motion.div>

      {/* Query input */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-navy-600/20 bg-card p-6">
        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 block">User Query</label>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl bg-navy-800/50 border border-navy-700/30 focus-within:border-teal-500/40 transition-colors">
            <User className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runDemo()}
              placeholder="Type a question or select below..."
              className="bg-transparent text-white text-sm outline-none flex-1"
              disabled={stage !== 'idle' && stage !== 'complete'}
            />
          </div>
          <button
            onClick={() => runDemo()}
            disabled={!query.trim() || (stage !== 'idle' && stage !== 'complete')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            Run
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => runDemo(q)}
              className="text-xs px-3 py-1.5 rounded-lg border border-navy-600/20 text-slate-400 hover:text-white hover:border-teal-500/30 transition-all"
            >
              &quot;{q}&quot;
            </button>
          ))}
        </div>
      </motion.div>

      {/* Pipeline Visualization */}
      {stage !== 'idle' && (
        <div className="space-y-4">
          {/* Step 1: Query received */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-xs text-teal-400 uppercase tracking-wider font-semibold">User Query</p>
                <p className="text-white font-medium">&quot;{query}&quot;</p>
              </div>
              <span className="ml-auto text-emerald-400 text-lg">✓</span>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ChevronDown className="w-6 h-6 text-teal-400/50" />
            </motion.div>
          </div>

          {/* Step 2: Orchestrator */}
          <AnimatePresence>
            {(stage === 'orchestrating' || stage === 'agents' || stage === 'reasoning' || stage === 'complete') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'rounded-2xl border p-5 transition-all duration-500',
                  stage === 'orchestrating' ? 'border-cyan-500/30 bg-cyan-500/5 glow-ocean' : 'border-emerald-500/20 bg-emerald-500/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center',
                    stage === 'orchestrating' ? 'bg-cyan-500/20' : 'bg-emerald-500/20'
                  )}>
                    <Brain className={cn('w-5 h-5',
                      stage === 'orchestrating' ? 'text-cyan-400 animate-pulse' : 'text-emerald-400'
                    )} />
                  </div>
                  <div>
                    <p className="text-xs text-cyan-400 uppercase tracking-wider font-semibold">Orchestrator</p>
                    <p className="text-sm text-slate-300">
                      {stage === 'orchestrating' ? 'Analyzing query and selecting agents...' : `Selected ${selectedAgents.length} agents`}
                    </p>
                  </div>
                  {stage !== 'orchestrating' && <span className="ml-auto text-emerald-400 text-lg">✓</span>}
                  {stage === 'orchestrating' && (
                    <div className="ml-auto w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                {stage !== 'orchestrating' && selectedAgents.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex flex-wrap gap-2">
                    {selectedAgents.map((agent) => (
                      <span key={agent} className="text-xs px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                        ✓ {agent.charAt(0).toUpperCase() + agent.slice(1)} Agent
                      </span>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Arrow */}
          {(stage === 'agents' || stage === 'reasoning' || stage === 'complete') && (
            <div className="flex justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ChevronDown className="w-6 h-6 text-teal-400/50" />
              </motion.div>
            </div>
          )}

          {/* Step 3: Agents */}
          {(stage === 'agents' || stage === 'reasoning' || stage === 'complete') && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">Agent Outputs</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.filter(a => selectedAgents.includes(a.id)).map((agent, i) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    index={i}
                    data={agentOutputs.get(agent.id) as Record<string, unknown> | undefined}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Arrow */}
          {(stage === 'reasoning' || stage === 'complete') && (
            <div className="flex justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ChevronDown className="w-6 h-6 text-teal-400/50" />
              </motion.div>
            </div>
          )}

          {/* Step 4: Reasoning & Response */}
          {stage === 'reasoning' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5 glow-ocean"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-cyan-400 uppercase tracking-wider font-semibold">Final Reasoning</p>
                  <p className="text-sm text-slate-300">Combining agent outputs and generating response...</p>
                </div>
                <div className="ml-auto w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            </motion.div>
          )}

          {stage === 'complete' && response && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 glow-safe"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">Final Reasoning</p>
                  <p className="text-xs text-slate-400">Confidence: {response.confidence}%</p>
                </div>
                <span className="ml-auto text-emerald-400 text-lg">✓</span>
              </div>

              <div className="grid md:grid-cols-[1fr,auto] gap-6">
                <div className="space-y-4">
                  {/* Safety */}
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold',
                    response.safetyStatus.status === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400' :
                    response.safetyStatus.status === 'MODERATE' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                  )}>
                    {response.safetyStatus.label} ({response.safetyStatus.overall}/100)
                  </div>

                  {/* Reasoning bullets */}
                  <ul className="space-y-1.5">
                    {response.reasoning.map((r, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="text-sm text-slate-300 flex items-start gap-2"
                      >
                        <span className="text-teal-400 mt-0.5">•</span><span>{r}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Recommendation */}
                  <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/15">
                    <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">Recommendation</p>
                    <p className="text-sm text-white">{response.recommendation}</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <RiskScore score={response.safetyStatus.overall} size="lg" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Idle state */}
      {stage === 'idle' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400/10 to-cyan-500/10 border border-teal-500/20 flex items-center justify-center mb-6">
            <Brain className="w-10 h-10 text-teal-400/60" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Multi-Agent Intelligence Engine</h2>
          <p className="text-sm text-slate-400 max-w-md mb-4">
            Type a question or select an example above to watch the JalSaathi orchestration pipeline in action.
          </p>
          <p className="text-xs text-slate-500">
            Query → Orchestrator → Agent Selection → Data Analysis → Reasoning → Answer
          </p>
        </motion.div>
      )}
    </div>
  );
}
