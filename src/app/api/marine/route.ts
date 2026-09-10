// ============================================================
// JalSaathi — Unified Live Marine Conditions API Route
// GET /api/marine?lat=18.95&lon=72.82
// Combines live ISRO MOSDAC, Open-Meteo weather & waves, IMD,
// and computes dynamic safety risk scores.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getMarineConditions } from '@/services/marine/unified';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseFloat(params.get('lat') || '18.95');
  const lon = parseFloat(params.get('lon') || '72.82');

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: 'Invalid latitude or longitude parameters' }, { status: 400 });
  }

  try {
    const conditions = await getMarineConditions(lat, lon);
    return NextResponse.json(conditions, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch unified marine conditions',
      message: String(error),
    }, { status: 500 });
  }
}
