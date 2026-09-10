import { NextRequest, NextResponse } from 'next/server';
import { getAISVessels } from '@/lib/maritime/aisService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '18.95');
  const lon = parseFloat(searchParams.get('lon') || '72.82');

  try {
    const aisData = await getAISVessels({ lat, lon });
    return NextResponse.json({
      success: true,
      data: aisData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve AIS vessel telemetry' },
      { status: 500 }
    );
  }
}
