/**
 * AIS Vessel Type Code Mapping & Color Specs
 * AIS Type numbers range from 0 to 99 according to ITU-R M.1371
 */

export const VESSEL_CATEGORIES = {
  CARGO: { id: 'cargo', label: 'Cargo / Container', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)' },
  TANKER: { id: 'tanker', label: 'Tanker / Oil', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' },
  PASSENGER: { id: 'passenger', label: 'Passenger / Ferry', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' },
  FISHING: { id: 'fishing', label: 'Fishing', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
  TUG: { id: 'tug', label: 'Tug / Special', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.4)' },
  HIGHSPEED: { id: 'highspeed', label: 'High Speed Craft', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)' },
  OTHER: { id: 'other', label: 'Other / Pleasure', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.4)' },
};

/**
 * Classify raw AIS shipType number into category spec
 */
export function getVesselCategory(typeNum) {
  const type = Number(typeNum) || 0;

  if (type >= 70 && type <= 79) return VESSEL_CATEGORIES.CARGO;
  if (type >= 80 && type <= 89) return VESSEL_CATEGORIES.TANKER;
  if (type >= 60 && type <= 69) return VESSEL_CATEGORIES.PASSENGER;
  if (type === 30) return VESSEL_CATEGORIES.FISHING;
  if (type >= 50 && type <= 59) return VESSEL_CATEGORIES.TUG;
  if (type >= 40 && type <= 49) return VESSEL_CATEGORIES.HIGHSPEED;

  return VESSEL_CATEGORIES.OTHER;
}

/**
 * Get exact human-readable ship type description
 */
export function getVesselTypeName(typeNum) {
  const type = Number(typeNum) || 0;

  const typeMap = {
    30: 'Fishing Trawler',
    31: 'Towing Vessel',
    32: 'Towing (Large)',
    33: 'Dredger / Underwater Op',
    34: 'Diving Vessel',
    35: 'Military Vessel',
    36: 'Sailing Vessel',
    37: 'Pleasure Craft',
    40: 'High Speed Craft (HSC)',
    50: 'Pilot Vessel',
    51: 'Search and Rescue (SAR)',
    52: 'Tug Boat',
    53: 'Port Tender',
    54: 'Anti-Pollution Vessel',
    55: 'Law Enforcement',
    60: 'Passenger Ship / Ferry',
    70: 'Cargo Ship (General)',
    71: 'Cargo Ship (Container)',
    72: 'Cargo Ship (Bulk Carrier)',
    79: 'Cargo Ship (No Additional)',
    80: 'Oil / Chemical Tanker',
    81: 'LNG / LPG Tanker',
    82: 'Chemical Tanker',
  };

  return typeMap[type] || getVesselCategory(type).label;
}

/**
 * AIS Navigational Status lookup table (0..15)
 */
export const NAV_STATUS_MAP = {
  0: 'Underway using engine',
  1: 'At anchor',
  2: 'Not under command',
  3: 'Restricted manoeuvrability',
  4: 'Constrained by draft',
  5: 'Moored',
  6: 'Aground',
  7: 'Engaged in fishing',
  8: 'Under way sailing',
  14: 'AIS-SART active',
  15: 'Not defined / default',
};

export function getNavStatusName(code) {
  return NAV_STATUS_MAP[code] || 'Underway / Active';
}
