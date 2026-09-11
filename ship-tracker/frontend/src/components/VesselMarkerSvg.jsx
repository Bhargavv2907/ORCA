import React from 'react';
import { getVesselCategory } from '../utils/vesselTypes';

export default function VesselMarkerSvg({ vessel, isSelected, onClick }) {
  const category = getVesselCategory(vessel.shipType);
  const heading = vessel.heading || vessel.cog || 0;
  const isMoving = vessel.sog > 0.5;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(vessel);
      }}
      className="vessel-marker-container group relative flex items-center justify-center"
      title={`${vessel.name || 'Ship'} (${vessel.mmsi}) • ${vessel.sog || 0} kn • ${category.label}`}
    >
      {/* Selected Radar Glow Ring */}
      {isSelected && (
        <div
          className="absolute inset-0 -m-3 rounded-full border-2 border-cyan-400 animate-radar-pulse pointer-events-none"
          style={{ backgroundColor: `${category.color}22` }}
        />
      )}

      {/* Ship Icon Base with Heading Rotation */}
      <div
        className="relative flex items-center justify-center transition-transform duration-300"
        style={{ transform: `rotate(${heading}deg)` }}
      >
        <svg
          width={isSelected ? '32' : '24'}
          height={isSelected ? '32' : '24'}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        >
          {/* Outer Vessel Hull Polygon */}
          <path
            d="M12 2L4 20C4 20 8 22 12 22C16 22 20 20 20 20L12 2Z"
            fill={category.color}
            stroke="#0f172a"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Inner Deck Accent */}
          <path
            d="M12 6L7 18C9.5 19.2 14.5 19.2 17 18L12 6Z"
            fill="#ffffff"
            fillOpacity="0.35"
          />

          {/* Center Command Bridge Marker */}
          <circle cx="12" cy="14" r="2" fill="#ffffff" />
        </svg>

        {/* Speed Motion Vector Arrow for moving vessels */}
        {isMoving && (
          <div
            className="absolute -top-3 w-0.5 bg-cyan-400 rounded-full opacity-80"
            style={{ height: `${Math.min(24, Math.max(8, vessel.sog * 0.8))}px` }}
          />
        )}
      </div>

      {/* Hover Name Tooltip Badge */}
      <div className="absolute top-full mt-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
        <div
          className="px-2 py-1 rounded-md text-[11px] font-bold text-white whitespace-nowrap shadow-xl border backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: category.color,
          }}
        >
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
            {vessel.name || 'UNKNOWN SHIP'}
          </span>
          <div className="text-[9px] text-slate-400 font-mono font-normal">
            {vessel.sog || 0} kn • {category.label}
          </div>
        </div>
      </div>
    </div>
  );
}
