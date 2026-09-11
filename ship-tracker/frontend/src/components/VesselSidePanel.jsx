import React from 'react';
import { X, Navigation, Compass, Radio, MapPin, Anchor, Clock, Ship, Shield, ArrowUpRight } from 'lucide-react';
import { getVesselCategory, getVesselTypeName, getNavStatusName } from '../utils/vesselTypes';
import { formatCoords, formatKnots, formatCourse, formatRelativeTime } from '../utils/formatters';

export default function VesselSidePanel({ vessel, onClose }) {
  if (!vessel) return null;

  const category = getVesselCategory(vessel.shipType);
  const typeName = getVesselTypeName(vessel.shipType);
  const navStatus = getNavStatusName(vessel.navStatus);

  return (
    <div className="absolute top-16 right-4 z-40 w-80 md:w-96 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl overflow-hidden transition-all text-slate-100 animate-in slide-in-from-right duration-300">
      {/* Header Banner */}
      <div
        className="p-4 border-b flex items-start justify-between gap-3 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${category.color}22 0%, rgba(15,23,42,0.9) 100%)`,
          borderColor: category.border,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0 border"
            style={{ backgroundColor: `${category.color}33`, borderColor: category.color }}
          >
            <Ship className="w-6 h-6" style={{ color: category.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                style={{ backgroundColor: category.bg, color: category.color, borderColor: category.border }}
              >
                {category.label}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight truncate mt-1 max-w-[210px]" title={vessel.name}>
              {vessel.name || 'UNKNOWN SHIP'}
            </h2>
            <p className="text-xs text-slate-400 font-mono">MMSI: {vessel.mmsi}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Vessel Details Body */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto text-xs">
        {/* Navigation Live Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1 mb-1">
              <Navigation className="w-3 h-3 text-cyan-400" />
              Speed (SOG)
            </span>
            <span className="text-base font-extrabold text-white">{formatKnots(vessel.sog)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1 mb-1">
              <Compass className="w-3 h-3 text-amber-400" />
              Course (COG)
            </span>
            <span className="text-base font-extrabold text-white">{formatCourse(vessel.cog)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1 mb-1">
              <Radio className="w-3 h-3 text-emerald-400" />
              True Heading
            </span>
            <span className="text-base font-extrabold text-white">{formatCourse(vessel.heading)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-purple-400" />
              Last Seen
            </span>
            <span className="text-xs font-bold text-slate-200">{formatRelativeTime(vessel.lastSeen)}</span>
          </div>
        </div>

        {/* Vessel Attributes List */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40">
            <span className="text-slate-400 flex items-center gap-2">
              <Anchor className="w-3.5 h-3.5 text-slate-500" />
              Navigational Status
            </span>
            <span className="font-semibold text-slate-200">{navStatus}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40">
            <span className="text-slate-400 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              Specific Vessel Type
            </span>
            <span className="font-semibold text-slate-200">{typeName}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40">
            <span className="text-slate-400 flex items-center gap-2">
              <Ship className="w-3.5 h-3.5 text-slate-500" />
              IMO Number
            </span>
            <span className="font-mono text-slate-200">{vessel.imo || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40">
            <span className="text-slate-400 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-slate-500" />
              Call Sign
            </span>
            <span className="font-mono text-slate-200">{vessel.callSign || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40">
            <span className="text-slate-400 flex items-center gap-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              Destination
            </span>
            <span className="font-bold text-amber-400 truncate max-w-[160px]" title={vessel.destination || 'NOT SPECIFIED'}>
              {vessel.destination || 'NOT SPECIFIED'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40">
            <span className="text-slate-400 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              Live Position
            </span>
            <span className="font-mono text-cyan-400 font-bold">{formatCoords(vessel.lat, vessel.lon)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
