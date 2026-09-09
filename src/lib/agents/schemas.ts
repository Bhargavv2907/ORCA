import { z } from 'zod';

export const MapActionSchema = z.object({
  mapAction: z.enum(['highlight_pfz', 'draw_route', 'show_geofence', 'compare_routes', 'focus_location']),
  selectedZone: z.string().optional(),
  layers: z.array(z.string()).optional(),
  markers: z.array(z.object({
    lat: z.number(),
    lon: z.number(),
    label: z.string(),
    type: z.string(),
  })).optional(),
  route: z.array(z.object({
    lat: z.number(),
    lon: z.number(),
  })).optional(),
});

export const OceanPFZOutputSchema = z.object({
  sst: z.number().optional(),
  chlorophyll: z.number().optional(),
  salinity: z.number().optional(),
  currentSpeed: z.number().optional(),
  currentDirection: z.string().optional(),
  zones: z.array(z.object({
    id: z.string(),
    name: z.string(),
    suitabilityScore: z.number(),
    sst: z.number(),
    chlorophyll: z.number(),
    distanceFromCoast: z.number(),
  })).optional(),
  summary: z.string(),
});

export const WeatherHazardOutputSchema = z.object({
  temperature: z.number().optional(),
  windSpeed: z.number().optional(),
  windDirection: z.string().optional(),
  pressure: z.number().optional(),
  visibility: z.number().optional(),
  rainfall: z.number().optional(),
  waveHeight: z.number().optional(),
  hasCycloneAlert: z.boolean(),
  hasLightningAlert: z.boolean(),
  advisories: z.array(z.string()),
  summary: z.string(),
});

export const GISNavigationOutputSchema = z.object({
  userLocation: z.object({ lat: z.number(), lon: z.number() }).optional(),
  distanceKm: z.number().optional(),
  isRestricted: z.boolean(),
  geofenceStatus: z.string(),
  routes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    distance: z.number(),
    safetyScore: z.number(),
    isRecommended: z.boolean(),
  })).optional(),
  mapAction: MapActionSchema,
  summary: z.string(),
});

export const SafetyDecisionOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  status: z.enum(['SAFE', 'MODERATE', 'DANGEROUS', 'CRITICAL']),
  label: z.string(),
  factors: z.array(z.object({
    name: z.string(),
    score: z.number(),
    weight: z.number(),
    description: z.string(),
  })),
  confidence: z.number().min(0).max(100),
  summary: z.string(),
});

export type MapAction = z.infer<typeof MapActionSchema>;
export type OceanPFZOutput = z.infer<typeof OceanPFZOutputSchema>;
export type WeatherHazardOutput = z.infer<typeof WeatherHazardOutputSchema>;
export type GISNavigationOutput = z.infer<typeof GISNavigationOutputSchema>;
export type SafetyDecisionOutput = z.infer<typeof SafetyDecisionOutputSchema>;
