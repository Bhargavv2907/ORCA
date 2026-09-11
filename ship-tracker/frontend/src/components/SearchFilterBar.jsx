import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Ship, Filter, ChevronDown } from 'lucide-react';
import { VESSEL_CATEGORIES, getVesselCategory } from '../utils/vesselTypes';

export default function SearchFilterBar({
  vessels = [],
  onSelectVessel,
  selectedCategory,
  onSelectCategory,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Filter vessels matching search query
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return vessels.filter((v) => {
      const nameMatch = v.name && v.name.toLowerCase().includes(q);
      const mmsiMatch = v.mmsi && String(v.mmsi).includes(q);
      const imoMatch = v.imo && String(v.imo).includes(q);
      return nameMatch || mmsiMatch || imoMatch;
    }).slice(0, 10);
  }, [query, vessels]);

  // Handle outside click to close search dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (vessel) => {
    onSelectVessel(vessel);
    setQuery(vessel.name || String(vessel.mmsi));
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl w-full">
      {/* Search Input Container */}
      <div ref={dropdownRef} className="relative flex-1">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl focus-within:border-cyan-500/50 transition-colors">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search ship by Name, MMSI, or IMO..."
            className="bg-transparent text-white text-xs outline-none w-full placeholder:text-slate-500 font-medium"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-1 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl max-h-72 overflow-y-auto z-50 p-1.5 space-y-1">
            {searchResults.map((v) => {
              const category = getVesselCategory(v.shipType);
              return (
                <button
                  key={v.mmsi}
                  onClick={() => handleSelect(v)}
                  className="w-full p-2.5 rounded-lg hover:bg-slate-800/80 text-left flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-cyan-300">
                        {v.name || 'UNKNOWN SHIP'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        MMSI: {v.mmsi} • {category.label}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">
                    {v.sog || 0} kn
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedCategory === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-lg'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          All ({vessels.length})
        </button>

        {Object.values(VESSEL_CATEGORIES).map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'text-white shadow-lg'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
            style={{
              backgroundColor: selectedCategory === cat.id ? cat.bg : undefined,
              borderColor: selectedCategory === cat.id ? cat.color : undefined,
              color: selectedCategory === cat.id ? '#ffffff' : undefined,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
            {cat.label.split('/')[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
