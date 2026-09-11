import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveVesselData } from '@/services/marine/vessels';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '18.95');
  const lon = parseFloat(searchParams.get('lon') || '72.82');
  const radius = parseFloat(searchParams.get('radius') || '50');
  const apiKey = searchParams.get('apiKey') || searchParams.get('key') || request.headers.get('x-marinetraffic-key') || undefined;

  try {
    const data = await fetchLiveVesselData(lat, lon, radius, apiKey);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve live vessel data' },
      { status: 500 }
    );
  }
}
