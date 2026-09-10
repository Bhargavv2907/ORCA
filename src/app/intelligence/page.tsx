'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Mic, User, Bot, Shield, Sparkles, ChevronDown, ChevronUp, RefreshCw, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { orchestrate, AgentOutput, CoastalLocation } from '@/lib/orchestrator';
import { OrcaResponse, AgentType } from '@/types/marine';
import { AudioAdvisoryPlayer, DemoModeBanner, LocationBadge } from '@/components/cards';
import { getSelectedLocation } from '@/lib/location-store';

interface ChatItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  response?: OrcaResponse;
  timestamp: string;
}

const QUICK_PROMPTS = [
  '🐟 Best fishing zone today?',
  '⛵ Is it safe to sail right now?',
  '🧭 Safest route to Zone A',
  '🌤️ Live weather & wave advisory',
  '🌊 Ocean currents & water temp',
];

export default function IntelligencePage() {
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentLoc, setCurrentLoc] = useState<CoastalLocation>(getSelectedLocation());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = useCallback(async (promptText?: string) => {
    const query = promptText || input.trim();
    if (!query || isLoading) return;

    const userMsg: ChatItem = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!promptText) setInput('');
    setIsLoading(true);

    try {
      const result = await orchestrate(query);
      const assistantMsg: ChatItem = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: result.recommendation,
        response: result,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatItem = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'I could not retrieve live ocean telemetry at the moment. Please check your connectivity and try again.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInput(text);
          handleSend(text);
        }
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between pb-4 border-b border-navy-700/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Brain className="w-5 h-5 text-navy-950" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              JalSaathi Marine Intelligence
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400">AI Marine Advisory • Live Telemetry Chat</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LocationBadge onLocationChange={(loc) => setCurrentLoc(loc)} />
          <DemoModeBanner />
        </div>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">How can ORCA assist your voyage?</h2>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Ask about real-time fishing zones, sea wave safety, coastal weather forecasts, or navigation pathfinding for {currentLoc.name}.
            </p>

            {/* Quick Prompt Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-left text-xs font-medium text-slate-300 hover:text-white p-3 rounded-xl border border-navy-700/50 bg-navy-900/40 hover:bg-navy-800/60 hover:border-teal-500/30 transition-all flex items-center justify-between group"
                >
                  <span>{prompt}</span>
                  <Send className="w-3 h-3 text-slate-500 group-hover:text-teal-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-teal-400" />
                </div>
              )}

              <div className={cn(
                'rounded-2xl max-w-[88%] sm:max-w-[80%] p-4 text-sm',
                msg.role === 'user'
                  ? 'bg-teal-500/15 text-white border border-teal-500/25 rounded-tr-none'
                  : 'bg-navy-900/80 border border-navy-700/50 text-slate-200 rounded-tl-none shadow-md'
              )}>
                {msg.role === 'user' ? (
                  <p className="leading-relaxed">{msg.text}</p>
                ) : (
                  <div className="space-y-3">
                    {/* Safety Status Pill */}
                    {msg.response?.safetyStatus && (
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
                          msg.response.safetyStatus.status === 'SAFE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : msg.response.safetyStatus.status === 'MODERATE'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        )}>
                          <Shield className="w-3.5 h-3.5" />
                          {msg.response.safetyStatus.label} ({msg.response.safetyStatus.overall}/100)
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono ml-auto">{msg.timestamp}</span>
                      </div>
                    )}

                    {/* Main Recommendation Text */}
                    <div className="text-slate-100 leading-relaxed font-medium space-y-2">
                      {msg.text.split('\n').map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>

                    {/* Voice Advisory Player */}
                    <div className="pt-1 border-t border-navy-700/30 flex items-center justify-between gap-2 flex-wrap">
                      <AudioAdvisoryPlayer text={msg.text} />

                      {/* Technical Reasoning Toggle */}
                      {msg.response?.reasoning && msg.response.reasoning.length > 0 && (
                        <button
                          onClick={() => setExpandedTraceId(expandedTraceId === msg.id ? null : msg.id)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-teal-300 transition-colors py-1 px-2 rounded-lg hover:bg-navy-800/50"
                        >
                          <span>{expandedTraceId === msg.id ? 'Hide Trace' : 'View Agent Trace'}</span>
                          {expandedTraceId === msg.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {/* Collapsible Agent Trace */}
                    <AnimatePresence>
                      {expandedTraceId === msg.id && msg.response && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-3 rounded-xl bg-navy-950/70 border border-navy-700/40 space-y-2 text-xs"
                        >
                          <p className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Multi-Agent Intelligence Trace</p>
                          <ul className="space-y-1 text-slate-400">
                            {msg.response.reasoning.map((step, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-1.5">
                                <span className="text-teal-400 font-mono">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-teal-300" />
                </div>
              )}
            </motion.div>
          ))
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-teal-400" />
            </div>
            <div className="bg-navy-900/80 border border-navy-700/50 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-teal-300">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
              <span>Analyzing live MOSDAC satellite & Open-Meteo ocean telemetry...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="shrink-0 pt-3 border-t border-navy-700/40">
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-navy-900/90 border border-navy-700/60 focus-within:border-teal-500/50 transition-colors shadow-lg">
          <button
            onClick={handleVoiceInput}
            className={cn(
              'p-2.5 rounded-xl transition-all',
              isListening ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-navy-800'
            )}
            title={isListening ? 'Listening...' : 'Voice Input'}
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={`Ask ORCA about ${currentLoc.name} ocean safety, fishing zones, or weather...`}
            className="flex-1 bg-transparent text-white text-xs sm:text-sm placeholder-slate-500 outline-none px-2"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={cn(
              'p-2.5 rounded-xl transition-all font-bold',
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 hover:shadow-lg hover:shadow-teal-500/25'
                : 'bg-navy-800 text-slate-600'
            )}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
