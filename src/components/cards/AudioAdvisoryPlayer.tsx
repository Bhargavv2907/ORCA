'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Globe, Play, Square, FastForward } from 'lucide-react';
import { COASTAL_LANGUAGES, translateAdvisory, speakVernacularAdvisory, stopVernacularAdvisory, preloadVoices, LANGUAGE_ANNOUNCEMENTS } from '@/lib/i18n-engine';
import { getSelectedLanguage, useSelectedLanguage, setSelectedLanguage } from '@/lib/language-store';

interface AudioAdvisoryPlayerProps {
  text: string;
  defaultLanguage?: string;
}

export function AudioAdvisoryPlayer({ text, defaultLanguage }: AudioAdvisoryPlayerProps) {
  const globalLanguage = useSelectedLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState(defaultLanguage || globalLanguage);
  const [speed, setSpeed] = useState(1.0);
  const [translatedPreview, setTranslatedPreview] = useState(text);

  // Preload voices on mount
  useEffect(() => {
    preloadVoices();
  }, []);

  // Sync with global store if defaultLanguage wasn't explicitly forced
  useEffect(() => {
    if (!defaultLanguage && globalLanguage) {
      setLanguage(globalLanguage);
    }
  }, [globalLanguage, defaultLanguage]);

  useEffect(() => {
    setLanguage(getSelectedLanguage());
    const handler = (e: Event) => {
      const lang = (e as CustomEvent<any>).detail;
      if (lang && lang.name) setLanguage(lang.name);
      else if (typeof lang === 'string') setLanguage(lang);
    };
    window.addEventListener('orca-language-changed', handler);
    return () => window.removeEventListener('orca-language-changed', handler);
  }, []);
  useEffect(() => {
    setTranslatedPreview(translateAdvisory(text, language));
  }, [text, language]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopVernacularAdvisory();
      setIsPlaying(false);
    } else {
      const success = speakVernacularAdvisory(text, language, speed, () => setIsPlaying(false));
      if (success) {
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="p-3 rounded-xl bg-navy-900/80 border border-teal-500/30 space-y-2 text-xs">
      {/* Control Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 hover:shadow-md hover:shadow-teal-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Voice</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen ({language})</span>
              </>
            )}
          </button>

          {/* Sound Wave Animation */}
          {isPlaying && (
            <div className="flex items-center gap-0.5 h-4 px-1">
              <span className="w-1 bg-teal-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-4" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-teal-300 rounded-full animate-bounce h-3" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value;
              stopVernacularAdvisory();
              setIsPlaying(false);
              setLanguage(newLang);
              setSelectedLanguage(newLang);
            }}
            className="bg-navy-800 text-slate-200 text-[11px] font-semibold px-2 py-1 rounded-lg border border-navy-700 outline-none cursor-pointer hover:border-teal-500/40"
          >
            {COASTAL_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>

          {/* Speed Selector */}
          <button
            onClick={() => setSpeed(prev => (prev === 1.0 ? 1.25 : prev === 1.25 ? 1.5 : 1.0))}
            className="px-2 py-1 rounded-lg bg-navy-800 border border-navy-700 text-[10px] font-bold text-teal-400 hover:bg-navy-700"
            title="Speech Speed"
          >
            {speed}x
          </button>
        </div>
      </div>

      {/* Translated Vernacular Preview if non-English */}
      {language !== 'English' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-1 border-t border-navy-800 text-[11px] text-teal-300 font-medium italic"
        >
          &quot;{translatedPreview}&quot;
        </motion.div>
      )}
    </div>
  );
}
