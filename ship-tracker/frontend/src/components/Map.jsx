import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { createRoot } from 'react-dom/client';
import VesselMarkerSvg from './VesselMarkerSvg';

// Free OpenFreeMap vector tile style (No API key needed!)
const OPEN_FREE_MAP_STYLE = 'https://tiles.openfreemap.org/styles/bright';

export default function Map({
  vessels = [],
  selectedVessel = null,
  onSelectVessel,
  center = { lat: 50.8, lon: 1.2 },
  zoom = 8.5,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());

  // Initialize MapLibre GL Map on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OPEN_FREE_MAP_STYLE,
      center: [center.lon, center.lat],
      zoom: zoom,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    mapRef.current = map;

    return () => {
      // Clean up markers
      markersRef.current.forEach(({ marker, root }) => {
        root.unmount();
        marker.remove();
      });
      markersRef.current.clear();

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map camera center/zoom when center props change
  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.flyTo({
      center: [center.lon, center.lat],
      zoom: zoom,
      duration: 1200,
      essential: true,
    });
  }, [center.lat, center.lon, zoom]);

  // Fly to selected vessel when chosen
  useEffect(() => {
    if (!mapRef.current || !selectedVessel || !selectedVessel.lat || !selectedVessel.lon) return;
    mapRef.current.flyTo({
      center: [selectedVessel.lon, selectedVessel.lat],
      zoom: Math.max(mapRef.current.getZoom(), 11),
      duration: 1000,
      essential: true,
    });
  }, [selectedVessel?.mmsi, selectedVessel?.lat, selectedVessel?.lon]);

  // Sync vessel markers with MapLibre GL instance
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const currentMmsis = new Set();

    vessels.forEach((vessel) => {
      if (!vessel || !vessel.mmsi || !vessel.lat || !vessel.lon) return;
      currentMmsis.add(vessel.mmsi);

      const isSelected = selectedVessel?.mmsi === vessel.mmsi;

      if (markersRef.current.has(vessel.mmsi)) {
        // Update existing marker position & re-render React SVG
        const { marker, root } = markersRef.current.get(vessel.mmsi);
        marker.setLngLat([vessel.lon, vessel.lat]);

        root.render(
          <VesselMarkerSvg
            vessel={vessel}
            isSelected={isSelected}
            onClick={onSelectVessel}
          />
        );
      } else {
        // Create new marker container
        const el = document.createElement('div');
        const root = createRoot(el);

        root.render(
          <VesselMarkerSvg
            vessel={vessel}
            isSelected={isSelected}
            onClick={onSelectVessel}
          />
        );

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([vessel.lon, vessel.lat])
          .addTo(map);

        markersRef.current.set(vessel.mmsi, { marker, root });
      }
    });

    // Remove old markers that are no longer in active vessel list
    for (const [mmsi, { marker, root }] of markersRef.current.entries()) {
      if (!currentMmsis.has(mmsi)) {
        root.unmount();
        marker.remove();
        markersRef.current.delete(mmsi);
      }
    }
  }, [vessels, selectedVessel?.mmsi, onSelectVessel]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
