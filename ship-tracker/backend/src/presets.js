/**
 * Predefined Maritime Region Bounding Boxes for AISStream.io
 * AISStream expects bounding box format: [[ [minLat, minLon], [maxLat, maxLon] ]]
 */
const BOUNDING_BOX_PRESETS = {
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
};

module.exports = {
  BOUNDING_BOX_PRESETS,
  DEFAULT_PRESET: BOUNDING_BOX_PRESETS.english_channel,
};
