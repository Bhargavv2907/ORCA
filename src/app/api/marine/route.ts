// ============================================================
// ORCA — Unified Live Marine Conditions API Route
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

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  try {
    const conditions = await getMarineConditions(lat, lon);
    return NextResponse.json(conditions);
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch unified marine conditions',
      message: String(error),
    }, { status: 500 });
  }
}
