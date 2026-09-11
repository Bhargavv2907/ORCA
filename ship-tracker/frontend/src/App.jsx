import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Map from './components/Map';
import StatusHeader from './components/StatusHeader';
import SearchFilterBar from './components/SearchFilterBar';
import VesselSidePanel from './components/VesselSidePanel';
import BboxControlModal from './components/BboxControlModal';
import { shipTrackerWs } from './services/websocket';
import { getVesselCategory } from './utils/vesselTypes';

const DEFAULT_CENTER = { lat: 50.8, lon: 1.2 };
const DEFAULT_ZOOM = 8.5;

export default function App() {
  const [vesselsMap, setVesselsMap] = useState(new Map());
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activePreset, setActivePreset] = useState({
    id: 'english_channel',
    name: 'English Channel & Dover Strait',
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  });
  const [wsStatus, setWsStatus] = useState({ state: 'CONNECTING', text: 'Connecting...' });
  const [isBboxModalOpen, setIsBboxModalOpen] = useState(false);

  // Initialize WebSocket connection on mount
  useEffect(() => {
    shipTrackerWs.connect();

    const unsubStatus = shipTrackerWs.subscribeStatus((status) => {
      setWsStatus(status);
    });

    const unsubMessages = shipTrackerWs.subscribe((message) => {
      if (!message) return;

      if (message.type === 'INIT_STATE') {
        const initialMap = new Map();
        if (message.vessels && Array.isArray(message.vessels)) {
          message.vessels.forEach((v) => initialMap.set(v.mmsi, v));
        }
        setVesselsMap(initialMap);

        if (message.preset) {
          setActivePreset(message.preset);
        }
      } else if (message.type === 'VESSEL_UPDATE' && message.vessel) {
        setVesselsMap((prev) => {
          const next = new Map(prev);
          next.set(message.vessel.mmsi, message.vessel);
          return next;
        });

        // Update selected vessel state if inspecting this ship
        setSelectedVessel((curr) => (curr && curr.mmsi === message.vessel.mmsi ? message.vessel : curr));
      } else if (message.type === 'BATCH_UPDATE' && message.vessels) {
        setVesselsMap((prev) => {
          const next = new Map(prev);
          message.vessels.forEach((v) => next.set(v.mmsi, v));
          return next;
        });
      } else if (message.type === 'REGION_CHANGED') {
        if (message.vessels) {
          const next = new Map();
          message.vessels.forEach((v) => next.set(v.mmsi, v));
          setVesselsMap(next);
        }
      } else if (message.type === 'CLEAR_VESSELS') {
        setVesselsMap(new Map());
        setSelectedVessel(null);
      }
    });

    return () => {
      unsubStatus();
      unsubMessages();
    };
  }, []);

  // Convert vessels map to filtered array based on category tab
  const vesselList = useMemo(() => {
    const all = Array.from(vesselsMap.values());
    if (selectedCategory === 'all') return all;
    return all.filter((v) => getVesselCategory(v.shipType).id === selectedCategory);
  }, [vesselsMap, selectedCategory]);

  // Handle region preset selection
  const handleSelectPreset = useCallback((preset) => {
    setActivePreset(preset);
    setIsBboxModalOpen(false);
    setSelectedVessel(null);

    shipTrackerWs.setBoundingBox(preset.boundingBox, preset.id);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Status & Region Control Header */}
      <StatusHeader
        status={wsStatus}
        vesselCount={vesselsMap.size}
        activePresetName={activePreset.name}
        onOpenBboxModal={() => setIsBboxModalOpen(true)}
      />

      {/* Floating Top Search & Filter Bar */}
      <div className="absolute top-16 left-4 right-4 sm:left-auto sm:right-4 z-40 sm:max-w-xl">
        <SearchFilterBar
          vessels={Array.from(vesselsMap.values())}
          onSelectVessel={setSelectedVessel}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Interactive MapLibre GL Vector Canvas */}
      <Map
        vessels={vesselList}
        selectedVessel={selectedVessel}
        onSelectVessel={setSelectedVessel}
        center={activePreset.center || DEFAULT_CENTER}
        zoom={activePreset.zoom || DEFAULT_ZOOM}
      />

      {/* Selected Vessel Inspector Side Panel */}
      <VesselSidePanel
        vessel={selectedVessel}
        onClose={() => setSelectedVessel(null)}
      />

      {/* Bounding Box Region Selector Modal */}
      {isBboxModalOpen && (
        <BboxControlModal
          activePresetId={activePreset.id}
          onSelectPreset={handleSelectPreset}
          onClose={() => setIsBboxModalOpen(false)}
        />
      )}
    </div>
  );
}
