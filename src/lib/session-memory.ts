// ============================================================
// ORCA Compact Session Memory & Context Store (Phase 7)
// ============================================================

export interface OrcaSessionContext {
  selectedLocation: { lat: number; lon: number; name: string };
  selectedPFZ?: { id: string; name: string; center: { lat: number; lon: number }; suitabilityScore: number; distanceFromCoast: number };
  selectedRoute?: { id: string; name: string; distance: number; safetyScore: number };
  selectedTime: string;
  language: string;
  userMode: 'Fisherman' | 'Researcher' | 'Authority' | 'Operator';
}

const DEFAULT_SESSION: OrcaSessionContext = {
  selectedLocation: { lat: 18.95, lon: 72.82, name: 'Mumbai Coast' },
  selectedPFZ: {
    id: 'zone-a',
    name: 'Zone A (Southwest Shelf)',
    center: { lat: 18.7, lon: 72.4 },
    suitabilityScore: 88,
    distanceFromCoast: 38,
  },
  selectedRoute: {
    id: 'route-b',
    name: 'Route B (Coastal Path)',
    distance: 38,
    safetyScore: 96,
  },
  selectedTime: '09:00 AM',
  language: 'English',
  userMode: 'Fisherman',
};

let currentSession: OrcaSessionContext = { ...DEFAULT_SESSION };

export function getSessionContext(): OrcaSessionContext {
  return currentSession;
}

export function updateSessionContext(patch: Partial<OrcaSessionContext>): OrcaSessionContext {
  currentSession = { ...currentSession, ...patch };
  return currentSession;
}

export function resetSessionContext(): OrcaSessionContext {
  currentSession = { ...DEFAULT_SESSION };
  return currentSession;
}

// Resolve ambiguous follow-up questions using stored context
export function resolveFollowUpContext(question: string): { resolvedLocation: { lat: number; lon: number; name: string }; isFollowUp: boolean } {
  const q = question.toLowerCase();

  // Follow-up phrases referencing previous location/PFZ/time
  const isFollowUp = /closest|safer|safe.*tomorrow|that.*zone|there|it|same.*place|leave.*at|departure|5\s*am|6\s*pm/i.test(q);

  if (isFollowUp && currentSession.selectedPFZ) {
    return {
      resolvedLocation: {
        lat: currentSession.selectedPFZ.center.lat,
        lon: currentSession.selectedPFZ.center.lon,
        name: currentSession.selectedPFZ.name,
      },
      isFollowUp: true,
    };
  }

  return {
    resolvedLocation: currentSession.selectedLocation,
    isFollowUp: false,
  };
}
