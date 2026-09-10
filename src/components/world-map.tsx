'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, MapPin, Radio, Shield, Thermometer, Wind, Waves,
  Droplets, RefreshCw, X, Globe, Eye, Ship, Fish, Navigation, Maximize2, Compass, ArrowUpRight
} from 'lucide-react';
import { MarineConditions, FishingZone, Vessel } from '@/types/marine';
import { MapAction } from '@/lib/agents/schemas';
import { cn } from '@/lib/utils';
import { getMockFishingZones, getMockRoutes, getMockVessels } from '@/data/mock-data';
import { ALL_INDIAN_PORTS } from '@/data/indian-ports';
import { generateOfflineRoutes } from '@/lib/offline-routing';
import { generateRealTimeFishingZones } from '@/services/marine/pfz';

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

export interface MapRegion {
  id: string;
  name: string;
  bounds?: { minLat: number; maxLat: number; minLon: number; maxLon: number };
  zoom?: number;
  center?: { lat: number; lon: number };
  state?: string;
  type?: string;
  description?: string;
}

interface WorldMapProps {
  onPointClick?: (lat: number, lon: number, data: MarineConditions | null) => void;

  fishingZones?: FishingZone[];
  vessels?: Vessel[];
  satelliteMode?: string;
  activeLayers?: Set<string>;
  highlightCoasts?: boolean;
  mapActionPayload?: MapAction;
  selectedRegion?: MapRegion;
}

export default function WorldMapComponent({
  onPointClick,
  fishingZones = [],
  vessels = [],
  satelliteMode = 'esri_satellite',
  activeLayers = new Set(['mosdac_overlay', 'winds', 'fishing', 'coastal_detect']),
  highlightCoasts = true,
  mapActionPayload,
  selectedRegion,
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const lineLayerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const inspectPointRef = useRef<(lat: number, lon: number, label?: string) => void>(() => {});
  const [clickedPoint, setClickedPoint] = useState<{ lat: number; lon: number; data?: MarineConditions; loading: boolean; label?: string } | null>(null);

  const inspectPoint = React.useCallback((lat: number, lon: number, label?: string) => {
    setClickedPoint({ lat, lon, loading: true, label });

    if (lineLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(lineLayerRef.current);
      lineLayerRef.current = null;
    }

    fetch(`/api/marine?lat=${lat}&lon=${lon}`)
      .then((res) => res.json())
      .then((data) => {
        setClickedPoint({ lat, lon, data, loading: false, label });
        if (onPointClick) onPointClick(lat, lon, data);
      })
      .catch(() => {
        setClickedPoint((prev) => (prev ? { ...prev, loading: false } : null));
      });
  }, [onPointClick]);

  // Keep ref in sync so the map click handler always calls the latest inspectPoint
  useEffect(() => {
    inspectPointRef.current = inspectPoint;
  }, [inspectPoint]);

  // Expose global inspector trigger for Leaflet popups
  useEffect(() => {
    (window as any).orcaInspectLocation = (lat: number, lon: number, label: string) => {
      inspectPoint(lat, lon, label);
    };
    return () => {
      delete (window as any).orcaInspectLocation;
    };
  }, [inspectPoint]);

  // Serialize activeLayers into a stable string so useEffect deps work correctly
  const activeLayersKey = useMemo(() => [...activeLayers].sort().join(','), [activeLayers]);

  const centerLat = selectedRegion?.center?.lat ?? 18.95;
  const centerLon = selectedRegion?.center?.lon ?? 72.82;

  const zonesList = useMemo(() => {
    return fishingZones.length > 0 ? fishingZones : generateRealTimeFishingZones(centerLat, centerLon);
  }, [fishingZones, centerLat, centerLon]);

  const vesselsList = useMemo(() => {
    return vessels && vessels.length > 0 ? vessels : getMockVessels();
  }, [vessels]);

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

  // Initialize Leaflet Map — runs once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Add initial tile layer immediately so tiles show right away
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri World Imagery & ISRO MOSDAC',
        maxZoom: 18,
        noWrap: false,
      }).addTo(map);

      // Add Zoom Control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Create Layer Group for dynamic markers & overlays
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;

      // Handle map click for live sampling — use ref so we don't depend on onPointClick
      map.on('click', (e: any) => {
        const lat = +e.latlng.lat.toFixed(3);
        const lon = +e.latlng.lng.toFixed(3);
        inspectPointRef.current(lat, lon, `Ocean Point (${lat}°N, ${lon}°E)`);
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 150);

      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

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

      if (satelliteMode === 'nautical_ecdis') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
        attribution = '&copy; Esri World Ocean Basemap & ISRO MOSDAC';
      } else if (satelliteMode === 'dark_nautical') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
        attribution = '&copy; Esri Topo Map & OpenStreetMap';
      } else if (satelliteMode === 'mosdac_sst') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      } else if (satelliteMode === 'osm') {
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        attribution = '&copy; OpenStreetMap contributors';
      }

      // Add Primary Basemap with maxNativeZoom: 13 so tiles auto-scale at high zoom levels
      const isOceanBase = tileUrl.includes('World_Ocean_Base');
      L.tileLayer(tileUrl, {
        attribution,
        maxZoom: 18,
        maxNativeZoom: isOceanBase ? 13 : 18,
        noWrap: false,
      }).addTo(map);

      // Add OpenStreetMap backdrop behind ocean base so land/coasts are always crisp
      if (isOceanBase) {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
          opacity: 0.35,
          zIndex: 0,
        }).addTo(map);
      }

      // Add OpenSeaMap Seamark Nautical Tile Overlay for seamarks & beacons
      if (satelliteMode === 'nautical_ecdis') {
        L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenSeaMap contributors',
          maxZoom: 18,
          opacity: 0.85,
        }).addTo(map);
      }
    });
  }, [satelliteMode, isLoaded]);

  // Handle selectedRegion changes from parent (fly to sector + inspect live telemetry)
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !selectedRegion) return;
    const map = mapInstanceRef.current;

    if (selectedRegion.id === 'world') {
      map.flyTo([20.0, 10.0], 2.5, { duration: 1.2 });
      return;
    }
    if (selectedRegion.id === 'all_india') {
      map.flyToBounds([[6.0, 68.0], [36.0, 97.0]], { padding: [50, 50], duration: 1.2 });
      return;
    }
    if (selectedRegion.bounds) {
      map.flyToBounds(
        [[selectedRegion.bounds.minLat, selectedRegion.bounds.minLon], [selectedRegion.bounds.maxLat, selectedRegion.bounds.maxLon]],
        { padding: [60, 60], duration: 1.2 }
      );
    } else if (selectedRegion.center) {
      map.flyTo([selectedRegion.center.lat, selectedRegion.center.lon], selectedRegion.zoom || 7.5, { duration: 1.2 });
    }

    if (selectedRegion.center) {
      inspectPoint(selectedRegion.center.lat, selectedRegion.center.lon, selectedRegion.name);
    }
  }, [selectedRegion, isLoaded, inspectPoint]);

  // Keep Leaflet viewport sized properly
  useEffect(() => {
    if (!containerRef.current || !mapInstanceRef.current || !isLoaded) return;
    const map = mapInstanceRef.current;
    setTimeout(() => {
      if (mapInstanceRef.current) map.invalidateSize();
    }, 200);
    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        try { map.invalidateSize(); } catch (_) { /* map may have been removed */ }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [isLoaded]);

  // Update Markers, Coastlines & Overlays
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || !isLoaded) return;

    // Read current active layers from the serialized key
    const currentLayers = new Set(activeLayersKey.split(',').filter(Boolean));
    // Use ref so we don't depend on inspectPoint identity
    const inspect = (...args: Parameters<typeof inspectPointRef.current>) => inspectPointRef.current(...args);

    import('leaflet').then((L) => {
      const layerGroup = layerGroupRef.current;
      layerGroup.clearLayers();

      // 1. HIGHLIGHT ALL 11 INDIAN COASTAL SECTORS
      if (highlightCoasts || currentLayers.has('coastal_detect')) {
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

          polyline.on('click', (e: any) => {
            const lat = +e.latlng.lat.toFixed(3);
            const lon = +e.latlng.lng.toFixed(3);
            inspect(lat, lon, `${sector.name} Coastline`);
          });

          polyline.addTo(layerGroup);

          // Add Pulsing Sector Center Marker
          const customIcon = L.divIcon({
            className: 'custom-coast-marker',
            html: `<div class="relative flex items-center justify-center cursor-pointer">
              <span class="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-teal-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-teal-300 border-2 border-navy-950"></span>
            </div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const marker = L.marker([sector.center.lat, sector.center.lon], { icon: customIcon });
          marker.on('click', () => {
            inspect(sector.center.lat, sector.center.lon, sector.name);
          });
          marker.bindPopup(
            `<div style="padding:10px;font-size:12px;font-family:system-ui,sans-serif;color:#e2e8f0;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <h4 style="font-weight:700;color:#2dd4bf;font-size:14px;margin:0;">🇮🇳 ${sector.name}</h4>
                <span style="font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(13,148,136,0.2);color:#5eead4;font-weight:600;border:1px solid rgba(45,212,191,0.3);">${sector.type}</span>
              </div>
              <p style="color:#94a3b8;margin:0 0 4px 0;"><strong style="color:#cbd5e1;">State/UT:</strong> ${sector.state}</p>
              <p style="color:#64748b;margin:0 0 8px 0;">${sector.description}</p>
              <div style="font-size:10px;background:rgba(30,58,95,0.5);padding:6px 8px;border-radius:6px;font-family:monospace;margin-bottom:8px;color:#5eead4;border:1px solid rgba(30,58,95,0.6);">
                Lat: ${sector.center.lat}°N | Lon: ${sector.center.lon}°E
              </div>
              <button
                onclick="window.orcaInspectLocation && window.orcaInspectLocation(${sector.center.lat}, ${sector.center.lon}, '${sector.name.replace(/'/g, "\\'")}')"
                style="width:100%;padding:6px 10px;background:#0d9488;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer;font-size:11px;"
              >
                📊 Inspect Live Telemetry
              </button>
            </div>`
          );

          marker.addTo(layerGroup);
        });
      }

      // 2. POTENTIAL FISHING ZONES (PFZ)
      if (currentLayers.has('fishing')) {
        zonesList.forEach((zone) => {
          const color = zone.color || '#14b8a6';
          const radiusMeters = (zone.radius || 15) * 1000;

          const circle = L.circle([zone.center.lat, zone.center.lon], {
            color: color,
            fillColor: color,
            fillOpacity: 0.22,
            radius: radiusMeters,
            weight: 2,
          });

          circle.on('click', () => {
            inspect(zone.center.lat, zone.center.lon, zone.name);
          });

          circle.bindPopup(
            `<div style="padding:8px;font-size:12px;font-family:system-ui,sans-serif;color:#e2e8f0;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <strong style="color:${color};font-size:14px;">${zone.name}</strong>
                <span style="padding:2px 6px;border-radius:4px;background:rgba(16,185,129,0.2);color:#6ee7b7;font-size:10px;font-weight:700;border:1px solid rgba(16,185,129,0.3);">${zone.suitabilityScore}% Match</span>
              </div>
              <p style="color:#94a3b8;margin:0 0 4px 0;">Activity Level: <strong style="color:#cbd5e1;">${zone.historicalActivity}</strong> | Radius: ${zone.radius} km</p>
              <p style="color:#64748b;margin:0;">SST: ${zone.sst}°C | Chlorophyll: ${zone.chlorophyll} mg/m³</p>
            </div>`
          );

          circle.addTo(layerGroup);

          // Add Zone Label Badge at Circle Center
          const shortName = zone.name.includes('Zone A') ? 'Zone A' :
                            zone.name.includes('Zone B') ? 'Zone B' :
                            zone.name.includes('Zone C') ? 'Zone C' : zone.name.split(' ')[0];
          const badgeIcon = L.divIcon({
            className: 'custom-zone-badge',
            html: `<div style="background:${color}22;border:1.5px solid ${color};color:${color};padding:2px 6px;border-radius:12px;font-size:10px;font-weight:bold;white-space:nowrap;backdrop-filter:blur(4px);box-shadow:0 2px 6px rgba(0,0,0,0.4);">
              📍 ${shortName} (${zone.suitabilityScore}%)
            </div>`,
            iconSize: [80, 20],
            iconAnchor: [40, 10],
          });
          const badgeMarker = L.marker([zone.center.lat, zone.center.lon], { icon: badgeIcon });
          badgeMarker.on('click', () => inspect(zone.center.lat, zone.center.lon, zone.name));
          badgeMarker.addTo(layerGroup);
        });
      }


      // 3. INDIAN PORTS LAYER (ALL MAJOR, DEEPWATER, PRIVATE & MINOR PORTS OF INDIA)
      if (currentLayers.has('ports')) {
        ALL_INDIAN_PORTS.forEach((port) => {
          const color = port.type === 'major' ? '#f59e0b' : port.type === 'deepwater' ? '#10b981' : port.type === 'private' ? '#8b5cf6' : '#38bdf8';
          const bgColor = port.type === 'major' ? 'rgba(245,158,11,0.18)' : port.type === 'deepwater' ? 'rgba(16,185,129,0.18)' : port.type === 'private' ? 'rgba(139,92,246,0.18)' : 'rgba(56,189,248,0.18)';
          const borderColor = port.type === 'major' ? 'rgba(245,158,11,0.6)' : port.type === 'deepwater' ? 'rgba(16,185,129,0.6)' : port.type === 'private' ? 'rgba(139,92,246,0.6)' : 'rgba(56,189,248,0.6)';
          const label = port.type === 'major' ? 'MAJOR PORT' : port.type === 'deepwater' ? 'DEEPWATER TRANS.' : port.type === 'private' ? 'PRIVATE PORT' : 'MINOR PORT';

          const portIcon = L.divIcon({
            className: 'custom-port-marker',
            html: `<div style="position:relative;display:flex;align-items:center;cursor:pointer;">
              <div style="width:22px;height:22px;border-radius:50%;background:${bgColor};border:2px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px ${color}66;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
                </svg>
              </div>
              <span style="margin-left:4px;font-size:9.5px;font-weight:700;color:${color};background:rgba(15,23,42,0.92);padding:1.5px 6px;border-radius:4px;white-space:nowrap;border:1px solid ${borderColor};backdrop-filter:blur(4px);">
                ${port.name.split('(')[0].trim()}
              </span>
            </div>`,
            iconSize: [130, 24],
            iconAnchor: [11, 12],
          });

          const marker = L.marker([port.lat, port.lon], { icon: portIcon });
          marker.on('click', () => inspect(port.lat, port.lon, `${port.name} — ${port.state}`));
          marker.bindTooltip(
            `<div style="padding:8px 12px;background:#0f172a;color:#fff;font-size:11px;font-family:system-ui,sans-serif;border-radius:8px;border:1px solid ${color};min-width:200px;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
              <div style="font-weight:800;font-size:12.5px;color:${color};margin-bottom:4px;display:flex;align-items:center;justify-content:space-between;">
                <span>⚓ ${port.name}</span>
              </div>
              <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">
                <span style="display:inline-block;padding:1px 6px;border-radius:4px;background:${bgColor};color:${color};border:1px solid ${borderColor};font-weight:700;font-size:9px;margin-right:6px;">${label}</span>
                <strong style="color:#cbd5e1;">${port.state}</strong> (${port.coast})
              </div>
              ${port.cargoType ? `<div style="font-size:10px;color:#38bdf8;margin-bottom:3px;">📦 <strong>Cargo:</strong> ${port.cargoType}</div>` : ''}
              ${port.description ? `<div style="font-size:9.5px;color:#64748b;margin-bottom:4px;line-height:1.3;">${port.description}</div>` : ''}
              <div style="font-size:9.5px;color:#475569;font-family:monospace;">
                GPS: ${port.lat.toFixed(4)}°N, ${port.lon.toFixed(4)}°E
              </div>
            </div>`,
            { sticky: true }
          );
          marker.addTo(layerGroup);
        });
      }

      // 4. NAUTICAL CHART ECDIS OVERLAYS (Isobaths, TSS Channels, Naval Exclusion Zone, Buoys)
      if (currentLayers.has('tss') || currentLayers.has('military') || currentLayers.has('nautical_ecdis') || true) {
        const centerLat = selectedRegion?.center?.lat || 18.92;
        const centerLon = selectedRegion?.center?.lon || 72.82;

        // 4A. Bathymetry Depth Isobaths (20m & 10m ISOBATH)
        const isobath20: [number, number][] = [
          [centerLat + 0.15, centerLon - 0.25],
          [centerLat + 0.05, centerLon - 0.20],
          [centerLat - 0.08, centerLon - 0.18],
          [centerLat - 0.20, centerLon - 0.15],
        ];
        const isoPoly20 = L.polyline(isobath20, { color: '#3b82f6', weight: 1.5, opacity: 0.7, dashArray: '4, 4' }).addTo(layerGroup);
        isoPoly20.bindTooltip('<span style="font-size:9px;font-weight:bold;color:#1d4ed8;">20m ISOBATH</span>', { permanent: true, direction: 'center', className: 'leaflet-tooltip-transparent' });

        const isobath10: [number, number][] = [
          [centerLat + 0.10, centerLon - 0.10],
          [centerLat, centerLon - 0.08],
          [centerLat - 0.15, centerLon - 0.06],
        ];
        const isoPoly10 = L.polyline(isobath10, { color: '#60a5fa', weight: 1.5, opacity: 0.7, dashArray: '4, 4' }).addTo(layerGroup);
        isoPoly10.bindTooltip('<span style="font-size:9px;font-weight:bold;color:#2563eb;">10m ISOBATH</span>', { permanent: true, direction: 'center', className: 'leaflet-tooltip-transparent' });

        // 4B. TSS Shipping Channel Fairway (30UR-FAIRWAY TSS DEEP DRAFT-VESSEL)
        const fairway: [number, number][] = [
          [centerLat + 0.25, centerLon - 0.02],
          [centerLat - 0.25, centerLon - 0.02],
        ];
        const fairwayPoly = L.polyline(fairway, { color: '#1e3a8a', weight: 2.5, opacity: 0.8, dashArray: '8, 6' }).addTo(layerGroup);
        fairwayPoly.bindTooltip('<span style="font-size:9px;font-weight:bold;color:#1e3a8a;background:#dbeafe;padding:1px 4px;border-radius:2px;">30UR-FAIRWAY -(TSS DEEP DRAFT-VESSEL)</span>', { permanent: true, direction: 'center' });

        // 4C. Naval Defence Zone (Strictly No Fishing Polygon)
        const militaryPolyCoords: [number, number][] = [
          [centerLat + 0.04, centerLon + 0.08],
          [centerLat + 0.03, centerLon + 0.15],
          [centerLat - 0.10, centerLon + 0.14],
          [centerLat - 0.09, centerLon + 0.07],
        ];
        const milPoly = L.polygon(militaryPolyCoords, {
          color: '#dc2626',
          fillColor: '#ef4444',
          fillOpacity: 0.18,
          weight: 2,
        }).addTo(layerGroup);
        milPoly.bindTooltip('<div style="font-size:10px;font-weight:extrabold;color:#b91c1c;text-align:center;">NAVAL DEFENCE ZONE<br/><span style="font-size:8px;color:#dc2626;">STRICTLY NO FISHING</span></div>', { permanent: true, direction: 'center' });

        // 4D. ICG SAR Buoy Marker #3
        const buoyIcon = L.divIcon({
          className: 'custom-buoy-marker',
          html: `<div style="text-align:center;">
            <div style="width:14px;height:14px;border-radius:50%;background:#ea580c;border:2px solid #fff;margin:0 auto;box-shadow:0 0 8px rgba(234,88,12,0.8);"></div>
            <div style="font-size:9px;font-weight:bold;color:#9a3412;background:#ffedd5;padding:1px 4px;border-radius:4px;border:1px solid #f97316;margin-top:2px;white-space:nowrap;">
              ICG SAR BUOY #3<br/><span style="font-size:7px;color:#c2410c;">Racon (B) • VHF Watch</span>
            </div>
          </div>`,
          iconSize: [90, 34],
          iconAnchor: [45, 17],
        });
        L.marker([centerLat - 0.18, centerLon - 0.05], { icon: buoyIcon }).addTo(layerGroup);

        // 4E. My Boat (Jai Malhar) Callout Marker
        const myBoatIcon = L.divIcon({
          className: 'custom-myboat-marker',
          html: `<div style="text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:4px;background:#0f172a;color:#fff;padding:4px 8px;border-radius:6px;font-size:10px;font-weight:bold;border:1px solid #3b82f6;box-shadow:0 4px 12px rgba(15,23,42,0.5);">
              <span>🚢 MY BOAT: Jai Malhar</span>
            </div>
            <div style="font-size:8px;color:#94a3b8;background:#1e293b;padding:2px 4px;border-radius:4px;margin-top:2px;border:1px solid #334155;">
              Heading 230° • 6.2 kts | <span style="color:#34d399;font-weight:bold;">CLEAR WATER</span>
            </div>
          </div>`,
          iconSize: [160, 40],
          iconAnchor: [80, 20],
        });
        L.marker([centerLat, centerLon - 0.01], { icon: myBoatIcon }).addTo(layerGroup);
      }

      // 5. LIVE MARINETRAFFIC AIS VESSELS LAYER
      if (currentLayers.has('vessels') || currentLayers.has('ais') || true) {
        vesselsList.forEach((vessel) => {
          const typeColor = vessel.type === 'fishing' ? '#06b6d4' : vessel.type === 'cargo' ? '#f97316' : vessel.type === 'passenger' ? '#10b981' : vessel.type === 'commercial' ? '#8b5cf6' : '#94a3b8';
          const typeBadge = vessel.type.toUpperCase();

          const vesselIcon = L.divIcon({
            className: 'custom-vessel-marker',
            html: `<div style="position:relative;display:flex;align-items:center;cursor:pointer;">
              <div style="width:24px;height:24px;border-radius:50%;background:rgba(15,23,42,0.9);border:2px solid ${typeColor};display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px ${typeColor}88;transform:rotate(${vessel.heading}deg);">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${typeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2L2 22h20L12 2z"/>
                </svg>
              </div>
              <span style="margin-left:5px;font-size:9.5px;font-weight:700;color:${typeColor};background:rgba(15,23,42,0.92);padding:1.5px 6px;border-radius:4px;white-space:nowrap;border:1px solid ${typeColor}66;backdrop-filter:blur(4px);">
                🚢 ${vessel.name.split(' ')[0]} (${vessel.speed} kts)
              </span>
            </div>`,
            iconSize: [140, 26],
            iconAnchor: [12, 13],
          });

          const vMarker = L.marker([vessel.position.lat, vessel.position.lon], { icon: vesselIcon });
          vMarker.on('click', () => inspect(vessel.position.lat, vessel.position.lon, `Vessel ${vessel.name}`));
          vMarker.bindTooltip(
            `<div style="padding:8px 12px;background:#0f172a;color:#fff;font-size:11px;font-family:system-ui,sans-serif;border-radius:8px;border:1px solid ${typeColor};min-width:210px;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
              <div style="font-weight:800;font-size:13px;color:${typeColor};margin-bottom:4px;">🚢 ${vessel.name}</div>
              <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;display:flex;align-items:center;gap:6px;">
                <span style="padding:1px 6px;border-radius:4px;background:${typeColor}22;color:${typeColor};border:1px solid ${typeColor}66;font-weight:700;font-size:9px;">${typeBadge}</span>
                <span>Flag: <strong>${vessel.flag || 'IN'}</strong></span>
                <span>Status: <strong style="color:#34d399;">${vessel.activity || 'Transit'}</strong></span>
              </div>
              <div style="font-size:10px;color:#cbd5e1;margin-bottom:3px;">
                ⚡ <strong>Speed:</strong> ${vessel.speed} kts | 🧭 <strong>Heading:</strong> ${vessel.heading}°
              </div>
              <div style="font-size:9.5px;color:#64748b;font-family:monospace;">
                GPS: ${vessel.position.lat.toFixed(4)}°N, ${vessel.position.lon.toFixed(4)}°E
              </div>
            </div>`,
            { sticky: true }
          );
          vMarker.addTo(layerGroup);
        });
      }
    });
  }, [highlightCoasts, activeLayersKey, zonesList, vesselsList, isLoaded]);

  // Handle AI-Controlled Map Actions (Phase 6)
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || !isLoaded || !mapActionPayload) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      const layerGroup = layerGroupRef.current;
      if (!map || !layerGroup) return;

      const { mapAction, selectedZone, route, markers } = mapActionPayload;

      // Remove old line layer if present
      if (lineLayerRef.current) {
        map.removeLayer(lineLayerRef.current);
        lineLayerRef.current = null;
      }

      if (mapAction === 'highlight_pfz') {
        const targetZone = zonesList.find(z => z.name.toLowerCase().includes(selectedZone?.toLowerCase() || 'zone a')) || zonesList[0];
        const p: [number, number] = [targetZone.center.lat, targetZone.center.lon];

        const highlightCircle = L.circle(p, {
          color: '#2dd4bf',
          fillColor: '#2dd4bf',
          fillOpacity: 0.4,
          radius: 40000,
          weight: 4,
        }).addTo(layerGroup);

        highlightCircle.bindPopup(`
          <div style="padding:8px;font-size:12px;font-family:system-ui,sans-serif;color:#e2e8f0;">
            <h4 style="font-weight:700;color:#2dd4bf;font-size:14px;margin:0 0 6px 0;">🎯 Highlighted PFZ: ${targetZone.name}</h4>
            <p style="color:#94a3b8;margin:0 0 4px 0;">Suitability Score: <strong style="color:#6ee7b7;">${targetZone.suitabilityScore}% Match</strong></p>
            <p style="color:#64748b;font-family:monospace;margin:0;">SST: ${targetZone.sst}°C | Chlorophyll: ${targetZone.chlorophyll} mg/m³</p>
          </div>
        `).openPopup();

        map.flyTo(p, 8.5, { duration: 1.5 });
      }

      if (route && route.length > 1) {
        const coords: [number, number][] = route.map((r: { lat: number; lon: number }) => [r.lat, r.lon]);

        // Outer Glow Buffer (Google Maps marine style)
        L.polyline(coords, {
          color: '#0d9488',
          weight: 10,
          opacity: 0.35,
        }).addTo(layerGroup);

        // Main Navigation Line
        const polyline = L.polyline(coords, {
          color: '#2dd4bf',
          weight: 5,
          opacity: 0.95,
          dashArray: '8, 4',
        }).addTo(layerGroup);

        // Add Waypoint Leg Pins along the sea route
        coords.forEach((pt, idx) => {
          if (idx > 0 && idx < coords.length - 1) {
            const wayIcon = L.divIcon({
              className: 'custom-way-marker',
              html: `<div style="background:#0f172a;border:1.5px solid #2dd4bf;color:#2dd4bf;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;box-shadow:0 0 6px rgba(45,212,191,0.6);">
                ${idx}
              </div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });
            L.marker(pt, { icon: wayIcon }).addTo(layerGroup).bindTooltip(`📍 Sea Waypoint ${idx} (${pt[0].toFixed(2)}°N, ${pt[1].toFixed(2)}°E)`, { sticky: true });
          }
        });

        // Add Start marker (Green pin)
        const startPt = coords[0];
        const startIcon = L.divIcon({
          className: 'custom-start-marker',
          html: `<div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-navy-950 shadow-lg"></span>
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        L.marker(startPt, { icon: startIcon }).addTo(layerGroup).bindPopup('<b>🚩 Start Location</b>');

        // Add Destination marker (Teal glowing target)
        const endPt = coords[coords.length - 1];
        const endIcon = L.divIcon({
          className: 'custom-end-marker',
          html: `<div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-cyan-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-5 w-5 bg-cyan-400 border-2 border-navy-950 shadow-lg"></span>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker(endPt, { icon: endIcon }).addTo(layerGroup).bindPopup(`<b>🎯 Destination: ${selectedZone || 'PFZ Target'}</b>`);

        polyline.bindTooltip(`✨ Google-Maps Sea Navigation Route to ${selectedZone || 'Destination'}`, { sticky: true });
        lineLayerRef.current = polyline;
        map.flyToBounds(coords, { padding: [60, 60], duration: 1.5 });
      }

      if (mapAction === 'show_geofence') {
        const geofenceCoords: [number, number][] = [
          [19.5, 71.5], [19.8, 72.0], [19.2, 72.5], [18.8, 72.0], [19.5, 71.5]
        ];
        const polygon = L.polygon(geofenceCoords, {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.3,
          weight: 3,
          dashArray: '6, 6',
        }).addTo(layerGroup);

        polygon.bindPopup(`
          <div style="padding:8px;font-size:12px;font-family:system-ui,sans-serif;">
            <strong style="color:#f87171;font-size:13px;">⚠️ Restricted Maritime Zone / IMBL Boundary</strong><br/>
            <span style="color:#94a3b8;font-size:11px;font-weight:400;">Prohibited waters for commercial fishing without clearance.</span>
          </div>
        `).openPopup();

        map.flyToBounds(geofenceCoords, { padding: [80, 80], duration: 1.5 });
      }

      if (mapAction === 'compare_routes') {
        const centerLat = zonesList[0]?.center.lat || 18.95;
        const centerLon = zonesList[0]?.center.lon || 72.82;
        const generatedRoutes = generateOfflineRoutes({ lat: centerLat, lon: centerLon }, { lat: centerLat - 0.2, lon: centerLon - 0.4 });
        const r1Coords: [number, number][] = generatedRoutes[0].waypoints.map((w: { lat: number; lon: number }) => [w.lat, w.lon]);
        const r2Coords: [number, number][] = generatedRoutes[1].waypoints.map((w: { lat: number; lon: number }) => [w.lat, w.lon]);

        const polylineSafest = L.polyline(r1Coords, { color: '#10b981', weight: 5, opacity: 0.9 }).addTo(layerGroup);
        polylineSafest.bindTooltip(`🟢 ${generatedRoutes[0].name} (${generatedRoutes[0].distance} km)`, { sticky: true });

        const polylineShortest = L.polyline(r2Coords, { color: '#f59e0b', weight: 4, dashArray: '6, 8', opacity: 0.8 }).addTo(layerGroup);
        polylineShortest.bindTooltip(`🟡 ${generatedRoutes[1].name} (${generatedRoutes[1].distance} km)`, { sticky: true });

        map.flyToBounds([...r1Coords, ...r2Coords], { padding: [60, 60], duration: 1.5 });
      }

      if (mapAction === 'focus_location' && markers && markers.length > 0) {
        const m = markers[0];
        map.flyTo([m.lat, m.lon], 9, { duration: 1.5 });
      }
    });
  }, [mapActionPayload, isLoaded, zonesList]);

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

      {/* Interactive Helper Toast */}
      {!clickedPoint && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-900/90 backdrop-blur border border-teal-500/40 text-xs font-medium text-teal-300 shadow-xl">
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Click anywhere on the map or select a sector to inspect live data</span>
          </div>
        </div>
      )}

      {/* Point Sampling Inspection HUD */}
      <AnimatePresence>
        {clickedPoint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 right-4 z-40 w-84 sm:w-96 rounded-2xl glass border border-teal-500/40 p-4 shadow-2xl bg-navy-950/95 max-h-[calc(100vh-120px)] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-2 border-b border-navy-700/40 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal-400 animate-pulse shrink-0" />
                <span className="truncate">{clickedPoint.label || 'Marine Point Inspector'}</span>
              </h3>
              <button onClick={() => setClickedPoint(null)} className="text-slate-400 hover:text-white p-1">
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
