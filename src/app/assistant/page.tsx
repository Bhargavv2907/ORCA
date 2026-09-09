'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Globe, Bot, User, Shield, Lightbulb, Database, Loader2, Anchor, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { orchestrate, AgentOutput } from '@/lib/orchestrator';
import { ChatMessage, AgentType, EvidencePayload, WhatIfComparisonPayload } from '@/types/marine';
import { DemoModeBanner, AgentTracePanel, WhyEvidenceModal, WhatIfComparisonCard, MissionPlannerCard } from '@/components/cards';

const EXAMPLE_QUESTIONS = [
  'Where is the nearest Potential Fishing Zone (PFZ) today?',
  'Is it safe to go fishing tomorrow morning?',
  'What are current weather and sea conditions?',
  'Are there any lightning or cyclone alerts?',
  'Which route is safest to the fishing zone?',
  'Is this area restricted or dangerous?',
  'What if I leave at 5 AM tomorrow?',
  'Why is Zone A recommended?',
];

const LANGUAGES = [
  'English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeAgents, setActiveAgents] = useState<Set<AgentType>>(new Set());
  const [completedAgents, setCompletedAgents] = useState<Set<AgentType>>(new Set());
  const [activeEvidence, setActiveEvidence] = useState<EvidencePayload | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get('q');
      if (initialQuery) {
        handleSend(initialQuery);
      }
    }
  }, []);

  const handleSend = async (question?: string) => {
    const q = question || input.trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setActiveAgents(new Set());
    setCompletedAgents(new Set());

    try {
      const response = await orchestrate(
        q,
        (agent: AgentType) => setActiveAgents(prev => new Set(prev).add(agent)),
        (agent: AgentType, _output: AgentOutput) => {
          setActiveAgents(prev => { const s = new Set(prev); s.delete(agent); return s; });
          setCompletedAgents(prev => new Set(prev).add(agent));
        },
      );

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.recommendation,
        timestamp: response.timestamp,
        agentsUsed: response.agentsUsed,
        safetyStatus: response.safetyStatus,
        reasoning: response.reasoning,
        recommendation: response.recommendation,
        dataSources: response.dataSources,
        executionTrace: response.executionTrace,
        evidence: response.evidence,
        whatIfComparison: response.whatIfComparison,
        missionPlan: response.missionPlan,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your question. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setActiveAgents(new Set());
      setCompletedAgents(new Set());
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] lg:h-screen">
      {/* Header */}
      <div className="shrink-0 border-b border-navy-700/20 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-navy-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Ask ORCA</h1>
              <p className="text-xs text-slate-400">Ask anything about the sea.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DemoModeBanner />
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs text-slate-300 hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                {language}
              </button>
              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-40 py-2 rounded-xl glass border border-navy-600/30 z-50"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-sm hover:bg-white/5 transition-colors',
                          lang === language ? 'text-teal-400' : 'text-slate-400'
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[50vh] text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400/20 to-cyan-500/20 flex items-center justify-center mb-6 border border-teal-500/20">
                <Anchor className="w-10 h-10 text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ask ORCA</h2>
              <p className="text-slate-400 mb-8 max-w-md">
                Ask anything about ocean conditions, fishing zones, weather forecasts, or route safety.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {EXAMPLE_QUESTIONS.map((q, i) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => handleSend(q)}
                    className="text-left text-sm text-slate-400 hover:text-white p-3 rounded-xl border border-navy-600/20 bg-card hover:border-teal-500/30 hover:bg-card-hover transition-all"
                  >
                    &quot;{q}&quot;
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-navy-950" />
                </div>
              )}
              <div className={cn(
                'rounded-2xl max-w-[85%] md:max-w-[75%]',
                msg.role === 'user'
                  ? 'bg-teal-500/15 border border-teal-500/20 px-4 py-3'
                  : 'bg-card border border-navy-600/20 px-5 py-4'
              )}>
                {msg.role === 'user' ? (
                  <p className="text-sm text-white">{msg.content}</p>
                ) : (
                  <div className="space-y-4">
                    {/* Safety Status */}
                    {msg.safetyStatus && (
                      <div className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold',
                        msg.safetyStatus.status === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400' :
                        msg.safetyStatus.status === 'MODERATE' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                      )}>
                        <Shield className="w-4 h-4" />
                        Safety: {msg.safetyStatus.label} ({msg.safetyStatus.overall}/100)
                      </div>
                    )}

                    {/* Reasoning */}
                    {msg.reasoning && msg.reasoning.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Analysis</p>
                        <ul className="space-y-1.5">
                          {msg.reasoning.map((r, i) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-teal-400 mt-0.5">•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendation */}
                    {msg.recommendation && (
                      <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/15 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-teal-400" />
                            <span className="text-xs text-teal-400 font-semibold uppercase tracking-wider">Recommendation</span>
                          </div>
                          {msg.evidence && (
                            <button
                              onClick={() => setActiveEvidence(msg.evidence!)}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-[10px] text-teal-300 border border-teal-500/20 transition-colors font-medium"
                            >
                              <HelpCircle className="w-3 h-3" />
                              Why? (View Proof)
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-white">{msg.recommendation}</p>
                      </div>
                    )}

                    {/* Agent Trace Panel */}
                    {msg.executionTrace && msg.executionTrace.length > 0 && (
                      <AgentTracePanel trace={msg.executionTrace} />
                    )}

                    {/* What-If Scenario Comparison Card */}
                    {msg.whatIfComparison && (
                      <WhatIfComparisonCard comparison={msg.whatIfComparison} />
                    )}

                    {/* Flagship Fishing Mission Planner Card */}
                    {msg.missionPlan && (
                      <MissionPlannerCard
                        mission={msg.missionPlan}
                        onOpenWhy={() => setActiveEvidence(msg.evidence || null)}
                      />
                    )}

                    {/* Structured Data */}
                    {msg.structuredData && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(msg.structuredData).map(([key, val]) => (
                            <div key={key} className="px-3 py-2 rounded-lg bg-navy-800/50 border border-navy-700/20">
                              <p className="text-[10px] text-slate-500 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="text-sm font-semibold text-white">{String(val)}{typeof val === 'number' && (key.includes('Score') || key.includes('suitability')) ? '%' : ''}</p>
                            </div>
                          ))}
                        </div>
                        {Boolean((msg.structuredData as Record<string, unknown>).mapAction) && (
                          <a
                            href={`/map?action=${encodeURIComponent(String((msg.structuredData as Record<string, unknown>).mapAction))}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-xs font-semibold text-teal-300 border border-teal-500/30 transition-colors"
                          >
                            🗺️ View AI Map Action ({String((msg.structuredData as Record<string, unknown>).mapAction)})
                          </a>
                        )}
                      </div>
                    )}

                    {/* Data Sources */}
                    {msg.dataSources && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Database className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Data:</span>
                        {msg.dataSources.map((src) => (
                          <span key={src} className="text-[10px] px-2 py-0.5 rounded-full bg-navy-700/30 text-slate-400">{src}</span>
                        ))}
                      </div>
                    )}

                    {/* Agents Used */}
                    {msg.agentsUsed && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {msg.agentsUsed.map((agent) => (
                          <span key={agent.id} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ✓ {agent.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-ocean-500/20 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-ocean-400" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-navy-950" />
              </div>
              <div className="bg-card border border-navy-600/20 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                  <span className="text-sm text-teal-300">Analyzing...</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(completedAgents).map((agent) => (
                    <span key={agent} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ {agent.charAt(0).toUpperCase() + agent.slice(1)} Agent
                    </span>
                  ))}
                  {Array.from(activeAgents).map((agent) => (
                    <span key={agent} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">
                      ⟳ {agent.charAt(0).toUpperCase() + agent.slice(1)} Agent
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-navy-700/20 px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 p-2 rounded-2xl glass border border-navy-600/30 focus-within:border-teal-500/40 transition-colors">
            <button
              className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              title="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about the sea..."
              className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm py-2"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={cn(
                'p-2.5 rounded-xl transition-all',
                input.trim() && !isLoading
                  ? 'bg-teal-500 text-navy-950 hover:bg-teal-400'
                  : 'bg-navy-700/30 text-slate-600'
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Why Evidence Modal */}
      <WhyEvidenceModal
        isOpen={Boolean(activeEvidence)}
        onClose={() => setActiveEvidence(null)}
        evidence={activeEvidence ?? undefined}
      />
    </div>
  );
}
