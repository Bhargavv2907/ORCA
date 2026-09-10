import { NextRequest, NextResponse } from 'next/server';
import { evaluateFleetRisk } from '@/lib/maritime/collisionRisk';
import { getAISVessels } from '@/lib/maritime/aisService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ownPos = body.ownVessel?.position || { lat: 18.95, lon: 72.82 };
    const ownSpeed = body.ownVessel?.speed || 6.2;
    const ownHeading = body.ownVessel?.heading || 230;

    const aisStream = await getAISVessels({ lat: ownPos.lat, lon: ownPos.lon });
    const report = evaluateFleetRisk(ownPos, ownSpeed, ownHeading, aisStream.vessels);

    return NextResponse.json({
      success: true,
      data: {
        aisStreamInfo: {
          source: aisStream.source,
          isDemonstrationMode: aisStream.isDemonstrationMode,
          staleSeconds: aisStream.staleSeconds,
        },
        report,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to calculate maritime collision risk' },
      { status: 500 }
    );
  }
}
