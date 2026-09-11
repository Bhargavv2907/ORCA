import React, { useState } from 'react';
import { X, Globe, MapPin, Check, RefreshCw } from 'lucide-react';
import { BOUNDING_BOX_PRESETS } from '../utils/presets';

const PRESETS = Object.values(BOUNDING_BOX_PRESETS || {
  english_channel: {
    id: 'english_channel',
    name: 'English Channel & Dover Strait',
    region: 'Europe',
    center: { lat: 50.8, lon: 1.2 },
    zoom: 8.5,
    boundingBox: [[ [49.5, -6.0], [52.5, 2.5] ]],
  },
  singapore_strait: {
    id: 'singapore_strait',
    name: 'Singapore Strait & Malacca',
    region: 'Asia',
    center: { lat: 1.28, lon: 103.85 },
    zoom: 10,
    boundingBox: [[ [1.0, 103.0], [1.8, 104.5] ]],
  },
  gibraltar: {
    id: 'gibraltar',
    name: 'Strait of Gibraltar',
    region: 'Europe / Africa',
    center: { lat: 35.95, lon: -5.4 },
    zoom: 9.5,
    boundingBox: [[ [35.5, -6.2], [36.3, -4.8] ]],
  },
  us_east_coast: {
    id: 'us_east_coast',
    name: 'US East Coast / NY Harbor',
    region: 'North America',
    center: { lat: 40.6, lon: -74.0 },
    zoom: 9,
    boundingBox: [[ [40.0, -74.5], [41.2, -73.0] ]],
  },
  tokyo_bay: {
    id: 'tokyo_bay',
    name: 'Tokyo Bay & Uraga Channel',
    region: 'Asia',
    center: { lat: 35.35, lon: 139.75 },
    zoom: 9.5,
    boundingBox: [[ [34.8, 139.5], [35.7, 140.2] ]],
  },
  full_globe: {
    id: 'full_globe',
    name: 'Full Worldwide Globe (High Volume)',
    region: 'Worldwide',
    center: { lat: 20.0, lon: 10.0 },
    zoom: 2.5,
    boundingBox: [[ [-90.0, -180.0], [90.0, 180.0] ]],
  },
});

export default function BboxControlModal({
  activePresetId,
  onSelectPreset,
  onClose,
}) {
  const [minLat, setMinLat] = useState('49.5');
  const [minLon, setMinLon] = useState('-6.0');
  const [maxLat, setMaxLat] = useState('52.5');
  const [maxLon, setMaxLon] = useState('2.5');

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const bbox = [[
      [parseFloat(minLat), parseFloat(minLon)],
      [parseFloat(maxLat), parseFloat(maxLon)],
    ]];

    const center = {
      lat: (parseFloat(minLat) + parseFloat(maxLat)) / 2,
      lon: (parseFloat(minLon) + parseFloat(maxLon)) / 2,
    };

    onSelectPreset({
      id: 'custom',
      name: 'Custom Bounding Box',
      boundingBox: bbox,
      center,
      zoom: 7,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Globe className="w-5 h-5 text-cyan-400" />
            Select AIS Bounding Box Region
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold block mb-2">
              PREDEFINED MARITIME HIGH-TRAFFIC REGIONS
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400/50'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Region: {preset.region}
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Bounding Box Input Form */}
          <div className="pt-3 border-t border-slate-800">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold block mb-2">
              CUSTOM LATITUDE / LONGITUDE BOUNDING BOX
            </label>

            <form onSubmit={handleCustomSubmit} className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Min Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minLat}
                    onChange={(e) => setMinLat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Min Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minLon}
                    onChange={(e) => setMinLon(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Max Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={maxLat}
                    onChange={(e) => setMaxLat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Max Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={maxLon}
                    onChange={(e) => setMaxLon(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Subscribe to Custom Region
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
