import React from 'react';
import { Ship, Radio, MapPin, Layers, RefreshCw, Wifi, WifiOff, Globe } from 'lucide-react';

export default function StatusHeader({
  status,
  vesselCount = 0,
  activePresetName = 'English Channel',
  onOpenBboxModal,
}) {
  const isConnected = status?.state === 'CONNECTED';
  const isConnecting = status?.state === 'CONNECTING';

  return (
    <header className="absolute top-4 left-4 z-40 flex flex-wrap items-center gap-2 max-w-full">
      {/* App Branding Badge */}
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-2xl">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <Ship className="w-4 h-4" />
        </div>
        <div>
          <h1 className="font-extrabold text-white text-sm tracking-tight leading-tight flex items-center gap-1.5">
            AIS Live Ship Tracker
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
              v1.0
            </span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono">AISStream.io + MapLibre GL JS</p>
        </div>
      </div>

      {/* Live Stream Status Badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-2xl text-xs">
        {isConnected ? (
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE AIS STREAM
          </span>
        ) : isConnecting ? (
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            CONNECTING...
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <WifiOff className="w-3.5 h-3.5" />
            RECONNECTING
          </span>
        )}
      </div>

      {/* Tracked Vessels Count Badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-2xl text-xs font-mono text-slate-200">
        <Radio className="w-3.5 h-3.5 text-cyan-400" />
        <span>Vessels: <strong className="text-white text-sm font-bold">{vesselCount}</strong></span>
      </div>

      {/* Region Bounding Box Selector Button */}
      <button
        onClick={onOpenBboxModal}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all shadow-xl"
        title="Change AIS Bounding Box Region"
      >
        <Globe className="w-3.5 h-3.5 text-cyan-400" />
        <span className="truncate max-w-[140px]">{activePresetName}</span>
        <span className="text-[10px] opacity-75 font-normal">▼</span>
      </button>
    </header>
  );
}
