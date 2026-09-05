'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, MapPin, Radio, Shield, Thermometer, Wind, Waves,
  Droplets, RefreshCw, X, Globe, Eye, Ship, Fish, Navigation, Maximize2, Compass, ArrowUpRight
} from 'lucide-react';
import { MarineConditions, Vessel, FishingZone } from '@/types/marine';
import { cn } from '@/lib/utils';
import { getMockFishingZones } from '@/data/mock-data';

// Import Leaflet CSS dynamically in client component
import 'leaflet/dist/leaflet.css';

// Coastline Coordinates for All 11 Indian Coastal Regions (9 States + 2 UTs)
export const INDIAN_COASTAL_SECTORS = [
  {
    id: 'gujarat',
    name: 'Gujarat Coast & Gulfs',
    state: 'Gujarat',
    type: 'West Coast',
    center: { lat: 21.75, lon: 70.0 },
    bounds: { minLat: 20.0, maxLat: 23.6, minLon: 68.1, maxLon: 73.0 },
    coordinates: [
      [23.5, 68.3], [23.1, 68.8], [22.4, 69.2], [22.2, 69.8], [22.5, 70.3],
      [22.8, 70.9], [21.6, 72.6], [21.0, 72.8], [20.3, 72.9]
    ] as [number, number][],
    description: 'Gulf of Kutch, Dwarka, Porbandar, Gulf of Khambhat & Veraval'
  },
  {
    id: 'konkan',
    name: 'Konkan Coast (Maharashtra)',
    state: 'Maharashtra',
    type: 'West Coast',
    center: { lat: 18.2, lon: 72.9 },
    bounds: { minLat: 15.7, maxLat: 20.2, minLon: 72.5, maxLon: 73.6 },
    coordinates: [
      [20.1, 72.8], [19.5, 72.8], [18.95, 72.82], [18.5, 72.9], [17.9, 73.1],
      [17.3, 73.2], [16.5, 73.3], [15.8, 73.6]
    ] as [number, number][],
    description: 'Palghar, Mumbai Metropolitan, Raigad, Ratnagiri & Sindhudurg'
  },
  {
    id: 'goa',
    name: 'Goa Coastline',
    state: 'Goa',
    type: 'West Coast',
    center: { lat: 15.35, lon: 73.8 },
    bounds: { minLat: 14.9, maxLat: 15.8, minLon: 73.6, maxLon: 74.2 },
    coordinates: [
      [15.78, 73.69], [15.60, 73.74], [15.48, 73.80], [15.25, 73.92], [14.95, 74.05]
    ] as [number, number][],
    description: 'Pernem, Bardez, Tiswadi, Marmagao, Salcete & Canacona'
  },
  {
    id: 'kanara',
    name: 'Kanara Coast (Karnataka)',
    state: 'Karnataka',
    type: 'West Coast',
    center: { lat: 13.8, lon: 74.4 },
    bounds: { minLat: 12.7, maxLat: 14.9, minLon: 74.0, maxLon: 74.9 },
    coordinates: [
      [14.9, 74.08], [14.5, 74.3], [14.0, 74.45], [13.3, 74.7], [12.85, 74.83]
    ] as [number, number][],
    description: 'Karwar, Kumta, Honnavar, Udupi, Malpe & Mangaluru'
  },
  {
    id: 'malabar',
    name: 'Malabar Coast (Kerala)',
    state: 'Kerala',
    type: 'West Coast',
    center: { lat: 10.2, lon: 76.0 },
    bounds: { minLat: 8.3, maxLat: 12.7, minLon: 74.8, maxLon: 77.2 },
    coordinates: [
      [12.7, 74.85], [12.0, 75.2], [11.25, 75.77], [10.5, 76.0], [9.93, 76.26],
      [9.5, 76.35], [8.9, 76.55], [8.48, 76.95]
    ] as [number, number][],
    description: 'Kasaragod, Kannur, Kozhikode, Kochi, Alappuzha, Kollam & Trivandrum'
  },
  {
    id: 'coromandel',
    name: 'Coromandel Coast (Tamil Nadu)',
    state: 'Tamil Nadu & Puducherry',
    type: 'East Coast',
    center: { lat: 10.8, lon: 79.5 },
    bounds: { minLat: 8.0, maxLat: 13.5, minLon: 77.2, maxLon: 80.4 },
    coordinates: [
      [8.08, 77.55], [8.8, 78.15], [9.28, 79.3], [10.3, 79.8], [10.8, 79.85],
      [11.93, 79.83], [13.08, 80.27], [13.4, 80.32]
    ] as [number, number][],
    description: 'Kanyakumari, Tuticorin, Gulf of Mannar, Nagapattinam, Puducherry & Chennai'
  },
  {
    id: 'andhra',
    name: 'Andhra Coast (Northern Circars)',
    state: 'Andhra Pradesh',
    type: 'East Coast',
    center: { lat: 16.2, lon: 81.8 },
    bounds: { minLat: 13.5, maxLat: 19.1, minLon: 80.0, maxLon: 84.8 },
    coordinates: [
      [13.5, 80.2], [14.4, 80.0], [15.8, 80.8], [16.5, 82.2], [17.0, 82.5],
      [17.68, 83.21], [18.3, 83.9], [19.0, 84.7]
    ] as [number, number][],
    description: 'Nellore, Machilipatnam, Kakinada, Visakhapatnam & Srikakulam'
  },
  {
    id: 'odisha',
    name: 'Odisha Coastline & Chilika',
    state: 'Odisha',
    type: 'East Coast',
    center: { lat: 20.2, lon: 86.2 },
    bounds: { minLat: 19.1, maxLat: 21.6, minLon: 84.7, maxLon: 87.5 },
    coordinates: [
      [19.1, 84.7], [19.7, 85.5], [20.2, 86.6], [20.8, 87.0], [21.5, 87.3]
    ] as [number, number][],
    description: 'Ganjam, Gopalpur, Chilika Lake, Puri, Paradip & Balasore'
  },
  {
    id: 'bengal',
    name: 'Bengal Coast & Sundarbans',
    state: 'West Bengal',
    type: 'East Coast',
    center: { lat: 21.8, lon: 88.3 },
    bounds: { minLat: 21.4, maxLat: 22.5, minLon: 87.3, maxLon: 89.2 },
    coordinates: [
      [21.6, 87.5], [21.62, 88.0], [21.50, 88.30], [21.65, 88.8], [21.75, 89.1]
    ] as [number, number][],
    description: 'Digha, Shankarpur, Sagar Island, Haldia & Sundarbans Delta'
  },
  {
    id: 'lakshadweep',
    name: 'Lakshadweep Islands',
    state: 'Lakshadweep UT',
    type: 'Island Territory',
    center: { lat: 10.56, lon: 72.64 },
    bounds: { minLat: 8.0, maxLat: 12.5, minLon: 71.0, maxLon: 74.0 },
    coordinates: [
      [10.56, 72.64], [10.85, 72.18], [11.15, 72.72], [8.28, 73.05]
    ] as [number, number][],
    description: 'Kavaratti, Agatti, Amini, Kadmat & Minicoy Atolls'
  },
  {
    id: 'andaman',
    name: 'Andaman & Nicobar Islands',
    state: 'Andaman & Nicobar UT',
    type: 'Island Territory',
    center: { lat: 11.62, lon: 92.72 },
    bounds: { minLat: 6.5, maxLat: 14.0, minLon: 91.5, maxLon: 94.2 },
    coordinates: [
      [13.1, 92.9], [12.0, 92.8], [11.62, 92.72], [10.5, 92.5], [9.1, 92.8], [7.0, 93.8]
    ] as [number, number][],
    description: 'Port Blair, Havelock Island, Diglipur, Car Nicobar & Great Nicobar'
  }
];

// Helper: Distance calculation using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  const nm = km * 0.539957;

  // Bearing
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(brng / 45) % 8;
  const bearing = directions[index];

  return { km: +km.toFixed(1), nm: +nm.toFixed(1), bearing };
}

interface WorldMapProps {
  onPointClick?: (lat: number, lon: number, data: MarineConditions | null) => void;
  vessels?: Vessel[];
  fishingZones?: FishingZone[];
  satelliteMode?: string;
  activeLayers?: Set<string>;
  highlightCoasts?: boolean;
}

export default function WorldMapComponent({
  onPointClick,
  vessels = [],
  fishingZones = [],
  satelliteMode = 'esri_satellite',
  activeLayers = new Set(['mosdac_overlay', 'winds', 'fishing', 'vessels', 'coastal_detect']),
  highlightCoasts = true
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const lineLayerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clickedPoint, setClickedPoint] = useState<{ lat: number; lon: number; data?: MarineConditions; loading: boolean } | null>(null);

  const zonesList = useMemo(() => {
    return fishingZones.length > 0 ? fishingZones : getMockFishingZones();
  }, [fishingZones]);

  // Compute nearest fishing zone whenever a point is clicked
  const nearestZoneInfo = useMemo<{ zone: FishingZone; km: number; nm: number; bearing: string } | null>(() => {
    if (!clickedPoint || !zonesList.length) return null;

    let minDist = Infinity;
    let nearest: FishingZone | null = null;
    let nearestCalc = { km: 0, nm: 0, bearing: '' };

    zonesList.forEach((zone: FishingZone) => {
      const calc = calculateDistance(clickedPoint.lat, clickedPoint.lon, zone.center.lat, zone.center.lon);
      if (calc.km < minDist) {
        minDist = calc.km;
        nearest = zone;
        nearestCalc = calc;
      }
    });

    return nearest ? { zone: nearest, ...nearestCalc } : null;
  }, [clickedPoint, zonesList]);

  // Draw connection line to nearest PFZ on map
  const connectNearestZone = () => {
    if (!clickedPoint || !nearestZoneInfo || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (lineLayerRef.current) {
        map.removeLayer(lineLayerRef.current);
      }

      const p1: [number, number] = [clickedPoint.lat, clickedPoint.lon];
      const p2: [number, number] = [nearestZoneInfo.zone.center.lat, nearestZoneInfo.zone.center.lon];

      const polyline = L.polyline([p1, p2], {
        color: '#34d399',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.9,
      }).addTo(map);

      lineLayerRef.current = polyline;

      map.flyToBounds([p1, p2], { padding: [80, 80], duration: 1.2 });
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      if (!isMounted || !containerRef.current) return;

      // Fix default Leaflet marker icons path issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Create Leaflet Map centered over India & World view
      const map = L.map(containerRef.current, {
        center: [15.0, 78.0],
        zoom: 4.5,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true,
        zoomControl: false,
      });

      // Add Zoom Control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Create Layer Group for dynamic markers & overlays
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;

      // Handle map click for live sampling
      map.on('click', (e: any) => {
        const lat = +e.latlng.lat.toFixed(3);
        const lon = +e.latlng.lng.toFixed(3);

        setClickedPoint({ lat, lon, loading: true });

        // Remove old connecting polyline if any
        if (lineLayerRef.current) {
          map.removeLayer(lineLayerRef.current);
          lineLayerRef.current = null;
        }

        fetch(`/api/marine?lat=${lat}&lon=${lon}`)
          .then((res) => res.json())
          .then((data) => {
            setClickedPoint({ lat, lon, data, loading: false });
            if (onPointClick) onPointClick(lat, lon, data);
          })
          .catch(() => {
            setClickedPoint((prev) => (prev ? { ...prev, loading: false } : null));
          });
      });

      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onPointClick]);

  // Update Basemap Tiles based on satelliteMode
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Remove existing tile layers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      let attribution = '&copy; Esri World Imagery & ISRO MOSDAC';

      if (satelliteMode === 'dark_nautical') {
        tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        attribution = '&copy; OpenStreetMap & CartoDB Dark';
      } else if (satelliteMode === 'mosdac_sst') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      } else if (satelliteMode === 'osm') {
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        attribution = '&copy; OpenStreetMap contributors';
      }

      L.tileLayer(tileUrl, {
        attribution,
        maxZoom: 18,
        noWrap: false,
      }).addTo(map);
    });
  }, [satelliteMode, isLoaded]);

  // Update Markers, Coastlines & Overlays
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || !isLoaded) return;

    import('leaflet').then((L) => {
      const layerGroup = layerGroupRef.current;
      layerGroup.clearLayers();

      // 1. HIGHLIGHT ALL 11 INDIAN COASTAL SECTORS
      if (highlightCoasts || activeLayers.has('coastal_detect')) {
        INDIAN_COASTAL_SECTORS.forEach((sector) => {
          // Draw Coastline Polyline
          const polyline = L.polyline(sector.coordinates, {
            color: '#2dd4bf', // Teal highlight
            weight: 4,
            opacity: 0.9,
            dashArray: '8, 6',
          });

          polyline.bindTooltip(
            `<div class="px-2 py-1 bg-navy-950/90 text-teal-300 text-xs font-bold rounded shadow-lg border border-teal-500/40">
              🇮🇳 ${sector.name} (${sector.type})<br/>
              <span class="text-[10px] text-slate-300">${sector.description}</span>
            </div>`,
            { sticky: true, className: 'leaflet-tooltip-dark' }
          );

          polyline.addTo(layerGroup);

          // Add Pulsing Sector Center Marker
          const customIcon = L.divIcon({
            className: 'custom-coast-marker',
            html: `<div class="relative flex items-center justify-center">
              <span class="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-teal-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-teal-300 border-2 border-navy-950"></span>
            </div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const marker = L.marker([sector.center.lat, sector.center.lon], { icon: customIcon });
          marker.bindPopup(
            `<div class="p-2 text-xs font-sans">
              <h4 class="font-bold text-teal-600 text-sm mb-1">🇮🇳 ${sector.name}</h4>
              <p class="text-slate-600 mb-1"><strong>State/UT:</strong> ${sector.state}</p>
              <p class="text-slate-500 mb-2">${sector.description}</p>
              <div class="text-[10px] bg-slate-100 p-1.5 rounded font-mono">
                Lat: ${sector.center.lat}°N | Lon: ${sector.center.lon}°E
              </div>
            </div>`
          );

          marker.addTo(layerGroup);
        });
      }

      // 2. POTENTIAL FISHING ZONES (PFZ)
      if (activeLayers.has('fishing')) {
        zonesList.forEach((zone) => {
          const circle = L.circle([zone.center.lat, zone.center.lon], {
            color: zone.color || '#14b8a6',
            fillColor: zone.color || '#14b8a6',
            fillOpacity: 0.25,
            radius: 35000,
          });

          circle.bindPopup(
            `<div class="p-2 text-xs font-sans">
              <div class="flex items-center justify-between mb-1">
                <strong class="text-teal-600 text-sm">${zone.name}</strong>
                <span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">${zone.suitabilityScore}% Match</span>
              </div>
              <p class="text-slate-600 mb-1">Activity Level: <strong>${zone.historicalActivity}</strong></p>
              <p class="text-slate-500">SST: ${zone.sst}°C | Chlorophyll: ${zone.chlorophyll} mg/m³</p>
            </div>`
          );

          circle.addTo(layerGroup);
        });
      }

      // 3. LIVE VESSEL POSITIONS (AIS)
      if (activeLayers.has('vessels')) {
        vessels.forEach((vessel) => {
          const color = vessel.type === 'fishing' ? '#34d399' : vessel.type === 'commercial' ? '#fbbf24' : '#38bdf8';
          const vesselIcon = L.divIcon({
            className: 'custom-vessel-marker',
            html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #030712; box-shadow: 0 0 8px ${color}"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });

          const marker = L.marker([vessel.position.lat, vessel.position.lon], { icon: vesselIcon });
          marker.bindTooltip(
            `<div class="px-2 py-1 bg-navy-900 text-white text-xs font-medium rounded shadow">
              🚢 ${vessel.name} (${vessel.type}) — ${vessel.speed} kts
            </div>`,
            { sticky: true }
          );

          marker.addTo(layerGroup);
        });
      }
    });
  }, [highlightCoasts, activeLayers, zonesList, vessels, isLoaded]);

  // Quick FlyTo Region or Reset to World View
  const flyToRegion = (bounds?: { minLat: number; maxLat: number; minLon: number; maxLon: number }, center?: { lat: number; lon: number }, zoom?: number) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (center && zoom) {
      map.flyTo([center.lat, center.lon], zoom, { duration: 1.5 });
    } else if (bounds) {
      map.flyToBounds(
        [[bounds.minLat, bounds.minLon], [bounds.maxLat, bounds.maxLon]],
        { padding: [50, 50], duration: 1.5 }
      );
    } else {
      // Reset to Global World Map view
      map.flyTo([20.0, 10.0], 2.5, { duration: 1.5 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Map Canvas Container */}
      <div ref={containerRef} className="w-full h-full bg-navy-950 z-0" />

      {/* Fly to World / Indian Coast Quick Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <button
          onClick={() => flyToRegion(undefined, { lat: 20.0, lon: 10.0 }, 2.5)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900/90 backdrop-blur border border-teal-500/40 text-xs font-semibold text-teal-300 hover:bg-teal-500/20 shadow-xl transition-all"
        >
          <Globe className="w-4 h-4 text-teal-400" />
          <span>Reset to World Map</span>
        </button>

        <button
          onClick={() => flyToRegion({ minLat: 6.0, maxLat: 36.0, minLon: 68.0, maxLon: 97.0 }, { lat: 18.0, lon: 80.0 }, 5)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900/90 backdrop-blur border border-emerald-500/40 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 shadow-xl transition-all"
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>All Indian Coasts (11 Sectors)</span>
        </button>
      </div>

      {/* Point Sampling Inspection HUD */}
      <AnimatePresence>
        {clickedPoint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 right-4 z-20 w-84 sm:w-96 rounded-2xl glass border border-teal-500/40 p-4 shadow-2xl bg-navy-950/95 max-h-[calc(100vh-120px)] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-2 border-b border-navy-700/40 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
                World Map Point Inspector
              </h3>
              <button onClick={() => setClickedPoint(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 bg-navy-900/60 px-3 py-1.5 rounded-lg border border-navy-700/40 font-mono text-[11px]">
                <span>LAT: <strong className="text-teal-300">{clickedPoint.lat}°</strong></span>
                <span>LON: <strong className="text-teal-300">{clickedPoint.lon}°</strong></span>
              </div>

              {/* NEAREST POTENTIAL FISHING ZONE (PFZ) DISPLAY */}
              {nearestZoneInfo && (
                <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-3 space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-xs">
                      <Fish className="w-4 h-4 text-emerald-400" />
                      <span>Nearest Fishing Zone</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold">
                      {nearestZoneInfo.zone.suitabilityScore}% Match
                    </span>
                  </div>

                  <p className="font-semibold text-white text-xs">{nearestZoneInfo.zone.name}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="flex items-center gap-1 font-mono">
                      <Navigation className="w-3 h-3 text-teal-400" />
                      {nearestZoneInfo.km} km ({nearestZoneInfo.nm} NM) {nearestZoneInfo.bearing}
                    </span>
                    <span className="text-teal-300">SST: {nearestZoneInfo.zone.sst}°C</span>
                  </div>

                  <button
                    onClick={connectNearestZone}
                    className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Connect & Fly to Nearest PFZ</span>
                  </button>
                </div>
              )}

              {clickedPoint.loading ? (
                <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                  <span>Fetching Satellite Observations...</span>
                </div>
              ) : clickedPoint.data ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 bg-navy-900/60 p-2 rounded-xl border border-navy-700/30">
                    <div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1"><Thermometer className="w-3 h-3 text-orange-400" /> INSAT SST</p>
                      <p className="text-xs font-bold text-white">{clickedPoint.data.ocean.sst.toFixed(1)} °C</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1"><Wind className="w-3 h-3 text-blue-400" /> EOS Wind</p>
                      <p className="text-xs font-bold text-white">{clickedPoint.data.weather.windSpeed.toFixed(1)} km/h {clickedPoint.data.weather.windDirection}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1"><Waves className="w-3 h-3 text-cyan-400" /> Waves</p>
                      <p className="text-xs font-bold text-white">{clickedPoint.data.waves.height.toFixed(1)} m</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1"><Droplets className="w-3 h-3 text-emerald-400" /> OCM Chl-a</p>
                      <p className="text-xs font-bold text-white">{clickedPoint.data.ocean.chlorophyll.toFixed(2)} mg/m³</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-300">
                    <span className="flex items-center gap-1 font-semibold text-[11px]">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" /> Safety Score
                    </span>
                    <strong className="text-xs font-extrabold">{clickedPoint.data.safety.overall}/100</strong>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
