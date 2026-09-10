// ============================================================
// JalSaathi — IMD Marine Data API Route
// Fetches port warnings, sea bulletins, fishermen warnings, cyclones
// GET /api/imd/marine
// ============================================================

import { NextResponse } from 'next/server';
import { fetchIMDMarineData, getIMDStatus } from '@/services/marine/imd';

export async function GET() {
  try {
    const data = await fetchIMDMarineData();
    const status = getIMDStatus();

    return NextResponse.json({
      ...data,
      imdConfig: {
        hasApiKey: status.hasApiKey,
        registrationUrl: status.registrationUrl,
        apiReferenceUrl: status.apiReferenceUrl,
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch IMD marine data',
      message: String(error),
    }, { status: 500 });
  }
}
