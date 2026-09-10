// ============================================================
// ORCA — Real-Time Potential Fishing Zones (PFZ) API Route
// GET /api/fishing-zones?lat=18.95&lon=72.82&name=Mumbai
// Returns location-accurate, satellite-computed fishing zones
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getMarineConditions } from '@/services/marine/unified';
import { generateRealTimeFishingZones } from '@/services/marine/pfz';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseFloat(params.get('lat') || '18.95');
  const lon = parseFloat(params.get('lon') || '72.82');
  const name = params.get('name') || 'Coastal Sector';

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: 'Invalid latitude or longitude' }, { status: 400 });
  }

  try {
    const conditions = await getMarineConditions(lat, lon);
    const zones = generateRealTimeFishingZones(lat, lon, conditions, name);

    return NextResponse.json({
      location: { lat, lon, name },
      conditions: {
        sst: conditions.ocean.sst,
        chlorophyll: conditions.ocean.chlorophyll,
        currentSpeed: conditions.ocean.currentSpeed,
        dataStatus: conditions.dataStatus,
        source: conditions.source,
      },
      zones,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to generate real-time fishing zones',
      message: String(error),
    }, { status: 500 });
  }
}
